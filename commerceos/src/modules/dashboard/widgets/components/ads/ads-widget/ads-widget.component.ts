import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { EMPTY } from 'rxjs';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'ads-widget',
  templateUrl: './ads-widget.component.html',
  styleUrls: ['./ads-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AdsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly installAppButtonText: string;
  readonly adsAppUrl: string = 'widgets.ads.url';
  readonly appName: string = 'ads';

  constructor(injector: Injector, private translateService: TranslateService, private cdr: ChangeDetectorRef) {
    super(injector);
    this.installAppButtonText = this.translateService.translate('widgets.ads.install-app');
  }

  ngOnInit(): void {
    this.showSpinner$.next(false);

    this.widget.data = [
      {
        title: 'widgets.ads.install-app',
        isButton: true,
        icon: '',
        onSelect: () => {
          this.onOpenAdsClick();
          return EMPTY;
        },
      }
    ];
    this.cdr.detectChanges();
  }

  onOpenAdsClick(): void {
    window.open(this.translateService.translate(this.adsAppUrl), '_blank');
  }
}
