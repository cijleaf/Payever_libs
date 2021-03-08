import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject, BehaviorSubject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { MediaUrlPipe } from '@pe/media';
import { EnvService } from '../env.service';

enum TransactionRoutes {
  Transactions = 'transactions',
  LIST = 'list',
}

@Injectable({
  providedIn: 'any',
})
export class PeTransactionsHeaderService {
  // @TODO add translations
  businessData: any;
  currentTerminal: any;
  currentRoute: TransactionRoutes = this.router.url.split(';')[0].split('/').reverse()[0] as TransactionRoutes;
  contactHref: string = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref: string = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  hideBusinessItemTextMaxWidth = 729;
  subheaderMaxWidth = 620;
  isShowBusinessItemText: boolean = true;
  isSubheaderMode: boolean = false;
  prevUrl: string;
  preventSavingPrevUrl = false;

  destroyed$ = new Subject<void>();
  isInitialized: boolean = false;

  constructor(
    private router: Router,
    private mediaUrlPipe: MediaUrlPipe,
    private authService: PeAuthService,
    private platformHeaderService: PePlatformHeaderService,
    private breakpointObserver: BreakpointObserver,
    private envService: EnvService,
  ) {
    console.log('creating transactions header service instance');
    console.log(platformHeaderService);
  }

  /**
   * Initializing service subscriptions
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    /**
     * Changing current route to highlist selected item in header;
     * Handling popstate browser button
     */
    this.router.events
      .pipe(
        tap(event => {
          if (event instanceof NavigationEnd) {
            this.currentRoute = this.router.url.split(';')[0].split('/').reverse()[0] as TransactionRoutes;
            if (Object.values(TransactionRoutes).includes(this.currentRoute)) {
              this.setPosHeaderConfig();
            }
          }
          if (event instanceof NavigationStart) {
            if (!this.preventSavingPrevUrl) {
              this.prevUrl = this.router.url;
            }
            this.preventSavingPrevUrl = false;
            if (event.navigationTrigger === 'popstate' && this.platformHeaderService.config.isShowShortHeader) {
              this.platformHeaderService.setFullHeader();
            }
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to screen width changes to set or remove business title
     */
    this.breakpointObserver
      .observe(`(max-width: ${this.hideBusinessItemTextMaxWidth}px`)
      .pipe(
        tap((state: BreakpointState) => {
          this.isShowBusinessItemText = state.matches ? false : true;
          this.setPosHeaderConfig();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to screen width changes to change header mode (subheader or one line)
     */
    this.breakpointObserver
      .observe(`(max-width: ${this.subheaderMaxWidth}px`)
      .pipe(
        tap((state: BreakpointState) => {
          this.isSubheaderMode = state.matches ? true : false;
          this.setPosHeaderConfig();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to close button click. Works only for lazy-loaded micro. (Different router instances)
     */
    this.platformHeaderService.closeButtonClicked$
      .asObservable()
      .pipe(
        tap(() => {
          this.preventSavingPrevUrl = true;
          if (!this.prevUrl && !this.currentRoute.includes(TransactionRoutes.LIST)) {
            this.router.navigateByUrl(this.platformHeaderService.config.currentMicroBaseUrl);
            return;
          }

          if (this.currentRoute.includes(TransactionRoutes.LIST)) {
            this.router.navigate([this.platformHeaderService.config.mainDashboardUrl]);
          } else {
            this.router.navigateByUrl(this.prevUrl);
          }

          this.prevUrl = null;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.isInitialized = true;
    this.initializePosHeader();
  }

  /**
   * Destroy service to remove it logic when switching to another app with own header
   */
  destroy(): void {
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Retrieve data and set config
   */
  initializePosHeader() {
    this.setPosHeaderConfig();
  }

  get businessLogo() {
    if (!this.businessData) {
      return;
    }
    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  navigateToTransactionsList(path: string) {
    this.router.navigate([`business/201b0ea1-36ab-4f09-b15a-902e88c00056/transactions/list`]);
  }

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
  };

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  };

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  };

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  };

  setPosHeaderConfig(): void {
    const isShortHeader = this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem = this.platformHeaderService.config?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: this.isSubheaderMode,
      mainDashboardUrl: this.envService.businessUuid ? `/business/${this.envService.businessUuid}/info/overview` : '',
      currentMicroBaseUrl: `/business/${this.envService.businessUuid}/transactions/list`,
      isShowShortHeader: isShortHeader,
      mainItem: {
        title: 'Transactions',
        icon: '#icon-apps-orders',
        iconType: 'vector',
        iconSize: '18px',
        onClick: () => {},
      },
      isShowMainItem: true,
      closeItem: {
        title: 'Close',
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px',
      },
      isShowCloseItem: true,
      leftSectionItems: [
        {
          title: 'All',
          onClick: this.navigateToTransactionsList,
          isActive: true,
        },
      ],
      businessItem: {
        title: this.businessData ? this.businessData.name : '',
        icon: this.businessData && this.businessLogo ? this.businessLogo : '#icon-account-circle-24',
        iconSize: this.businessData && this.businessLogo ? '18px' : '14px',
        iconType: this.businessData && this.businessLogo ? 'raster' : 'vector',
      },
      isShowBusinessItem: true,
      shortHeaderTitleItem,
      isShowBusinessItemText: this.isShowBusinessItemText,
    };

    this.platformHeaderService.setConfig(config);
  }
}
