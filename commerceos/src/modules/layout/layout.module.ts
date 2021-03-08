import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { OverlayBoxModule } from '@pe/ng-kit/modules/overlay-box';
import { LayoutComponent } from './layout.component';

@NgModule({
  exports: [
    LayoutComponent
  ],
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    I18nModule.forChild(),
    RouterModule,
    OverlayBoxModule,
    BrowserModule,
    MatButtonModule
  ]
})
export class LayoutModule {
}
