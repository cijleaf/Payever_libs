import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { DockerItemInterface } from '@pe/ng-kit/modules/docker';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AppsListComponent {

  @Input() apps: DockerItemInterface[] | any[];
  @Input() installText: string;
  @Input() uninstallText: string;

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onAppToggle: EventEmitter<DockerItemInterface> =
    new EventEmitter<DockerItemInterface>();

  disabledClick: boolean;

  getRetinaIcon(icon: string) {
    return (icon || '').replace('32', '64');
  }
}
