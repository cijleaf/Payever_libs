import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { MicroAppDashboardInfoInterface } from '@pe/ng-kit/modules/micro';

import { WidgetInfoInterface } from '../../../../shared-dashboard/interfaces';
import { EditWidgetsService } from '../../../../shared-dashboard/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'widgets-list',
  templateUrl: './widgets-list.component.html',
  styleUrls: ['./widgets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WidgetsListComponent {

  installed$: Observable<WidgetInfoInterface[]> = this.editWidgetsService.installedWidgets$;
  uninstalled$: Observable<WidgetInfoInterface[]> = this.editWidgetsService.uninstalledWidgets$;

  constructor(private editWidgetsService: EditWidgetsService) {}

  add(widget: WidgetInfoInterface & MicroAppDashboardInfoInterface) {
    if (widget) {
      widget.disabledClick = true;
      this.editWidgetsService.install(widget._id).toPromise().then(() => {
        widget.disabledClick = false;
      });
    } else {
      console.warn('No widget instance to delete');
    }
  }

  delete(widget: WidgetInfoInterface & MicroAppDashboardInfoInterface) {
    if (widget) {
      widget.disabledClick = true;
      this.editWidgetsService.uninstall(widget._id).toPromise().then(() => {
        widget.disabledClick = false;
      });
    } else {
      console.warn('No widget instance to delete');
    }
  }

}
