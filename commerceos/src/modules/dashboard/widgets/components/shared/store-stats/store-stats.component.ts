import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PopularProductByChannelSetInterface } from '../../../interfaces';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'store-stats',
  styleUrls: ['./store-stats.component.scss'],
  templateUrl: './store-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreStatsComponent {
  @Input() statsTitle: string;
  @Input() statsCounter: string;
  @Input() productsTitle: string;
  @Input() products: PopularProductByChannelSetInterface[];
  @Input() statsCounterSmaller: boolean;

}

