import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
// import { StoreModule } from '@ngrx/store';
// // import { EffectsModule } from '@ngrx/effects';

import { I18nModule } from '@pe/ng-kit/modules/i18n';

import { PEPersonalRoutingModule } from './personal-routing.module';
import { PersonalDashboardLayoutComponent, PersonalLayoutComponent } from './components';
import { SharedModule } from '../shared';
// import { NotificationsInfoBoxEffects } from './state-management';
import { SharedDashboardModule } from '../dashboard/shared-dashboard';
import { PersonalAppRegistryGuard } from './guards';
import { loadStyles } from 'lazy-styles-loader';

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
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    I18nModule.forChild(),
    PEPersonalRoutingModule,
    SharedModule,
    // StoreModule.forFeature('personalDashboard', reducer),
    // EffectsModule.forFeature([NotificationsInfoBoxEffects]),
    SharedDashboardModule
  ],
  declarations: [
    PersonalLayoutComponent,
    PersonalDashboardLayoutComponent
  ],
  providers: [
    PersonalAppRegistryGuard,
  ]
})
export class PEPersonalModule { }
