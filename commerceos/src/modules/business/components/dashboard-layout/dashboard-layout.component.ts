import { Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {take, takeUntil, first, delay} from 'rxjs/operators';
import { Location } from '@angular/common';

import { PlatformService } from '@pe/ng-kit/src/kit/common/src';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { MicroRegistryService, MicroAppInterface, AppSetUpStatusEnum } from '@pe/ng-kit/modules/micro';

import {
  DashboardDataService,
  EnvService,
  HeaderService,
  AppSelectorService,
  AppLauncherService,
} from '../../../../apps/standalone/app/services';


import { BusinessInterface, ApiService } from '@modules/shared';
import { LoaderService } from '../../../shared';

import { AbstractDashboardComponent } from '../../../dashboard/shared-dashboard';
import { PeStepperService, PeWelcomeStepAction, PeWelcomeStepperAction } from '@pe/stepper';
import { StepperHelperService } from '../../../dashboard/shared-dashboard/services/stepper-helper.service';
import { ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher';
import { WidgetsApiService } from '@modules/dashboard/widgets/services';
import { ShopInterface } from '@modules/dashboard/widgets';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'business-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class BusinessDashboardLayoutComponent extends AbstractDashboardComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;

  widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);

  @HostListener('document:keydown.a', ['$event.target'])
  navigateToApps(target: HTMLElement): void {
    if (target.tagName.toLowerCase() !== 'input' &&
      target.tagName.toLowerCase() !== 'textarea' &&
      this.location.isCurrentPathEqualTo(this.router.url)
    ) {
      this.router.navigate([`business/${this.envService.businessUuid}/info/overview`]);
    }
  }

  // tslint:disable-next-line:member-ordering
  constructor(
    injector: Injector,
    private envService: EnvService,
    private location: Location,
    private dashboardDataService: DashboardDataService,
    private headerService: HeaderService,
    private translateService: TranslateService,
    private loaderService: LoaderService,
    private microRegistryService: MicroRegistryService,
    private router: Router,
    private platformService: PlatformService,
    private peStepperService: PeStepperService,
    private stepperHelperService: StepperHelperService,
    private themeSwitcherService: ThemeSwitcherService,
    private appSelectorService: AppSelectorService,
    private appLauncherService: AppLauncherService,
    private apiService: ApiService,
  ) {
    super(injector);
    this.isLoading = false;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, false);

    this.apiService.getUserAccount().pipe(first()).subscribe(user => {
      this.dashboardDataService.userName = user['firstName'] || null;
    });

    this.envService.businessData$.pipe(
      take(1),
      delay(0)
    ).subscribe(businessData => {
      this.dashboardDataService.label = businessData.name;
      this.dashboardDataService.logo = businessData.logo;
    });

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
      this.headerService.setBusinessDashboardHeader();
    });
  }

  ngOnDestroy(): void {
    this.headerService.destroyBusinessDashboardHeader();
    this.dockerItems.forEach(item => item.onSelect = undefined);
    super.ngOnDestroy();
  }

  navigateToSwitcher(): void {
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
          this.appSelectorService.hideAppSelector();
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
    this.loaderService.appLoading = micro.code;

    if (([AppSetUpStatusEnum.Completed, AppSetUpStatusEnum.Started].indexOf(micro.setupStatus) >= 0)) {

      // NEW SHOP ENABLED: commented because don't need in new shop app
      //
      // if (micro.code === 'shop') {
      //   this.widgetsApiService.getShops(this.envService.businessUuid).pipe(
      //     takeUntil(this.destroyed$),
      //   ).subscribe(
      //     (shops: ShopInterface[]) => {
      //       let shop: any;
      //       if (shops && shops.length) {
      //         shop = shops.find((s: ShopInterface) => s.active);
      //         shop = shop || shops[0];
      //         this.openMicro('builder', `builder/shop/${shop.id || shop._id}/builder/viewer`);
      //       }
      //     }
      //   );
      //   return;
      // }

      this.openMicro(micro.code);
    } else {
      this.wallpaperService.showDashboardBackground(false);
      const url: string = `business/${this.envService.businessUuid}/welcome/${micro.code}`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }

  private openMicro(code: string, path?: string): void {
    this.appLauncherService.launchApp(code, path).subscribe();
  }

  private loadMicroApp(businessId: string, micro: MicroAppInterface): void {
    const microName: string = micro.code;
    const config: any = this.microRegistryService.getMicroConfig(microName);

    this.loaderService.loadMicroScript(microName, this.envService.businessUuid).subscribe(() => {
      // NOTE: delay done for IE. When open app twice IE do not show spinner and do redirect immidiatelly
      // Make small delay to show spinner above the app icon
      setTimeout(
        () => this.router.navigateByUrl(config.url.replace('{uuid}', businessId))
          .then(() => {
            this.loaderService.appLoading = null;
          }),
        100
      );
    });
  }

  private navigateToWelcomeScreen(micro: MicroAppInterface): void {
    this.headerService.resetHeader();

    if (micro.setupStatus === AppSetUpStatusEnum.Started && micro.code === 'shop' && this.peStepperService.currentStep) {
      this.stepperHelperService.navigateToStep(this.peStepperService.currentStep.action);
      return;
    }

    const url: string[] = [`business/${this.envService.businessUuid}/welcome/${micro.code}`];
    this.router.navigate(url);
  }

  private getAppCodeFromUrl(url: string): string {
    // here need to separate by ? too, because there maybe router.url like "/business/_id/products?someparams"
    const separators = ['/', '\\\?'];
    return url.split(new RegExp(separators.join('|'), 'g'))[3];
  }
}
