import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject, BehaviorSubject } from 'rxjs';
import {
  tap,
  takeUntil,
  switchMap,
  filter,
  distinctUntilChanged,
} from 'rxjs/operators';
import {
  Router,
  NavigationEnd,
  NavigationStart,
} from '@angular/router';

import { PebEnvService } from '@pe/builder-core';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { MediaUrlPipe } from '@pe/ng-kit/modules/media';
import {
  PePlatformHeaderConfig,
  PePlatformHeaderService,
} from '@pe/platform-header';
import { PebPosApi } from '@pe/builder-api';

import { BusinessInterface } from '@modules/shared';

import { AppSelectorService } from '../app-selector.service';
import { HeaderService } from '../header.service';
import { EnvService } from '../env.service';

enum PosRoutes {
  SETTINGS = 'settings',
  DASHBOARD = 'dashboard',
  PANEL_CONNECT = 'panel-connect',
  CONNECT = 'connect',
}

@Injectable()
export class PePosHeaderService {
  // @TODO add translations
  businessData: BusinessInterface;
  currentTerminal: any;
  currentRoute: PosRoutes = this.router.url
    .split(';')[0]
    .split('/')
    .reverse()[0] as PosRoutes;
  contactHref: string = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref: string =
    'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  hideBusinessItemTextMaxWidth = 729;
  subheaderMaxWidth = 620;
  isShowBusinessItemText: boolean = true;
  isSubheaderMode: boolean = false;
  prevUrl: string;

  destroyed$ = new Subject<void>();
  isInitialized: boolean = false;
  terminalId$ = new BehaviorSubject<string>(null);

 // TODO(@mivnv) Remove it, and use translation;

  get locale(): string {
    return this.envService.businessData?.defaultLanguage ?? 'en';
  }

  get settingsTitle(): string {
    if (this.locale === 'de') {
      return 'Einstellungen'
    } else if (this.locale === 'sv') {
      return 'Inställningar'
    }
    return 'Settings'
  }

  get addTerminalTitle(): string {
    if (this.locale === 'de') {
      return 'Terminal erstellen'
    } else if (this.locale === 'sv') {
      return 'Lägg till terminal'
    }
    return 'Add new terminal'
  }

  get switchTerminalTitle(): string {
    if (this.locale === 'de') {
      return 'Terminal wechseln'
    } else if (this.locale === 'sv') {
      return 'Ändra terminal'
    }
    return 'Switch terminal'
  }

  constructor(
    private router: Router,
    private envService: PebEnvService,
    private oldEnvService: EnvService,
    private mediaUrlPipe: MediaUrlPipe,
    private posApi: PebPosApi,
    private headerService: HeaderService,
    private authService: AuthService,
    private platformHeaderService: PePlatformHeaderService,
    private appSelectorService: AppSelectorService,
    private breakpointObserver: BreakpointObserver,
  ) {
    console.log('creating terminal header service instance');
  }

