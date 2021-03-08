import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { filter, map, takeUntil } from 'rxjs/operators';

import { AmountDataInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { Observable, combineLatest } from 'rxjs';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'transactions-widget',
  templateUrl: './transactions-widget.component.html',
  styleUrls: ['./transactions-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TransactionsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'transactions';

  constructor(injector: Injector, private currencyPipe: CurrencyPipe, private cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit() {
    combineLatest([this.getTransactionsMonthlyAmount$(), this.getTransactionsDailyAmount$()])
      .pipe(
        filter(
          ([monthlyData, dailyData]: [AmountDataInterface[], AmountDataInterface[]]) => !!monthlyData && !!dailyData,
        ),
        map(([monthlyData, dailyData]: [AmountDataInterface[], AmountDataInterface[]]) => {
          const currentMonth: AmountDataInterface = monthlyData[monthlyData.length - 1];
          const currentDay: AmountDataInterface = dailyData[dailyData.length - 1];

          const currentMonthAmount = currentMonth && currentMonth.amount ? currentMonth.amount : 0;
          const sign = currentMonthAmount > 0 ? '+' : '';
          const currency = monthlyData.length ? monthlyData[0]?.currency || 'EUR' : 'EUR';

          const currentDayAmount = currentDay && currentDay.amount ? currentDay.amount : 0;
          const daySign = currentDayAmount > 0 ? '+' : currentDayAmount !== 0 ? '-' : '';
          const dayCurrency = dailyData.length ? dailyData[0]?.currency || 'EUR' : 'EUR';

          this.widget = {
            ...this.widget,
            data: [
              {
                title: this.currencyPipe.transform(currentDayAmount, dayCurrency, 'symbol'),
              },
              {
                title: 'This month',
              },
              {
                title: `${sign}${this.currencyPipe.transform(currentMonthAmount, currency, 'symbol')}`,
                titleColor: sign === '+' ? 'green' : currentMonthAmount < 0 ? 'red' : null,
              },
            ],
          };

          this.cdr.detectChanges();
          return currentMonthAmount;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  private getTransactionsMonthlyAmount$(): Observable<AmountDataInterface[]> {
    if (this.envService.isPersonalMode) {
      return this.widgetsApiService.getTransactionsPersonalMonthlyAmount();
    } else {
      return this.widgetsApiService.getTransactionsMonthlyAmount(this.envService.businessUuid);
    }
  }

  private getTransactionsDailyAmount$(): Observable<AmountDataInterface[]> {
    if (this.envService.isPersonalMode) {
      return this.widgetsApiService.getTransactionsPersonalDailyAmount();
    } else {
      return this.widgetsApiService.getTransactionsDailyAmount(this.envService.businessUuid);
    }
  }
}
