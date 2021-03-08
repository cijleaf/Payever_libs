import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { registrationDisabled } from '../../../settings';

@Injectable()
export class RegistrationGuard implements CanActivate {
  constructor(
    private router: Router
  ) {}
  canActivate(): boolean {
    // if (registrationDisabled) {
    //   this.router.navigate(['/entry/login']);
    //   return false;
    // }
    return true;
  }
}
