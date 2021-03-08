import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { EnvService } from '../../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'app-card',
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.scss']
})
export class AppCardComponent {

  @Input() isUninstalledApps: boolean;
  @Input() appConfig: DockerItemInterface;

  @Input() profileButtonTitle: string;
  @Input() profileButtonImage: string;
  @Input() withEditButton: boolean;

    constructor(
    private router: Router,
    private mediaUrlPipe: MediaUrlPipe,
    private envService: EnvService
  ) {}

  openEditBox(): void {
    this.router.navigate([`business/${this.envService.businessUuid}/info/edit`]);
  }

  navigateToSettings() {
    this.router.navigate([`business/${this.envService.businessUuid}/settings/editing-business`]);
  }
}
