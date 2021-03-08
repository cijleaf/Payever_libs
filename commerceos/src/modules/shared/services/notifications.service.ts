import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, combineLatest, Subject, merge, of, empty, BehaviorSubject } from 'rxjs';
import {
  filter, switchMap, shareReplay, map, tap,
  distinctUntilChanged, startWith, take, scan, withLatestFrom
} from 'rxjs/operators';

import * as Cookie from 'js-cookie';

import { PlatformService } from '@pe/ng-kit/modules/common';
import {
  EnvironmentConfigService, NodeJsBackendConfigInterface
} from '@pe/ng-kit/modules/environment-config/index';

import {
  NotificationMessageNameEnum, NotificationsMessage,
  NotificationRawInterface, NotificationSocket
} from '../interfaces';
import { EnvService } from '../../../apps/standalone/app/services/env.service';
import { NotificationMessage } from '@modules/dashboard/shared-dashboard/components/notifications/notifications-interface';
import { NotificationsTarget } from '@modules/dashboard/shared-dashboard/components/notifications/notifications-target';

// helper combines all flows into array
function mergeAll(params: Observable<any>[]): Observable<any[]> {
  let mergeResult: any = [];
  return merge(...params.map((o, index) => o.pipe(tap(v => {
    mergeResult = [];
    mergeResult[index] = v;
  })))).pipe(map(() => mergeResult));
}

const CONNECTION_DELAY_SEC: number = 15;

class WebSocketConnector {

  appMessageWS$: Subject<NotificationsMessage> = new Subject();

  appNotificationsWS$ = this.appMessageWS$.pipe(
    startWith({notifications: []}),
    map((notificationMessage: NotificationsMessage) => notificationMessage.notifications),
  );
  deleteNotificationsWS$: Subject<string> = new Subject();

  notificationsWS$: Observable<NotificationRawInterface[]> = mergeAll([
      this.appNotificationsWS$.pipe(startWith([])),
      this.deleteNotificationsWS$
    ]).pipe(
      scan((acc, current) => {
        let result = acc[0] || [];
        const [addMessages, deleteMessageId] = current;
        // Add new messages
        if (addMessages) {
          // if array empty - means no messages at all
          if (!addMessages.length) {
            result = [];
          } else {
            result = [].concat(result, addMessages);
          }
        }
        // Deleteing message from current notification list
        if (deleteMessageId) {
          const messIndex: number = result.findIndex((i: NotificationRawInterface) => i._id === deleteMessageId);
          if (messIndex > -1) {
            result.splice(messIndex, 1);
          }
        }
        return [result, undefined];
      }),
      map(acc => acc[0] || []),
    );

  private get token(): string {
    return Cookie.get('pe_auth_token') || '';
  }

  private disconnectEvent: Subject<void> = new Subject();

  public constructor(
  ) {

  }

  deleteMessage(messageId: string) {
    this.deleteNotificationsWS$.next(messageId);
  }

  public connectWS(backendConfig: NodeJsBackendConfigInterface, connectionParameters: any): WebSocket & NotificationSocket {
    if (!connectionParameters.entity) {
      return;
    }

    const socket: (WebSocket & NotificationSocket ) = new WebSocket(backendConfig.notificationsWs) as (WebSocket & NotificationSocket );
    socket.appName = connectionParameters.appName;
    socket.entity = connectionParameters.entity;
    socket.onopen = this.openHandler.bind(this);
    socket.onclose = () => {
      if (socket.onclose) {
        setTimeout(() => {
          const newSocket = this.connectWS.call(this, backendConfig, connectionParameters);
          newSocket.connectionId = socket.connectionId;
        }, CONNECTION_DELAY_SEC * 1000);
      }
    };
    socket.onmessage = this.messageHandler.bind(this);
    const unsubs = this.disconnectEvent.subscribe(() => {
      connectionParameters.entity = undefined;
      socket.connectionId = undefined;
      socket.onopen = undefined;
      socket.onclose = undefined;
      socket.onmessage = undefined;
      socket.close();
      unsubs.unsubscribe();
    });

    return socket;
  }

  public disconnectWs() {
    this.disconnectEvent.next();
  }

  private openHandler(event: MessageEvent) {
    const socket: NotificationSocket = event.target as NotificationSocket;
    socket.send(
      JSON.stringify({
        event: NotificationMessageNameEnum.CONNECT,
        data: {
          id: socket.connectionId,
          kind: 'business',
          entity: socket.entity,
          app: socket.appName,
          token: this.token,
        },
      }),
    );
  }

  private messageHandler(event: MessageEvent) {
    const message: any = JSON.parse(event.data);
    switch (message.name) {
      case NotificationMessageNameEnum.CONNECT:
      const socket: NotificationSocket = event.target as NotificationSocket;
      if (socket.connectionId !== message.id) {
          socket.connectionId = message.id;
          socket.send(
            JSON.stringify({
              event: NotificationMessageNameEnum.NOTIFICATIONS,
              data: {
                id: socket.connectionId,
                kind: 'business',
                entity: socket.entity,
                app: socket.appName,
                token: this.token,
              },
            })
          );
        }
        break;
      case NotificationMessageNameEnum.NOTIFICATIONS:
        this.appMessageWS$.next(message);
        break;
    }
  }

}

