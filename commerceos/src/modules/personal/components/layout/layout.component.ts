import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { MicroRegistryService, MicroAppInterface } from '@pe/ng-kit/modules/micro';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

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
import {delay, first} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'personal-dashboard-layout',
  templateUrl: './layout.component.html'
})
export class PersonalLayoutComponent extends AbstractDashboardComponent implements OnInit, OnDestroy {

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
    protected wallpaperService: WallpaperService,
  ) {
    super(injector);
    this.apiService.getUserAccount().pipe(first(), delay(0)).subscribe(user => {
      this.dashboardDataService.logo = user['logo'];
      this.dashboardDataService.label = `${user['firstName']} ${user['lastName']}`;
    });
    this.dashboardDataService.showEditAppsButton = false;
    this.dashboardDataService.showCloseAppsButton = true;
  }

  ngOnInit(): void {
    this.headerService.resetHeader();
    this.backgroundImage = this.wallpaperService.blurredBackgroundImage;
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    this.platformHeaderService.setPlatformHeader(null);
    super.ngOnDestroy();
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
        result.setupStatus = micro.setupStatus;
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
