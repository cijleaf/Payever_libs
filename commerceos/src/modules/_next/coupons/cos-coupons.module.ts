import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { loadStyles } from 'lazy-styles-loader';

import { EnvService, PeCouponsHeaderService } from '@app/services';
import { AuthModule } from '@pe/auth';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { ActualPeCouponsApi, PeCouponsApi } from '@pe/coupons';

import { CosCouponsRootComponent } from './root/coupons-root.component';

loadStyles(['entry-lazy-styles'], ['lazy-styles']);


const routes: Route[] = [
  {
    path: '',
    component: CosCouponsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/coupons').then(m =>  m.PeCouponsModule),
      }
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    AuthModule.forRoot(),
  ],
  declarations: [
    CosCouponsRootComponent
  ],
  providers: [
    PeCouponsHeaderService,
    {
      provide: PeCouponsApi,
      useClass: ActualPeCouponsApi,
    }
  ],
})
export class CosCouponsModule {}
