import { Component, ViewChild, ElementRef, NgZone, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router, NavigationStart, ActivatedRoute, NavigationEnd } from '@angular/router';

import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  take,
  takeUntil,
  tap,
  shareReplay,
  startWith,
  distinctUntilChanged,
  share,
  catchError,
  delay
} from 'rxjs/operators';

import { SessionService } from '@pe/ng-kit/modules/auth';
import {
  AbstractComponent,
  FrontendAppsEnum,
  LoaderManagerService,
  LoaderStateEnum,
  PlatformEventInterface,
  PlatformService,
  ProfileMenuEventInterface
} from '@pe/ng-kit/modules/common';
import { TranslationLoaderService, TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService, PlatfromHeaderInterface } from '@pe/ng-kit/modules/platform-header';
import { SidebarConfig } from '@pe/ng-kit/modules/sidebar';
import { WindowService } from '@pe/ng-kit/modules/window';
import { ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher';
import { peVariables } from '@pe/ui-kit/scss/pe-variables';
import { PeStepperService, PeSimpleStepperService, PeWelcomeStepperControl, PeWelcomeStepAction, PeWelcomeStepperAction } from '@pe/stepper';

import { LazyAppsLoaderService, AppLauncherService, DashboardDataService, EnvService, WallpaperService, HeaderService, AppSelectorService, PeShopHeaderService } from '@app/services';
import { ApiService, LoaderService, SidebarService } from '@modules/shared/services';
import { appsShownWithoutRedirect, appsUsingGlobalHeader } from 'settings';
import { switchMap } from 'rxjs/operators';
import { BusinessInterface } from '@modules/shared';
import { PePosHeaderService } from '@app/services/platform-header-apps-services/pos-header.service';


const GRID_UNIT_Y: number = peVariables.toNumber('gridUnitY');
const PADDING_VERTICAL: number = peVariables.toNumber('paddingXsVertical');
const PADDING__BASE_HOR: number = peVariables.toNumber('paddingBaseHorizontal');
const SIDEBAR_WIDTH: number = 415;

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'os-commerce-root',
  templateUrl: './root.component.html',
  styleUrls: ['root.component.scss']
})
export class RootLayoutComponent extends AbstractComponent implements OnInit, AfterViewInit {
  @ViewChild(MatMenuTrigger, { static: true }) trigger: MatMenuTrigger;

  sideBarOpened$: BehaviorSubject<boolean> = this.sidebarService.sideBarOpened$;
  appSelectorDisplayed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  reloadingTranslations: boolean = false;
  isPersonalAccountMode$: Observable<boolean>;
  currentMicroAppName: string;

  isLazyAppUsedPlatformHeader$: Observable<boolean> = combineLatest(
    this.platformService.microAppReady$,
    this.platformHeaderService.platformHeader$
  ).pipe(
    takeUntil(this.destroyed$),
    map(([appName, header]) => {
      return (header && header.microCode === appName) || appsUsingGlobalHeader.indexOf(appName) >= 0;
    })
  );
  belowPlatformSubheader$: Observable<boolean> = this.platformHeaderService.mobileView$;
  isSubheaderVisible$: Observable<boolean> = this.platformHeaderService.isSubheaderVisible$;
  showAlertInHeader$: Observable<boolean> = this.platformService.internetConnectionStatus$.pipe(
    map(connected => !connected),
    distinctUntilChanged()
  );

  showMicroApp$: Observable<boolean> = this.lazyAppsLoaderService.showMicroApp$.pipe(
    takeUntil(this.destroyed$),
    tap(showMicroApp => {
      if (showMicroApp) {
        this.wallpaperService.showDashboardBackground(false);
      } else {
        this.sidebarService.sideBarOpened$.next(false);
      }
    }),
    shareReplay(1)
  );

