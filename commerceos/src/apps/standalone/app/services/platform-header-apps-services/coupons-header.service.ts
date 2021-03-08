import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { PebEnvService } from "@pe/builder-core";
import { AppSelectorService } from '../app-selector.service';
import { HeaderService } from '../header.service';
import { EnvService } from '../env.service';
import { MediaUrlPipe } from "@pe/ng-kit/modules/media/index";
import { AuthService } from "@pe/ng-kit/modules/auth/index";
import { PePlatformHeaderService } from "@pe/platform-header";
import { BreakpointObserver } from "@angular/cdk/layout";
import { BaseHeaderService } from "./base-header.service";
import { NavigationService } from "@pe/connect-app";

@Injectable()
export class PeCouponsHeaderService extends BaseHeaderService {
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
    console.log('creating coupons header service instance');
  }

  init(): void {
    this.initHeaderObservers();
    this.setHeaderConfig({
      mainDashboardUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/coupons` : '',
      isShowShortHeader: null,
      mainItem: {
        title: `Coupons`,
        icon: '#icon-apps-coupons',
        iconType: 'vector',
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
      businessItem: null,
      isShowBusinessItem: null,
      isShowBusinessItemText: null,
      leftSectionItems: [],
    });
  }
}