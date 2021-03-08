import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { AbbreviationPipe, CommonModule as PECommonModule } from '@pe/ng-kit/modules/common';
import { FormModule } from '@pe/ng-kit/modules/form';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { LayoutModule } from '@pe/ng-kit/modules/layout';
import { MediaModule, MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { SnackBarModule } from '@pe/ng-kit/modules/snack-bar';

import { EntryModule } from '@modules/entry/entry.module';
import { RegistrationGuard } from '@modules/entry/guards/registration.guard';
import { LoginFormModule } from '@modules/entry/modules/login-form';
import { CoreConfigService, SharedModule } from '@modules/shared';

import { loadStyles } from 'lazy-styles-loader';
import { CreateUserFormModule } from '../create-user-form';
import { VerificationComponent, VerificationContainerComponent } from './components';
import { VerificationRoutingModule } from './verification-routing.module';

loadStyles(['lazy-styles']);

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MediaModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    FormModule,
    VerificationRoutingModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    ButtonModule,
    BrowserModule,
    EntryModule,
    CreateUserFormModule,
    LoginFormModule,
    SnackBarModule,
    LayoutModule
  ],
  declarations: [
    VerificationContainerComponent,
    VerificationComponent,
  ],
  providers: [
    RegistrationGuard,
    AbbreviationPipe,
    MediaUrlPipe,
    CoreConfigService,
  ]
})
export class VerificationModule {}
