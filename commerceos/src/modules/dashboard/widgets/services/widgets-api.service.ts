import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AmountDataInterface,
  CampaignInterface, ChannelSetInterface,
  DomainInterface,
  PopularProductByChannelSetInterface,
  ShopInterface,
  PopularProductInterface, TerminalInterface, ConnectIntegrationInterface, CheckoutInterface, IntegrationInterface, StudioMedia
} from '../interfaces';
import { WidgetInfoInterface } from '../../shared-dashboard/interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { MediaContainerType } from '@pe/ng-kit/modules/media';

@Injectable()
export class WidgetsApiService {

  constructor(
    private envConfigService: EnvironmentConfigService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  getBusinessWidgets(businessId: string): Observable<WidgetInfoInterface[]> {
    const url: string = `${this.envConfigService.getBackendConfig().widgets}/api/business/${businessId}/widget`;
    return this.http.get<WidgetInfoInterface[]>(url);
  }

  getPersonalWidgets(): Observable<WidgetInfoInterface[]> {
    const url: string = `${this.envConfigService.getBackendConfig().widgets}/api/personal/widget`;
    return this.http.get<WidgetInfoInterface[]>(url);
  }

  getWidgetTutorials(businessId: string): Observable<WidgetInfoInterface[]> {
    const url: string = `${this.envConfigService.getBackendConfig().widgets}/api/business/${businessId}/widget-tutorial`;
    return this.http.get<WidgetInfoInterface[]>(url);
  }

  installWidget(businessId: string, widgetId: string): Observable<WidgetInfoInterface[]> {
    const url: string = `${this.envConfigService.getBackendConfig().widgets}/api/business/${businessId}/widget/${widgetId}/install`;
    return this.http.patch<WidgetInfoInterface[]>(url, {});
  }

  uninstallWidget(businessId: string, widgetId: string): Observable<WidgetInfoInterface[]> {
    const url: string = `${this.envConfigService.getBackendConfig().widgets}/api/business/${businessId}/widget/${widgetId}/uninstall`;
    return this.http.patch<WidgetInfoInterface[]>(url, {});
  }

  watchedTutorialWidget(businessId: string, widgetId: string): Observable<WidgetInfoInterface[]> {
    const url: string =
      `${this.envConfigService.getBackendConfig().widgets}/api/business/${businessId}/widget-tutorial/${widgetId}/watched`;
    return this.http.patch<WidgetInfoInterface[]>(url, {});
  }

  // TRANSACTIONS WIDGET

  getTransactionsDailyAmount(businessId: string): Observable<AmountDataInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/transactions-app/business/${businessId}/last-daily`;
    return this.http.get<AmountDataInterface[]>(path);
  }

  getTransactionsMonthlyAmount(businessId: string): Observable<AmountDataInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/transactions-app/business/${businessId}/last-monthly`;
    return this.http.get<AmountDataInterface[]>(path);
  }

  getTransactionsPersonalDailyAmount(): Observable<AmountDataInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/transactions-app/personal/last-daily`;
    return this.http.get<AmountDataInterface[]>(path);
  }

  getTransactionsPersonalMonthlyAmount(): Observable<AmountDataInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/transactions-app/personal/last-monthly`;
    return this.http.get<AmountDataInterface[]>(path);
  }

  getWeekTransactionsByChannelSet(
    businessId: string,
    channelSet: string
  ): Observable<AmountDataInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}
