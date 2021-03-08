import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { tap, takeUntil, filter } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';

import { PeSimpleStepperService } from '@pe/stepper';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { PEB_SHOP_HOST } from '@pe/builder-shop';

import { WallpaperService } from '@app/services';
import { PeShopHeaderService } from '@app/services/platform-header-apps-services/shop-header.service';
import { AppThemeEnum } from '@pe/common';
import { PePlatformHeaderService } from '@pe/platform-header';
import { MatDialog } from '@angular/material/dialog';
import { PebShopBuilderViewComponent } from './builder-view/builder-view.component';
import { PeShopBuilderPublishComponent } from './builder-publish/builder-publish.component';

@Component({
  selector: 'cos-next-root',
  templateUrl: './next-root.component.html',
  styleUrls: [
    './next-root.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  theme = (this.envService.businessData?.themeSettings?.theme) ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default

  destroyed$ = new Subject<boolean>();

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private envService: PebEnvService,
    public peSimpleStepperService: PeSimpleStepperService,
    private shopHeaderService: PeShopHeaderService,
    private translateService: TranslateService,
    private headerService: PlatformHeaderService,
    private platformHeaderService: PePlatformHeaderService,
    private dialog: MatDialog,

    private wallpaperService: WallpaperService,
    @Inject(PEB_SHOP_HOST) private pebShopHost: string,
  ) {

  }

  ngOnInit() {

    this.headerService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);

    this.shopHeaderService.init();

    this.patchedElements = document.querySelectorAll('.pe-bootstrap');
    this.patchedElements.forEach(
      el => el.classList.remove('pe-bootstrap'),
    );

    this.messageBus.listen('shop.open').pipe(
      tap((shop: any) => {
        if (shop?.accessConfig?.internalDomain) {
          window.open(`https://${shop.accessConfig.internalDomain}.${this.pebShopHost}`);
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('shop.navigate.edit').pipe(
      tap((shopId) => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/edit`)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('shop.navigate.dashboard').pipe(
      tap((shopId) => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/dashboard`)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('shop.navigate.settings').pipe(
      tap((shopId) => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/settings`)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.messageBus.listen('shop.navigate.themes').pipe(
      tap((shopId) => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/themes`)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();


    this.messageBus.listen(`shop.builder.init`).pipe(
      tap((data: any) => {
        this.platformHeaderService.assignConfig(Object.assign({}, this.platformHeaderService.config, {
          leftSectionItems: [
            {
              title: 'View',
              icon: '#icon-apps-builder-view',
              iconType: 'vector',
              iconSize: '24px',
              isActive: true,
              onClick: () => {
                const dialogRef = this.dialog.open(PebShopBuilderViewComponent, {
                  position: {
                    top: '42px',
                    left: '47px',
                  },
                  disableClose: false,
                  hasBackdrop: true,
                  backdropClass: 'builder-backdrop',
                  maxWidth: '267px',
                  width: '267px',
                  panelClass: 'builder-dialog',
                  autoFocus: false,
                });
                dialogRef.backdropClick().pipe(
                  tap(() => {
                    dialogRef.close();
                  }),
                  takeUntil(this.destroyed$),
                ).subscribe();
              }
            },
            {
              title: 'Publish',
              icon: '#icon-apps-builder-publish',
              iconType: 'vector',
              iconSize: '24px',
              onClick: () => {
                const dialogRef = this.dialog.open(PeShopBuilderPublishComponent, {
                  position: {
                    top: '42px',
                    left: '100px',
                  },
                  disableClose: false,
                  hasBackdrop: true,
                  data,
                  backdropClass: 'builder-backdrop',
                  maxWidth: '286px',
                  width: '286px',
                  panelClass: ['builder-dialog',this.theme],
                  autoFocus: false,
                });
                dialogRef.backdropClick().pipe(
                  tap(() => {
                    dialogRef.close();
                  }),
                  takeUntil(this.destroyed$),
                ).subscribe();
                dialogRef.afterClosed().pipe(
                  takeUntil(this.destroyed$),
                ).subscribe();
              }
            },
          ]
        }))

      }),
      takeUntil(this.destroyed$)
    ).subscribe(),

      this.messageBus.listen(`shop.builder.destroy`).pipe(
        tap((shopId: any) => {
          this.platformHeaderService.assignConfig(Object.assign({}, this.platformHeaderService.config, {
            leftSectionItems: null
          }))
        }),
        takeUntil(this.destroyed$)).subscribe()

    combineLatest([
      this.peSimpleStepperService.isVisible$,
      this.messageBus.listen('shop.theme.installed'),
    ]).pipe(
      filter(([isStepperVisible]) => isStepperVisible),
      tap(_ => this.router.navigate([`business/${this.envService.businessId}/shop/${this.envService.shopId}/dashboard`])),
      takeUntil(this.destroyed$),
    ).subscribe();

  }

  ngOnDestroy() {
    this.patchedElements.forEach(
      el => el.classList.add('pe-bootstrap'),
    );
    this.patchedElements = null;
    this.shopHeaderService.destroy();

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
