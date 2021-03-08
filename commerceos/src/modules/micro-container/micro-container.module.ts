import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NavbarModule } from '@pe/ng-kit/modules/navbar';
import { I18nModule } from '@pe/ng-kit/modules/i18n';

import { SharedModule } from '../shared';

import { MicroContainerComponent } from './components/micro-container/micro-container.component';
import { SelectPlanBarComponent } from './components/select-plan-bar/select-plan-bar.component';
import { PricingOverlayComponent } from './components/pricing-overlay/pricing-overlay.component';
import { SharedDashboardModule } from '../dashboard/shared-dashboard';
import { MicroContainerRoutingModule } from './micro-container-routing.module';


@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    MicroContainerRoutingModule,
    NavbarModule,
    SharedDashboardModule,
    SharedModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    MicroContainerComponent,
    SelectPlanBarComponent,
    PricingOverlayComponent
  ]
})
export class MicroContainerModule { }
