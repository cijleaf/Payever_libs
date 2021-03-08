import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import { CommonModule as PeCommonModule } from '@pe/ng-kit/modules/common';
import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { SnackBarModule } from '@pe/ng-kit/modules/snack-bar';
import { SharedDashboardModule } from '../shared-dashboard';
import {
  AdsWidgetComponent,
  AppsWidgetComponent,
  ChartLegendComponent,
  CheckoutWidgetComponent,
  ConnectWidgetComponent,
  ContactsWidgetComponent,
  MarketingCampaignComponent,
  MarketingWidgetComponent,
  SearchWidgetComponent,
  SettingsWidgetComponent,
  StoreInfoComponent,
  StoreStatsComponent,
  StoreWidgetComponent,
  StudioWidgetComponent,
  TutorialWidgetComponent,
  TransactionsWidgetComponent,
  PosWidgetComponent,
  ProductItemComponent,
  ProductsWidgetComponent,
  TruncatePipe,
  WidgetsLayoutComponent
} from './components';
import { WidgetActionButtonComponent, WidgetCardComponent, WidgetStatisticsComponent } from '../shared-dashboard/components';
import { WidgetsDashboardRoutingModule } from './widgets-dashboard-routing.module';
import { WidgetsApiService } from './services';
import { WidgetsResolver } from './resolvers';

// TODO: maybe should be added globaly
import localeDE from '@angular/common/locales/en-DE';
import { FormsModule } from '@angular/forms';

import { PeWidgetsModule } from '@pe/widgets';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config/index';

const peWidgetsModule: ModuleWithProviders<PeWidgetsModule> = PeWidgetsModule.forRoot({
  environmentConfigService: EnvironmentConfigService,
  translateService: TranslateService,
});

registerLocaleData(localeDE, 'en-DE');

@NgModule({
  imports: [
    CommonModule,
    PeCommonModule,
    I18nModule.forChild(),
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MediaModule,
    SnackBarModule,
    WidgetsDashboardRoutingModule,
    SharedDashboardModule,
    FormsModule,

    peWidgetsModule,
  ],
  exports: [
    AdsWidgetComponent,
    AppsWidgetComponent,
    ChartLegendComponent,
    CheckoutWidgetComponent,
    ConnectWidgetComponent,
    ContactsWidgetComponent,
    MarketingWidgetComponent,
    SearchWidgetComponent,
    SettingsWidgetComponent,
    StoreInfoComponent,
    StoreStatsComponent,
    StoreWidgetComponent,
    StudioWidgetComponent,
    TutorialWidgetComponent,
    TransactionsWidgetComponent,
    PosWidgetComponent,
    ProductItemComponent,
    ProductsWidgetComponent
  ],
  declarations: [
    AdsWidgetComponent,
    AppsWidgetComponent,
    ChartLegendComponent,
    CheckoutWidgetComponent,
    ConnectWidgetComponent,
    ContactsWidgetComponent,
    MarketingCampaignComponent,
    MarketingWidgetComponent,
    SearchWidgetComponent,
    SettingsWidgetComponent,
    StoreInfoComponent,
    StoreStatsComponent,
    StoreWidgetComponent,
    StudioWidgetComponent,
    TutorialWidgetComponent,
    TransactionsWidgetComponent,
    PosWidgetComponent,
    ProductsWidgetComponent,
    ProductItemComponent,
    WidgetCardComponent,
    WidgetStatisticsComponent,
    WidgetActionButtonComponent,
    TruncatePipe,
    WidgetsLayoutComponent
  ],
  providers: [
    CurrencyPipe,
    WidgetsApiService,
    WidgetsResolver,
  ]
})
export class WidgetsDashboardModule {}
