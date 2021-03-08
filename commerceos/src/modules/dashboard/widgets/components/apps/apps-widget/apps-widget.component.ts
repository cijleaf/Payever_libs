import { Component, Injector, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { map, tap, takeUntil } from 'rxjs/operators';

import { DashboardDataService } from '@app/services';

import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { EMPTY } from 'rxjs';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'apps-widget',
  templateUrl: './apps-widget.component.html',
  styleUrls: ['./apps-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  protected appName: string = '';

  constructor(
    injector: Injector,
    private dashboardDataService: DashboardDataService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit() {
    this.dashboardDataService.apps$.pipe(
      map(a => a.filter((micro: any) => micro.installed && micro.code !== 'dashboard')),
      tap(visibleApps => {
        this.widget.data = [
          ...visibleApps.map((app) => ({
            code: app.code,
            imgSrc: app.icon,
            title: app.title,
            loading: false,
            notProcessLoading: true,
            onSelect: (data) => {
              app.onSelect(data)
              return EMPTY;
            },
          }))];
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.loaderService.appLoading$.pipe(
      tap(appLoading => {
        this.widget.data.forEach(app => {
          app.loading = app.code === appLoading;
        });
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
