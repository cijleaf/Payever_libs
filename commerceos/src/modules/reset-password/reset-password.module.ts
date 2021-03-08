import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { FormModule } from '@pe/ng-kit/modules/form';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { ButtonModule } from '@pe/ng-kit/modules/button';

import {
  ForgotPasswordComponent,
  LayoutComponent,
  ResetPasswordComponent
} from './components';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { SharedModule } from '../shared';
import { loadStyles } from 'lazy-styles-loader';

loadStyles(['lazy-styles']);

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    BrowserModule,
    FormModule,
    ResetPasswordRoutingModule,
    MatButtonModule,
    ButtonModule
  ],
  declarations: [
    ForgotPasswordComponent,
    LayoutComponent,
    ResetPasswordComponent
  ]
})
export class ResetPasswordModule {}
