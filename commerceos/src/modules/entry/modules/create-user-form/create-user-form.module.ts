import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { ButtonModule } from '@pe/ng-kit/modules/button';
import { CommonModule as PECommonModule } from '@pe/ng-kit/modules/common';
import { FormModule } from '@pe/ng-kit/modules/form';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { ReCaptchaModule } from '@pe/ng-kit/modules/recaptcha';

import { CreateUserFormComponent } from './create-user-form.component';

@NgModule({
  exports: [
    CreateUserFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    ButtonModule,
    PECommonModule,
    FormModule,
    I18nModule.forChild(),
    ReCaptchaModule
  ],
  declarations: [
    CreateUserFormComponent
  ]
})
export class CreateUserFormModule {
}
