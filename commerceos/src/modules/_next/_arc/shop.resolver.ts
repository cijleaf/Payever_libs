import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { PebEditorApi } from '@pe/builder-api';

@Injectable({ providedIn: 'root' })
export class PeShopResolver implements Resolve<any> {
  constructor(private api: PebEditorApi) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.api.gzetShopThemeById(route.params.shopId).pipe();
  }
}
