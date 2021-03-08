import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CampaignInterface } from '../../../interfaces';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'marketing-campaign',
  templateUrl: './marketing-campaign.component.html',
  styleUrls: ['./marketing-campaign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingCampaignComponent { // TODO Remove this component
  @Input() campaigns: CampaignInterface[];
  @Input() selectedCampaign: CampaignInterface;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onClick: EventEmitter<CampaignInterface> = new EventEmitter<CampaignInterface>();
}
