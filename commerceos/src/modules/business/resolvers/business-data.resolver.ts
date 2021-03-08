import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EnvService } from '../../../apps/standalone/app/services';
import { BusinessInterface } from '../../shared/interfaces';
import { ApiService } from '../../shared/services';
import * as moment from 'moment';
import { LocaleConstantsService } from '@pe/ng-kit/src/kit/i18n';

@Injectable()
export class BusinessDataResolver implements Resolve<any> {

  constructor(private apiService: ApiService,
              private localeConstantsService: LocaleConstantsService,
              private envService: EnvService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.apiService.getBusinessData(this.envService.businessUuid)
      .pipe(tap((business: BusinessInterface) => {
        this.envService.businessData = business;
        moment.locale(this.localeConstantsService.getLang() || 'en');
      }));
  }
}
