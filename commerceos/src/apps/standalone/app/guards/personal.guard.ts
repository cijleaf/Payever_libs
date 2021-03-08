import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { EnvService } from '../services';

@Injectable()
export class PersonalGuard implements CanActivate {

  constructor(private envService: EnvService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const parts = window.location.pathname.split('/').filter(d => !!d);
    if (parts[0] !== 'personal') {
      console.error('This guard should be implemented only to the personal routes!');
    }
    this.envService.isPersonalMode = true;
    return true;
  }
}
