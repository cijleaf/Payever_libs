import { Injectable } from '@angular/core';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { Router } from '@angular/router';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { AppSelectorService } from '../app-selector.service';
import { MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { PePlatformHeaderService } from '@pe/platform-header';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HeaderService } from '../header.service';
import { EnvService } from '../env.service';
import { PebShopsApi } from '@pe/builder-api';
import { BaseHeaderService } from './base-header.service';
import { NavigationService } from "@pe/connect-app";

enum ShopRoutes {
  SETTINGS = 'settings',
  THEMES = 'themes',
  DASHBOARD = 'dashboard',
  BUILDER = 'builder'
}

@Injectable()
export class PeShopHeaderService extends BaseHeaderService {
  // @TODO add translations
  currentShop: any;
  currentRoute: ShopRoutes = this.router.url.split('/').reverse()[0] as ShopRoutes;

  constructor(
    protected router: Router,
    protected envService: PebEnvService,
    protected oldEnvService: EnvService,
    protected mediaUrlPipe: MediaUrlPipe,
    protected shopsApi: PebShopsApi,
    protected headerService: HeaderService,
    protected authService: AuthService,
    protected platformHeaderService: PePlatformHeaderService,
    protected appSelectorService: AppSelectorService,
    protected breakpointObserver: BreakpointObserver,
    protected navigationService: NavigationService,
    private messageBus: MessageBus,
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


  onSidebarToggle = () => {
    this.messageBus.emit('shop.toggle.sidebar', '')
  }



  init(): void {
    this.initHeaderObservers();
    this.businessData=this.envService.businessData;
    this.setHeaderConfig({
      mainDashboardUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/shop` : '',
      isShowShortHeader: null,
      mainItem: {},
      isShowMainItem: false,
      closeItem: {
        title: 'Back to apps',
        icon:'#icon-apps-apps',
        showIconBefore: true,
        iconType: 'vector',
        iconSize:'14px'
      },
      showDataGridToggleItem: {
        iconSize: '24px',
        iconType: 'vector',
        onClick: this.onSidebarToggle,
        isActive: true,
        isLoading: true,
        showIconBefore: true,
      },

      isShowCloseItem: true,
      isShowDataGridToggleComponent: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: null,
      leftSectionItems: [],

    });
  }
}
