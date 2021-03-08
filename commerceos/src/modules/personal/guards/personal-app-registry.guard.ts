import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EnvService } from '../../../apps/standalone/app/services';

@Injectable()
export class PersonalAppRegistryGuard implements CanActivate {

  constructor(private envService: EnvService,
              private router: Router,
              private microRegistryService: MicroRegistryService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    // const registered: any = this.microRegistryService.getMicroConfig();
    // if (registered && registered.length) {
    //    
    //    
    //   return true;
    // } else {
      return this.microRegistryService.getPersonalRegisteredMicros()
        .pipe(
          map(() => true,
        ),
          catchError((error: any, caught: Observable<boolean>) => {
             
            this.router.navigate(['switcher/profile']);

            return of(false);
          }));
    // }
  }
}
