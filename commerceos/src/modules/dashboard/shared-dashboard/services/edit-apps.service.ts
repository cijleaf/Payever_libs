import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { DockerItemInterface } from '@pe/ng-kit/modules/docker';

@Injectable()
export class EditAppsService {

  private _editApps$: Subject<DockerItemInterface[]> = new Subject<DockerItemInterface[]>();

  get editApps$(): Observable<DockerItemInterface[]> {
    return this._editApps$.asObservable();
  }

  refreshApps(apps$: DockerItemInterface[]): void {
    this._editApps$.next(apps$);
  }
}
