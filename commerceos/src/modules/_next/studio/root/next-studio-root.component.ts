import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { PeSimpleStepperService } from '@pe/stepper';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { WallpaperService, PeStudioHeaderService } from '@app/services';

@Component({
  selector: 'cos-next-studio-root',
  templateUrl: './next-studio-root.component.html',
  styleUrls: [
    './next-studio-root.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextStudioRootComponent implements OnInit, OnDestroy {

  destroyed$ = new Subject<boolean>();

  constructor(
    public router: Router,
    public peSimpleStepperService: PeSimpleStepperService,
    private studioHeaderService: PeStudioHeaderService,
    private platformHeaderService: PlatformHeaderService,
    private wallpaperService: WallpaperService,
  ) {
  }

  ngOnInit() {
    // Hide old platform header because next root component uses new platform header
    this.platformHeaderService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);

    this.studioHeaderService.initialize();
  }

  ngOnDestroy() {
    this.studioHeaderService.destroy();

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
