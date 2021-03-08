import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { FeedbackModule } from '@pe/ng-kit/modules/feedback';
import { I18nModule } from '@pe/ng-kit/modules/i18n';

import { FeedbackComponent, HelpComponent, LayoutComponent } from './components';
import { PEHelpRoutingModule } from './help-routing.module';
import { CoreConfigService } from '@modules/shared/services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    FeedbackModule,
    PEHelpRoutingModule
  ],
  declarations: [
    FeedbackComponent,
    HelpComponent,
    LayoutComponent
  ],
  providers: [
    CoreConfigService
  ]
})
export class PEHelpModule {
}
