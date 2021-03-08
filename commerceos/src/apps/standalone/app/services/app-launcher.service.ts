import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import { DashboardEventEnum, PlatformService } from '@pe/ng-kit/modules/common';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { NavbarColor, NavbarStyle } from '@pe/ng-kit/modules/navbar';

import { ApiService, LoaderService } from '../../../../modules/shared/services';
import { appsShownWithoutRedirect } from '../../../../settings';
import { EnvService } from './env.service';
import { LazyAppsLoaderService } from './lazy-apps-loader.service';

/**
 * This is the only correct service to launch any apps
 */
@Injectable()
export class AppLauncherService {

  constructor(
    private envService: EnvService,
    private loaderService: LoaderService,
    private lazyAppsLoaderService: LazyAppsLoaderService,
    private platformHeaderService: PlatformHeaderService,
    private platformService: PlatformService,
    private apiService: ApiService,
  ) { }

  launchApp(appName: string, urlPath?: string): Observable<boolean> {
    // TODO: has to be removed after new shop release
    const nonMicroApps: string[] = [
      'shop',
      'studio',
      'contacts',
      'checkout',
      'connect',
      'coupons',
      'finexp',
      'pos',
      'products',
      'site',
      'shipping',
      "statistics",
      // 'transactions'
    ];
    if (nonMicroApps.indexOf(appName) >= 0) {

      // TODO: delete when routing shop will be fixed and will have correct redirects, to builder for example
      if (appName === 'shop' && !urlPath) {
        urlPath = 'shop';
      }

      if (appName === 'pos' && !urlPath) {
        urlPath = 'pos/builder';
      }

      if (appName === 'transactions' && !urlPath) {
        urlPath = 'transactions/list';
      }

      if (appName === 'shipping' && !urlPath) {
        urlPath = 'shipping/profiles';
      }

      if (appName === 'statistics' && !urlPath) {
        urlPath = 'statistics/list';
      }

      return this.lazyAppsLoaderService.runPackagedApp(appName, urlPath);
    }

    let obs$: Observable<boolean>;
    if (appsShownWithoutRedirect.indexOf(appName) >= 0) {
      obs$ = this.loaderService.loadMicroScript(
        appName,
        this.envService.isPersonalMode ? this.envService.businessUuid : undefined
      ).pipe(
        switchMap(() => this.lazyAppsLoaderService.runMicroApp(appName, urlPath)),
        switchMap(() => this.lazyAppsLoaderService.appReadyEvent$),
        map(() => true),
        take(1),
        tap(() => {
          this.lazyAppsLoaderService.isMicroAppShown = true;
          this.loaderService.appLoading = null;
          this.platformHeaderService.setHeaderColor(NavbarColor.Black);
          this.platformHeaderService.setHeaderStyle(NavbarStyle.Apps);
        })
      );
    } else {
      this.loaderService.appLoading = appName;

      obs$ = this.loaderService.loadMicroScript(appName, this.envService.businessUuid).pipe(
        tap(() => {
          this.platformService.dispatchEvent({
            target: DashboardEventEnum.MicroNavigation,
            action: '',
            data: {
              url: `${appName}${urlPath ? '/' + urlPath : ''}`,
              useContainerInsideDashboard: false,
              useCurrentMicroContainer: false,
            }
          });
          this.loaderService.appLoading = null;
          this.platformHeaderService.setHeaderColor(NavbarColor.Black);
          this.platformHeaderService.setHeaderStyle(NavbarStyle.Apps);
        })
      );
    }

    return obs$.pipe(
      catchError(() => {
        this.loaderService.appLoading = null;
        return of(false);
      })
    );
  }

  // Need for widgets
  toggleInstalledApp(businessId: string, data: any): Observable<any> {
    return this.apiService.toggleInstalledApp(businessId, data);
  }

  }
