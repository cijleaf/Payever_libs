import { COS_ENV } from './../env.provider';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { loadStyles } from 'lazy-styles-loader';

import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';
import { CosEnvInitializer, CosEnvProvider } from '@modules/_next/env.provider';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';
// import { PebThemesSharedModule } from '@pe/builder-themes';
import {
  PebPosSharedModule,
  PEB_POS_TRANSLATION,
} from '@pe/builder-pos';
import { PebThemesApi, PebActualTerminalThemesApi } from '@pe/builder-api';
import { PE_FORMS_ENV } from '@pe/forms';
import { PE_TRANSLATION_API_URL } from '@pe/i18n';
import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { PePosHeaderService } from '@app/services/platform-header-apps-services/pos-header.service';
import { BusinessDataResolver } from '@modules/business/resolvers';

import { CosNextRootComponent } from './root/next-root.component';
import { CosNextNotFoundComponent } from './root/next-not-found.component';
import { SetupGuard } from './guards/setup.guard';
import { CorrectSetupStepGuard } from './guards/correct-setup-step.guard';
import { CosCreateTerminalComponent } from './setup/create-terminal/create-terminal.component';
import { CosTerminalGuard } from './guards/terminal.guard';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../token.interceptor';
import { AuthModule } from '@pe/ng-kit/src/kit/auth';

loadStyles(['entry-lazy-styles'], ['lazy-styles']);

const routes: Route[] = [
  {
    path: 'setup',
    component: CosNextRootComponent,
    canActivate: [],
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full',
      },
      {
        path: 'create',
        component: CosCreateTerminalComponent,
      },
    ],
  },
  {
    path: 'builder',
    canActivate: [SetupGuard, CosTerminalGuard],
  },
  {
    path: '',
    component: CosNextRootComponent,
    resolve: [BusinessDataResolver],
    canActivate: [EnvironmentConfigGuard, SetupGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/builder-pos').then(m => m.PebPosModule),
      },
      {
        path: '**',
        component: CosNextNotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    PePlatformHeaderModule,
    PebPosSharedModule,
    // PebThemesSharedModule,
    RouterModule.forChild(routes),
    PeSimpleStepperModule,
    HttpClientModule,
    AuthModule.forRoot()
  ],
  declarations: [
    CosNextRootComponent,
    CosNextNotFoundComponent,
    CosCreateTerminalComponent,
  ],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    SetupGuard,
    CorrectSetupStepGuard,
    PePosHeaderService,
    { provide: 'PEB_ENTITY_NAME', useValue: 'terminal' },
    {
      provide: PE_TRANSLATION_API_URL,
      deps: [COS_ENV],
      useFactory: env => env.custom.translation,
    },
    {
      provide: PebThemesApi,
      useClass: PebActualTerminalThemesApi,
    },
    {
      provide: PEB_POS_TRANSLATION,
      deps: [TranslateService],
      useFactory: service => service,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
})
export class CosNextPosModule {}
