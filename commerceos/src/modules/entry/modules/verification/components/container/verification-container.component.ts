import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-verification-container',
  templateUrl: './verification-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationContainerComponent {
}
