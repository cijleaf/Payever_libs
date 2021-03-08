import { Injectable } from '@angular/core';
import { DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DashboardDataService {

  showEditAppsButton: boolean;
  showCloseAppsButton: boolean;
  label: string;
  logo: string;
  userName: string;
  private _apps$: BehaviorSubject<DockerItemInterface[]> = new BehaviorSubject<DockerItemInterface[]>(null);

  get apps$(): Observable<DockerItemInterface[]> {
    return this._apps$.asObservable();
  }

  apps(apps: DockerItemInterface[]): void {
    apps = apps.slice().sort((a: DockerItemInterface, b: DockerItemInterface) => {
      if (typeof a['order'] === 'undefined') {
        return 1;
      }
      if (typeof b['order'] === 'undefined') {
        return -1;
      }
      return a['order'] - b['order'];
    });
    const settingsIndex = apps.findIndex((elem: any) => elem.code === 'settings');
    const settings  = apps.splice(settingsIndex, 1);
    apps.push(...settings);
    this._apps$.next(apps);
  }
}
