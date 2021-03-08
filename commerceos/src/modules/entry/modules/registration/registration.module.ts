import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntryModule } from '@modules/entry/entry.module';
import { RegistrationGuard } from '@modules/entry/guards/registration.guard';
import { CreateUserFormModule } from '@modules/entry/modules/create-user-form';
import { CoreConfigService, SharedModule } from '@modules/shared';
import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { AbbreviationPipe, CommonModule as PECommonModule } from '@pe/ng-kit/modules/common';
import { AddressModule } from '@pe/ng-kit/modules/address';
import { FormModule } from '@pe/forms';
import { I18nModule, TranslateService } from '@pe/i18n';
import { TranslateService as NgKitTranslateService } from '@pe/ng-kit/src/kit/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { loadStyles } from 'lazy-styles-loader';
import {
  BusinessRegistrationComponent,
  CreateBusinessFormComponent,
  PersonalRegistrationComponent,
  RegistrationContainerComponent,
} from './components';
import { RegistrationRoutingModule } from './registration-routing.module';

loadStyles(['lazy-styles']);

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MediaModule,
    ReactiveFormsModule,
    I18nModule,
    AddressModule,
    FormModule,
    RegistrationRoutingModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    ButtonModule,
    BrowserModule,
    EntryModule,
    CreateUserFormModule,
  ],
  declarations: [
    CreateBusinessFormComponent,
    RegistrationContainerComponent,
    BusinessRegistrationComponent,
    PersonalRegistrationComponent,
  ],
  providers: [
    RegistrationGuard,
    AbbreviationPipe,
    MediaUrlPipe,
    CoreConfigService,
    {
      provide: TranslateService,
      useExisting: NgKitTranslateService,
    },
  ],
  exports: [CreateBusinessFormComponent],
})
export class RegistrationModule {}
