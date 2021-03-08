import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppSelectorService, HeaderService } from "@app/services";
import { BaseHeaderService } from "@app/services/platform-header-apps-services/base-header.service";
import { MessageBus, PebEnvService } from "@pe/builder-core";
import { NavigationService } from '@pe/connect-app';
import { AuthService } from "@pe/ng-kit/modules/auth/index";
import { MediaUrlPipe } from "@pe/ng-kit/modules/media/index";
import { PePlatformHeaderService } from '@pe/platform-header';
import { PebShippingSidebarService } from '@pe/shipping-app';
import { EnvService } from '../env.service';



@Injectable()
export class PeStatisticsHeaderService extends BaseHeaderService {

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
    private messageBus: MessageBus,
    protected navigationService: NavigationService,
    private sidebarService: PebShippingSidebarService,
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
    this.sidebarService.toggleSidebar()
  }


  init(): void {
    this.initHeaderObservers();
    this.businessData=this.envService.businessData;
    this.setHeaderConfig({
      mainDashboardUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/statistics` : '',
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
