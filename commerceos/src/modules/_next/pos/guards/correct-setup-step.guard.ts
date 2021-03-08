import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { map, flatMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { AppSetUpService, AppSetUpStatusEnum } from '@pe/ng-kit/modules/micro';
import { PebEnvService } from '@pe/builder-core';
import { PebEditorApi, PebShopsApi, PebPosApi } from '@pe/builder-api';

import { SetupStepEnum } from '../enums/setup-step.enum';

@Injectable()
export class CorrectSetupStepGuard implements CanActivate {
  constructor(
    private api: PebPosApi,
    private router: Router,
    private envService: PebEnvService,
    private appSetUpService: AppSetUpService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.appSetUpService.getStatusAndStepFromBackend(this.envService.businessId, 'pos').pipe(
      flatMap(statusData => {

        if (statusData.status === AppSetUpStatusEnum.Completed) {
          this.navigateToBuilder(this.envService.businessId);
        } else {
          this.navigateToCorrectStep(state, this.envService.businessId, statusData.step as SetupStepEnum);

          if (statusData.step === SetupStepEnum.Theme) {
            return this.api.getTerminalsList().pipe(
              map((terminals: any) => {
                if (terminals?.length) {
                  this.envService.terminalId = terminals[0]._id;
                  return true;
                } else {
                  this.navigateToBuilder(this.envService.businessId);
                }
              }),
            );
          } else {
            return of(true);
          }
        }
      }),
    );
  }

  private navigateToBuilder(businessUuid: string) {
    this.router.navigate([`business/${businessUuid}/pos/builder`]);
  }

  private navigateToCorrectStep(state: RouterStateSnapshot, businessUuid: string, step: SetupStepEnum) {
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
    if (!state.url.includes(page)) {
      this.router.navigate([`business/${businessUuid}/pos/${page}`]);
    }
  }
}
