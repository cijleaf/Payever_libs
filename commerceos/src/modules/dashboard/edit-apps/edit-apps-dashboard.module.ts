import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditAppsComponent, AppsListWrapperComponent, WidgetsListComponent, AppsListComponent } from './components';
import { EditAppsDashboardRoutingModule } from './edit-apps-dashboard-routing.module';
import { SharedDashboardModule } from '../shared-dashboard';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { MediaModule } from '@pe/ng-kit/modules/media';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MatButtonModule,
    MatTooltipModule,
    MatButtonToggleModule,
    SharedDashboardModule,
    EditAppsDashboardRoutingModule,
    I18nModule.forChild(),
    MediaModule
  ],
  declarations: [
    EditAppsComponent,
    AppsListWrapperComponent,
    WidgetsListComponent,
    AppsListComponent
  ],
})
export class EditAppsDashboardModule {}
