import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'profile-button',
  templateUrl: './profile-button.component.html',
  styleUrls: ['./profile-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileButtonComponent {

  @Output() profileButtonClicked: EventEmitter<boolean> = new EventEmitter();

  toggleRoutes(): void {
    this.profileButtonClicked.emit(true);
  }

}
