import {Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { DashboardEventEnum } from '@pe/ng-kit/modules/common';

import { CampaignInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { SectionInterface } from '../../../../shared-dashboard/components';
import { WindowService } from '@pe/ng-kit/modules/window';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'marketing-widget',
  templateUrl: './marketing-widget.component.html',
  styleUrls: ['./marketing-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MarketingWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'marketing';

  sections: SectionInterface[] = [{
    title: 'widgets.marketing.sections.unread_campaigns.title',
    value: '0',
  },
  {
    title: 'widgets.marketing.sections.all_campaigns.title',
    value: '0',
  }];

  activeCampaign$: BehaviorSubject<CampaignInterface> = new BehaviorSubject<CampaignInterface>(null);
  // campaigns$: BehaviorSubject<CampaignInterface[]> = new BehaviorSubject<CampaignInterface[]>([]);
  showNewCampaignButtonSpinner$ = new BehaviorSubject(false);
  isMobile$ = this.windowService.isMobile$;

  statistic$: Observable<SectionInterface[]> = this.activeCampaign$.pipe(
    takeUntil(this.destroyed$),
    // filter((campaign: CampaignInterface) => !!campaign),
    map((campaign: CampaignInterface) => {
      return [
        {
          title: 'widgets.marketing.users',
          value: String(campaign ? campaign.contactsCount : 0),
        },
        {
          title: 'widgets.marketing.views',
          value: String(0), // TODO STUB DATA
        },
        {
          title: 'widgets.marketing.sells',
          value: String(campaign && campaign.channelSet ? campaign.channelSet.sells : 0),
        },
      ];
    }),
    tap((sections: SectionInterface[]) => {
      this.widget.data = sections.map((section) => ({
        title: section.title,
        isButton: false,
        subtitle: section.value,
      }));
    })
  );

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private windowService: WindowService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.showSpinner$.next(true);

    this.widgetsApiService.getMarketingData(this.envService.businessUuid).pipe(
      takeUntil(this.destroyed$),
    ).subscribe((campaigns: CampaignInterface[]) => {
      // NOTE: show only 2 campaigns by design
      // this.campaigns$.next(campaigns.slice(0, 2));

      if (campaigns && campaigns.length > 0) {
        this.activeCampaign$.next(campaigns[0]);
      }

      this.showSpinner$.next(false);
    });
    this.statistic$.subscribe();
  }
/*
  onCampaignSelect(campaign: CampaignInterface): void {
    this.activeCampaign$.next(campaign);
  }
*/
  openNewCampaign(): void {
    this.showNewCampaignButtonSpinner$.next(true);
    this.loaderService.loadMicroScript(this.appName, this.envService.businessUuid).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.platformService.dispatchEvent({
        target: DashboardEventEnum.MicroNavigation,
        action: '',
        data: 'marketing/campaigns/create-from-widget'
      });
    });
  }

}
