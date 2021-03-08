import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';

import { SidebarModule } from '@pe/ng-kit/modules/sidebar';
// import { PlatformHeaderService, PlatformHeaderLoaderService } from '@pe/ng-kit/modules/platform-header';
// import { PlatformHeaderModule } from '@pe/ng-kit/modules/platform-header';
import { PeStepperModule } from '@pe/stepper'; // @deprecated
import { PeSimpleStepperModule } from '@pe/stepper';
import { LoaderService } from '@modules/shared/services';
import { SharedDashboardModule, EditWidgetsService } from '@modules/dashboard/shared-dashboard';
import {
  LazyAppsLoaderService, AppLauncherService, DashboardDataService, //, HeaderService
  AppSelectorService,
  PeCommonHeaderService,
  PeShopHeaderService,
  PePosHeaderService,
  PeStudioHeaderService,
  PeContactsHeaderService,
  PeProductsHeaderService
} from '@app/services';
import { BusinessGuard, PersonalGuard } from '@app/guards';
import { RootLayoutComponent } from './components/root-layout/root.component';
import { ThemeSwitcherModule } from '@pe/ng-kit/src/kit/theme-switcher';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeCouponsHeaderService } from '@app/services/platform-header-apps-services/coupons-header.service';
import { NavigationService } from "@pe/connect-app";

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    // StoreModule.forRoot({}),
    // EffectsModule.forRoot([]),
    SharedDashboardModule.forRoot(),
    SidebarModule,
    PeStepperModule.forRoot(),
    PeSimpleStepperModule,
    ThemeSwitcherModule.forRoot(),
    PePlatformHeaderModule
  ],
  declarations: [
    RootLayoutComponent
  ],
  exports: [
    RootLayoutComponent
  ],
  providers: [
    BusinessGuard,
    PersonalGuard,
    // PlatformHeaderService,
    LazyAppsLoaderService,
    AppLauncherService,
    AppSelectorService,
    LoaderService,
    DashboardDataService,
    // HeaderService,
    // PlatformHeaderLoaderService,
    EditWidgetsService,
    NavigationService,
    PeCommonHeaderService,
    PeShopHeaderService,
    PeCouponsHeaderService,
    PeContactsHeaderService,
    PeProductsHeaderService,
    PePosHeaderService,
    PeStudioHeaderService,
  ]
})
export class SharedRootModule {}