/api/transactions-app/business/${businessId}/channel-set/${channelSet}/last-daily`;

    return this.http.get<AmountDataInterface[]>(path).pipe(
      map(transactions => {
        transactions.sort((a, b) => a.date < b.date ? 1 : -1);
        return transactions.slice(0, 7);
      })
    );
  }

  // MARKETING WIDGET

  getMarketingData(businessId: string): Observable<CampaignInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/campaign-app/business/${businessId}`;
    return this.http.get<CampaignInterface[]>(path);
  }

  // SHOP WIDGET

  getShops(businessId: string): Observable<ShopInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().shop}/api/business/${businessId}/shop`;
    return this.http.get<ShopInterface[]>(path);
  }

  getShopDomain(businessId: string, shopId: string): Observable<DomainInterface> {
    const path: string = `${this.envConfigService.getBackendConfig().builder}/api/business/${businessId}/app/${shopId}/domain`;
    return this.http.get<DomainInterface>(path);
  }

  getTopViewedProductsByChannelSet(businessId: string,
                                   channelSet: string,
                                   period: 'week' | 'month' = 'week'): Observable<PopularProductByChannelSetInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}
/api/products-app/business/${businessId}/channel-set/${channelSet}/${ period === 'month' ? 'popular-month' : 'popular-week' }`;

    return this.http.get<PopularProductByChannelSetInterface[]>(path);
  }

  // PRODUCTS WIDGET

  getWeekPopularProducts(businessId: string): Observable<PopularProductInterface[]> {
    // prod.thumbnailSanitized = this.sanitizeImageUrl(prod.thumbnail);
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/products-app/business/${businessId}/popular-week`;
    return this.http.get<PopularProductInterface[]>(path).pipe(
      map(products => products.map(product => {
          product.thumbnailSanitized = this.sanitizeProductImageUrl(product.thumbnail);
          return product;
        })
      )
    );
  }

  getMonthPopularProducts(businessId: string): Observable<PopularProductInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/products-app/business/${businessId}/popular-month`;
    return this.http.get<PopularProductInterface[]>(path).pipe(
      map(products => products.map(product => {
          product.thumbnailSanitized = this.sanitizeProductImageUrl(product.thumbnail);
          return product;
        })
      )
    );
  }

  getLastSoldProducts(businessId: string): Observable<PopularProductInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/products-app/business/${businessId}/last-sold`;
    return this.http.get<PopularProductInterface[]>(path).pipe(
      map(products => products.map(product => {
          product.thumbnailSanitized = this.sanitizeProductImageUrl(product.thumbnail);
          return product;
        })
      )
    );
  }

  getWeekPopularProductsRandom(businessId: string): Observable<PopularProductInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/products-app/business/${businessId}/popular-week/random`;
    return this.http.get<PopularProductInterface[]>(path).pipe(
      map(products => products.map(product => {
          product.thumbnailSanitized = this.sanitizeProductImageUrl(product.thumbnail);
          return product;
        })
      )
    );
  }

  getMonthPopularProductsRandom(businessId: string): Observable<PopularProductInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/products-app/business/${businessId}/popular-month/random`;
    return this.http.get<PopularProductInterface[]>(path).pipe(
      map(products => products.map(product => {
          product.thumbnailSanitized = this.sanitizeProductImageUrl(product.thumbnail);
          return product;
        })
      )
    );
  }

  getLastSoldProductsRandom(businessId: string): Observable<PopularProductInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/products-app/business/${businessId}/last-sold/random`;
    return this.http.get<PopularProductInterface[]>(path).pipe(
      map(products => products.map(product => {
          product.thumbnailSanitized = this.sanitizeProductImageUrl(product.thumbnail);
          return product;
        })
      )
    );
  }

  // POS WIDGET
  getTerminals(businessId: string): Observable<TerminalInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().pos}/api/business/${businessId}/terminal`;
    return this.http.get<TerminalInterface[]>(path);
  }

  getBusinessIntegrations(businessId: string): Observable<any> {
    const path: string = `${this.envConfigService.getBackendConfig().checkout}/api/business/${businessId}/integration`;
    return this.http.get(path);
  }

  getCheckoutIntegrations(businessId: string, checkoutId: string): Observable<string[]> {
    const path: string = `${this.envConfigService.getBackendConfig().checkout}
/api/business/${businessId}/checkout/${checkoutId}/integration`;
    return this.http.get<string[]>(path);
  }

  getChannelSets(businessId: string): Observable<ChannelSetInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().checkout}/api/business/${businessId}/channelSet`;
    return this.http.get<ChannelSetInterface[]>(path);
  }

  makeCheckoutDirectLink(channelSetId: string): string {
    return `${this.envConfigService.getFrontendConfig().checkoutWrapper}/pay/create-flow/channel-set-id/${channelSetId}`;
  }

  // CONNECT WIDGET
  getUninstalledConnections(businessId: string): Observable<ConnectIntegrationInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().connect}/api/business/${businessId}/integration/not-installed/random`;
    return this.http.get<ConnectIntegrationInterface[]>(path);
  }

  getUninstalledConnectionsFilteredByCountry(businessId: string): Observable<ConnectIntegrationInterface[]> {
    const path: string =
        `${this.envConfigService.getBackendConfig()
            .connect}/api/business/${businessId}/integration/not-installed/random/filtered-by-country`;
    return this.http.get<ConnectIntegrationInterface[]>(path);
  }

  installIntegration(business: string, name: string, install: boolean = true): Observable<void> {
    const path: string = `${this.envConfigService.getBackendConfig().connect}/api/business/${business}
/integration/${name}/${install ? 'install' : 'uninstall'}`;

    return this.http.patch<void>(path, {});
  }

  // CHECKOUT WIDGET
  getCheckoutList(businessId: string): Observable<CheckoutInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().checkout}/api/business/${businessId}/checkout`;
    return this.http.get<CheckoutInterface[]>(path);
  }

  getIntegrationList(businessId: string): Observable<IntegrationInterface[]> {
    const path: string = `${this.envConfigService.getBackendConfig().checkout}/api/business/${businessId}/integration`;
    return this.http.get<IntegrationInterface[]>(path);
  }

  getLastStudioItems(businessId: string): Observable<StudioMedia[]> {
    const path: string = `${this.envConfigService.getBackendConfig().widgets}/api/studio-app/business/${businessId}/last`;
    return this.http.get<StudioMedia[]>(path);
  }

  private sanitizeProductImageUrl(url: string) {
    if (url) {
      if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
        return this.sanitizer
          .bypassSecurityTrustStyle(`url('${url}')`);
      }
      let storageIndex = url.indexOf(MediaContainerType.Products);
      // if (storageIndex === -1) {
      const storage = this.envConfigService.getCustomConfig().storage;
      if (storage) {
        url = storage + '/products/' + url;
        storageIndex = url.indexOf(MediaContainerType.Products);
      }
      // }
      return this.sanitizer
        .bypassSecurityTrustStyle(`url('${url.substring(0, storageIndex) + encodeURIComponent(url.substring(storageIndex))}')`);
    } else {
      return '';
    }
  }

}
