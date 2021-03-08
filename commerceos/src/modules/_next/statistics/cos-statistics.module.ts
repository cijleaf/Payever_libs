import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PeStatisticsHeaderService } from '@app/services/platform-header-apps-services/statistics-header.service';
import { AuthModule } from '@pe/auth';
import { PebTranslateService } from '@pe/builder-core';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe, MEDIA_ENV } from '@pe/media';
import { PePlatformHeaderModule} from '@pe/platform-header';
import { COS_ENV } from '../env.provider';
import { CosStatisticsRootComponent } from './root/statistics-root.component';

const routes: Route[] = [
  {
    path: '',
    component: CosStatisticsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@pe/statistics').then((m) => m.PeStatisticsModule),
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
  declarations: [CosStatisticsRootComponent],
  providers: [
    MediaUrlPipe,
    PeStatisticsHeaderService,
    {
      provide: PebTranslateService,
      useClass: TranslateService,
    },
    {
      provide: MEDIA_ENV,
      useFactory: (env: any) => ({ custom: env.custom, backend: env.backend }),
      deps: [COS_ENV],
    },
  ],
})
export class CosStatisticsModule {}