@Injectable()
export class NotificationsService {

  private appConnector: WebSocketConnector = new WebSocketConnector();

  private commonConnector: WebSocketConnector = new WebSocketConnector();

  private configBE$: Observable<NodeJsBackendConfigInterface> = this.envConfigService.getConfig$()
  .pipe(
    filter(config => !!config),
    map(config => config.backend),
  );

  private configAsync: Promise<NodeJsBackendConfigInterface>;

  private businessUuid$: Observable<string> = this.envService.businessUuid$.pipe(filter(businessUuid => !!businessUuid));
  private microAppReady$: Observable<string> = this.platformService.microAppReady$.pipe(distinctUntilChanged(), startWith(undefined));

  private microNavigation$: Observable<string> = this.platformService.microNavigation$.pipe(
    map((navData: string | { url: string }) => {
      let url: string;
      if (typeof navData === 'string') {
        url = navData;
      } else {
        url = navData.url;
      }
      const urlParams = (url || '').split('/');
      let appName: string = urlParams[0];
      if (appName === 'builder') {
        appName = urlParams[1];
      }

      return appName;
    }),
  );

  private microAppName$: Observable<string> = merge(
    this.microAppReady$,
    this.microNavigation$,
  ).pipe(
    switchMap(appName => {
      if (appName === 'builder') {
        if (this.router.url.includes('builder/')) {
          return of((/builder\/([^\/|$]+)/.exec(this.router.url) || [])[1]);
        } else {
          return empty();
        }
      } else {
        return of(appName);
      }
    }),
    map(appName => {
      switch (appName) {
        case 'builder':
        case 'shop':
          return 'shops';
        default:
          return appName;
      }
    }),
    distinctUntilChanged(),
    startWith(undefined),
  );

  private wsAppConnectionParameters$: Observable<any> = combineLatest(
    this.businessUuid$,
    this.microAppName$,
  ).pipe(
    map(([businessUuid, appName]) => {
      let appId: string;
      if (!appName) {
        appId = undefined;
      } else {
        appId = this.getAppId(appName);
      }

      const connParams = {
        kind: 'business',
        entity: (appName && appId) || businessUuid,
        appName: appName || 'dashboard',
      };
      return connParams;
    }),
    distinctUntilChanged((a, b) =>
      a.kind === b.kind &&
      a.entity === b.entity &&
      a.appName === b.appName
    ),
  );

  private appNotifications$: Observable<NotificationRawInterface[]> = combineLatest([
    this.configBE$,
    this.wsAppConnectionParameters$,
  ]).pipe(
    switchMap(([backendConfig, connectionParameters]) => {
      this.appConnector.disconnectWs();
      this.appConnector.connectWS(backendConfig, connectionParameters);
      return this.appConnector.notificationsWS$;
    }),
    shareReplay(1),
  );

  private wsCommonParameters$: Observable<any> = combineLatest(
    this.businessUuid$,
    this.microAppName$,
  ).pipe(
    map(([businessUuid, appName]) => {
      let commonApp: string;
      if (!appName) {
        commonApp = undefined;
      } else {
        commonApp = this.getCommonApp(appName);
      }

      if (commonApp === 'shop') {
        commonApp = 'shops'; // what?
      }

      if (!commonApp) {
        return {
          kind: 'business',
          entity: undefined,
          appName: undefined,
        };
      } else {
        return {
          kind: 'business',
          entity: businessUuid,
          appName: commonApp,
        };
      }
    }),
    distinctUntilChanged((a, b) =>
      a.kind === b.kind &&
      a.entity === b.entity &&
      a.appName === b.appName
    ),
  );

  private commonNotifications$: Observable<NotificationRawInterface[]> = combineLatest(
    this.configBE$,
    this.wsCommonParameters$,
  ).pipe(
    switchMap(([backendConfig, connectionParameters]) => {
      this.commonConnector.disconnectWs();
      this.commonConnector.connectWS(backendConfig, connectionParameters);
      return this.commonConnector.notificationsWS$;
    }),
    shareReplay(1),
  );

  // tslint:disable-next-line:member-ordering
  notifications$: Observable<NotificationRawInterface[]> = combineLatest([
    this.appNotifications$,
    this.commonNotifications$,
  ]).pipe(
    map(([app, common]) => [].concat(common, app)),
    distinctUntilChanged((c, p) =>  (c && p && c.length === p.length) && !c.some((a, i) => p[i] !== a)),
    shareReplay(1),
    startWith([]),
    withLatestFrom(this.activatedRoute.queryParamMap),
    map(([notif, queryParam]) => {
      return notif.map((message: NotificationRawInterface) => {
        return {
          ...message,
          params: queryParam['params']
        };
      });
    }),
  );

