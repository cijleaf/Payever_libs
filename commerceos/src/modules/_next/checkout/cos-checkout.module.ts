import { COS_ENV } from './../env.provider';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { loadStyles } from 'lazy-styles-loader';
import { AngularResizedEventModule } from 'angular-resize-event';

// import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';
import { CosEnvInitializer, CosEnvProvider } from '@modules/_next/env.provider';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';
import {
  PebPosSharedModule,
  // PEB_POS_CHECKOUT_WRAPPER_FRONTEND_PATH,
  PEB_POS_TRANSLATION,
} from '@pe/builder-pos';
// import { PebThemesApi, PebActualTerminalThemesApi } from '@pe/builder-api';
import { AUTH_ENV, AuthModule } from '@pe/auth';
import { MEDIA_ENV } from '@pe/media';
import { PE_ENV } from '@pe/common';
import { PE_FORMS_ENV } from '@pe/forms';
import { PE_TRANSLATION_API_URL } from '@pe/i18n';
import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { PeCheckoutHeaderService } from '@app/services';
// import { PePosHeaderService } from '@app/services/platform-header-apps-services/pos-header.service';
// import { BusinessDataResolver } from '@modules/business/resolvers';

import { EnvService } from "@app/services";
import { CosCheckoutRootComponent } from './root/checkout-root.component';

loadStyles(['entry-lazy-styles'], ['lazy-styles']);

const routes: Route[] = [
  {
    path: '',
    component: CosCheckoutRootComponent,
    // resolve: [BusinessDataResolver],
    // canActivate: [EnvironmentConfigGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/checkout-app').then(m =>  m.CheckoutModule),
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
    CosCheckoutRootComponent
  ],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    PeCheckoutHeaderService,
    // PePosHeaderService,
    // { provide: 'PEB_ENTITY_NAME', useValue: 'terminal' },
    // {
    //   provide: PEB_POS_CHECKOUT_WRAPPER_FRONTEND_PATH,
    //   deps: [COS_ENV],
    //   useFactory: env => env.frontend.checkoutWrapper,
    // },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    /*
    {
      provide: BUSINESS_UUID,
      deps: [EnvService],
      useFactory: envService => envService.businessUuid,
    },*/
    {
      provide: AUTH_ENV, // TODO Remove
      deps: [COS_ENV],
      useFactory: env => env,
    },
    /*
    {
      provide: 'CAF_ENV', // TODO Check can we remove
      deps: [COS_ENV],
      useFactory: env => env,
    },*/
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
export class CosCheckoutModule {}
