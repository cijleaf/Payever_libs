import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CosSitesRoutingModule } from './cos-sites-routing.module';
import { CosSitesRootComponent } from './sites-root/sites-root.component';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebCacheInterceptor, PebEditorApi, PebThemesApi } from '@pe/builder-api';
import {
  AbstractSiteBuilderApi,
  ActualPebSitesEditorApi,
  ActualPebSitesThemesApi,
  PebActualSiteBuilderApi,
} from '@pe/sites-app';
import { TranslateService } from '@pe/i18n';
import { PebTranslateService } from '@pe/builder-core';
import {PeSitesHeaderService} from '@app/services/platform-header-apps-services/sites-header.service'
import {PebSiteBuilderViewComponent} from "./sites-root/builder-view/builder-view.component";
import {PebShopEditorModule} from "@pe/builder-shop-editor";
import { PebViewerModule } from '@pe/builder-viewer';
import {MatChipsModule} from '@angular/material/chips'
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from "@angular/material/form-field";
import {PebRendererModule} from "@pe/builder-renderer";
import {PeSiteBuilderPublishComponent} from "./sites-root/builder-publish/builder-publish.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {PePublishSuccessComponent} from "@modules/_next/shared/publish-sccess/publish-success.component";
import { PebMessagesModule } from '@pe/ui';
import { AuthService } from '@pe/ng-kit/src/kit/auth';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../token.interceptor';


@NgModule({
  declarations: [
    CosSitesRootComponent,
    PeSiteBuilderPublishComponent,
    PebSiteBuilderViewComponent,
    PePublishSuccessComponent,
  ],
  imports: [
    CommonModule,
    CosSitesRoutingModule,
    PebShopEditorModule,
    PebViewerModule,
    PePlatformHeaderModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    PebRendererModule,
    MatProgressSpinnerModule,
    PebMessagesModule
  ],
  providers: [
    PeSitesHeaderService,
    {
      provide: PebEditorApi,
      useClass: ActualPebSitesEditorApi,
    },
    {
      provide: PebThemesApi,
      useClass: ActualPebSitesThemesApi,
    },
    {
      provide: AbstractSiteBuilderApi,
      useClass: PebActualSiteBuilderApi,
    },
 
    {
      provide: PebTranslateService,
      useClass: TranslateService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'site',
    },
  
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: 'PE_ACCESS_TOKEN',
      deps: [AuthService],
      useFactory: (authService: AuthService) => authService.token,
      // useValue: Cookie.get('pe_auth_token'),
    },
  ],
})
export class CosSitesModule { }

