import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { PebEnvService } from "@pe/builder-core";
import { AppSelectorService } from '../app-selector.service';
import { HeaderService } from '../header.service';
import { EnvService } from '../env.service';
import { MediaUrlPipe } from "@pe/ng-kit/modules/media";
import { AuthService } from "@pe/ng-kit/modules/auth";
import { PePlatformHeaderService } from "@pe/platform-header";
import { BreakpointObserver } from "@angular/cdk/layout";
import { NavigationService } from "@pe/connect-app";

import { BaseHeaderService } from "./base-header.service";

@Injectable()
export class PeCommonHeaderService extends BaseHeaderService {
  constructor(
    protected router: Router,
    protected envService: PebEnvService,
    protected oldEnvService: EnvService,
    protected mediaUrlPipe: MediaUrlPipe,
    protected headerService: HeaderService,
    protected authService: AuthService,
    protected navigationService: NavigationService,
    protected platformHeaderService: PePlatformHeaderService,
    protected appSelectorService: AppSelectorService,
    protected breakpointObserver: BreakpointObserver
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

  init(path: string, title: string, icon: string): void {
    this.initHeaderObservers();
    this.setHeaderConfig({
      mainDashboardUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/${path}` : '',
      isShowShortHeader: null,
      mainItem: {
        title: title,
        icon: icon,
        iconType: 'vector',
        iconSize: '18px',
        onClick: this.onMainItemClick
      },
      isShowMainItem: true,
      closeItem: {
        title: this.navigationService.getReturnUrl() ? 'Close' : 'Back to apps',
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
