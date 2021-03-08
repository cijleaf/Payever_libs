import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree, ActivatedRoute, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PebEnvService } from '@pe/builder-core';
import { Injectable } from '@angular/core';
import { map, filter, switchMap } from 'rxjs/operators';
import { PebEditorApi, PebPosApi, Terminal } from '@pe/builder-api';

@Injectable({ providedIn: 'any' })
export class CosTerminalGuard implements CanActivate {
  constructor(
    private editorApi: PebEditorApi,
    private posApi: PebPosApi,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private envService: PebEnvService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!route.params.terminalId) {
      return this.posApi.getTerminalsList().pipe(
        switchMap((terminals: Terminal[]) => {
          if (!terminals.length) {
            return of(this.router.createUrlTree([`/business/${this.envService.businessId}/pos/setup/create`]))
          }

          const activeTerminal = terminals.find(terminal => terminal.active)

          if (activeTerminal) {
            this.envService.terminalId = activeTerminal._id;
            return of(this.router.createUrlTree([`/business/${this.envService.businessId}/pos/${activeTerminal._id}/dashboard`]))
          }

          return of(this.router.createUrlTree([`/business/${this.envService.businessId}/pos/list`]))
        })
      );
    } else {
      this.envService.terminalId = this.envService.terminalId || route.params.terminalId;
    }

    return true;
  }
}
