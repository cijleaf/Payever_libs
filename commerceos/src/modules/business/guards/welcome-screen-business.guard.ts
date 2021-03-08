import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { AppSetUpService, AppSetUpStatusEnum, MicroRegistryService } from '@pe/ng-kit/modules/micro';

@Injectable()
export class WelcomeScreenBusinessGuard implements CanActivate {

  constructor(
    private router: Router,
    private welcomeScreenService: AppSetUpService,
    private microRegistryService: MicroRegistryService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    const businessId = route.params['slug'];
    return this.welcomeScreenService.getStatus(businessId, 'commerceos', this.microRegistryService)
      .pipe(take(1), map((status: AppSetUpStatusEnum) => {

      if (status === AppSetUpStatusEnum.Completed) {
        this.router.navigate([`business/${businessId}`]);
        return false;
      } else {
        return true;
      }
    }));
  }

}
