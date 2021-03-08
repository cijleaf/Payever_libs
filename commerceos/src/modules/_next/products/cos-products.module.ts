import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MEDIA_ENV } from '@pe/media';
import { PE_ENV } from '@pe/common';
import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';
import { CosEnvInitializer, CosEnvProvider, COS_ENV } from '@modules/_next/env.provider';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { CosProductsRootComponent } from './root/products-root.component';
import { PeProductsHeaderService } from '@app/services';
import { AuthModule } from '@pe/auth';
import { TranslationGuard } from '@pe/i18n';
import { DragulaModule } from 'ng2-dragula';

const routes: Route[] = [
  {
    path: '',
    component: CosProductsRootComponent,
    canActivate: [EnvironmentConfigGuard, TranslationGuard],
    data: {
      i18nDomains: ['products-list', 'products-editor', 'ng-kit-ng-kit', 'data-grid-app'],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/products-app').then(m => m.ProductsModule),
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
    AuthModule.forRoot(),
    DragulaModule.forRoot(),
  ],
  declarations: [CosProductsRootComponent],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    PeProductsHeaderService,
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: MEDIA_ENV,
      useFactory: (env: any) => ({ custom: env.custom, backend: env.backend }),
      deps: [COS_ENV],
    },
  ],
})
export class CosProductsModule {}
