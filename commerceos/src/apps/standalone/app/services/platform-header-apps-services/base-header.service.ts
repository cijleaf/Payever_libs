import { BusinessInterface } from "@pe/builder-core";
import { Subject } from "rxjs";
import { MediaUrlPipe } from "@pe/ng-kit/modules/media/index";
import { PePlatformHeaderConfig, PePlatformHeaderService } from "@pe/platform-header";
import { AppSelectorService, EnvService, HeaderService } from "@app/services";
import { Router } from "@angular/router";
import { PebEnvService } from "@pe/builder-core";
import { AuthService } from "@pe/ng-kit/modules/auth/index";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { debounceTime, take, takeUntil, tap } from "rxjs/operators";
import { NavigationService } from "@pe/connect-app";

export class BaseHeaderService {
  businessData: BusinessInterface;
  contactHref: string = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref: string = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  hideBusinessItemTextMaxWidth = 720;
  subheaderMaxWidth = 720;
  isShowBusinessItemText: boolean = true;
  isSubheaderMode: boolean = false;

  destroyed$: Subject<void> = new Subject<void>();
  isInitialized: boolean = false;

  get businessLogo() {
    if (!this.businessData) {
      return;
    }
    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  constructor(
    protected router: Router,
    protected envService: PebEnvService,
    protected oldEnvService: EnvService,
    protected mediaUrlPipe: MediaUrlPipe,
    protected headerService: HeaderService,
    protected authService: AuthService,
    protected PePlatformHeaderService: PePlatformHeaderService,
    protected appSelectorService: AppSelectorService,
    protected navigationService: NavigationService,
    protected breakpointObserver: BreakpointObserver
  ) {
  }

  initHeaderObservers() {
    /**
     * Listen to screen width changes to set or remove business title
     */
    this.breakpointObserver.observe(`(max-width: ${this.hideBusinessItemTextMaxWidth}px`).pipe(
      tap((state: BreakpointState) => {
        this.isSubheaderMode = state.matches ? true : false;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    /**
     * Listen to screen width changes to change header mode (subheader or one line)
     */
    this.breakpointObserver.observe(`(max-width: ${this.subheaderMaxWidth}px`).pipe(
      tap((state: BreakpointState) => {
        this.isSubheaderMode = state.matches ? true : false;
        if (this.PePlatformHeaderService.config) {
          if(this.PePlatformHeaderService.config.rightSectionItems&&this.PePlatformHeaderService.config.rightSectionItems.length){
            this.PePlatformHeaderService.config.rightSectionItems.forEach(item=>item.iconSize=this.isSubheaderMode ? '28px' : '24px')
          }
          if(this.PePlatformHeaderService.config.businessItem){
            this.PePlatformHeaderService.config.businessItem.iconSize=this.isSubheaderMode ? '19px' : '16px'
          }
          this.PePlatformHeaderService.config.isShowSubheader = this.isSubheaderMode;
          this.setHeaderConfig(this.PePlatformHeaderService.config);
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    /**
     * Listen to close button click. Works only for lazy-loaded micro. (Different router instances)
     */
    this.PePlatformHeaderService.closeButtonClicked$.asObservable().pipe(
      tap(() => {
        if (this.PePlatformHeaderService.config.isShowShortHeader) {
          this.router.navigateByUrl(this.PePlatformHeaderService.config.currentMicroBaseUrl).then(
            () => this.PePlatformHeaderService.setFullHeader()
          )
        } else {
          this.PePlatformHeaderService.config.mainDashboardUrl = this.navigationService?.getReturnUrl();
          this.router.navigate([
            this.PePlatformHeaderService.config.mainDashboardUrl ||
            `/business/${this.oldEnvService.businessUuid}/info/overview`,
          ]).then(() => this.navigationService?.resetReturnUrl())
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  /**
   * Destroy service to remove it logic when switching to another app with own header
   */
  destroy(): void {
    this.isInitialized = false;
    this.PePlatformHeaderService.setConfig(null);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSearchClick = () => {
    const businessUuid: string = this.oldEnvService.businessUuid;
    if (this.oldEnvService.isPersonalMode) {
      this.router.navigate([`personal/info/search`]);
    } else {
      this.router.navigate([`business/${businessUuid}/info/search`]);
    }
  }

  onNotificationsClick = () => {
    this.headerService.sidebarButtonClick();
  }

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  }

  onLogOut = () => {
    this.authService.logout().subscribe();
  }

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  }

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  }

  navigateToThemes = () => {
    this.router.navigate([`business/${this.envService.businessId}/shop/${this.envService.shopId}/themes`]);
  }

  navigateToSettings = () => {
    this.router.navigate([`business/${this.envService.businessId}/shop/${this.envService.shopId}/settings`]);
  }

  navigateToDashboard = () => {
    this.router.navigate([`business/${this.envService.businessId}/info/overview`]);
  }

  navigateToEdit = () => {
    this.router.navigate([`business/${this.envService.businessId}/shop/${this.envService.shopId}/edit`]);
  }

  navigateToBuilder = () => {
    this.router.navigate([`business/${this.envService.businessId}/shop/${this.envService.shopId}/builder`]);
  }

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  }

  onMainItemClick = () => {
    this.appSelectorService.showAppSelector();
  }

  setHeaderConfig(headerConfig: PePlatformHeaderConfig): void {
    const isShortHeader = headerConfig?.isShowShortHeader ?? this.PePlatformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem = headerConfig?.shortHeaderTitleItem ?? this.PePlatformHeaderService.config?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: this.isSubheaderMode,
      mainDashboardUrl: headerConfig.mainDashboardUrl || '',
      currentMicroBaseUrl: headerConfig.currentMicroBaseUrl || '',
      isShowShortHeader: isShortHeader,
      mainItem: headerConfig.mainItem || null,
      isShowMainItem: headerConfig.isShowMainItem|| true,
      closeItem: headerConfig.closeItem || {
        title: 'Close',
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: this.isSubheaderMode ? '22px' : '16px',
      },
      isShowCloseItem: true,
      isShowDataGridToggleComponent: headerConfig.isShowDataGridToggleComponent,
      showDataGridToggleItem: headerConfig.showDataGridToggleItem || {},
      leftSectionItems: headerConfig.leftSectionItems || [],
      rightSectionItems: headerConfig.rightSectionItems || [

        {
          icon: '#icon-apps-header-notification',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onNotificationsClick
        },
        {
          icon: '#icon-apps-header-search',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onSearchClick
        },
        {
          icon: '#icon-apps-header-hamburger',
          iconSize:this.isSubheaderMode ? '28px' : '24px',
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
      businessItem: headerConfig.businessItem || {
        title: this.businessData ? this.businessData?.name : this.envService.businessData?.name,
        icon: (this.businessData && this.businessLogo) ? this.businessLogo : '#icon-account-circle-24',
        iconSize: this.isSubheaderMode ? '19px' : '16px',
        iconType: (this.businessData && this.businessLogo) ? 'raster' : 'vector'
      },
      isShowBusinessItem: headerConfig.isShowBusinessItem || true,
      shortHeaderTitleItem,
      isShowBusinessItemText: headerConfig.isShowBusinessItemText || this.isShowBusinessItemText
    };


    this.PePlatformHeaderService.setConfig(config);
  }
}
