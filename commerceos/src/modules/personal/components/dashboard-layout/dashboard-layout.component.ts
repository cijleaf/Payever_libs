import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { MicroRegistryService, MicroAppInterface } from '@pe/ng-kit/modules/micro';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { PlatformService } from '@pe/ng-kit/modules/common';

import {
  AbstractDashboardComponent,
} from '../../../dashboard/shared-dashboard';
import { ApiService, LoaderService } from '../../../shared/services';
import {
  DashboardDataService,
  HeaderService,
  WallpaperService
} from '../../../../apps/standalone/app/services';
import { appsLaunchedByEvent } from '../../../../settings';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'personal-dashboard-layout',
  templateUrl: './dashboard-layout.component.html'
})
export class PersonalDashboardLayoutComponent extends AbstractDashboardComponent implements OnInit, OnDestroy {

  constructor(
    injector: Injector,
    private authService: AuthService,
    public dashboardDataService: DashboardDataService,
    private headerService: HeaderService,
    private translateService: TranslateService,
    private loaderService: LoaderService,
    private microRegistryService: MicroRegistryService,
    private apiService: ApiService,
    private router: Router,
    private platformHeaderService: PlatformHeaderService,
    private platformService: PlatformService,
    protected wallpaperService: WallpaperService,
  ) {
    super(injector);
    this.apiService.getUserAccount().pipe(first()).subscribe(user => {
      this.dashboardDataService.logo = user['logo'];
      this.dashboardDataService.userName = user['firstName'] || null;
    });
    this.dashboardDataService.showEditAppsButton = false;
    this.dashboardDataService.showCloseAppsButton = false;
  }

  ngOnInit(): void {
    this.backgroundImage = this.wallpaperService.blurredBackgroundImage;
    super.ngOnInit();

    this.showChatButton();
    this.platformService.backToDashboard$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.showChatButton();
    });

    this.loaderService.appLoading$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(() => this.hideChatButton());

    // When this components creates the header component not ready
    setTimeout(() => {
      this.headerService.setPersonalDashboardHeader();
    });
  }

  ngOnDestroy(): void {
    this.platformHeaderService.setPlatformHeader(null);
    super.ngOnDestroy();
  }

  navigateToSwitcher(): void {
    // this.loaderManagerService.showGlobalLoader(true);
    this.router.navigate(['/switcher/profile']);
  }

  protected initDocker(infoBox?: string): void {
    // micro apps loaded inside guard
    const microList: MicroAppInterface[] = this.microRegistryService.getMicroConfig('') as MicroAppInterface[];
    this.dockerItems = microList
      .filter((micro: any) => !!micro.dashboardInfo && Object.keys(micro.dashboardInfo).length > 0)
      .map((micro: MicroAppInterface) => {
        const result: any = {};
        result.icon = micro.dashboardInfo.icon;
        result.title = this.translateService.translate(micro.dashboardInfo.title);
        result.onSelect = (active: boolean) => {
          this.onAppSelected(micro, active);
        };
        result.installed = micro.installed;
        result.order = micro.order;
        result.microUuid = micro._id;
        result.code = micro.code;
        return result;
      });
    this.dashboardDataService.apps(this.dockerItems);
  }

  private onAppSelected(micro: MicroAppInterface, active: boolean): void {
    this.loaderService.appLoading = micro.code;
    this.wallpaperService.showDashboardBackground(false);

    const userUuid: string = this.authService.getUserData().uuid;
    this.loadMicroApp(userUuid, micro);
  }

  private loadMicroApp(userId: string, micro: MicroAppInterface): void {
    const microName: string = micro.code;
    const config: any = this.microRegistryService.getMicroConfig(microName);





    console.log('Personal loadMicroApp url', config.url.replace('{uuid}', userId));

    // if app support launching by window event - load it here, then navigate to route.
    let loadObservable$: Observable<boolean> = of(true);
    if (appsLaunchedByEvent.indexOf(config.code) > -1) {
      loadObservable$ = this.microRegistryService.loadBuild(config);
    }

    loadObservable$.subscribe(() => {
      // NOTE: delay done for IE. When open app twice IE do not show spinner and do redirect immidiatelly
      // Make small delay to show spinner above the app icon
      setTimeout(
        () => this.router.navigateByUrl(config.url.replace('{uuid}', userId))
          .then(() => this.loaderService.appLoading = null),
        100
      );
    });
  }
}
