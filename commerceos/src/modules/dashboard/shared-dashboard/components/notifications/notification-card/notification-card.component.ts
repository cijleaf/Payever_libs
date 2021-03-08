import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NotificationListMessageInterface } from '../notifications-interface';

@Component({
    // tslint:disable-next-line component-selector
    selector: 'notification-card',
    templateUrl: './notification-card.component.html',
    styleUrls: ['./notification-card.component.scss']
})
export class NotificationCardComponent {
  opened: boolean = false;
  @Input() title: string;
  @Input() iconSrc: string;
  @Input() notifications: NotificationListMessageInterface[];

  @Output() open: EventEmitter<string> = new EventEmitter();

  @Output() close: EventEmitter<string> = new EventEmitter();

  onMoreClick(e: any) {
    this.opened = !this.opened;
  }
}
