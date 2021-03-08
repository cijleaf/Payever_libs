import { Observable, Subject } from 'rxjs';
import { NotificationRawInterface } from '../../../../shared/interfaces';

export interface NotificationListInterface {
  title: string;
  iconSrc: string;
  notifications$: Observable<NotificationListMessageInterface[]>;
}

export interface NotificationListMessageInterface extends NotificationRawInterface {
  id: string;
  open$: Subject<boolean>;
  delete$: Subject<boolean>;
}

export class NotificationMessage implements NotificationListMessageInterface {
  _id: string;
  id: string;
  app: string;
  entity: string;
  kind: string;
  message: string;
  actionKey: string;
  data?: any;
  params?: any;
  open$ = new Subject<boolean>();
  delete$ = new Subject<boolean>();

  constructor(item: NotificationRawInterface) {
    Object.assign(this, item);
    this.id = this._id;
    this.actionKey = this.message.replace('notification.', '');
    this.message = `info_boxes.notifications.messages.${this.actionKey}`;
  }
}
