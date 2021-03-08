import { Injectable } from '@angular/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';
import { EnvService } from '../../../../apps/standalone/app/services';
import { WidgetsApiService } from '../../widgets/services';
import { WidgetInfoInterface, WidgetTutorialInterface } from '../interfaces';

@Injectable()
export class EditWidgetsService {

  public updateList$: Subject<any> = new Subject();
  protected updateTutorials$: Subject<any> = new Subject();
  protected busy$: Subject<any> = new Subject();

  widgets$: Observable<WidgetInfoInterface[]> = combineLatest(
    this.envService.businessUuid$,
    this.updateList$.pipe(startWith(0))
  ).pipe(
    switchMap(([businessUuid]) => {
      if (this.envService.isPersonalMode) {
        return this.widgetsApiService.getPersonalWidgets().pipe(
          catchError(() => of([])),
          tap(() => {
            this.busy$.next(true);
            this.busy$.complete();
          })
        );
      } else {
        if (!businessUuid) {
          this.busy$.next(true);
          this.busy$.complete();
          return of([]);
        }
        return this.widgetsApiService.getBusinessWidgets(businessUuid).pipe(
          catchError(() => of([])),
          tap(() => {
            this.busy$.next(true);
            this.busy$.complete();
          }),
        );
      }
    }),
    shareReplay(1)
  );

  widgetTutorials$: Observable<WidgetTutorialInterface[]> = combineLatest(
    this.envService.businessUuid$,
    this.updateList$.pipe(startWith(0)),
    this.updateTutorials$.pipe(startWith(0))
  ).pipe(
    switchMap(([businessUuid]) => {
      if (!businessUuid) {
        return of([]);
      }
      return this.widgetsApiService.getWidgetTutorials(businessUuid).pipe(
        map(a => a.filter(b => b.showOnTutorial === undefined || b.showOnTutorial === true)),
        catchError(() => of([]))
      );
    }),
    shareReplay(1)
  );

  installedWidgets$: Observable<WidgetInfoInterface[]> = this.widgets$.pipe(
    map(list => list.filter(w => w.installed))
  );

  uninstalledWidgets$: Observable<WidgetInfoInterface[]> = this.widgets$.pipe(
    map(list => list.filter(w => !w.installed))
  );

  constructor(
    private widgetsApiService: WidgetsApiService,
    private envService: EnvService,
  ) { }

  reloadWidgets(): Observable<any> {
    this.busy$ = new Subject();
    this.updateList$.next({});
    this.installedWidgets$.pipe(take(1)).subscribe();
    return this.busy$.pipe(
      startWith(true)
    );
  }

  install(id: string): Observable<WidgetInfoInterface[]> {
    return this.envService.businessUuid$.pipe(
      take(1),
      switchMap(businessUuid => {
        if (!businessUuid || !id) {
          return of([]);
        }
        return this.widgetsApiService.installWidget(businessUuid, id);
      }),
      tap(() => {
        this.updateList$.next({});
      })
    );
  }

  uninstall(id: string): Observable<WidgetInfoInterface[]> {
    return this.envService.businessUuid$.pipe(
      take(1),
      switchMap(businessUuid => {
        if (!businessUuid || !id) {
          return of([]);
        }
        return this.widgetsApiService.uninstallWidget(businessUuid, id);
      }),
      tap(() => {
        this.updateList$.next({});
      })
    );
  }

  tutorialWatched(id: string): Observable<WidgetInfoInterface[]> {
    return this.envService.businessUuid$.pipe(
      take(1),
      switchMap(businessUuid => {
        if (!businessUuid || !id) {
          return of([]);
        }
        return this.widgetsApiService.watchedTutorialWidget(businessUuid, id);
      }),
      tap(() => {
        this.updateTutorials$.next({});
      })
    );
  }

}
