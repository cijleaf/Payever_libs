
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { AppSetUpService, AppSetUpStatusEnum } from '@pe/ng-kit/modules/micro';
import { PebEnvService } from '@pe/builder-core';

import { SetupStepEnum } from '../enums/setup-step.enum';

@Injectable()
export class SetupGuard implements CanActivate {
  constructor(
    private router: Router,
    private envService: PebEnvService,
    private appSetUpService: AppSetUpService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.appSetUpService.getStatusAndStepFromBackend(this.envService.businessId, 'pos').pipe(
      map(statusData => {

        if (statusData.status !== AppSetUpStatusEnum.Completed) {
          this.navigateToStepperStep(state, this.envService.businessId, statusData.step as SetupStepEnum);
        }
        return true;
      }),
    );
  }

  private navigateToStepperStep(state: RouterStateSnapshot, businessUuid: string, step: SetupStepEnum) {
    let page: string;
    switch (step) {
      case SetupStepEnum.Theme:
        page = 'setup/theme';
        break;
      case SetupStepEnum.Create:
      default:
        page = 'setup/create';
        break;
    }
    this.router.navigate([`business/${businessUuid}/pos/${page}`]);
  }
}
