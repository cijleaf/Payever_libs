import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { PeSimpleStepperService } from '@pe/stepper';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { PeCouponsHeaderService, WallpaperService } from '@app/services';

@Component({
  selector: 'cos-coupons-root',
  templateUrl: './coupons-root.component.html',
  styleUrls: [
    './coupons-root.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CosCouponsRootComponent implements OnInit, OnDestroy {

  destroyed$ = new Subject<boolean>();

  constructor(
    public router: Router,
    public peSimpleStepperService: PeSimpleStepperService,
    private couponsHeaderService: PeCouponsHeaderService,
    private platformHeaderService: PlatformHeaderService,
    private wallpaperService: WallpaperService,
  ) {
  }

  ngOnInit() {
    // Hide old platform header because next root component uses new platform header
    this.platformHeaderService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);

    this.couponsHeaderService.init();
  }

  ngOnDestroy() {
    this.couponsHeaderService.destroy();

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


}