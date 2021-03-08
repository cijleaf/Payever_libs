import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { MicroAppInterface, MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { combineLatest, EMPTY, Observable, Subject, timer, of, from, BehaviorSubject } from 'rxjs';
import { map, startWith, take, takeUntil, switchMap, filter } from 'rxjs/operators';

import {
  AppLauncherService,
  EnvService,
  HeaderService,
  WallpaperService,
} from '../../../../../apps/standalone/app/services';
import { WidgetInfoInterface, WidgetTypeEnum } from '../../../shared-dashboard/interfaces';
import { EditWidgetsService } from '../../../shared-dashboard/services';
import { Platform } from '@angular/cdk/platform';
import {
  ApiService,
  LoaderService,
  NotificationsService
} from '@modules/shared';
import {
  NotificationMessage
} from '@modules/dashboard/shared-dashboard/components/notifications/notifications-interface';
import { DashboardEventEnum, PlatformService } from '@pe/ng-kit/src/kit/common/index';
import { NavbarColor, NavbarStyle } from '@pe/ng-kit/modules/navbar/index';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header/index';
import { AppSetUpStatusEnum } from '@pe/ng-kit/modules/micro/index';
import { PeStepperService } from '@pe/stepper';
import { StepperHelperService } from '@modules/dashboard/shared-dashboard/services/stepper-helper.service';
import { WidgetType, Widget } from '@pe/widgets';
import { ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher';
import { PeThemeEnum } from '@app/interfaces/theme.interface';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetsLayoutComponent implements OnInit, OnDestroy {

  readonly WidgetTypeEnum: typeof WidgetTypeEnum = WidgetTypeEnum;

  @ViewChild('scrollElement') scrollElement: ElementRef;

  theme$ = this.themeSwitcherService.theme$;

  widgets$: Observable<Widget[]>;
  // showEdit: boolean = false;

  isSafari: boolean = this.platform.SAFARI; // safari for backdrop-filter

  private micros: MicroAppInterface[];
  private destroyed$: Subject<void> = new Subject<void>();

  constructor(
    private envService: EnvService,
    private editWidgetsService: EditWidgetsService,
    private router: Router,
    private microRegistryService: MicroRegistryService,
    private authService: AuthService,
    private wallpaperService: WallpaperService,
    private platform: Platform,
    private notificationsService: NotificationsService,
    private platformService: PlatformService,
    private loaderService: LoaderService,
    private platformHeaderService: PlatformHeaderService,
    private headerService: HeaderService,
    private peStepperService: PeStepperService,
    private stepperHelperService: StepperHelperService,
    private appLauncherService: AppLauncherService,
    private apiService: ApiService,
    private themeSwitcherService: ThemeSwitcherService,
  ) { }

  ngOnInit(): void {
    this.wallpaperService.showDashboardBackground(true);

    this.micros = this.microRegistryService.getMicroConfig() as MicroAppInterface[];

    this.widgets$ = combineLatest([
      this.editWidgetsService.installedWidgets$,
      this.authService.onChange$.pipe(startWith(null)),
    ]).pipe(
      map(([ widgets ]) => widgets
        // .filter((widget: WidgetInfoInterface) => {
        //   return !this.envService.businessUuid || this.authService.isAdmin() || widget.type === WidgetTypeEnum.Apps || this.haveAccessToWidgetByPermissions(
        //     this.authService.getUserData().roles, this.envService.businessUuid, widget
        //   );
        // })
        .map((widget: WidgetInfoInterface) => {
          const micro = this.micros.find((m: MicroAppInterface) => m.code === widget.type);
          return {
            ...widget,
            setupStatus: micro ? micro.setupStatus : widget.setupStatus,
            installedApp: micro && micro.installed || false,
            defaultApp: micro && micro.default || false,
            onInstallAppClick: (appName: string) => {
              return this.onInstallAppClick(appName);
            }
          };
        }),
      ),
      map(widgets => this.fillWidgetsConfigs(widgets)),
      switchMap(widgets => this.handleThemeChanging(widgets)),
      switchMap(widgets => this.handleNotifications(widgets)),
      // tap(() => this.showEdit = true),
      takeUntil(this.destroyed$),
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onInstallAppClick(appName: string): Observable<void> {
    const subject = new BehaviorSubject(false);
    const result = subject.asObservable().pipe(filter(a => !!a), map(() => null));

    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(appName);
    if (appName) {
      this.install(appName).pipe(take(1)).subscribe(() => {
        if (micro && ([AppSetUpStatusEnum.Completed, AppSetUpStatusEnum.Started].indexOf(micro.setupStatus) >= 0)) {
          this.appLauncherService.launchApp(appName).subscribe(
            () => {
              subject.next(true);
              this.editWidgetsService.updateList$.next({});
            }
          );
        } else {
          subject.next(true);
          this.navigateToWelcomeScreen(appName);
        }
      });
    } else {
      subject.next(true);
    }
    return result;
  }

  onOpenButtonClick(appName: WidgetTypeEnum, appUrlPath?: string): Observable<any> {
    appUrlPath = appUrlPath || '';
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(appName) as MicroAppInterface;
    // this.headerService.resetHeader();
    if ((micro && micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      return this.appLauncherService.launchApp(appName, appUrlPath);
    } else {
      const url: string = `business/${this.envService.businessUuid}/welcome/${appName}`;
      this.router.navigate([url]); // go to welcome-screen
      return EMPTY;
    }
  }

  openEditAppsBox(): Observable<any> {
    if (this.envService.isPersonalMode) {
      this.router.navigate([`personal/info/edit`, {view: 'widgets'}]);
    } else {
      this.router.navigate([`business/${this.envService.businessUuid}/info/edit`, {view: 'widgets'}]);
    }
    return EMPTY;
  }

  private navigateToWelcomeScreen(appName: string): void {
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(appName);
    this.headerService.resetHeader();
    this.wallpaperService.showDashboardBackground(false);

    timer(100).subscribe(() => {
      if (micro.setupStatus === AppSetUpStatusEnum.Started && micro.code === 'shop' && this.peStepperService.currentStep) {
        this.stepperHelperService.navigateToStep(this.peStepperService.currentStep.action);
        return;
      }

      const url: string[] = [`business/${this.envService.businessUuid}/welcome/${appName}`];
      this.router.navigate(url);
    });
  }

  private install(appName: string): Observable<any> {
    const businessId: string = this.envService.businessUuid;
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(appName);
    if (micro) {
      const data = {
        microUuid: micro._id,
        installed: true
      };
      micro.installed = true;
      return this.apiService.toggleInstalledApp(businessId, data);
    }
    return EMPTY;
  }

  private fillWidgetsConfigs(widgets: WidgetInfoInterface[]): Widget[] {
    return widgets.map(widget => {
      switch (widget.type) {
        case WidgetTypeEnum.Apps:
          return this.initAppsWidget(widget);
        case WidgetTypeEnum.Transactions:
          return this.initTransactionsWidget(widget);
        case WidgetTypeEnum.Shop:
          return this.initStoreWidget(widget);
        case WidgetTypeEnum.Pos:
          return this.initPosWidget(widget);
        case WidgetTypeEnum.Checkout:
          return this.initCheckoutWidget(widget);
        case WidgetTypeEnum.Ads:
          return this.initAdsWidget(widget);
        case WidgetTypeEnum.Connect:
          return this.initConnectWidget(widget);
        case WidgetTypeEnum.Contacts:
          return this.initContactsWidget(widget);
        case WidgetTypeEnum.Marketing:
          return this.initMarketingWidget(widget);
        case WidgetTypeEnum.Products:
          return this.initProductsWidget(widget);
        case WidgetTypeEnum.Settings:
          return this.initSettingsWidget(widget);
        case WidgetTypeEnum.Studio:
          return this.initStudioWidget(widget);
        case WidgetTypeEnum.Tutorial:
          return this.initTutorialWidget(widget);
        default:
          return null;
      }
    }).filter(Boolean);
  }

  private handleThemeChanging(widgets: Widget[]): Observable<Widget[]> {
    return this.theme$.pipe(
      map(theme => widgets.map(widget => {
        widget.notificationsIcon = `icons-apps-notifications/${widget.appName}-${theme === PeThemeEnum.LIGHT ? 'black.png' : 'white.png'}`;
        return widget;
      })),
    );
  }

  private handleNotifications(widgets: Widget[]): Observable<Widget[]> {
    return this.notificationsService.notifications$.pipe(
      map(notifications => {
        widgets.filter(widget => widget.appName !== WidgetTypeEnum.Tutorial).forEach(widget => {
          const widgetNotifications = notifications.filter(
            (notification) => notification.app === widget.appName
          ).map(n => {
            const notification = new NotificationMessage(n);
            return {
              message: notification.message,
              openFn: () => {
                const appURL = this.notificationsService.getApplicationURL(notification);

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
                  console.warn("The application URL can't be defined", notification);
                }
                return EMPTY;
              },
              deleteFn: () => {
                notification.delete$.next(true);
                return from(this.notificationsService.deleteMessage(notification.id));
              },
            }
          });
          widget.notifications = widgetNotifications;
          widget.notificationCount = widgetNotifications.length;
        });
        return widgets;
      }),
    );
  }

  private initTransactionsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Text,
      appName: WidgetTypeEnum.Transactions,
      title: 'widgets.transactions.title',
      icon: '#transactions-widget-icon',
      iconUrl: 'icon-commerceos-transactions-64.png',
      installIconUrl: 'icon-comerceos-transactions-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Transactions),
    };
  }

  private initAppsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Icons,
      appName: WidgetTypeEnum.Apps,
      title: this.envService.isPersonalMode ? 'widgets.apps.title-personal' : 'widgets.apps.title-business',
      iconUrl: 'icon-commerceos-applications-64.png',
      installIconUrl: 'icon-commerceos-dashboard-not-installed.png',
      icon: '#icon-apps-apps',
      data: [],
      showInstallAppButton: false,
      openButtonLabel: 'widgets.actions.edit',
      openButtonFn: () => this.openEditAppsBox(),
    }
  }

  private initStoreWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Shop,
      title: 'widgets.store.title',
      subTitle: 'widgets.store.install-app',
      icon: '',
      iconUrl: 'icon-commerceos-store-64.png',
      installIconUrl: 'icon-comerceos-shop-not-installed.png',
      data: [],
      noDataTitle: 'widgets.store.no-shops',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Shop, 'shop/dashboard'),
    };
  }

  private initPosWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Pos,
      title: 'widgets.pos.title',
      subTitle: 'widgets.pos.install-app',
      icon: '#icon-db-pos-96',
      iconUrl: 'icon-commerceos-pos-64.png',
      installIconUrl: 'icon-comerceos-pos-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Pos),
    };
  }

  private initCheckoutWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Checkout,
      title: 'widgets.checkout.title',
      subTitle: 'widgets.checkout.actions.add-new',
      icon: '',
      iconUrl: 'icon-commerceos-checkout-64.png',
      installIconUrl: 'icon-comerceos-checkout-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Checkout),
    };
  }

  private initAdsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Ads,
      title: 'widgets.ads.title',
      subTitle: 'widgets.ads.install-app',
      icon: '',
      iconUrl: 'icon-commerceos-ad-64.png',
      installIconUrl: 'icon-commerceos-ad-not-installed.png',
      data: [],
      showInstallAppButton: false,
    };
  }

  private initConnectWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Connect,
      title: 'widgets.connect.title',
      icon: '',
      iconUrl: 'icon-commerceos-connect-64.png',
      installIconUrl: 'icon-comerceos-connect-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Connect);
      },
    };
  }

  private initContactsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Custom,
      appName: WidgetTypeEnum.Contacts,
      title: 'widgets.contacts.title',
      subTitle: 'widgets.contacts.install-app',
      icon: '#icon-contacts',
      iconUrl: 'icon-commerceos-customers-64.png',
      installIconUrl: 'icon-comerceos-contacts-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Contacts);
      },
    };
  }

  private initMarketingWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Custom,
      appName: WidgetTypeEnum.Marketing,
      title: 'widgets.marketing.title',
      subTitle: 'widgets.marketing.install-app',
      icon: '',
      iconUrl: 'icon-commerceos-marketing-64.png',
      installIconUrl: 'icon-comerceos-mail-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Marketing);
      },
    };
  }

  private initProductsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Grid,
      appName: WidgetTypeEnum.Products,
      title: 'widgets.products.title',
      subTitle: 'widgets.products.actions.add-new',
      icon: '',
      iconUrl: 'icon-commerceos-products-64.png',
      installIconUrl: 'icon-comerceos-product-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Products);
      },
    };
  }

  private initSettingsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Settings,
      title: 'widgets.settings.title',
      icon: '#icon-apps-settings',
      iconUrl: 'icon-commerceos-settings-64.png',
      installIconUrl: 'icon-comerceos-settings-not-installed.png',
      data: [],
      showInstallAppButton: false,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Settings);
      },
    };
  }

  private initStudioWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Grid,
      appName: WidgetTypeEnum.Studio,
      title: 'widgets.studio.title',
      subTitle: 'widgets.studio.install-app',
      icon: '',
      iconUrl: 'icon-commerceos-studio-64.png',
      installIconUrl: 'icon-comerceos-studio-not-installed.png',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Studio)
      }
    };
  }

  private initTutorialWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Table,
      appName: WidgetTypeEnum.Tutorial,
      title: 'widgets.tutorial.title',
      icon: '',
      iconUrl: 'icon-commerceos-tutorial-40.png',
      data: [],
      installedApp: true,
      defaultApp: true,
      installed: true,
      showInstallAppButton: false,
      onInstallAppClick: () => {
        return EMPTY;
      },
    };
  }

  // private haveAccessToWidgetByPermissions(
  //   userPermissions: UserPermissionsInterface[],
  //   businessId: string,
  //   widget: WidgetInfoInterface
  // ): boolean {
  //   return userPermissions.some((userPermission: UserPermissionsInterface) =>
  //     userPermission.permissions.some((permission: PermissionInterface) =>
  //       permission.businessId === businessId
  //       && (
  //         !permission.acls
  //         || !permission.acls.length
  //         || permission.acls.some((acl: AclInterface) =>
  //           acl.microservice === widget.type
  //           && Object.keys(acl).some((option: string) => option !== 'microservice' && acl[option] === true)
  //         )
  //       )
  //     )
  //   );
  // }
}
