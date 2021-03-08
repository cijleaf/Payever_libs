import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { CosEnvInitializer, CosEnvProvider, COS_ENV } from '@modules/_next/env.provider';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { CosTransactionsRootComponent } from './root/transactions-root.component';
import { AuthModule, AUTH_ENV } from '@pe/auth';
import { MediaModule, MediaUrlPipe, MEDIA_ENV } from '@pe/media';
import { PeTransactionsHeaderService } from '@app/services/platform-header-apps-services/transactions-header.service';
import { FormCoreModule } from '@pe/forms';
import { BackendLoggerService, MicroLoaderService, MicroRegistryService } from '@pe/common';

const routes: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: '',
    component: CosTransactionsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/transactions').then(m => m.PeTransactionsModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PeSimpleStepperModule,
    AuthModule,
    MediaModule,
    FormCoreModule,
  ],
  declarations: [CosTransactionsRootComponent],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    CurrencyPipe,
    PeTransactionsHeaderService,
    MediaUrlPipe,
    MicroLoaderService,
    BackendLoggerService,
    MicroRegistryService,
    { provide: MEDIA_ENV, useFactory: env => env, deps: [COS_ENV] },
    { provide: AUTH_ENV, useFactory: env => env, deps: [COS_ENV] },
  ],
})
export class CosTransactionsModule {}
