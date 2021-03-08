import { Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { AppSelectorService } from '../app-selector.service';
import { MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { tap, takeUntil } from 'rxjs/operators';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { BusinessInterface } from '@modules/shared';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { HeaderService } from '../header.service';
import { EnvService } from '../env.service';

enum StudioRoutes {
  EMPTY = ''
}

@Injectable()
export class PeStudioHeaderService {
  // @TODO add translations
  businessData: BusinessInterface;
  currentRoute: StudioRoutes = this.router.url.split('/').reverse()[0] as StudioRoutes;
  contactHref: string = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref: string = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  hideBusinessItemTextMaxWidth = 729;
  subheaderMaxWidth = 620;
  isShowBusinessItemText: boolean = true;
  isSubheaderMode: boolean = false;

  destroyed$: Subject<void> = new Subject<void>();
  isInitialized: boolean = false;

  constructor(
    private router: Router,
    private oldEnvService: EnvService,
    private mediaUrlPipe: MediaUrlPipe,
    private headerService: HeaderService,
    private authService: AuthService,
    private platformHeaderService: PePlatformHeaderService,
    private appSelectorService: AppSelectorService,
    private breakpointObserver: BreakpointObserver
  ) {
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
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects.split('/').reverse()[0] as StudioRoutes;
          if (Object.values(StudioRoutes).includes(this.currentRoute)) {
            this.setStudioHeaderConfig();
          }
        }
        if (event instanceof NavigationStart) {
          this.platformHeaderService.previousUrlForBackChanged$.next(this.router.url);
          if (event.navigationTrigger === 'popstate' && this.platformHeaderService.config.isShowShortHeader) {
            this.platformHeaderService.setFullHeader();
          }
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    /**
     * Listen to screen width changes to set or remove business title
     */
    this.breakpointObserver.observe(`(max-width: ${this.hideBusinessItemTextMaxWidth}px`).pipe(
      tap((state: BreakpointState) => {
        this.isShowBusinessItemText = state.matches ? false : true;
        this.setStudioHeaderConfig();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    /**
     * Listen to screen width changes to change header mode (subheader or one line)
     */
    this.breakpointObserver.observe(`(max-width: ${this.subheaderMaxWidth}px`).pipe(
      tap((state: BreakpointState) => {
        this.isSubheaderMode = state.matches ? true : false;
        this.setStudioHeaderConfig();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    /**
     * Listen to close button click. Works only for lazy-loaded micro. (Different router instances)
     */
    this.platformHeaderService.closeButtonClicked$.asObservable().pipe(
      tap(() => {
        if (this.platformHeaderService.config.isShowShortHeader) {
          this.router.navigateByUrl(this.platformHeaderService.config.currentMicroBaseUrl);
          this.platformHeaderService.setFullHeader();
        } else {
          this.router.navigate([this.platformHeaderService.config.mainDashboardUrl]);
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.isInitialized = true;
    this.initializeStudioHeader();
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
  initializeStudioHeader() {
    this.setStudioHeaderConfig();

    this.oldEnvService.businessData$.pipe(
      tap((data) => {
        this.businessData = data;
        this.setStudioHeaderConfig();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
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
/*
  onSearchClick = () =>  {
    const businessUuid: string = this.oldEnvService.businessUuid;
    if (this.oldEnvService.isPersonalMode) {
      this.router.navigate([`personal/info/search`]);
    } else {
      this.router.navigate([`business/${businessUuid}/info/search`]);
    }
  }
*/
  onNotificationsClick = () => {
    this.headerService.sidebarButtonClick();
  }
/*
  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  }

  onLogOut = () => {
    this.authService.logout().subscribe();
  }*/

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  }

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  }
/*
  onContactClick = () => {
    window.open(this.contactHref);
  }

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  }*/

  onMainItemClick = () => {
    this.appSelectorService.showAppSelector();
  }

  setStudioHeaderConfig(): void {
    const isShortHeader = this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem = this.platformHeaderService.config?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: this.isSubheaderMode,
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: (this.businessData) ?
      `/business/${this.businessData._id}/studio` : '',
      isShowShortHeader: isShortHeader,
      mainItem: {
        title: `Studio`,
        icon: 'assets/icons/studio-2.png',
        iconType: 'raster',
        iconSize: '18px',
        onClick: this.onMainItemClick
      },
      isShowMainItem: true,
      closeItem: {
        title: 'Close',
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px'
      },
      isShowCloseItem: true,
      leftSectionItems: [
      ],
      /*
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
      ],*/
      businessItem: {
        title: this.businessData ? this.businessData.name : '',
        icon: (this.businessData && this.businessLogo) ? this.businessLogo : '#icon-account-circle-24',
        iconSize: (this.businessData && this.businessLogo) ? '18px' : '14px',
        iconType: (this.businessData && this.businessLogo) ? 'raster' : 'vector'
      },
      isShowBusinessItem: true,
      shortHeaderTitleItem,
      isShowBusinessItemText: this.isShowBusinessItemText
    };
    this.platformHeaderService.setConfig(config);
  }
}