  sideBarOpenedView$: Observable<boolean> = combineLatest(
    this.sidebarService.sideBarOpened$,
    this.showMicroApp$.pipe(startWith(false))
  ).pipe(
    takeUntil(this.destroyed$),
    distinctUntilChanged((c, p) => !c.some((a, i) => p[i] !== a)),
    map(([opened, showMicroApp]) => {
      if (opened) {
        let currentRight: number = 0;
        if (!showMicroApp) {
          currentRight = this.getWidgetsRightOffset(window.innerWidth) + (false ? this.appsRightTranslation : 0);
        }
        this.updateAppsRightTranslation(currentRight);
      }
      return opened;
    }),
    shareReplay(1)
  );

  backgroundImage$: Observable<string> = this.wallpaperService.backgroundImage$.pipe(
    takeUntil(this.destroyed$),
    distinctUntilChanged(),
    map(backgroundImageUrl => `url(${backgroundImageUrl})`),
  );

  businessesList$: Observable<BusinessInterface[]> = this.apiService.getBusinessesList().pipe(
    takeUntil(this.destroyed$)
  );

  blurredbackgroundImage$: Observable<string> = this.wallpaperService.blurredBackgroundImage$.pipe(
    takeUntil(this.destroyed$),
    distinctUntilChanged(),
    map(backgroundImageUrl => `url(${backgroundImageUrl})`),
  );

