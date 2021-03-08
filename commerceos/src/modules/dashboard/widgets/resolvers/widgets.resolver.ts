import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { EditWidgetsService } from '../../shared-dashboard/services';

@Injectable()
export class WidgetsResolver implements Resolve<any> {

  constructor(private editWidgetsService: EditWidgetsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.editWidgetsService.reloadWidgets();
  }
}
