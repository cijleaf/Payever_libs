import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';

import { FormModule } from '@pe/ng-kit/modules/form';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { NavbarModule } from '@pe/ng-kit/modules/navbar';
import { ProfileSwitcherModule } from '@pe/ng-kit/modules/profile-switcher';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { MediaModule, MediaUrlPipe } from '@pe/ng-kit/modules/media';

import { SharedModule } from '@modules/shared';
import { RegistrationModule } from '@modules/entry/modules/registration/registration.module';
import { AddBusinessLayoutComponent, BaseSwitcherComponent, SwitcherProfileListComponent } from './components';

import { SwitcherRoutingModule } from './switcher-routing.module';
import { loadStyles } from 'lazy-styles-loader';

loadStyles(['lazy-styles']);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MediaModule.forRoot(),
    NavbarModule,
    FormModule,
    ProfileSwitcherModule,
    I18nModule.forChild(),
    SwitcherRoutingModule,
    SharedModule,
    RegistrationModule
  ],
  declarations: [
    AddBusinessLayoutComponent,
    BaseSwitcherComponent,
    SwitcherProfileListComponent,
  ],
  providers: [
    MediaUrlPipe,
    PlatformHeaderService,
  ]
})
export class SwitcherModule {}
