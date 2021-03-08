import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '@pe/ng-kit/modules/auth';

import { EnvService } from '../services';

@Injectable()
export class SetTokensGuard implements CanActivate {

  constructor(private envService: EnvService, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    if (route.queryParams['auth_token']) {
      return this.authService.setTokens({
        accessToken: route.queryParams['auth_token'],
        refreshToken: route.queryParams['refresh_token'] || this.authService.refreshToken
      }).pipe(map(() => true));
    }
    return true;
  }
}
