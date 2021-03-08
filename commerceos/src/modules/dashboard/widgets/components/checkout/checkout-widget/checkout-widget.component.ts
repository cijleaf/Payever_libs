import { Component, Injector, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { BehaviorSubject, Observable, combineLatest, EMPTY } from 'rxjs';
import { switchMap, map, shareReplay, distinctUntilChanged, startWith, takeUntil, tap } from 'rxjs/operators';

import { SnackBarService } from '@pe/ng-kit/modules/snack-bar';
import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { CheckoutInterface } from '../../../interfaces';
import { WallpaperService } from '../../../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'checkout-widget',
  templateUrl: './checkout-widget.component.html',
  styleUrls: ['./checkout-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CheckoutWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'checkout';
  iconUrl: string;

  loadingCheckoutDirectLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loadingCheckoutEdit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  updateDashboard$: Observable<boolean> = this.platformService.microAppReady$.pipe(
    takeUntil(this.destroyed$),
    map(appName => !appName),
    distinctUntilChanged(),
    startWith(true)
  );

  defaultPayment$: Observable<CheckoutInterface> = combineLatest(
    this.envService.businessUuid$,
    this.updateDashboard$,
  ).pipe(
    takeUntil(this.destroyed$),
    switchMap(([businessUuid]) => this.widgetsApiService.getCheckoutList(businessUuid)),
    map((payments: CheckoutInterface[]) => {
      return payments.find(p => p.default) || payments[0];
    }),
    tap((payment) => {
      this.widget.data = [
        {
          title: 'widgets.checkout.actions.open-direct-link',
          isButton: true,
          // icon: '#icon-apps-cart',
          notProcessLoading: true,
          onSelect: (data) => {
            this.onDirectLinkClick(data);
            return EMPTY;
          },
          onSelectData: payment,
        },
        {
          title: 'widgets.checkout.actions.edit-checkout',
          isButton: true,
          // icon: '#icon-edit-pencil-24',
          onSelect: (data) => {
            this.onEditCheckout(data);
            return EMPTY;
          },
          onSelectData: payment,
        }
      ];
      this.cdr.detectChanges();
    }),
    shareReplay(1)
  );
/*
  defaultCheckoutDirectLink$: Observable<string[]> = this.defaultPayment$.pipe(map(checkout => {
    return checkout.map(c => c.)
  }));

  integrations$: Observable<IntegrationInterface[]> = combineLatest(
    this.envService.businessUuid$,
    this.updateDashboard$,
  ).pipe(
    takeUntil(this.destroyed$),
    switchMap(([businessUuid]) => this.widgetsApiService.getIntegrationList(businessUuid)),
    shareReplay(1)
  );

  paymentMethods$: Observable<DisplayOptionsInterface[]> = this.integrations$.pipe(
    takeUntil(this.destroyed$),
    map(integrations => integrations
      .filter(i => i.integration.category === IntegrationCategory.Payments && i.installed)
      .map(i => i.integration.displayOptions)
    ),
    map((last: DisplayOptionsInterface[]) => last.slice(0, 4)),
    shareReplay(1)
  );

  channels$: Observable<DisplayOptionsInterface[]> = this.integrations$.pipe(
    takeUntil(this.destroyed$),
    map(integrations => integrations
      .filter(i => (i.integration.category === IntegrationCategory.ShopSystems
        || i.integration.category === IntegrationCategory.Applications)
        && i.installed)
      .map(i => i.integration.displayOptions)
    ),
    map((last: DisplayOptionsInterface[]) => last.slice(0, 4)),
    shareReplay(1)
  );
*/

  constructor(
    injector: Injector,
    protected wallpaperService: WallpaperService,
    protected snackBarService: SnackBarService,
    protected translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit() {
    this.defaultPayment$.subscribe();
  }

  onDirectLinkClick(checkout: CheckoutInterface): void {
    this.loadingCheckoutDirectLink$.next(true);
    this.widgetsApiService.getChannelSets(this.envService.businessUuid).subscribe(channelSets => {
      const channelsSetLink = channelSets.find(c => c.type === 'link' && c.checkout === checkout._id);
      if (channelsSetLink) {
        const link = this.widgetsApiService.makeCheckoutDirectLink(channelsSetLink.id);
        var win = window.open(link, '_blank');
        win.focus();
      } else {
        this.showError('Cant get channel set with type link'); // TODO Translation
      }
      this.loadingCheckoutDirectLink$.next(false);
    }, () => {
      this.showError('Cant get channel sets'); // TODO Translation
      this.loadingCheckoutDirectLink$.next(false);
    });
  }
/*
  onAddNewCheckout(): void {

    this.loaderService.loadMicroScript(this.appName, this.envService.businessUuid).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      () => {
        this.router.navigate(['business', this.envService.businessUuid, this.appName, 'create'])
          .then(() => {
            this.showButtonSpinner$.next(false);
            this.wallpaperService.showDashboardBackground(false);
          });
      }
    );
  }
*/
  onEditCheckout(checkout: CheckoutInterface): void {
    this.loadingCheckoutEdit$.next(true);
    this.loaderService.loadMicroScript(this.appName, this.envService.businessUuid).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      () => {
        this.router.navigate(['business', this.envService.businessUuid, this.appName, checkout._id, 'edit'])
          .then(() => {
            this.showButtonSpinner$.next(false);
            this.wallpaperService.showDashboardBackground(false);
          });
      }
    );
  }
/*
  onAddPayments() {
    this.loaderService.loadMicroScript(this.appName, this.envService.businessUuid).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      () => {
        this.router.navigate(['business', this.envService.businessUuid, 'connect', 'payments'])
          .then(() => {
            this.showButtonSpinner$.next(false);
            this.wallpaperService.showDashboardBackground(false);
          });
      }
    );
  }

  onAddChannel() {
    this.loaderService.loadMicroScript(this.appName, this.envService.businessUuid).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      () => {
        this.router.navigate(['business', this.envService.businessUuid, 'connect', 'shopsystems'])
          .then(() => {
            this.showButtonSpinner$.next(false);
            this.wallpaperService.showDashboardBackground(false);
          });
      }
    );
  }
*/
  protected showError(error: string): void {
    this.snackBarService.toggle(true, error || 'Unknown_error', {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24
    });
  }
}

