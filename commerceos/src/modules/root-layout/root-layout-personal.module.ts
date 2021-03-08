import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';

import { SidebarModule } from '@pe/ng-kit/modules/sidebar';
// import { PlatformHeaderService, PlatformHeaderLoaderService } from '@pe/ng-kit/modules/platform-header';
// import { PlatformHeaderModule } from '@pe/ng-kit/modules/platform-header';
import { PeStepperModule } from '@pe/stepper';
import { LoaderService } from '@modules/shared/services';
import { SharedDashboardModule, EditWidgetsService } from '@modules/dashboard/shared-dashboard';
import {
  LazyAppsLoaderService, AppLauncherService, DashboardDataService //, HeaderService
} from '@app/services';
import { BusinessGuard, PersonalGuard } from '@app/guards';
import { RootLayoutComponent } from './components/root-layout/root.component';
import { RootLayoutPersonalRoutingModule } from './root-layout-personal-routing.module';
import { SharedRootModule } from './shared-root.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RootLayoutPersonalRoutingModule,
    //SidebarModule,
    SharedRootModule,
  ],
  bootstrap: [
  ]
})
export class RootLayoutPersonalModule {}
