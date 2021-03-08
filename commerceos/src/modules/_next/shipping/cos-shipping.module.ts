import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AuthModule } from '@pe/auth';
import { TranslateService } from '@pe/i18n';
import { PebTranslateService } from '@pe/builder-core';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { CosShippingRootComponent } from './root/shipping-root.component';
import { PeShippingHeaderService } from '@app/services/platform-header-apps-services/shipping-header.service';

const routes: Route[] = [
  {
    path: '',
    component: CosShippingRootComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@pe/shipping-app').then((m) => m.PebShippingModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    AuthModule,
  ],
  declarations: [CosShippingRootComponent],
  providers: [
    PeShippingHeaderService,
    {
      provide: PebTranslateService,
      useClass: TranslateService,
    },
  ],
})
export class CosShippingModule {}
