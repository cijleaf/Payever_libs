import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { tap, takeUntil, switchMap, map, shareReplay } from 'rxjs/operators';
import { combineLatest, of, Subject } from 'rxjs';

import { PeSimpleStepperService } from '@pe/stepper';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { PeProductsHeaderService, EnvService, WallpaperService } from '@app/services';
import { PopularProductInterface } from '@modules/dashboard/widgets/interfaces/products.interface';
import { ProductItem } from '@modules/dashboard/widgets/components/products/products-widget/product-item.model';
import { forEach } from 'lodash';
import { CurrencyPipe } from '@angular/common';
import { WidgetsApiService } from '@modules/dashboard/widgets/services';
import { ThemeSwitcherService, PeThemeEnum } from "@pe/ng-kit/modules/theme-switcher/index";

@Component({
  selector: 'cos-products-root',
  templateUrl: './products-root.component.html',
  styleUrls: [
    './products-root.component.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CosProductsRootComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<boolean>();

  isDashboardRoute: boolean;

  PeThemeEnum = PeThemeEnum;
  theme = this.themeSwitcherService.theme;

  constructor(
    public router: Router,
    public peSimpleStepperService: PeSimpleStepperService,
    private productsHeaderService: PeProductsHeaderService,
    private translateService: TranslateService,
    private platformHeaderService: PlatformHeaderService,
    private themeSwitcherService: ThemeSwitcherService,
    private cdr: ChangeDetectorRef,

    private envService: EnvService,
    private currencyPipe: CurrencyPipe,
    private widgetsApiService: WidgetsApiService,
    private wallpaperService: WallpaperService,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }

  ngOnInit() {
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'products';

          if (this.isDashboardRoute) {
            this.productsHeaderService.init();
          }
          this.productsHeaderService.reassign();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'products';

    // Hide old platform header because next root component uses new platform header
    this.platformHeaderService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);

    this.productsHeaderService.init();
  }

  ngOnDestroy() {
    this.productsHeaderService.destroy();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
