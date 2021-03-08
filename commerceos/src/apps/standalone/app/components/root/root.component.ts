import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { FullStoryService } from '@pe/ng-kit/modules/full-story';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { AbstractComponent } from '@pe/ng-kit/modules/common';

import { BaseServicesGuard } from '@app/guards';
import { TrafficSourceService } from '@app/services';
import { PePlatformHeaderService } from '@pe/platform-header';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'os-commerce',
  templateUrl: './root.component.html',
  styleUrls: ['root.component.scss']
})
export class RootComponent extends AbstractComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private fullStoryService: FullStoryService,
    private trafficSourceService: TrafficSourceService,
    private pePlatformHeaderService: PePlatformHeaderService, // Initializing service
  ) {
    super();
  }

  ngOnInit() {
    this.authService.onChange$.pipe(takeUntil(this.destroyed$)).subscribe(
      () => BaseServicesGuard.fullStoryIdentify(this.authService, this.fullStoryService)
    );

    this.trafficSourceService.saveSource();
  }
}
