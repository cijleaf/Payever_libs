import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forEach } from 'lodash-es';

import { combineLatest, Observable, BehaviorSubject, of, EMPTY } from 'rxjs';
import { map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PopularProductInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { WallpaperService } from '../../../../../../apps/standalone/app/services';
import { ProductItem } from './product-item.model';
import { TranslateService } from '@pe/ng-kit/src/kit/i18n/src/services/translate/translate.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'products-widget',
  templateUrl: './products-widget.component.html',
  styleUrls: ['./products-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProductsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'products';

  showNewProductSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  popularProductsTitle: string;

  products$: Observable<ProductItem[]> = this.envService.businessUuid$.pipe(
    takeUntil(this.destroyed$),
    switchMap(businessUuid =>
      combineLatest(
        // this.widgetsApiService.getWeekPopularProducts(businessUuid),
        // this.widgetsApiService.getMonthPopularProducts(businessUuid),
        this.widgetsApiService.getWeekPopularProductsRandom(businessUuid),
        this.widgetsApiService.getMonthPopularProductsRandom(businessUuid),
      ).pipe(
        switchMap(([week, month]: PopularProductInterface[][]) => {
          /*
          if (!week.length && !month.length) {
            return combineLatest(
              this.widgetsApiService.getWeekPopularProductsRandom(businessUuid),
              this.widgetsApiService.getMonthPopularProductsRandom(businessUuid),
            );
          }*/
          return of([week, month]);
        }),
      ),
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
      this.widget.data = products.map((product: ProductItem) => ({
        title: product.name,
        subtitle: this.currencyPipe.transform(product.price, product.currency || 'EUR'),
        imgSrc: product.thumbnailSanitized,
        onSelect: product => {
          this.onOpenProduct(product);
          return EMPTY;
        },
        onSelectData: product,
      }));
      this.cdr.detectChanges();
    }),
    shareReplay(1),
  );
  /*
  productsMore$: Observable<ProductItem[]> = this.envService.businessUuid$.pipe(
    takeUntil(this.destroyed$),
    switchMap(businessUuid => this.widgetsApiService.getLastSoldProducts(businessUuid).pipe(
      switchMap((last: PopularProductInterface[]) => {
        if (!last.length) {
          return this.widgetsApiService.getLastSoldProductsRandom(businessUuid);
        }
        return of(last);
      })
    )),
    map((last: PopularProductInterface[]) => {
      return last.slice(0, 3).map(prod => {
        prod.id = prod._id;
        return new ProductItem(prod);
      });
    }),
    shareReplay(1)
  );
*/

  constructor(
    injector: Injector,
    private translateService: TranslateService,
    protected wallpaperService: WallpaperService,
    private currencyPipe: CurrencyPipe,
    private cdr: ChangeDetectorRef,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.products$.subscribe();
    this.popularProductsTitle = this.translateService.translate('widgets.products.most-popular').replace(/\s/g, '<br>');
  }

  onOpenProduct(product: ProductItem) {
    product.loading$.next(true);
    this.router
      .navigate(['business', this.envService.businessUuid, this.appName, 'products-editor', product.id || product.uuid])
      .then(() => {
        product.loading$.next(false);
        this.wallpaperService.showDashboardBackground(false);
      });
  }

  onAddNewProduct(): void {
    this.showNewProductSpinner$.next(true);
    this.loaderService
      .loadMicroScript(this.appName, this.envService.businessUuid)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => {
          this.router
            .navigate(['business', this.envService.businessUuid, this.appName])
            .then(() => this.showNewProductSpinner$.next(false));
        },
        () => {
          this.showNewProductSpinner$.next(false);
        },
      );
  }
}
