import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { EnvService } from '../services';

@Injectable()
export class BusinessGuard implements CanActivate {

  constructor(private envService: EnvService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    this.envService.isPersonalMode = false;
    this.envService.businessUuid = route.params['slug'];
    return true;
  }
}
