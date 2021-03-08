import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { ActiveBusinessModule } from '@modules/active-business/active-business.module';
import { LayoutModule } from '@modules/layout';

import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { FormComponentsInputModule, FormModule } from '@pe/ng-kit/modules/form';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { OverlayBoxModule } from '@pe/ng-kit/modules/overlay-box';
import { ReCaptchaModule } from '@pe/ng-kit/modules/recaptcha';

import { SharedModule } from '@modules/shared';
import { LoaderService } from '../../../../apps/standalone/app/services/loader.service'; // TODO Import correctly

import { EntryLoginComponent } from './entry-login/entry-login.component';
import { LoginAsUserLayoutComponent } from './login-as-user-layout/login-as-user-layout.component';
import { LoginFormService } from './login-form.service';
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { LoginRefreshLayoutComponent } from './login-refresh-layout/login-refresh-layout.component';
import {
  AutofocusDirective,
  LoginSecondFactorCodeComponent
} from './login-second-factor-code/login-second-factor-code.component';

@NgModule({
  exports: [
    LoginLayoutComponent,
    LoginAsUserLayoutComponent,
    LoginRefreshLayoutComponent,
    LoginSecondFactorCodeComponent
  ],
  declarations: [
    EntryLoginComponent,
    LoginLayoutComponent,
    LoginAsUserLayoutComponent,
    LoginRefreshLayoutComponent,
    AutofocusDirective,
    LoginSecondFactorCodeComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    ActiveBusinessModule,
    MediaModule,
    MatButtonModule,
    MatCardModule,
    BrowserModule,
    ButtonModule,
    FormModule,
    FormComponentsInputModule,
    I18nModule.forChild(),
    OverlayBoxModule,
    ReCaptchaModule,
    RouterModule,
    SharedModule
  ],
  providers: [
    LoaderService // TODO Import correctly
  ]
})
export class LoginFormModule {
  public static forRoot(): ModuleWithProviders<LoginFormModule> {
    return {
      ngModule: LoginFormModule,
      providers: [LoginFormService]
    };
  }
}
