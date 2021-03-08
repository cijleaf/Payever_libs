import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MediaModule } from '@pe/ng-kit/modules/media';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { SearchModule } from '@pe/ng-kit/modules/search';
import { SearchResultsModule } from '@pe/ng-kit/modules/search-results';

import {
  SearchBoxContainerComponent, SearchBoxAdminComponent, SearchBoxUserComponent,
  EmptySearchBoxComponent
} from './components';
import { SearchDashboardRoutingModule } from './search-dashboard-routing.module';
import { SharedDashboardModule } from '../shared-dashboard';

@NgModule({
  imports: [
    CommonModule,
    SearchModule,
    BrowserModule,
    MatButtonModule,
    MatTooltipModule,
    MatButtonToggleModule,
    SharedDashboardModule,
    MatProgressSpinnerModule,
    SearchDashboardRoutingModule,
    SearchResultsModule,
    MediaModule,
    I18nModule.forChild()
  ],
  declarations: [
    SearchBoxContainerComponent,
    SearchBoxAdminComponent,
    SearchBoxUserComponent,
    EmptySearchBoxComponent,
  ],
})
export class SearchDashboardModule {}