  configuration$: Observable<SidebarConfig> = combineLatest(
    this.platformService.microAppReady$.pipe(startWith(undefined)),
    this.isLazyAppUsedPlatformHeader$.pipe(startWith(true)),
    this.belowPlatformSubheader$.pipe(startWith(false)),
    this.blurredbackgroundImage$.pipe(startWith(undefined))
  ).pipe(
    takeUntil(this.destroyed$),
    map(([microAppReady, isLazyAppUsedPlatformHeader, belowPlatformSubheader, blurredbackgroundImage]) => {
      return [!!microAppReady, isLazyAppUsedPlatformHeader && belowPlatformSubheader, blurredbackgroundImage];
    }),
    distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]),
    map(([showMicroApp, isSubheader, blurredbackgroundImage]) => {
      const headerK: number = isSubheader ? 2 : 1;
      const marginTop = (GRID_UNIT_Y * 2 + PADDING_VERTICAL * 4) * headerK;
      const paddingTop = GRID_UNIT_Y * 5 - 2 - marginTop;

      return {
        style: 'transparent',
        backgroundImage: blurredbackgroundImage,
        position: 'right',
        zIndex: 9999,
        marginRight: '0',
        marginBottom: '0',
        paddingTop: `${paddingTop}px`,
        width: `${SIDEBAR_WIDTH}px`,
        showCloseBtn: false
      } as SidebarConfig;
    }),
    shareReplay(1)
  );

  appsRightTranslation: number = 0;

  showBackground$: Observable<boolean> = this.wallpaperService.showDashboardBackground$.pipe(
    takeUntil(this.destroyed$),
  );
  showBackgroundView$: Observable<boolean> = combineLatest(
    this.showBackground$.pipe(startWith(false)),
    this.platformService.microAppReady$.pipe(startWith(undefined)),
    this.showMicroApp$.pipe(startWith(false))
  ).pipe(
    delay(0),
    takeUntil(this.destroyed$),
    map(([showBackground, appName, showMicroApp]) => {
      return showBackground && !(appName && showMicroApp);
    }),
    distinctUntilChanged()
  );

  headerHeightForStepper$ = combineLatest([ // @deprecated
      this.peStepperService.currentStep$,
      this.windowService.width$
    ])
    .pipe(
      delay(0),
      takeUntil(this.destroyed$),
      filter(([step, width]) => !!step),
      map(([step, w]) => {
        if (step.action === PeWelcomeStepAction.ShopPreview) {
          return w > 815 ? 26 : 52;
        }
        return 0;
      }),
      distinctUntilChanged()
  );

  stepperTopOffset$ = this.platformHeaderService.headerHeight$.pipe(
    delay(0),
    takeUntil(this.destroyed$),
    distinctUntilChanged()
  );

  theme$ = this.themeSwitcherService.theme$;

  PeWelcomeStepAction = PeWelcomeStepAction;

  @ViewChild('background', { static: true }) backgroundElement: ElementRef;
  @ViewChild('rootElement', { static: true }) rootElement: ElementRef<HTMLElement>;

  private closingSideBarTask: Promise<boolean> = Promise.resolve(true);

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private translateService: TranslateService,
    private platformHeaderService: PlatformHeaderService,
    public lazyAppsLoaderService: LazyAppsLoaderService,
    private loaderManagerService: LoaderManagerService,
    private appLauncherService: AppLauncherService,
    private apiService: ApiService,
    private dashboardDataService: DashboardDataService,
    protected wallpaperService: WallpaperService,
    private platformService: PlatformService,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private headerService: HeaderService,
    private loaderService: LoaderService,
    private windowService: WindowService,
    private sidebarService: SidebarService,
    private themeSwitcherService: ThemeSwitcherService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private overlayContainer: OverlayContainer,
    public peStepperService: PeStepperService, // @todo deprecated
    public peSimpleStepperService: PeSimpleStepperService,
    private envService: EnvService,
    public appSelectorService: AppSelectorService,
    private posHeaderService: PePosHeaderService,
    private shopHeaderService: PeShopHeaderService
  ) {
    super();
    localStorage.removeItem('pe-common_token');
    this.isPersonalAccountMode$ = this.activatedRoute.data.pipe(takeUntil(this.destroyed$), map(d => d.personal));
    this.loaderService.logoutEvent$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.onLogout();
    });
    window['rootZone'] = this.zone;

    window['stepper'] = this.peStepperService;
  }

  ngOnInit(): void {

    this.peStepperService.setTranslations(
      {
        [PeWelcomeStepperControl.Continue]: this.translateService.translate(`stepper.${PeWelcomeStepperControl.Continue}`),
        [PeWelcomeStepperControl.Skip]: this.translateService.translate(`stepper.${PeWelcomeStepperControl.Skip}`),
        [PeWelcomeStepperControl.Edit]: this.translateService.translate(`stepper.${PeWelcomeStepperControl.Edit}`),
        [PeWelcomeStepperControl.Open]: this.translateService.translate(`stepper.${PeWelcomeStepperControl.Open}`),
        [PeWelcomeStepperControl.GoBack]: this.translateService.translate(`stepper.${PeWelcomeStepperControl.GoBack}`),
      }
    );
    this.platformService.platformEvents$.pipe(
      takeUntil(this.destroyed$),
      filter((event: any) => event.target === 'dashboard-back'),
    ).subscribe(d => {

    });
    this.platformService.platformEvents$.pipe(
      takeUntil(this.destroyed$),
      filter((event: any) => event.target === 'wallpaper_updated'), // From settings app
    ).subscribe(d => {
      this.wallpaperService.setBackgrounds(d.data.wallpaper);
    });
    this.platformService.platformEvents$.pipe(
      takeUntil(this.destroyed$),
      filter((event: any) => event.target === 'browser_back_event'),
      debounceTime(100))
      .subscribe((event: any) => {

        this.zone.run(() => {
          this.router.navigateByUrl(event.action);
        }, 100);
      });

    this.envService.businessData$.pipe(
      filter(data => !!data)
    )
    .subscribe(businessData => {
      this.setThemes(businessData);
    });

    this.platformService.showAppSelector$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.appSelectorService.showAppSelector();
    });

    this.platformService.backToDashboard$.pipe(takeUntil(this.destroyed$))
      .subscribe(async (event: PlatformEventInterface) => {
        await this.closeSideBar();

        if (!this.headerService.loggedIn) {
          this.router.navigate(['entry/login']);
          return;
        }

        const [domain, dashboardType, businessUuid] = this.router.url.split('/');
        let navigatePath: any[];
        if (dashboardType === 'personal') {
          navigatePath = ['/personal'];
        } else {
          navigatePath = [`/business/${businessUuid || ''}`];
        }
        if (!(event.action === FrontendAppsEnum.Commerceos)) {
          await this.router.navigate(navigatePath);
          // we do this because some app could be created inside dashboard page. And when user close it
          // he will see correct platform header
          this.headerService.setBusinessDashboardHeader();
          this.wallpaperService.showDashboardBackground(true);
        }

        this.lazyAppsLoaderService.clearMicroContainerElement();

        this.platformService.microAppReady = '';
      });

    this.platformService.backToSwitcher$.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.router.navigate(['switcher/profile']).then(() => {
          this.lazyAppsLoaderService.clearMicroContainerElement();
          this.platformService.microAppReady = '';
        });
      });

    this.platformService.microLoading$.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged()
    )
      .subscribe((loading: LoaderStateEnum) => {
        this.platformHeaderService.disableButtons = loading === LoaderStateEnum.Loading;
        this.overlayCheck();
      });

    this.platformHeaderService.platformHeader$
      .pipe()
      .subscribe((data: PlatfromHeaderInterface) => {
        this.overlayCheck();
      });

    this.platformService.microNavigation$.pipe(takeUntil(this.destroyed$))
      .subscribe((microPath: string | any) => {
        this.platformService.microLoaded = false;
        const businessUuid: string = this.router.url.split('/')[2];
        const separators = ['/', '\\\?'];
        const currentlyOpenedApp: string = location.pathname.split(new RegExp(separators.join('|'), 'g'))[3];
        let appName: string;
        let path: string;
        let getParams: any = {};
        if (typeof microPath === 'string') {
          appName = microPath.split('/')[0];
          path = microPath;
        } else {
          appName = microPath.url.split('/')[0];
          path = microPath.url;
          getParams = microPath.getParams;
          getParams = microPath.getParams;
        }

        // if micro navigation is inside one app, like navigation between builder and themes
        // this navigation should be handled by app itself
        if (currentlyOpenedApp === appName) {
          return;
        }

        // NOTE: use micro container inside dashboard only if it is already used and event has useCurrentMicroContainer = true
        // useCurrentMicroContainer = true needed cos by default we use micro-container-component.
        // It is used in Shop and POS apps where we launch Shop app and then immidiatelly builder (or themes)
        // in the same micro container
        // Need to do check this.lazyAppsLoaderService.shownAppName !== appName becauseif occured micronavigation event
        // to the app that is laready laucnhed we have to do router.navgate inside  app. But we are inside commerceos and micronavgation
        // event occures from platform header.
        // That's why we launch app again but inside micro-container component
        if (
          this.lazyAppsLoaderService.shownAppName
          && this.lazyAppsLoaderService.shownAppName !== appName
          && appsShownWithoutRedirect.indexOf(appName)
          && microPath.useCurrentMicroContainer
        ) {
          path = `${path}?`;
          for (const key of Object.keys(microPath.getParams || {})) {
            path += `${key}=${microPath.getParams[key]}&`;
          }

          this.lazyAppsLoaderService.runMicroApp(appName, path).subscribe();
        } else if (microPath.navigateInsideMicro) {
          path = `${path}?`;
          for (const key of Object.keys(microPath.getParams || {})) {
            path += `${key}=${microPath.getParams[key]}&`;
          }

          this.sidebarService.sideBarOpened$.next(false);
          this.lazyAppsLoaderService.isMicroAppShown = false;
          this.appLauncherService.launchApp(appName, path).pipe(
            takeUntil(this.destroyed$),
          ).subscribe(() => {
            this.wallpaperService.showDashboardBackground(false);
          });
        } else {
          const url: string = path;
          const pathLog = `business/${businessUuid}/${url} \n queryParams: ${JSON.stringify(getParams)}`;
          this.router.navigate([`business/${businessUuid}/${url}`], { queryParams: getParams }).then(() => {
            this.wallpaperService.showDashboardBackground(false);
          });
        }
      });

    this.platformService.localeChanged$.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      this.reloadingTranslations = true;
      this.cdr.detectChanges();
      this.translationLoaderService.reloadTranslations(event.data).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.reloadingTranslations = false;
        this.cdr.detectChanges();
      });
    });

    this.platformService.profileMenuChanged$.pipe(
      takeUntil(this.destroyed$),
      delay(0)
    ).subscribe((profileMenu: ProfileMenuEventInterface) => {
      if (profileMenu.firstName && profileMenu.lastName) {
        this.dashboardDataService.label = `${profileMenu.firstName} ${profileMenu.lastName}`;
      }

      if (profileMenu.logo || profileMenu.logo === null) {
        this.dashboardDataService.logo = profileMenu.logo;
      }

      if (profileMenu.name) {
        this.dashboardDataService.label = profileMenu.name;
      }
    });

    this.headerService.sidebarButtonClick$.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.sidebarService.sideBarOpened$.next(!this.sidebarService.sideBarOpened$.value);
      });

    this.router.events.pipe(
      takeUntil(this.destroyed$)
    )
      .subscribe(route => {
        if (route instanceof NavigationStart) {
          this.closeSideBar();
        }
      });

    this.sessionService.startUserInactivityDetection();
  }

  setThemes(businessData: BusinessInterface) {
    if (businessData.hasOwnProperty('themeSettings')) {
      this.themeSwitcherService.changeTheme(businessData.themeSettings.theme);
    }

    if (businessData.currentWallpaper && businessData.currentWallpaper.auto) {
      this.themeSwitcherService.autoTheme$.next(businessData.currentWallpaper.theme);
      this.themeSwitcherService.autoMode$.next(true);
    }
  }

  overlayCheck(): void {
    // fix for Material menu bug:
    // After header resets while mat-menu or mat-dialog is open inside of micro - menus that use CDK-overlay won't work because parent of CDK-element is null
    // Readding current overlay as _containerElement fixes the null parent issue
    (this.overlayContainer as any)._containerElement = document.querySelectorAll(`.cdk-overlay-container`)[0];
  }

  onLogout(): void {
    this.loaderManagerService.backgroundDefault$.pipe(take(1))
      .subscribe((image: string) => {
        this.loaderManagerService.changeBackground(image);
      });
  }

  ngAfterViewInit(): void {
    this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, false);

    combineLatest([
      this.windowService.width$,
      this.showMicroApp$.pipe(startWith(false))
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([windowWidth, showMicroApp]) => {
      let currentRight: number = 0;
      if (!showMicroApp) {
        currentRight = this.getWidgetsRightOffset(windowWidth) - (this.sidebarService.sideBarOpened$.value ? this.appsRightTranslation : 0);
      }
      this.updateAppsRightTranslation(currentRight);
    });
  }

  async closeSideBar(): Promise<boolean> {

    if (this.sidebarService.sideBarOpened$.value) {
      this.closingSideBarTask = new Promise((resolve) => {
        this.sidebarService.sideBarOpened$.next(false);
        setTimeout(() => resolve(true), 450); // should await the sidebar fully closed
      });
    }

    return this.closingSideBarTask;
  }

  closeAppSelect(): void {
    this.appSelectorService.hideWithDelay();
  }

  setSidebarState(isSidebarOpen: boolean) {
    this.sidebarService.sideBarOpened$.next(isSidebarOpen);
  }

  private getWidgetsRightOffset(windowWidth: number): number {
    const rightRootElement = this.rootElement.nativeElement.querySelector('.widgets-dashboard-wrapper')
      || this.rootElement.nativeElement.querySelector('.apps-dashboard-wrapper');
    if (rightRootElement) {
      return windowWidth - rightRootElement.getBoundingClientRect().right;
    }
    return 0;
  }

  private updateAppsRightTranslation(currentRightTranslate: number) {
    if (currentRightTranslate <= SIDEBAR_WIDTH) {
      this.appsRightTranslation = SIDEBAR_WIDTH - currentRightTranslate;
    } else if (currentRightTranslate - this.appsRightTranslation <= SIDEBAR_WIDTH) {
      this.appsRightTranslation = 0;
    }
  }

}
