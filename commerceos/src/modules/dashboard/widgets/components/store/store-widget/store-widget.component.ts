import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { takeUntil, filter, tap, map } from 'rxjs/operators';

import { DashboardEventEnum } from '@pe/ng-kit/modules/common';
import { ShopInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'store-widget',
  templateUrl: './store-widget.component.html',
  styleUrls: ['./store-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StoreWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'shop';

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // NOTE: this need to open selected shop when click "Open" in widget
    this.widgetsApiService.getShops(this.envService.businessUuid).pipe(
      map((shops: ShopInterface[]) => {
        let shop: ShopInterface;
        if (shops && shops.length) {
          shop = shops.find((s: ShopInterface) => s.isDefault);
          shop = shop || shops[0];
        }
        return shop;
      }),
      filter(shop => !!shop),
      tap((shop: ShopInterface) => {
        // Small hack for shops when installed=true but shops count is 0. It's not correct.
        this.widget.data = [
          {
            title: shop.name,
            isButton: false,
            imgSrc: shop.picture,
          },
          {
            title: 'widgets.store.actions.edit-store',
            isButton: true,
            onSelect: () => this.openShop(shop.id),
          }
        ];
        this.appUrlPath = `${this.appName}/${shop.id}/dashboard`;
        this.widget.openButtonFn = () => {
          this.onOpenButtonClick();
          return EMPTY;
        },
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  openShop(shopId: string): Observable<any> {
    this.loaderService.loadMicroScript(this.appName, this.envService.businessUuid).subscribe(
      () => {
        this.platformService.dispatchEvent({
          target: DashboardEventEnum.MicroNavigation,
          data: `shop/${shopId}/edit`,
          action: ''
        });
      }
    );
    return EMPTY;
  }
}



  // domain$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  // products$ = new BehaviorSubject<PopularProductByChannelSetInterface[]>(null);

  // shop$: BehaviorSubject<ShopInterface> = new BehaviorSubject(null);
  // showEditButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
/*
  transactionsAmount$: Observable<number> = combineLatest(this.envService.businessUuid$, this.shop$).pipe(
    takeUntil(this.destroyed$),
    switchMap(([businessUuid, store]) => {
      if (!businessUuid || !store) {
        return of(0);
      }
      return this.widgetsApiService.getWeekTransactionsByChannelSet(businessUuid, store.channelSet).pipe(
        takeUntil(this.destroyed$),
        map((transactions: AmountDataInterface[]) => transactions.reduce((total, current) => total += (current.amount || 0), 0 ))
      );
    }),
    shareReplay(1)
  );
*/
  // shops: ShopInterface[] = [];

  // ngOnInit() {
  //   this.shop$.pipe(
  //     takeUntil(this.destroyed$),
  //     switchMap((shop: ShopInterface) => {
  //       const domain$: Observable<DomainInterface> = shop
  //         ? this.widgetsApiService.getShopDomain(this.envService.businessUuid, shop._id).pipe(
  //           takeUntil(this.destroyed$),
  //         )
  //         : of(null);

  //       return domain$;
  //     })
  //   ).subscribe((domain: DomainInterface) => {
  //     this.domain$.next(domain ? domain.name : '');
  //   });

  //   this.shop$.pipe(
  //     takeUntil(this.destroyed$),
  //     switchMap((shop: ShopInterface) => {
  //       const popularProducts: Observable<PopularProductByChannelSetInterface[]> = shop
  //         ? this.widgetsApiService.getTopViewedProductsByChannelSet(this.envService.businessUuid, shop.channelSet.id, 'week').pipe(
  //           takeUntil(this.destroyed$),
  //         )
  //         : of([]);

  //       return popularProducts;
  //     })
  //   ).subscribe((products: PopularProductByChannelSetInterface[]) => {
  //     this.products$.next(products ? products.slice(0, 3) : []);
  //   });
  // }
/*
  showNextShop(): void {
    this.shop$.pipe(take(1)).subscribe((shop: ShopInterface) => {
      const index: number = this.shops.findIndex((_shop: ShopInterface) => _shop._id === shop._id);
      const nextIndex: number = index === this.shops.length - 1
        ? 0
        : index + 1;

      this.shop$.next(this.shops[nextIndex]);
    });
  }
*/
  // onOpenButtonClick(): void {
  //   const shopMicroConfig = <MicroAppInterface>this.microRegistryService.getMicroConfig('shop');
  //   if (shopMicroConfig && shopMicroConfig.setupStatus !== AppSetUpStatusEnum.Completed) {
  //     this.stepperHelperService.navigateToStep(PeWelcomeStepAction.ShopPreview);
  //     return;
  //   }
  //   super.onOpenButtonClick();

  //   const builderMicroConfig: MicroAppInterface = this.microRegistryService.getMicroConfig('builder') as MicroAppInterface;

  //   // NOTE: preload builder because it should be launched immidiately from shop app
  //   if (builderMicroConfig) {
  //     this.microLoaderService.loadScript(builderMicroConfig.bootstrapScriptUrl, 'builder').subscribe();
  //   }
  // }
