import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { PlatformService, DashboardEventEnum, AbstractComponent } from '@pe/ng-kit/src/kit/common';
import { NavbarStyle, NavbarColor } from '@pe/ng-kit/modules/navbar';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { MediaService } from '@pe/ng-kit/modules/media';

import { NotificationsService, LoaderService } from '../../../../../shared/services';
import { NotificationRawInterface } from '../../../../../shared/interfaces';
import { NotificationsTarget } from '../notifications-target';
import { Applications, APP_ICONS } from '../notifications-enum';
import { NotificationListInterface, NotificationMessage } from '../notifications-interface';
import { EnvService } from '../../../../../../apps/standalone/app/services/env.service';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'application-notifications',
  templateUrl: './application-notifications.component.html',
  styleUrls: ['./application-notifications.component.scss'],
})
export class ApplicationNotificationsComponent extends AbstractComponent {

  notificationMessages$: Observable<NotificationRawInterface[]> = this.notificationsService.notifications$.pipe(
    takeUntil(this.destroyed$),
    startWith([])
  );

  notificationApp$: Observable<string[]> = this.notificationMessages$.pipe(
    takeUntil(this.destroyed$),
    map(notifications => {
      return notifications.map(notification => notification.app);
    }),
    map((apps: string[]) => Array.from(new Set<string>(apps))),
    distinctUntilChanged((current, prev) => {
      return current.length === prev.length && current.every((a, index) => a === prev[index]);
    }),
  );

  notifications$: Observable<NotificationListInterface[]> = this.notificationApp$.pipe(
    takeUntil(this.destroyed$),
    map((apps) => {
      return apps.map(app => {
        const isApp: boolean = typeof Applications[app] !== 'undefined';
        return ({
          title: isApp ? `info_boxes.notifications.panels.${app || ''}.title` : app,
          iconSrc: isApp ? this.mediaService.getIconsPngUrl(APP_ICONS[Applications[app]]) : '',
          notifications$: this.notificationMessages$.pipe(
            takeUntil(this.destroyed$),
            map(notifications => notifications
              .filter(n => n.app === app)
              .map(n => new NotificationMessage(n))
            )
          )
        });
      });
    })
  );

  constructor(
    private platformHeaderService: PlatformHeaderService,
    private mediaService: MediaService,
    private notificationsService: NotificationsService,
    private platformService: PlatformService,
    private loaderService: LoaderService,
    private envService: EnvService,
  ) {
    super();
  }

  onOpenMessage(message: NotificationMessage) {
    const appURL = this.notificationsService.getApplicationURL(message);
    if (appURL) {

      this.platformService.dispatchEvent({
        target: DashboardEventEnum.MicroNavigation,
        action: '',
        data: appURL
      });
      this.loaderService.appLoading = null;
      this.platformHeaderService.setHeaderColor(NavbarColor.Black);
      this.platformHeaderService.setHeaderStyle(NavbarStyle.Apps);

    } else {
      console.warn('The application URL can\'t be defined', message);
    }
  }

  async onCloseMessage(message: NotificationMessage) {
    message.delete$.next(true);
    await this.notificationsService.deleteMessage(message.id);
  }
}
