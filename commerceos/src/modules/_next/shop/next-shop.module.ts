import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthService } from "@pe/ng-kit/modules/auth";
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { CosEnvInitializer, CosEnvProvider } from '@modules/_next/env.provider';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebTranslateService } from '@pe/builder-core';
import {
  PebThemesApi,
  PebActualShopThemesApi,
} from '@pe/builder-api';

import { CosNextRootComponent } from './root/next-root.component';
import { PeShopHeaderService } from '@app/services/platform-header-apps-services/shop-header.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../token.interceptor';
import { PebShopBuilderViewComponent } from './root/builder-view/builder-view.component';
import {PebShopEditorModule} from "@pe/builder-shop-editor";
import { PeShopBuilderPublishComponent } from './root/builder-publish/builder-publish.component';
import { PebRendererModule } from '@pe/builder-renderer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { PebMessagesModule } from '@pe/ui';

const routes:Route[]=[
  {
    path:'',
    component: CosNextRootComponent,
    children:[{
      path: '',
      loadChildren: () => import('@pe/builder-shop').then(m => m.PebShopModule),
    }],

  }
]

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PebShopEditorModule,
    PebRendererModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatChipsModule,
    PebMessagesModule
  ],
  declarations: [
    CosNextRootComponent,
    PebShopBuilderViewComponent,
    PeShopBuilderPublishComponent,
  ],
  providers: [
    CosEnvProvider,
    CosEnvInitializer,
    PeShopHeaderService,
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'shop'
    },
    {
      provide: PebThemesApi,
      useClass: PebActualShopThemesApi
    },
    {
      provide: PebTranslateService,
      useExisting: TranslateService,
    },
    {
      provide: 'PE_ACCESS_TOKEN',
      deps: [AuthService],
      useFactory: (authService: AuthService) => authService.token,
      // useValue: Cookie.get('pe_auth_token'),
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    }
  ],
})
export class CosNextShopModule {}
