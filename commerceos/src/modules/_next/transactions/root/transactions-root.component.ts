import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { PeSimpleStepperService } from '@pe/stepper';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { WallpaperService } from '@app/services';
import { PeTransactionsHeaderService } from '@app/services/platform-header-apps-services/transactions-header.service';

@Component({
  selector: 'cos-transactions-root',
  templateUrl: './transactions-root.component.html',
  styleUrls: ['./transactions-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosTransactionsRootComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<boolean>();

  isDashboardRoute: boolean;

  constructor(
    public router: Router,
    private platformHeaderService: PlatformHeaderService,
    private transactionsHeaderService: PeTransactionsHeaderService,
    private wallpaperService: WallpaperService,
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        tap(event => {}),
        takeUntil(this.destroyed$),
      )
      .subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'transactions';

    // Hide old platform header because next root component uses new platform header
    this.platformHeaderService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);
    this.transactionsHeaderService.initialize();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.transactionsHeaderService.destroy();
  }
}
