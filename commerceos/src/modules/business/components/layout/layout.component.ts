import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import {delay, take, takeUntil} from 'rxjs/operators';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { AppSetUpStatusEnum, MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { PlatformHeaderService, PlatfromHeaderInterface } from '@pe/ng-kit/modules/platform-header';
import { MicroAppInterface } from '@pe/ng-kit/modules/micro';

import {
  AppLauncherService,
  DashboardDataService,
  EnvService,
} from '../../../../apps/standalone/app/services';
import { AbstractDashboardComponent } from '../../../dashboard/shared-dashboard';
import { LoaderService } from '../../../shared';
import { baseDockerItems } from '../../../shared/settings/dashboard/business';
import { StepperHelperService } from '../../../dashboard/shared-dashboard/services/stepper-helper.service';
import { PeWelcomeStepAction } from '@pe/stepper';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'business-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class BusinessLayoutComponent extends AbstractDashboardComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;
  belowHeader: boolean = false;
  belowSubheader: boolean = false;

  constructor(
    injector: Injector,
    private appLauncherService: AppLauncherService,
    private envService: EnvService,
    private dashboardDataService: DashboardDataService,
    private translateService: TranslateService,
    private loaderService: LoaderService,
    private microRegistryService: MicroRegistryService,
    private platformHeaderService: PlatformHeaderService,
    private router: Router,
    private stepperHelperService: StepperHelperService,
  ) {
    super(injector);
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.platformHeaderService.setPlatformHeader(null);
    super.ngOnInit();

    this.envService.businessData$.pipe(take(1),
      delay(0)
    ).subscribe(businessData => {
      this.dashboardDataService.label = businessData.name;
      this.dashboardDataService.logo = businessData.logo;
    });

    combineLatest(
      this.platformHeaderService.platformHeaderSubject$,
      this.platformHeaderService.mobileView$
    ).pipe(takeUntil(this.destroyed$)).subscribe((data: [PlatfromHeaderInterface, boolean]) => {
      this.belowHeader = !!data[0];
      this.belowSubheader = data[0] && data[1] && data[0].controls.length > 0;
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected initDocker(infoBox?: string): void {
    const infoBoxes: any[] = baseDockerItems.map((item: any) => {
      const itemCode: string = item.title;
      const result: any = {};
      result.icon = item.icon;
      result.active = infoBox ? infoBox === itemCode : false;
      result.title = this.translateService.translate(`dashboard_docker.items.${itemCode}`);
      result.onSelect = (active: boolean) => {
        if (!active) {
          this.router.navigate(['info', itemCode], {relativeTo: this.activatedRoute});
        }
      };
      return result;
    });

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
    this.dashboardDataService.showEditAppsButton = false;
    this.dashboardDataService.showCloseAppsButton = true;
  }

  private onAppSelected(micro: MicroAppInterface, active: boolean): void {
    if (micro.setupStatus === AppSetUpStatusEnum.Completed) {
      this.loaderService.appLoading = micro.code;
      this.wallpaperService.showDashboardBackground(false);
      this.openMicro(micro.code);
    } else {
      this.wallpaperService.showDashboardBackground(false);
      const url: string = `business/${this.envService.businessUuid}/welcome/${micro.code}`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }

  private openMicro(code: string): void {
    this.appLauncherService.launchApp(code).subscribe();
  }

  private loadMicroApp(businessId: string, micro: MicroAppInterface): Observable<boolean> {
    return this.loaderService.loadMicroScript(micro.code, this.envService.businessUuid);
  }
}
