import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SectionInterface {
  title: string;
  value: string;
}

@Component({
    // tslint:disable-next-line component-selector
  selector: 'widget-statistics',
  templateUrl: './widget-statistics.component.html',
  styleUrls: ['./widget-statistics.component.scss']
})
export class WidgetStatisticsComponent {

  @Input() sections: SectionInterface[] = [];

  constructor(
  ) {}
}
