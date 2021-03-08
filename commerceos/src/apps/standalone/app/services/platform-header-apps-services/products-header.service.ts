import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PebEnvService } from '@pe/builder-core';
import { AppSelectorService } from '../app-selector.service';
import { HeaderService } from '../header.service';
import { EnvService } from '../env.service';
import { MediaUrlPipe } from '@pe/ng-kit/modules/media/index';
import { AuthService } from '@pe/ng-kit/modules/auth/index';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BaseHeaderService } from './base-header.service';
import { NavigationService } from "@pe/connect-app";

@Injectable()
export class PeProductsHeaderService extends BaseHeaderService {
  constructor(
    protected router: Router,
    protected envService: PebEnvService,
    protected oldEnvService: EnvService,
    protected mediaUrlPipe: MediaUrlPipe,
    protected headerService: HeaderService,
    protected authService: AuthService,
    protected platformHeaderService: PePlatformHeaderService,
    protected appSelectorService: AppSelectorService,
    protected breakpointObserver: BreakpointObserver,
    protected navigationService: NavigationService,
  ) {
    super(
      router,
      envService,
      oldEnvService,
      mediaUrlPipe,
      headerService,
      authService,
      platformHeaderService,
      appSelectorService,
      navigationService,
      breakpointObserver,

    );
  }

  reassign() {
    const config = this.getHeaderConfig();
    delete config.showDataGridToggleItem;
    this.platformHeaderService.assignConfig(config);
  }

  init(): void {
    this.initHeaderObservers();
    this.setHeaderConfig(this.getHeaderConfig());
  }

  getHeaderConfig(): PePlatformHeaderConfig {
    const logo = this.envService.businessData?.logo || null;
    return {
      mainDashboardUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/products` : '',
      isShowShortHeader: false,
      mainItem: {},
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
        }
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'products-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
      leftSectionItems: [],
      rightSectionItems: [
        {
          icon: '#icon-menu-notifications-24',
          iconSize: '25px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-menu-search-24',
          iconSize: '24px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-menu-hamburger-24',
          iconSize: '24px',
          iconType: 'vector',
          class: 'products-header-hamburger-icon',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
          ],
        },
      ],
      businessItem: {
        title: this.envService.businessData?.name || '',
        icon:
          logo
            ? this.mediaUrlPipe.transform(logo, 'images')
            : '#icon-account-circle-24',
        iconSize: logo ? '18px' : '16px',
        iconType: logo ? 'raster' : 'vector',
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: false,
    }
  }
}
