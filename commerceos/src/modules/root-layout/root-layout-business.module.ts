import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { SharedDashboardModule } from '@modules/dashboard/shared-dashboard';
import { RootLayoutBusinessRoutingModule } from './root-layout-business-routing.module';
import { SharedRootModule } from './shared-root.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RootLayoutBusinessRoutingModule,
    SharedDashboardModule,
    SharedRootModule,
  ],
  bootstrap: [
  ]
})
export class RootLayoutBusinessModule {}
