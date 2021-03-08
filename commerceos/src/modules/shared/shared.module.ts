import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';

import { AuthModule } from '@pe/ng-kit/modules/auth';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { AbbreviationPipe } from '@pe/ng-kit/modules/common';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/ng-kit/modules/media';

import { MicroModule } from '@pe/ng-kit/modules/micro';
import { OverlayBoxModule } from '@pe/ng-kit/modules/overlay-box';

import {
  ApiService, HttpContentTypeInterceptor, LoaderService, SidebarService, NotificationsService, ResetThemeGuard
} from './services';
import {
  EntryErrorComponent
} from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ReactiveFormsModule,
    AuthModule.forRoot(),
    MicroModule.forRoot(),
    I18nModule.forChild(),
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    OverlayBoxModule,
    HttpClientModule,
    MediaModule.forRoot()
  ],
  declarations: [
    EntryErrorComponent
  ],
  exports: [
    OverlayBoxModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    HttpClientModule,
    EntryErrorComponent
  ],
  providers: [
    MediaUrlPipe,
    AbbreviationPipe,
    NotificationsService,
    ResetThemeGuard,
    SidebarService
  ]
})
export class SharedModule {

  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        ApiService,
        LoaderService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpContentTypeInterceptor,
          multi: true
        }
      ]
    };
  }
}
