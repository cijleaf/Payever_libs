import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { MicroAppInterface, MicroRegistryService, AppSetUpStatusEnum } from '@pe/ng-kit/src/kit/micro';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher';

import { EnvService } from './env.service';
import { ShopInterface, TerminalInterface } from '@modules/dashboard/widgets';
import { WidgetsApiService } from '../../../../modules/dashboard/widgets/services/widgets-api.service';
import { AppLauncherService } from './app-launcher.service';
import { DashboardDataService } from './dashboard-data.service';


@Injectable()
export class AppSelectorService {
  apps: any[] = [];
  private _selectorShowed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _closeCalled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   *
   */
  constructor(
   // protected injector: Injector,
    private appLauncherService: AppLauncherService,
    private microRegistryService: MicroRegistryService,
    private translateService: TranslateService,
    private router: Router,
    private envService: EnvService,
    private themeSwitcherService: ThemeSwitcherService,
    private dashboardDataService: DashboardDataService,
    private widgetsApiService: WidgetsApiService,
  ) {
    const microList: MicroAppInterface[] = this.microRegistryService.getMicroConfig('') as MicroAppInterface[];

    this.apps = microList
      .filter((micro: any) => !!micro.dashboardInfo && Object.keys(micro.dashboardInfo).length > 0)
      .map((micro: MicroAppInterface) => {
        const result: any = {};
        result.icon = micro.dashboardInfo.icon;
        result.title = this.translateService.translate(micro.dashboardInfo.title);
        result.onSelect = (active: boolean) => {
          this.onAppSelected(micro);
        };
        result.installed = micro.installed;
        result.setupStatus = micro.setupStatus;
        result.order = micro.order;
        result.microUuid = micro._id;
        result.code = micro.code;
        return result;
      });
    // add dashboard link
    const dashboardApp: any = {
      title: this.translateService.translate('dashboard_docker.items.dashboard'),
      setupStatus: AppSetUpStatusEnum.Completed,
      installed: true,
      order: 0,
      code: 'dashboard',
      icon: 'icon-commerceos-applications-96.png',
    };

    // add search link
    const searchApp: any = {
      title: this.translateService.translate('dashboard_docker.items.search'),
      setupStatus: AppSetUpStatusEnum.Completed,
      installed: true,
      order: this.apps.length + 20,
      code: 'search',
      icon: 'icon-search.png',
    };

    const shopApp: any = {
      icon: 'icon-commerceos-store-32.png',
      title: 'Shop',
      installed: true,
      setupStatus: 'completed',
      order: 12,
      microUuid: '51cce2bb-5a89-4442-a1cc-c6eed25c614a',
      code: 'shop',
    };

    const posApp: any = {
      icon: 'icon-commerceos-pos-32.png',
      title: 'POS',
      installed: true,
      setupStatus: AppSetUpStatusEnum.Completed,
      order: 12,
      microUuid: '954fbf2f-5cb0-472c-8582-130ca23b7f7d',
      code: 'pos',
    };

    dashboardApp.onSelect = (active: boolean) => {
      this.onAppSelected(dashboardApp);
    };

    searchApp.onSelect = (active: boolean) => {
      this.onAppSelected(searchApp);
    };

    shopApp.onSelect = (active: boolean) => {
      this.onAppSelected(shopApp);
    };

    posApp.onSelect = (active: boolean) => {
      this.onAppSelected(posApp);
    };

    // studioApp.onSelect = (active: boolean) => {
    //   this.onAppSelected(studioApp);
    // };




    this.apps = this.apps.map(app => app.code === 'shop' ? shopApp : app);
    this.apps = this.apps.map(app => app.code === 'pos' ? posApp : app);
    // this.apps = this.apps.map(app => app.code === 'studio' ? studioApp   : app);

    this.apps.unshift(dashboardApp);
    this.apps.push(searchApp);

    // this.themeSwitcherService.theme$.pipe(
    //   tap((theme) => {
    //     const dashboardMicro = this.apps.find((micro: MicroAppInterface) => micro && micro.code === 'dashboard');
    //     const searchMicro = this.apps.find((micro: MicroAppInterface) => micro && micro.code === 'search');
    //     switch (theme) {
    //       case 'light': {
    //         dashboardMicro ? dashboardMicro.icon = 'light-commerceos-applications-96.png' : null;
    //         searchMicro ? searchMicro.icon = 'light-icon-commerceos-search.png' : null;
    //         break;
    //       }
    //       case 'default': {
    //         dashboardMicro ? dashboardMicro.icon = 'default-commerceos-applications-96.png' : null;
    //         searchMicro ? searchMicro.icon = 'default-icon-commerceos-search.png' : null;
    //         break;
    //       }
    //       default: {
    //         dashboardMicro ? dashboardMicro.icon = 'dark-icon-commerceos-applications-96.png' : null;
    //         searchMicro ? searchMicro.icon = 'dark-icon-commerceos-search.png' : null;
    //         break;
    //       }
    //     }
    //   })
    // ).subscribe();
  }

  get selectorShowed$(): Observable<boolean> {
    return this._selectorShowed$.asObservable();
  }

  get closeCalled$(): Observable<boolean> {
    return this._closeCalled$.asObservable();
  }

  hideAppSelector (): void {
    this._selectorShowed$.next(false);
  }

  // to support fade out transition
  hideWithDelay (): void {
    this._closeCalled$.next(true);
    setTimeout(() => {
      this._selectorShowed$.next(false);
      this._closeCalled$.next(false);
    }, 700);
  }

  showAppSelector (): void {
    this._selectorShowed$.next(true);
  }

  private onAppSelected(selectedMicro: any): void {
    const businessUuid: string = this.envService.businessUuid;
    if (selectedMicro.code === 'dashboard') {
      this.router.navigateByUrl(`business/${businessUuid}/info/overview`).then(() => this.hideWithDelay());
      return;
    }

    if (selectedMicro.code === 'search') {
      this.router.navigateByUrl(`business/${businessUuid}/info/search`).then(() => this.hideWithDelay());
      return;
    }

    if (selectedMicro.code === 'shop') {
      this.widgetsApiService.getShops(this.envService.businessUuid).pipe(
        tap((shops: any) => {
          this.router.navigateByUrl(`business/${businessUuid}/shop/${shops[0].id}/dashboard`).then(() => this.hideWithDelay());
        })
      ).subscribe();

      return;
    }

    if (selectedMicro.code === 'pos') {
      this.widgetsApiService.getTerminals(this.envService.businessUuid).pipe(
        map((terminals: any) => terminals.find((t: TerminalInterface) => t.active) || terminals[0]),
        switchMap((terminal: any) => {
          const path = terminal ? `/pos/${terminal.id || terminal._id}/dashboard` :`/pos/setup/create`
          return this.appLauncherService.launchApp('pos', path).pipe(
            tap(() => this.hideWithDelay()),
          );
        }),
      ).subscribe();

      return;
    }

    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(selectedMicro.code) as MicroAppInterface;
    if (micro && (micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      this.appLauncherService.launchApp(selectedMicro.code).subscribe(
        () => {
            this.hideWithDelay()
        },
        () => {
            this.hideWithDelay()
        }
      );
    } else {
      const url: string = `business/${this.envService.businessUuid}/welcome/${selectedMicro.code}`;
      this.router.navigate([url]); // go to welcome-screen
      this.hideWithDelay()
    }
  }
}
