import { Component, Input } from '@angular/core';

import { entryLogo } from '../../../../settings';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'active-business',
  templateUrl: './active-business.component.html',
  styleUrls: ['./active-business.component.scss'],
})
export class ActiveBusinessComponent {

  readonly entryLogo = entryLogo;

  @Input() logo: string;
  @Input() name: string;
  @Input() email: string;
  @Input() city: string;
  @Input() firstName: string;
  @Input() lastName: string;

  @Input() noMargin: boolean;
  @Input() size: number = 76;
}
