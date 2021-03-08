import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-error',
  templateUrl: './entry-error.component.html',
  styleUrls: ['./entry-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryErrorComponent {

  @Input() errorText: string = null;

  constructor() {}
}