  /**
   * Initializing service subscriptions
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    /**
     * Changing current route to highlist selected item in header;
     * Handling popstate browser button
     */
    this.router.events
      .pipe(
        tap(event => {
          if (event instanceof NavigationEnd) {
            this.currentRoute = this.router.url
              .split(';')[0]
              .split('/')
              .reverse()[0] as PosRoutes;
            if (Object.values(PosRoutes).includes(this.currentRoute)) {
              this.setPosHeaderConfig();
            }
          }
          if (event instanceof NavigationStart) {
            const route = this.router.url.split(';')[0].split('/').reverse()[0] as PosRoutes;
            this.prevUrl = Object.values(PosRoutes).includes(route) ? this.router.url : this.prevUrl;
            if (
              event.navigationTrigger === 'popstate' &&
              this.platformHeaderService.config.isShowShortHeader
            ) {
              this.platformHeaderService.setFullHeader();
            }
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to screen width changes to set or remove business title
     */
    this.breakpointObserver
      .observe(`(max-width: ${this.hideBusinessItemTextMaxWidth}px`)
      .pipe(
        tap((state: BreakpointState) => {
          this.isShowBusinessItemText = state.matches ? false : true;
          this.setPosHeaderConfig();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to screen width changes to change header mode (subheader or one line)
     */
    this.breakpointObserver
      .observe(`(max-width: ${this.subheaderMaxWidth}px`)
      .pipe(
        tap((state: BreakpointState) => {
          this.isSubheaderMode = state.matches ? true : false;
          this.setPosHeaderConfig();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to close button click. Works only for lazy-loaded micro. (Different router instances)
     */
    this.platformHeaderService.closeButtonClicked$
      .asObservable()
      .pipe(
        tap(() => {
          if (this.router.url.includes('setup/create')) {
            this.router.navigate([
              this.platformHeaderService.config.mainDashboardUrl,
            ]);

            return;
          }


          const route = this.router.url.split(';')[0].split('/').reverse()[0] as PosRoutes;
          if (!Object.values(PosRoutes).includes(route)) {
            if (this.prevUrl) {
              this.router.navigateByUrl(this.prevUrl);
            } else {
              this.router.navigateByUrl(
                this.platformHeaderService.config.currentMicroBaseUrl,
              );
            }
            this.platformHeaderService.setFullHeader();
          } else {
            this.router.navigate([
              this.platformHeaderService.config.mainDashboardUrl,
            ]);
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.isInitialized = true;
    this.initializePosHeader();
  }

  /**
   * Destroy service to remove it logic when switching to another app with own header
   */
  destroy(): void {
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Retrieve data and set config
   */
  initializePosHeader() {
    this.terminalId$.next(this.envService.terminalId);
    this.setPosHeaderConfig();

    this.oldEnvService.businessData$
      .pipe(
        tap(data => {
          console.log(data)
          this.businessData = data;
          this.setPosHeaderConfig();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.terminalId$
      .pipe(
        distinctUntilChanged(),
        filter(id => !!id),
        switchMap(id => {
          return this.posApi.getSingleTerminal(id).pipe(
            filter(t => !!t),
            tap(terminal => (this.currentTerminal = terminal)),
            tap(() => this.setPosHeaderConfig()),
          );
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  get businessLogo() {
    if (!this.businessData) {
      return;
    }
    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  /**
   * Header buttons handlers. In case of lazy-loaded micro left items handlers could be defined here.
   * Otherwise should be defined inside micro to make router works correct
   */
  navigateToTerminal(path: string) {
    if (!this.envService.terminalId) {
      this.router.navigate([`business/${this.envService.businessId}/pos/list`]);
    }

    this.router.navigate([
      `business/${this.envService.businessId}/pos/${this.envService.terminalId}/${path}`,
    ]);
  }

  navigateToTerminalCreate = () => {
    this.router.navigate([`business/${this.envService.businessId}/pos/create`]);
  };

  navigateToTerminalList = () => {
    this.router.navigate([`business/${this.envService.businessId}/pos/list`]);
  };

  onSearchClick = () => {
    const businessUuid: string = this.oldEnvService.businessUuid;
    if (this.oldEnvService.isPersonalMode) {
      this.router.navigate([`personal/info/search`]);
    } else {
      this.router.navigate([`business/${businessUuid}/info/search`]);
    }
  };

  onNotificationsClick = () => {
    this.headerService.sidebarButtonClick();
  };

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
  };

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  };

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  };

  navigateToSettings = () => {
    this.router.navigate([
      `business/${this.envService.businessId}/pos/${this.envService.terminalId}/settings`,
    ]);
  };

  navigateToDashboard = () => {
    this.router.navigate([
      `business/${this.envService.businessId}/pos/${this.envService.terminalId}/dashboard`,
    ]);
  };

  navigateToBuilder = () => {
    this.router.navigate([
      `business/${this.envService.businessId}/pos/${this.envService.terminalId}/builder`,
    ]);
  };

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  };

  onMainItemClick = () => {
    this.appSelectorService.showAppSelector();
  };

  navigateToConnect = () => {
    this.router.navigate([
      `/business/${this.envService.businessId}/pos/${this.envService.terminalId}/panel-connect`,
    ]);
  };

  setPosHeaderConfig(): void {
    const isShortHeader = this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem = this.platformHeaderService.config
      ?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: this.isSubheaderMode,
      mainDashboardUrl: this.businessData
        ? `/business/${this.businessData._id}/info/overview`
        : '',
      currentMicroBaseUrl:
        this.businessData && this.currentTerminal
          ? `/business/${this.businessData._id}/pos/${this.currentTerminal._id}/dashboard`
          : '',
      isShowShortHeader: isShortHeader,
      mainItem: {
        title: `Point of Sale`,
        icon: '#icon-apps-pos',
        iconType: 'vector',
        iconSize: '18px',
        onClick: this.onMainItemClick,
      },
      isShowMainItem: true,
      closeItem: {
        title: 'Close',
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px',
      },
      isShowCloseItem: true,
      leftSectionItems: [
        {
          title: this.currentTerminal?.name ?? 'Dashboard',
          onClick: this.navigateToDashboard,
          isActive: this.currentRoute === PosRoutes.DASHBOARD,
        },
        {
          title: 'Connect',
          onClick: this.navigateToConnect,
          isActive: this.currentRoute === PosRoutes.PANEL_CONNECT,
        },
        {
          title: this.settingsTitle,
          onClick: this.navigateToSettings,
          isActive: this.currentRoute === PosRoutes.SETTINGS,
        },
        {
          icon: '#icon-dots-h-24',
          iconType: 'vector',
          iconSize: '24px',
          children: [
            {
              title: this.switchTerminalTitle,
              onClick: this.navigateToTerminalList,
            },
            {
              title: this.addTerminalTitle,
              onClick: this.navigateToTerminalCreate,
            },
          ],
        },
      ],
      rightSectionItems: [
        {
          icon: '#icon-menu-search',
          iconSize: '14px',
          iconType: 'vector',
          onClick: this.onSearchClick
        },
        {
          icon: '#icon-n-bell-32',
          iconSize: '14px',
          iconType: 'vector',
          onClick: this.onNotificationsClick
        },
        {
          icon: '#icon-hamburger-16',
          iconSize: '14px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick
            }
          ]
        },
      ],
      businessItem: {
        title: this.businessData ? this.businessData.name : this.envService.businessData.name,
        icon: (this.businessData && this.businessLogo) ? this.businessLogo : '#icon-account-circle-24',
        iconSize: (this.businessData && this.businessLogo) ? '18px' : '14px',
        iconType: (this.businessData && this.businessLogo) ? 'raster' : 'vector'
      },
      isShowBusinessItem: true,
      shortHeaderTitleItem,
      isShowBusinessItemText: this.isShowBusinessItemText,
    };

    this.platformHeaderService.setConfig(config);
  }
}
