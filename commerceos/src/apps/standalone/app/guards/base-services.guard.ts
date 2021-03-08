import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { TrafficSourceService } from '@app/services';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { FullStoryService } from '@pe/ng-kit/modules/full-story';
import { environment } from 'environments/environment';

@Injectable()
export class BaseServicesGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private fullStoryService: FullStoryService,
    private trafficSourceService: TrafficSourceService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (environment.poduction) {
      this.trafficSourceService.saveSource();
      this.fullStoryService.init();
      BaseServicesGuard.fullStoryIdentify(this.authService, this.fullStoryService);
    }
    return true;
  }

  static fullStoryIdentify(authService: AuthService, fullStoryService: FullStoryService): void {
    const data = authService.getUserData();
    if (data && data.email) {
      fullStoryService.identify(data.email, {
        displayName: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email,
        userId: data.uuid
      });
    }
  }
}
