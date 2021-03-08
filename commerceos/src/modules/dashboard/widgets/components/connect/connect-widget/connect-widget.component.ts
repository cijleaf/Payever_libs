import {Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { TranslationLoaderService } from '@pe/ng-kit/modules/i18n';

import { BehaviorSubject, combineLatest, Observable, EMPTY } from 'rxjs';
import {
  filter, map, switchMap, take, distinctUntilChanged,
  startWith, shareReplay, takeUntil, tap
} from 'rxjs/operators';

import { ConnectIntegrationInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { WallpaperService } from '../../../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'connect-widget',
  templateUrl: './connect-widget.component.html',
  styleUrls: ['./connect-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ConnectWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'connect';

  readonly TOP_LIST_LENGTH: number = 4;
  // readonly MORE_LIST_LENGTH: number = 5;

  integrationWithSpinner$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  showEditButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  integrations$: Observable<ConnectIntegrationInterface[]> = combineLatest(
    this.envService.businessUuid$,
    this.platformService.microAppReady$.pipe(
      startWith(undefined),
      distinctUntilChanged(),
    )
  ).pipe(
    takeUntil(this.destroyed$),
    filter(([businessUuid, app]) => !app),
    switchMap(([businessUuid]) => this.widgetsApiService.getUninstalledConnectionsFilteredByCountry(businessUuid)),
    shareReplay(1)
  );

  topIntegrations$: Observable<ConnectIntegrationInterface[]> = this.integrations$.pipe(
    takeUntil(this.destroyed$),
    filter((integrations: ConnectIntegrationInterface[]) => !!integrations),
    map((integrations: ConnectIntegrationInterface[]) => integrations.slice(0, this.TOP_LIST_LENGTH)),
    tap((integrations)  => {
      this.widget.data = integrations.map((integration) => ({
        title: '', // `integrations.${integration.integration.category}.${integration.integration.name}.title`,
        isButton: true,
        icon: integration.integration.displayOptions.icon,
        iconSize: 24,
        onSelect: (data) => {
          this.onGoToIntegration(data);
          return EMPTY;
        },
        onSelectData: integration,
      }));
      // this.newWidget.data.push({
      //   title: 'widgets.connect.actions.add-connect',
      //   isButton: true,
      //   icon: '',
      //   onSelect: () => this.onConnectAddClick(),
      // });
      this.cdr.detectChanges();
    })
  );
/*
  moreIntegrations$: Observable<ConnectIntegrationInterface[]> = this.integrations$.pipe(
    takeUntil(this.destroyed$),
    filter((integrations: ConnectIntegrationInterface[]) => !!integrations),
    map((integrations: ConnectIntegrationInterface[]) =>
      integrations.slice(this.TOP_LIST_LENGTH, this.TOP_LIST_LENGTH + this.MORE_LIST_LENGTH)
    )
  );
*/
  // isShortTopList$: Observable<boolean> = this.topIntegrations$.pipe(
  //   takeUntil(this.destroyed$),
  //   filter((intergations: ConnectIntegrationInterface[]) => !!intergations),
  //   map((intergations: ConnectIntegrationInterface[]) => intergations.length < this.TOP_LIST_LENGTH)
  // );
/*
  isShortMoreList$: Observable<boolean> = this.moreIntegrations$.pipe(
    takeUntil(this.destroyed$),
    filter((intergations: ConnectIntegrationInterface[]) => !!intergations),
    map((intergations: ConnectIntegrationInterface[]) => intergations.length < this.MORE_LIST_LENGTH)
  );

  showMoreLink$: Observable<boolean> = this.moreIntegrations$.pipe(
    takeUntil(this.destroyed$),
    map((integrations: ConnectIntegrationInterface[]) => integrations && integrations.length > 0)
  );*/

  constructor(
    injector: Injector,
    private translationLoaderService: TranslationLoaderService,
    private wallpaperService: WallpaperService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.showSpinner$.next(true);

    this.topIntegrations$.subscribe();

    combineLatest(
      this.translationLoaderService.loadTranslations(['connect-app', 'connect-integrations']),
      this.integrations$,
    ).pipe(
      take(1)
    ).subscribe(() => {
      this.showSpinner$.next(false);
    });
  }

  onGoToIntegration(connection: ConnectIntegrationInterface): void {
    if (connection) {
      this.integrationWithSpinner$.next(connection.integration.name);
      this.router.navigate([`business/${this.envService.businessUuid}/connect`, connection.integration.category])
        .then(() => this.wallpaperService.showDashboardBackground(false));
    } else {
      console.warn('Can\'t open empty integration');
    }
  }

  onConnectAddClick(): void {
    this.showEditButtonSpinner$.next(true);
    this.router.navigate([`business/${this.envService.businessUuid}/connect`])
      .then(() => this.wallpaperService.showDashboardBackground(false));
  }
}
