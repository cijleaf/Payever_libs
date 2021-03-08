import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { tap, takeUntil, switchMap, map, shareReplay } from 'rxjs/operators';
import { combineLatest, of, Subject } from 'rxjs';

import { PeSimpleStepperService } from '@pe/stepper';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { PeContactsHeaderService, EnvService, WallpaperService } from '@app/services';
import { PopularProductInterface } from '@modules/dashboard/widgets/interfaces/products.interface';
import { ProductItem } from '@modules/dashboard/widgets/components/products/products-widget/product-item.model';
import { forEach } from 'lodash';
import { CurrencyPipe } from '@angular/common';
import { WidgetsApiService } from '@modules/dashboard/widgets/services';

@Component({
  selector: 'cos-contacts-root',
  templateUrl: './contacts-root.component.html',
  styleUrls: [
    './contacts-root.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosContactsRootComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<boolean>();

  isDashboardRoute: boolean;

  constructor(
    public router: Router,
    public peSimpleStepperService: PeSimpleStepperService,
    private contactsHeaderService: PeContactsHeaderService,
    private translateService: TranslateService,
    private platformHeaderService: PlatformHeaderService,
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
    this.getProducts();

    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'contacts';
          if (this.isDashboardRoute) {
            this.contactsHeaderService.init();
          }
          this.cdr.markForCheck();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'contacts';

    // Hide old platform header because next root component uses new platform header
    this.platformHeaderService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);

    this.contactsHeaderService.init();
  }


  private getProducts(): void {
    this.envService.businessUuid$.pipe(
      takeUntil(this.destroyed$),
      switchMap(businessUuid => combineLatest([
        this.widgetsApiService.getWeekPopularProductsRandom(businessUuid),
        this.widgetsApiService.getMonthPopularProductsRandom(businessUuid),
        ]).pipe(
        switchMap(([week, month]: PopularProductInterface[][]) => {
          return of([week, month]);
        })
        )
      ),
      map(([week, month]: PopularProductInterface[][]) => {
        let result: ProductItem[] = [];
        const added: string[] = [];
        if (week && week.length) {
          forEach(week, item => {
            if (added.indexOf(item._id) < 0) {
              result.push(new ProductItem(item, this.translateService.translate('widgets.products.popular-lastWeek')));
              added.push(item._id);
            }
          });
        }
        if (month && month.length) {
          forEach(month, item => {
            if (added.indexOf(item._id) < 0) {
              result.push(new ProductItem(item, this.translateService.translate('widgets.products.popular-lastMonth')));
              added.push(item._id);
            }
          });
        }
        result = result.slice(0, 4);
        return result;
      }),
      tap((products: ProductItem[]) => {
        // this.productsWidget.data = products.map((product: ProductItem) => ({
        //   title: product.name,
        //   subtitle: this.currencyPipe.transform(product.price, product.currency || 'EUR'),
        //   imgSrc: product.thumbnailSanitized
        // }));
      }),
      shareReplay(1)
    ).subscribe();
  }

  ngOnDestroy() {
    this.contactsHeaderService.destroy();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
