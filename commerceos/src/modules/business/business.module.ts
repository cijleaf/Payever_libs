import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { DialogModule } from '@pe/ng-kit/modules/dialog';

import { PEBusinessRoutingModule } from './business-routing.module';
import {
  BusinessLayoutComponent,
  BusinessDashboardLayoutComponent, WelcomeScreenComponent
} from './components';
import { SharedModule } from '../shared';
import { BusinessAppRegistryGuard, WelcomeScreenBusinessGuard } from './guards';
import { BusinessDataResolver } from './resolvers';

import { SharedDashboardModule } from '../dashboard/shared-dashboard';
import { WidgetsDashboardModule } from '../dashboard/widgets';
import { loadStyles } from 'lazy-styles-loader';
import { CosEnvInitializer, CosEnvProvider } from '@modules/_next/env.provider';

PayeverStatic.IconLoader.loadIcons([
  'set',
  'apps',
  'industries',
  'settings',
  'builder',
  'dock',
  'edit-panel',
  'social',
  'dashboard',
  'notification',
  'commerceos',
  'widgets',
  'payment-methods',
  'payment-plugins',
  'shipping',
  'finance-express'
]);

loadStyles(['lazy-styles']);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatToolbarModule,
    I18nModule.forChild(),
    DialogModule,
    PEBusinessRoutingModule,
    SharedModule,
    SharedDashboardModule,
    WidgetsDashboardModule
  ],
  declarations: [
    BusinessLayoutComponent,
    BusinessDashboardLayoutComponent,
    WelcomeScreenComponent
  ],
  providers: [
    BusinessAppRegistryGuard,
    BusinessDataResolver,
    WelcomeScreenBusinessGuard,
  ]
})
export class PEBusinessModule { }
