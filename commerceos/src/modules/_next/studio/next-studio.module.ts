import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { CosEnvInitializer, CosEnvProvider, COS_ENV } from '@modules/_next/env.provider';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { CosNextStudioRootComponent } from './root/next-studio-root.component';
import { PE_TRANSLATION_API_URL } from '@pe/i18n';


const routes: Route[] = [
  {
    path: '',
    component: CosNextStudioRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/studio').then(
          m => m.PeStudioModule
        ),
      },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    CosNextStudioRootComponent
  ],
  providers: [
    {
      provide: 'PEB_ENV',
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: PE_TRANSLATION_API_URL,
      deps: [COS_ENV],
      useFactory: ({ custom }) => custom.translation,
    },
    CosEnvProvider,
    CosEnvInitializer,
  ],
})
export class CosNextStudioModule {}
