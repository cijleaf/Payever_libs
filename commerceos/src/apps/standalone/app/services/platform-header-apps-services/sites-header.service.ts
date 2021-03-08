import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {PePlatformHeaderConfig, PePlatformHeaderService} from '@pe/platform-header';
import {EnvService} from '../env.service'

import {BusinessInterface} from "@modules/shared";
import {MediaUrlPipe} from "@pe/ng-kit/modules/media/index";
import {AppSelectorService, HeaderService} from "@app/services";
import {AuthService} from "@pe/ng-kit/modules/auth/index";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";
import {takeUntil, tap} from "rxjs/operators";
import {PebSidebarService, PebSitesApi} from "@pe/sites-app";
import {BaseHeaderService} from "@app/services/platform-header-apps-services/base-header.service";
import {MessageBus, PebEnvService} from "@pe/builder-core";
import { NavigationService } from '@pe/connect-app';


@Injectable()
export class PeSitesHeaderService extends BaseHeaderService {

  constructor(
    protected router: Router,
    protected envService: PebEnvService,
    protected oldEnvService: EnvService,
    protected mediaUrlPipe: MediaUrlPipe,
    protected sitesApi: PebSitesApi,
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
    this.messageBus.emit('site.toggle.sidebar', '')
  }



  init(): void {
    this.initHeaderObservers();
    this.businessData=this.envService.businessData;
    this.setHeaderConfig({
      mainDashboardUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.envService.businessData ? `/business/${this.envService.businessData._id}/site` : '',
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
