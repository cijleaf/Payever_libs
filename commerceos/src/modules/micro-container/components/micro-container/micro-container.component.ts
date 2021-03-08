import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil, tap, debounceTime } from 'rxjs/operators';

import { AbstractComponent, LoaderStateEnum, PlatformService } from '@pe/ng-kit/modules/common';
import { MicroLoaderService, MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { NavbarColor, NavbarStyle } from '@pe/ng-kit/modules/navbar';
import { PlatformHeaderService, PlatfromHeaderInterface } from '@pe/ng-kit/modules/platform-header';
import {
  MicroAppDashboardInfoInterface,
  MicroAppInterface as LocalMicroAppInterface
} from '@pe/ng-kit/modules/micro';

import { ApiService } from '../../../shared/services';
import { LazyAppsLoaderService, WallpaperService } from '../../../../apps/standalone/app/services';
import { appsLaunchedByEvent } from '../../../../settings';
import { PeStepperService, PeSimpleStepperService } from '@pe/stepper';

interface AppInfo {
  icon: string;
  title: string;
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'micro-container-component',
  templateUrl: './micro-container.component.html',
  styleUrls: ['micro-container.component.scss']
})
export class MicroContainerComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('micro', { static: true }) microContainer: ElementRef;

  showAlertInHeader$: Observable<boolean> = this.platformService.internetConnectionStatus$.pipe(
    map(connected => !connected),
    distinctUntilChanged()
  );

  appInfo: AppInfo;
  businessUuid: string;
  belowHeader: boolean = false;
  belowSubheader: boolean = false;
  hideLoader$: Observable<boolean> = this.platformService.microLoading$.pipe(
    map((loading: LoaderStateEnum) => this.peStepperService.isActiveStored || loading !== LoaderStateEnum.Loading),
  );

  isActiveWelcomeStepperWithDebounce$ = new BehaviorSubject<boolean>(true);
  isWelcomeStep = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private lazyAppsLoaderService: LazyAppsLoaderService,
    private microLoaderService: MicroLoaderService,
    private microRegistryService: MicroRegistryService,
    private platformHeaderService: PlatformHeaderService,
    private platformService: PlatformService,
    private router: Router,
    private wallpaperService: WallpaperService,
    public peStepperService: PeStepperService, // @deprecated
    public peSimpleStepperService: PeSimpleStepperService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.peStepperService.isActive$.pipe(
      takeUntil(this.destroyed$),
      debounceTime(1000),
      filter(v => typeof v === 'boolean'),
      tap(isActive => this.isActiveWelcomeStepperWithDebounce$.next(isActive)),
    ).subscribe();

    // Maybe it's not correct solution but I have no idea how to set blurred background for checkout app
    this.wallpaperService.showDashboardBackground(false);

    this.lazyAppsLoaderService.microContainerActive$.next(true);

    this.lazyAppsLoaderService.clearMicroContainerElement();

    this.isWelcomeStep = this.peStepperService.isActiveStored;

    this.platformService.microAppReady$.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.platformHeaderService.setHeaderColor(NavbarColor.Black);
        this.platformHeaderService.setHeaderStyle(NavbarStyle.Apps);
      });

    combineLatest([this.activatedRoute.parent.url, this.activatedRoute.parent.params]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe((data: [UrlSegment[], Params]) => {
      this.businessUuid = data[1]['slug'];

      // here need to separate by ? too, because there maybe router.url like "/business/_id/products?someparams"
      const separators = ['/', '\\\?'];
      const microName: string = this.router.url.split(new RegExp(separators.join('|'), 'g'))[3];
      const config: LocalMicroAppInterface = this.microRegistryService.getMicroConfig(
        microName === 'old-builder' ? 'builder' : microName,
      ) as LocalMicroAppInterface;
      console.log(config);
      this.microContainer.nativeElement.innerHTML = config.tag;

      if (!config.installed) {
        this.install(config as (LocalMicroAppInterface & MicroAppDashboardInfoInterface));
      }

      if (appsLaunchedByEvent.indexOf(config.code) > -1 && this.microLoaderService.isScriptLoadedbyCode(config.code)) {
        window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
      } else {
        if (this.microLoaderService.isScriptLoadedbyCode(config.code)) {
          // if the script already loaded we have to call it
          window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
        } else {
          this.microRegistryService.loadBuild(config).subscribe(() => {
            if (appsLaunchedByEvent.indexOf(config.code) > -1) {
              window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
            }
          });
        }
      }

      this.appInfo = { ...config.dashboardInfo };
    });

    combineLatest([
      this.platformHeaderService.platformHeaderSubject$,
      this.platformHeaderService.mobileView$
    ]).pipe(takeUntil(this.destroyed$)).subscribe((data: [PlatfromHeaderInterface, boolean]) => {
      this.belowHeader = !!data[0];
      this.belowSubheader = data[0] && data[1] && data[0].controls.length > 0;
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.lazyAppsLoaderService.microContainerActive$.next(false);
  }

  backToDashboard(): void {
    this.router.navigate(['/business', this.businessUuid]);
  }

  private install(micro: (LocalMicroAppInterface & MicroAppDashboardInfoInterface)): void {
    micro.installed = true;
    const data = {
      microUuid: micro._id,
      installed: micro.installed
    };

    micro.disabledClick = true;
    this.apiService.toggleInstalledApp(this.businessUuid, data).subscribe();
  }
}
