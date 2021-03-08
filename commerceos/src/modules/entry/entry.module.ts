import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { loadStyles } from 'lazy-styles-loader';

import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { AbbreviationPipe } from '@pe/ng-kit/modules/common';
import { FormComponentsInputModule } from '@pe/ng-kit/modules/form-components-input';
import { FormModule } from '@pe/ng-kit/modules/form';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { OverlayBoxModule } from '@pe/ng-kit/modules/overlay-box';

import { ActiveBusinessModule } from '@modules/active-business/active-business.module';
import { LayoutModule } from '@modules/layout';

import { EmailVerificationComponent, EntryLayoutWrapperComponent } from './components';
import { EntryRoutingModule } from './entry-routing.module';
import { RegistrationGuard } from './guards/registration.guard';
import { LoginContainerComponent } from './modules/login-form/login-container/login-container.component';

loadStyles(['entry-lazy-styles'], ['lazy-styles']);

@NgModule({
  imports: [
    CommonModule,
    MediaModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    FormComponentsInputModule,
    EntryRoutingModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    ButtonModule,
    FormModule,
    BrowserModule,
    OverlayBoxModule,
    MatCardModule,
    ActiveBusinessModule,
    LayoutModule
  ],
  declarations: [
    EmailVerificationComponent,
    EntryLayoutWrapperComponent,
    LoginContainerComponent,
  ],
  providers: [
    RegistrationGuard,
    AbbreviationPipe,
    MediaUrlPipe,
  ],
  exports: [
    EntryLayoutWrapperComponent
  ]
})
export class EntryModule {}
