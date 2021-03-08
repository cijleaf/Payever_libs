import { COS_ENV } from './../env.provider';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { loadStyles } from 'lazy-styles-loader';
import { AngularResizedEventModule } from 'angular-resize-event';

import { CosEnvInitializer, CosEnvProvider } from '@modules/_next/env.provider';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';
import {
  PebPosSharedModule,
  PEB_POS_TRANSLATION,
} from '@pe/builder-pos';
import { AUTH_ENV, AuthModule } from '@pe/auth';
import { MEDIA_ENV } from '@pe/media';
import { PE_ENV } from '@pe/common';
import { PE_FORMS_ENV } from '@pe/forms';
import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { PeConnectHeaderService } from '@app/services';

import { EnvService } from "@app/services";
import { CosConnectRootComponent } from './root/connect-root.component';

loadStyles(['entry-lazy-styles'], ['lazy-styles']);

const routes: Route[] = [
  {
    path: '',
    component: CosConnectRootComponent,
    // resolve: [BusinessDataResolver],
    // canActivate: [EnvironmentConfigGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/connect-app').then(m =>  m.ConnectModule),
      }
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    PebPosSharedModule,
    // PebThemesSharedModule,
    RouterModule.forChild(routes),
    AngularResizedEventModule,
    PeSimpleStepperModule,
    AuthModule,
  ],
  declarations: [
    CosConnectRootComponent
  ],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    PeConnectHeaderService,
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: AUTH_ENV, // TODO Remove
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: PE_FORMS_ENV, // TODO Remove
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: MEDIA_ENV, // TODO Remove
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: PEB_POS_TRANSLATION, // TODO Remove
      deps: [TranslateService],
      useFactory: service => service,
    }
  ],
})
export class CosConnectModule {}
