import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  HostListener,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter
} from "@angular/core";

import { Observable } from "rxjs";
import {
  map,
  startWith,
  distinctUntilChanged,
  takeUntil,
  tap,
  filter
} from "rxjs/operators";

import { MediaService } from "@pe/ng-kit/modules/media";
import {
  PlatformService,
  DashboardEventEnum,
  AbstractComponent
} from "@pe/ng-kit/src/kit/common";
import { NavbarStyle, NavbarColor } from "@pe/ng-kit/modules/navbar";
import { PlatformHeaderService } from "@pe/ng-kit/modules/platform-header";

import {
  NotificationsService,
  LoaderService,
  SidebarService
} from "@modules/shared/services";
import { NotificationsEnum } from "@modules/dashboard/shared-dashboard/enum";
import { NotificationRawInterface } from "../../../../../shared/interfaces";
import { NotificationsTarget } from "../notifications-target";
import { Applications, APP_ICONS } from "../notifications-enum";
import { EnvService } from '../../../../../../apps/standalone/app/services/env.service';
import {
  NotificationListInterface,
  NotificationMessage,
  NotificationListMessageInterface
} from "../notifications-interface";

@Component({
  // tslint:disable-next-line component-selector
  selector: "widget-notifications",
  templateUrl: "./widget-notifications.component.html",
  styleUrls: ["./widget-notifications.component.scss"]
})
export class WidgetNotificationsComponent extends AbstractComponent
  implements OnInit {
  @Input() appCode: string;

  opened: boolean = true;
  // @Output() open: EventEmitter<string> = new EventEmitter();
  // @Output() close: EventEmitter<string> = new EventEmitter();

  @Output() notificationCountChange: EventEmitter<number> = new EventEmitter();

  notificationMessages$: Observable<
    NotificationRawInterface[]
  > = this.notificationsService.notifications$.pipe(
    takeUntil(this.destroyed$),
    startWith([])
  );

  // notificationApp$: Observable<string[]> = this.notificationMessages$.pipe(
  //   takeUntil(this.destroyed$),
  //   map(notifications => {
  //     return notifications.map(notification => notification.app);
  //   }),
  //   map((apps: string[]) => Array.from(new Set<string>(apps))),
  //   distinctUntilChanged((current, prev) => {
  //     return current.length === prev.length && current.every((a, index) => a === prev[index]);
  //   }),
  // );

  // notifications$: Observable<NotificationListInterface[]> = this.notificationApp$.pipe(
  //   takeUntil(this.destroyed$),
  //   map((apps) => {
  //     return apps.map(app => {
  //       const isApp: boolean = typeof Applications[app] !== 'undefined';
  //       return ({
  //         title: isApp ? `info_boxes.notifications.panels.${app || ''}.title` : app,
  //         iconSrc: isApp ? this.mediaService.getIconsPngUrl(APP_ICONS[Applications[app]]) : '',
  //         notifications$: this.notificationMessages$.pipe(
  //           takeUntil(this.destroyed$),
  //           map(notifications => notifications
  //             .filter(n => n.app === app)
  //             .map(n => new NotificationMessage(n))
  //           )
  //         )
  //       });
  //     });
  //   })
  // );

  notifications$: Observable<
    NotificationListMessageInterface[]
  > = this.notificationMessages$.pipe(
    takeUntil(this.destroyed$),
    map(notifications =>
      notifications
        .filter(n => n.app === this.appCode)
        .map(n => new NotificationMessage(n))
    ),
    tap(notifications =>
      this.notificationCountChange.emit(notifications.length)
    )
  );

  constructor(
    private platformHeaderService: PlatformHeaderService,
    private mediaService: MediaService,
    private notificationsService: NotificationsService,
    private platformService: PlatformService,
    private sideBarService: SidebarService,
    private loaderService: LoaderService,
    private envService: EnvService,
  ) {
    super();
  }

  ngOnInit(): void {}

  onOpenMessage(message: NotificationMessage) {
    const appURL = this.notificationsService.getApplicationURL(message);

    if (appURL) {
      this.platformService.dispatchEvent({
        target: DashboardEventEnum.MicroNavigation,
        action: "",
        data: appURL
      });
      this.loaderService.appLoading = null;
      this.platformHeaderService.setHeaderColor(NavbarColor.Black);
      this.platformHeaderService.setHeaderStyle(NavbarStyle.Apps);
    } else {
      console.warn("The application URL can't be defined", message);
    }
  }

  async onCloseMessage(message: NotificationMessage) {
    message.delete$.next(true);
    await this.notificationsService.deleteMessage(message.id);
  }
}
