import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    // tslint:disable-next-line component-selector
  selector: 'widget-action-button',
  templateUrl: './widget-action-button.component.html',
  styleUrls: ['./widget-action-button.component.scss']
})
export class WidgetActionButtonComponent {

  @Input() icon: string;
  @Input() iconSize: number = 24;
  @Input() title: string;
  @Input() loading: boolean;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  constructor(
  ) {}
}
