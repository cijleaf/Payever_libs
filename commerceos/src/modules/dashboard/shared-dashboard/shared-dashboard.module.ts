import { CommonModule } from '@angular/common';
import { AbbreviationPipe } from '@pe/ng-kit/modules/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BlurryModule } from '@pe/ng-kit/modules/blurry';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { DockerModule } from '@pe/ng-kit/modules/docker';
import { I18nModule, TranslatePipe } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderModule } from '@pe/ng-kit/modules/platform-header';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { NavbarModule } from '@pe/ng-kit/modules/navbar';
import { SidebarModule } from '@pe/ng-kit/modules/sidebar';

import {
  AppCardComponent,
  AppsLayoutComponent,
  ProfileMenuComponent,
  ProfileButtonComponent,
  NotificationsComponent,
  BaseDashboardComponent,
  PlatformHeaderComponent,
  FixIEMouseWheelDirective,
  NotificationCardComponent,
  FixIOSScrollFreezingDirective,
  BusinessApplicationsComponent,
  DashboardNotificationsComponent,
  ApplicationNotificationsComponent,
  DashboardNotificationsSwitcherComponent,
  WidgetNotificationsComponent,
} from './components';

import { SharedModule } from '../../shared';
import { EditAppsService, EditWidgetsService, SearchBoxService } from './services';
import { WidgetsApiService } from '../widgets/services';
import { StepperHelperService } from './services/stepper-helper.service';

@NgModule({
  imports: [
    ButtonModule,
    BrowserModule,
    BlurryModule,
    CommonModule,
    DockerModule,
    SharedModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MediaModule,
    MediaModule.forRoot(),
    NavbarModule,
    I18nModule.forChild(),
    SidebarModule,
    PlatformHeaderModule
  ],
  exports: [
    AppCardComponent,
    FixIEMouseWheelDirective,
    AppsLayoutComponent,
    FixIOSScrollFreezingDirective,
    ButtonModule,
    SharedModule,
    BaseDashboardComponent,
    BusinessApplicationsComponent,
    DashboardNotificationsSwitcherComponent,
    ProfileMenuComponent,
    PlatformHeaderComponent,
    NotificationCardComponent,
    NotificationsComponent,
    DashboardNotificationsComponent,
    ApplicationNotificationsComponent,
    WidgetNotificationsComponent,
  ],
  declarations: [
    AppCardComponent,
    FixIEMouseWheelDirective,
    AppsLayoutComponent,
    FixIOSScrollFreezingDirective,
    BaseDashboardComponent,
    PlatformHeaderComponent,
    ProfileButtonComponent,
    ProfileMenuComponent,
    DashboardNotificationsSwitcherComponent,
    BusinessApplicationsComponent,
    NotificationCardComponent,
    NotificationsComponent,
    DashboardNotificationsComponent,
    ApplicationNotificationsComponent,
    WidgetNotificationsComponent,
  ],
})
export class SharedDashboardModule {
  static forRoot(): ModuleWithProviders<SharedDashboardModule> {
    return {
      ngModule: SharedDashboardModule,
      providers: [
        AbbreviationPipe,
        EditAppsService,
        EditWidgetsService,
        WidgetsApiService,
        SearchBoxService,
        StepperHelperService,
        TranslatePipe,
      ]
    };
  }
}
