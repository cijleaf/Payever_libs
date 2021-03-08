import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { EnvironmentConfigGuard, EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { CosEnvInitializer, CosEnvProvider } from '@modules/_next/env.provider';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';
import { PebShopModule } from '@pe/builder-shop';
import { PebThemesModule } from '@pe/builder-themes';

import { CosContactsRootComponent } from './root/contacts-root.component';
import { PeContactsHeaderService } from '@app/services/platform-header-apps-services/contacts-header.service';
import { TranslateService } from '@pe/ng-kit/src/kit/i18n';
import { AuthService } from '@pe/ng-kit/src/kit/auth';
import { PeContactsAuthService } from '@pe/contacts';

const routes: Route[] = [
  {
    path: '',
    component: CosContactsRootComponent,
    canActivate: [ EnvironmentConfigGuard ],
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/contacts').then(
          m => m.ContactsModule.forRoot({
            environmentConfigService: EnvironmentConfigService,
            translateService: TranslateService,
          }).ngModule,
        )
      }
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    PebShopModule,
    PebThemesModule,
    RouterModule.forChild(routes),
    PeSimpleStepperModule,
  ],
  declarations: [
    CosContactsRootComponent,
  ],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    PeContactsHeaderService,

    CurrencyPipe,
    {
      provide: PeContactsAuthService,
      useExisting: AuthService,
    }
  ],
})
export class CosContactsModule {}
