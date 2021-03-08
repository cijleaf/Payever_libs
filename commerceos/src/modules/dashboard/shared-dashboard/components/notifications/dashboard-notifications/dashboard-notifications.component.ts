import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, ViewChildren, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { MediaService } from '@pe/ng-kit/modules/media';
import { PlatformService, DashboardEventEnum, AbstractComponent } from '@pe/ng-kit/src/kit/common';
import { NavbarStyle, NavbarColor } from '@pe/ng-kit/modules/navbar';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { EnvService } from '../../../../../../apps/standalone/app/services/env.service';

import { NotificationsService, LoaderService, SidebarService } from '@modules/shared/services';
import { NotificationsEnum } from '@modules/dashboard/shared-dashboard/enum';
import { NotificationRawInterface } from '../../../../../shared/interfaces';
import { NotificationsTarget } from '../notifications-target';
import { Applications, APP_ICONS } from '../notifications-enum';
import { NotificationListInterface, NotificationMessage } from '../notifications-interface';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'dashboard-notifications',
  templateUrl: './dashboard-notifications.component.html',
  styleUrls: ['./dashboard-notifications.component.scss']
})
export class DashboardNotificationsComponent extends AbstractComponent implements OnInit {
  @ViewChild('notificationsEl') notificationsEl: ElementRef;
  @Input() buttonSize: number;

  activeNotificationView: NotificationsEnum = NotificationsEnum.Todo;
  notificationsEnum: typeof NotificationsEnum = NotificationsEnum;

  notificationMessages$: Observable<NotificationRawInterface[]> = this.notificationsService.notifications$.pipe(
    takeUntil(this.destroyed$),
    startWith([]),
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
    private sideBarService: SidebarService,
    private loaderService: LoaderService,
    private envService: EnvService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
  }

  onOpenMessage(message: NotificationMessage) {
    const data = this.notificationsService.getApplicationURL(message);

    console.log(data);

    if (data) {
      data.fromNotification = true;

      this.platformService.dispatchEvent({
        target: DashboardEventEnum.MicroNavigation,
        action: '',
        data: data
      });
      this.loaderService.appLoading = null;
      this.platformHeaderService.setHeaderColor(NavbarColor.Black);
      this.platformHeaderService.setHeaderStyle(NavbarStyle.Apps);

    } else {
      console.warn('The application URL can\'t be defined', message);
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    if (!this.notificationsEl.nativeElement.contains(event.target)) {
      this.sideBarService.sideBarOpened$.next(false);
    }
  }

  close(): void {
    this.sideBarService.sideBarOpened$.next(false);
  }

  async onCloseMessage(message: NotificationMessage) {
    message.delete$.next(true);
    await this.notificationsService.deleteMessage(message.id);
  }
}
