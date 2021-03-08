import { Injectable } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SearchGroup, SearchGroupItems } from '@pe/ng-kit/modules/search-results';
import { BusinessInterface, TransactionInterface } from '../../../shared/interfaces';
import { SearchGroupEnum } from '../enum';
import { MediaContainerType, MediaUrlPipe } from '@pe/ng-kit/modules/media';

@Injectable()
export class SearchBoxService {
  public readonly MaxResults: number = 8;
  private _businesses: BusinessInterface[] = [];
  private _groups: SearchGroup[] = [];

  constructor(private mediaUrlPipe: MediaUrlPipe) { }

  set businesses(businesses: BusinessInterface[]) {
    businesses = businesses.map((item: BusinessInterface) => ({
      ...item,
      logo: item.logo ? this.mediaUrlPipe.transform(item.logo, MediaContainerType.Images) : ''
    }));
    this._businesses = businesses;
    this._groups.push(this._getSearchBusinessObject(businesses.slice(0, this.MaxResults)));
  }

  getGroups(): SearchGroup[] {
    return this._groups;
  }

  filterBusinesses(query: string): void {
    const filteredBusinesses = this._businesses
      .filter((business: BusinessInterface) =>
        business.name.toLowerCase().indexOf(query) !== -1).slice(0, this.MaxResults);
    this._updateGroups(this._getSearchBusinessObject(filteredBusinesses));
  }

  updateTransactionsGroup(businessUuid: string, transactions: TransactionInterface[]): void {
    this._updateGroups(this._getSearchTransactionsObject(businessUuid, transactions));
  }

  reset() {
    this._groups = [];
  }

  rebalanceGroups() {
    const firstGroupItemsCount = Math.ceil(this.MaxResults / this._groups.length);
    const remainingGroupItemsCount = Math.floor(this.MaxResults / this._groups.length);

    for (let i = 0; i < this._groups.length; i++) {
      if (i === 0) {
        this._groups[i].items = this._groups[i].items.slice(0, firstGroupItemsCount);
      } else if (i === this._groups.length - 1) {
        const totalItems = this._groups.reduce((acc, current) => acc + current.items.length, 0);
        this._groups[i].items = this._groups[i].items.slice(0, this.MaxResults - totalItems);
      } else {
        this._groups[i].items = this._groups[i].items.slice(0, remainingGroupItemsCount);
      }
    }
  }

  private _getSearchBusinessObject(businesses: BusinessInterface[]): SearchGroup {
    return {
      heading: SearchGroupEnum.Businesses,
      items: businesses.map((business: BusinessInterface) => ({
        ...business,
        title: business.name,
        description: business.email || business.companyAddress.city,
        imageIconSrc: business.logo,
        id: business._id,
        email: business.email || '',
        city: business.companyAddress && business.companyAddress.city,
        firstName: business.contactDetails && business.contactDetails.firstName,
        lastName: business.contactDetails && business.contactDetails.lastName,
        url: `./business/${business._id}/info/overview`,
      }))
    };
  }

  private _getSearchTransactionsObject(businessUuid: string, transactions: TransactionInterface[]): SearchGroup {
    const moneyPipe = new CurrencyPipe('en-US');

    return {
      heading: SearchGroupEnum.Transactions,
      items: transactions.map((transaction: TransactionInterface) => ({
        title: transaction.original_id,
        iconSrc: this.getChannelIconId(transaction.channel),
        description: `${transaction.customer_name} ${moneyPipe.transform(transaction.amount, transaction.currency, true)}`,
        url: `./business/${businessUuid}/transactions/${transaction.uuid}`,
      }))
    };
  }

  private _updateGroups(data: SearchGroup) {
    const group = this._groups.find(x => x.heading === data.heading);

    if (group) {
      if (data.items.length) {
        this._groups = this._groups.map((x: SearchGroup) => {
          return x.heading === data.heading ? data : x;
        });
      } else {
        this._groups = this._groups.filter(x => x.heading !== data.heading);
      }

    } else if (data.items.length) {
      this._groups.push(data);
    }
  }

  // TODO: extracted from transactions app, needs to be in one place
  private getChannelIconId(channelType: string): string {
    let iconId: string = '#icon-';
    switch (channelType) {
      case 'facebook':
        iconId += 'channel-facebook';
        break;
      case 'finance_express':
        iconId += 'payment-option-santander';
        break;
      case 'store':
        iconId += 'channel-store';
        break;
      case 'marketing':
        iconId += 'apps-marketing';
        break;
      case 'pos':
        iconId += 'channel-pos';
        break;
      // Shopsystems:
      case 'api':
        iconId += 'api';
        break;
      case 'dandomain':
        iconId += 'dan-domain-bw';
        break;
      case 'jtl':
        iconId += 'jtl';
        break;
      case 'magento':
        iconId += 'magento';
        break;
      case 'oxid':
        iconId += 'oxid';
        break;
      case 'plentymarkets':
        iconId += 'plenty-markets-bw';
        break;
      case 'presta':
        iconId += 'prestashop-bw';
        break;
      case 'shopify':
        iconId += 'shopify';
        break;
      case 'shopware':
        iconId += 'shopware';
        break;
      case 'woo_commerce':
      case 'wooCommerce':
        iconId += 'woo-commerce-bw';
        break;
      case 'xt_commerce':
      case 'xtCommerce':
        iconId += 'xt-commerce';
        break;
      default:
        iconId += 'channel-other_shopsystem';
        break;
    }
    return iconId;
  }
}