  public constructor(
    private envService: EnvService,
    private envConfigService: EnvironmentConfigService,
    private platformService: PlatformService,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.configAsync = new Promise((resolve) => this.configBE$.pipe(take(1)).subscribe(resolve));
  }

  async deleteMessage(messageId: string): Promise<void> {
    const configBE = await this.configAsync;
    await this.http.delete(configBE.notifications + `/api/notification/${messageId}`).toPromise();

    this.appConnector.deleteMessage(messageId);
    this.commonConnector.deleteMessage(messageId);
  }

  private getAppId(appName: string): string {
    const query = this.activatedRoute.queryParams as BehaviorSubject<any>;
    let urlPath: string[];
    switch (appName) {
      case 'transactions':
      case 'products':
        // TODO: filter by app id
        // if (query.value && query.value.embedded) {
        //   if (query.value.appId) {
        //     return query.value.appId;
        //   } else {
        //     urlPath = /shop\/([^\/]+)\//.exec(query.value && query.value.backUrl) || [];
        //     if (!urlPath.length) {
        //       urlPath = /pos\/([^\/]+)\//.exec(query.value && query.value.backUrl) || [];
        //     }
        //     return urlPath[1];
        //   }
        // } else if (query.value && query.value.appId) {
        //   return query.value && query.value.appId;
        // } else {
        //   urlPath = /\/pos\/([^\/]+)\//.exec(location.pathname) || [];
        //   return urlPath[1];
        // }
        return undefined;
      case 'shops':
        if (query.value && query.value.embedded) {
          if (query.value.backUrl) {
            urlPath = /shop\/([^\/]+)\//.exec(query.value.backUrl) || [];
            return urlPath[1];
          } else {
            return query.value.appId;
          }
        } else {
          urlPath = /\/shop\/([^\/]+)\//.exec(location.pathname) || [];
           return urlPath[1];
        }
      case 'pos':
        if (query.value && query.value.embedded) {
          if (query.value.backUrl) {
            urlPath = /pos\/([^\/]+)\//.exec(query.value.backUrl) || [];
            return urlPath[1];
          } else {
            return query.value.appId;
          }
        } else {
          urlPath = /pos\/([^\/]+)\//.exec(location.pathname) || [];
          return urlPath[1];
        }
      default:
        return undefined;
    }
  }

  private getCommonApp(appName: string): string {
    const query = this.activatedRoute.queryParams as BehaviorSubject<any>;
    switch (appName) {
      case 'transactions':
      case 'products':
      case 'checkout':
        if (`${query.value.embedded}` === 'true') {
          if (query.value.app) {
            return query.value.app;
          } else {
            if (query.value.shop) {
              return 'shop';
            } else if (query.value.pos) {
              return 'pos';
            }
            return undefined;
          }
        } else {
          if (/\/shop\//.exec(location.pathname)) {
            return 'shop';
          } else if (/\/pos\//.exec(location.pathname)) {
            return 'pos';
          }
          return undefined;
        }
      case 'shops':
        return 'shop';
      case 'pos':
        return 'pos';
      default:
        return undefined;
    }
  }

  getApplicationURL(message: NotificationMessage): any {

    if (message.actionKey.indexOf('url.tour') !== -1) {
      return {
        url: `welcome/${message.app}`,
      };
    }

    let result: { [key: string]: any };
    const microAppUrl = NotificationsTarget[message.actionKey];

    switch (message.app) {
      case 'transactions':
        if (message.data.transactionId) {
          if (message.params) {
            result = {
              url: microAppUrl.replace('{id}', message.data.transactionId),
              getParams: message.params,
              navigateInsideMicro: false
            };
          } else {
            result = {
              url: `${message.app}/${message.data.transactionId}`,
            };
          }
        }
        break;
      case 'products':
        if (message.data.productId) {
          if (message.params) {
            result = {
              url: microAppUrl.replace('{id}', message.data.productId),
              getParams: message.params,
              navigateInsideMicro: false
            };
          } else {
            result = { url: microAppUrl };
          }
        }
        break;
      case 'checkout':
        if (message.data.checkoutId) {
          result = {
            url: microAppUrl.replace('{id}', message.data.checkoutId),
          };
        }
        break;
      case 'connect':
        result = {
          url: microAppUrl,
        };
        break;
      case 'builder':
        if (message.data.shopId) {
          result = { url: microAppUrl.replace('{id}', message.data.shopId) };
        }
        break;
      case 'shop':
      case 'shops':
        if (message.message.includes('shops.url.selectBilling')) {
          this.envService.launchPricingOverlay$.next(true);
        }

        if (message.message.includes('legalDocuments')) {
          result = {
            url: microAppUrl,
            navigateInsideMicro: false
          };
          break;
        }

        if (message.data.shopId) {
          if (message.params) {
            result = {
              url: microAppUrl.replace('{id}', message.data.shopId),
              getParams: message.params,
              navigateInsideMicro: false
            };
          } else {
            result = { url: microAppUrl.replace('{id}', message.data.shopId) };
          }
        }

        break;

      default:
        result = {
          url: microAppUrl,
          navigateInsideMicro: false
        };
    }
    return result;
  }

}
