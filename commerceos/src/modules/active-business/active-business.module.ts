import { NgModule } from '@angular/core';

import { ActiveBusinessComponent } from './components';
import { CommonModule } from '@angular/common';
import { CommonModule as PeCommonModule } from '@pe/ng-kit/modules/common';

@NgModule({
  imports: [
    CommonModule,
    PeCommonModule
  ],
  declarations: [
    ActiveBusinessComponent,
  ],
  exports: [
    ActiveBusinessComponent,
  ]
})
export class ActiveBusinessModule {
}
