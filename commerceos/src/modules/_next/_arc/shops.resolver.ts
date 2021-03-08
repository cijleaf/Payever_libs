import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { PebEnvService } from '@pe/builder-core';
import { tap, catchError } from 'rxjs/operators';
import { PebShopsApi } from '@pe/builder-api';

@Injectable({ providedIn: 'root' })
export class PeShopsResolver implements Resolve<any> {
  constructor(
    private api: PebShopsApi,
    private router: Router,
    private envService: PebEnvService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const shopCreateRoute = `business/${this.envService.businessId}/builder-next/create`;

    return this.api.getShopsList().pipe(
      tap(shops => {
        if (!shops?.length) {
          this.router.navigate([shopCreateRoute]).then(/* do nothing */);
        }
      }),
      catchError(() =>
        this.router.navigate([shopCreateRoute])
      ),
    );
  }
}
