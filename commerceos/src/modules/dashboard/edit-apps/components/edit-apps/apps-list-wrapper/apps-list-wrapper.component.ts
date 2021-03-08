import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

import { of, Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { catchError, takeUntil, switchMap, map, shareReplay, take } from 'rxjs/operators';

import { MicroRegistryService, MicroAppDashboardInfoInterface, MicroAppInterface } from '@pe/ng-kit/modules/micro';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { ApiService } from '../../../../../shared/services';
import { WallpaperService, EnvService } from '../../../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'apps-list-wrapper',
  templateUrl: './apps-list-wrapper.component.html',
  styleUrls: ['./apps-list-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppsListWrapperComponent implements OnDestroy {

  updateLists$: BehaviorSubject<Object> = new BehaviorSubject({});

  destropyed$: Subject<void> = new Subject();

  dockerItems$: Observable<DockerItemInterface[]> = this.envService.businessUuid$.pipe(
    takeUntil(this.destropyed$),
    switchMap((businessId) => {
      if (this.envService.isPersonalMode) {
        return this.microRegistryService.getPersonalRegisteredMicros().pipe(
          catchError(() => of([])),
        );
      } else {
        return this.microRegistryService.getRegisteredMicros(businessId).pipe(
          catchError(() => of([])),
        );
      }
    }),
    map((microList: MicroAppInterface[]) => {
      return microList.filter((micro: MicroAppInterface) => !!micro.dashboardInfo && micro.dashboardInfo.title)
        .map((micro: MicroAppInterface) => ({
          ...micro,
          _origin: micro,
          icon: micro.dashboardInfo.icon,
          title: this.translateService.translate(micro.dashboardInfo.title),
          order: micro.code === 'settings' ? 999999 : micro.order
        }))
        .sort((current: any, next: any) => current.order - next.order);
    }),
    shareReplay(1)
  );

  installedApps$: Observable<DockerItemInterface[]> = combineLatest(
    this.dockerItems$,
    this.updateLists$,
  ).pipe(
    map(([ dockerItems ]) => {
      return dockerItems.filter((item: any) => item.installed && !(item.code === 'settings'));
    }),
    shareReplay(1),
  );

  uninstalledApps$: Observable<DockerItemInterface[]> = combineLatest(
    this.dockerItems$,
    this.updateLists$,
  ).pipe(
    map(([ dockerItems ]) => {
      return dockerItems.filter((item: any) => !item.installed || item.code === 'settings');
    }),
    shareReplay(1),
  );

  constructor(
    private translateService: TranslateService,
    private microRegistryService: MicroRegistryService,
    private apiService: ApiService,
    private envService: EnvService,
    protected wallpaperService: WallpaperService
  ) { }

  ngOnDestroy(): void {
    this.destropyed$.next();
  }

  install(micro: (MicroAppInterface & MicroAppDashboardInfoInterface)): void {

    micro.installed = true;
    const data = {
      microUuid: micro._id,
      installed: micro.installed
    };

    micro.disabledClick = true;
    this.envService.businessUuid$.pipe(
      switchMap((businessId: string) => {
        return this.apiService.toggleInstalledApp(businessId, data);
      }),
      take(1),
    ).subscribe(() => {
      micro.disabledClick = false;
      (<any>micro)._origin.installed = true;
      this.updateLists$.next({});
    });
  }

  uninstall(micro: (MicroAppInterface & MicroAppDashboardInfoInterface)): void {
    // We cannot uninstall default apps
    if (micro.default) {
      return;
    }

    micro.installed = false;
    const data = {
      microUuid: micro._id,
      installed: micro.installed
    };

    micro.disabledClick = true;

    this.envService.businessUuid$.pipe(
      switchMap((businessId: string) => {
        return this.apiService.toggleInstalledApp(businessId, data).pipe(
          take(1),
        );
      }),
      take(1),
    ).subscribe(() => {
      micro.disabledClick = false;
      (<any>micro)._origin.installed = false;
      this.updateLists$.next({});
    });
  }

}
