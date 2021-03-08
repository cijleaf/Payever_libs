import { Component, Input, ElementRef, ViewChild, Output, AfterViewInit } from '@angular/core';
import { filter, tap } from 'rxjs/operators';
import { DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { EventEmitter } from 'events';
import { AppSelectorService } from '@app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'apps-layout',
  templateUrl: './apps-layout.component.html',
  styleUrls: ['./apps-layout.component.scss']
})
export class AppsLayoutComponent extends AbstractComponent implements AfterViewInit {

  widgets: any;
  loaded = false;
  apps: DockerItemInterface[];
  @ViewChild('scrollElement') scrollElement: ElementRef;

  @Input() profileButtonTitle: string;
  @Input() profileButtonImage: string;
  @Input() withEditButton: boolean;

  @Input() set dashboardItems(dashboardItems: any) {
    if (dashboardItems) {
      this.apps = dashboardItems.sort((current: any, next: any) => current.order - next.order);
    }
  }

  constructor(
    private appSelectorService: AppSelectorService,
  ) {
    super();

    this.appSelectorService.closeCalled$.pipe(
      filter(val => !!val),
      tap(() => {
        this.loaded = false;
      })
    ).subscribe();
  }

  ngAfterViewInit() {
    this.loaded = true;
  }

  close() {
    this.loaded = false;

    // timeout needed to show some fade out effect and not close immediately
    setTimeout(() => {
      this.appSelectorService.hideAppSelector();
    }, 400);
  }
}
