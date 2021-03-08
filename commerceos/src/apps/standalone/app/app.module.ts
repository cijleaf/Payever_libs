import { EffectsModule } from '@ngrx/effects';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginFormModule } from '@modules/entry/modules/login-form';

import { NgxWebstorageModule } from 'ngx-webstorage';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {CommonModule} from '@pe/ng-kit/modules/common';
import {AuthGuard, AuthModule, AuthService} from '@pe/ng-kit/modules/auth';
import {PlatformHeaderModule} from '@pe/ng-kit/modules/platform-header';
import {MediaUrlPipe} from '@pe/ng-kit/modules/media';
import {BackgroundService} from '@pe/ng-kit/modules/wallpaper';
import {MicroModule, MicroRegistryService} from '@pe/ng-kit/modules/micro';
import {EnvironmentConfigModule} from '@pe/ng-kit/modules/environment-config';
import {I18nModule, TranslateService} from '@pe/ng-kit/modules/i18n';

import { ApiService } from '@modules/shared';
import { TrafficSourceService } from '@app/services';
import { RootComponent } from './components';
import { AppRoutingModule } from './app-routing.module';
import {
  BusinessWallpaperGuard,
  GoogleTagManagerGuard,
  PersonalWallpaperGuard,
  BaseServicesGuard,
  LoaderOffGuard,
  SetTokensGuard,
} from './guards';
import { EnvService, WallpaperService, HeaderService } from './services';
import cssVars from 'css-vars-ponyfill';
import { FullStoryService } from '@pe/ng-kit/src/kit/full-story';
import { PebEnvironmentService } from './services/pebEnv.service';
import {
  CosEnvInitializer,
  CosEnvProvider,
  COS_ENV,
} from '@modules/_next/env.provider';
import { CosMessageBus } from '@modules/_next/shop/services/message-bus.service';
import { PePlatformHeaderService } from '@pe/platform-header';
import { PlatformHeaderService } from './services/app-platform-header.service';

import { PebEnvService, MessageBus, PebMediaService } from '@pe/builder-core';
import {
  PEB_EDITOR_API_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  BUILDER_MEDIA_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PebEditorApi,
  PebActualEditorApi,
  PebShopsApi,
  PebActualShopsApi,
  PebActualProductsApi,
  PebProductsApi,
  PebPosApi,
  PebActualPosApi,
  PEB_POS_API_PATH,
  PEB_CONNECT_API_PATH,
  PEB_BUILDER_POS_API_PATH,
  PEB_STUDIO_API_PATH,
  MediaService,
  PEB_SYNCHRONIZER_API_PATH,
  PebContextApi,
  PebActualContextApi,
} from '@pe/builder-api';
import { PEB_SHOP_HOST } from '@pe/builder-shop';
import { PE_STUDIO_API_PATH, PE_ACCESS_TOKEN } from '@pe/studio';
import { PEB_TERMINAL_HOST } from '@pe/builder-pos';
import { PE_CDN_HOST, PE_CONTACTS_HOST } from '@pe/contacts';
import { I18nModule as NewI18nModule } from '@pe/i18n';
import { PE_ENV } from '@pe/common';
import { AUTH_ENV } from '@pe/auth';
import { StoreModule } from '@ngrx/store';
import { MediaModule, MEDIA_ENV } from '@pe/media';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-editor';
import { ServiceWorkerModule } from '@angular/service-worker';
import {
  PEB_SITE_API_BUILDER_PATH,
  PEB_SITE_API_PATH,
  PEB_SITE_HOST,
  PebActualSitesApi,
  PebSitesApi
} from "@pe/sites-app";
import { PE_COUPONS_API_PATH } from '@pe/coupons';
import { PebRendererModule } from '@pe/builder-renderer';
import { PEB_SHIPPING_API_PATH } from '@pe/shipping-app';
import { PE_STATISTICS_API_PATH } from '@pe/statistics';

let devModules: any[] = [];

PayeverStatic.IconLoader.loadIcons([
  'set',
  'apps',
  'builder', // For #icon-b-warning-18
  'commerceos', // For #icon-account-circle-24
  // 'settings', // For #icon-settings-business-detail-48
  'industries',
]);

cssVars({ watch: true });

@NgModule({
  imports: [
    HttpClientModule,
    EnvironmentConfigModule.forRoot(),
    NgxWebstorageModule.forRoot({
      prefix: 'pe.common',
      separator: '.',
      caseSensitive: true,
    }),
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    I18nModule.forRoot({ useStorageForLocale: true }),
    ...devModules,
    AuthModule.forRoot(),
    MicroModule.forRoot(),
    NgxWebstorageModule.forRoot(),
    PlatformHeaderModule.forRoot(), // For HeaderService
    CommonModule.forRoot(),
    LoginFormModule.forRoot(),
    ServiceWorkerModule.register('image-upload.worker.js', { registrationStrategy: 'registerImmediately' }),
    StoreModule.forRoot({}),
    EffectsModule.forRoot(),
    NewI18nModule.forRoot(),
    MediaModule.forRoot({}),
    PebRendererModule.forRoot({ elements: {}}),
  ],
  declarations: [RootComponent],
  providers: [
    AuthGuard,
    EnvService,
    MicroRegistryService,
    BaseServicesGuard,
    BusinessWallpaperGuard,
    GoogleTagManagerGuard,
    PersonalWallpaperGuard,
    LoaderOffGuard,
    SetTokensGuard,
    WallpaperService,
    HeaderService,
    MediaUrlPipe,
    ApiService,
    TranslateService,
    BackgroundService,
    TrafficSourceService,
    FullStoryService,
    BackgroundActivityService,

    // TODO: doesn't work in shop editor module
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: PEB_GENERATOR_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderGenerator,
    },
    {
      provide: PEB_MEDIA_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.media,
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderMedia,
    },
    {
      provide: PEB_STUDIO_API_PATH,
      useValue: 'https://studio-backend.test.devpayever.com',
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [COS_ENV],
      useFactory: env => env.custom.storage,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PEB_SHOP_HOST,
      deps: [COS_ENV],
      useFactory: env => env.primary.shopHost,
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.synchronizer,
    },
    {
      provide: PEB_TERMINAL_HOST,
      deps: [COS_ENV],
      useFactory: env => env.primary.businessHost,
    },
    {
      provide: PEB_POS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.pos + '/api',
    },
    {
      provide: PEB_CONNECT_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.connect + '/api',
    },
    {
      provide: PEB_BUILDER_POS_API_PATH,
      deps: [COS_ENV],
      // TODO: chnage it to env.backend.builderPos
      useFactory: env => env.backend.builderPos + '/api',
    },
    {
      provide: 'PEB_ENV',
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: 'POS_ENV',
      deps: [COS_ENV],
      useFactory: env => env.backend.pos + '/api',
    },
    {
      provide: 'POS_MEDIA',
      deps: [COS_ENV],
      useFactory: env => env.custom.storage + '/images',
    },
    {
      provide: 'POS_PRODUCTS_MEDIA',
      deps: [COS_ENV],
      useFactory: env => env.custom.storage + '/products',
    },
    {
      provide: PE_CDN_HOST,
      deps: [COS_ENV],
      useFactory: env => env.custom.cdn,
    },
    {
      provide: PE_CONTACTS_HOST,
      deps: [COS_ENV],
      useFactory: env => env.backend.contacts,
    },
    {
      provide: PE_STATISTICS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.statistics,
    },
    {
      provide: PE_STUDIO_API_PATH,
      deps: [COS_ENV],
      useFactory: (env) => env.backend.studio,
    },
    {
      provide: PE_COUPONS_API_PATH,
      deps: [COS_ENV],
      useFactory: (env) => env.backend.coupons,
    },

    {
      provide: 'POS_GOOGLE_MAPS_API_KEY',
      deps: [COS_ENV],
      useFactory: env => env.config.googleMapsApiKey,
    },
    {
      provide: PE_ACCESS_TOKEN,
      deps: [AuthService],
      useFactory: (authService: AuthService) => authService.token,
      // useValue: Cookie.get('pe_auth_token'),
    },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: AUTH_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: MEDIA_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: AUTH_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: MEDIA_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: PEB_SITE_HOST,
      deps: [COS_ENV],
      useFactory: env => env.primary.siteHost,
    },
    {
      provide: PEB_SITE_API_BUILDER_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderSite,
    },
    {
      provide: PEB_SITE_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.site,
    },
    {
      provide: PEB_SHIPPING_API_PATH,
      deps: [COS_ENV],
      useFactory: env => `${env.backend.shipping}/api`,
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebContextApi,
      useClass: PebActualContextApi,
    },
    {
      provide: PebShopsApi,
      useClass: PebActualShopsApi,
    },
    {
      provide: PebProductsApi,
      useClass: PebActualProductsApi,
    },
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: PebEnvService,
      useClass: PebEnvironmentService,
    },
    {
      provide: PebPosApi,
      useClass: PebActualPosApi,
    },
    {
      provide: PebSitesApi,
      useClass: PebActualSitesApi,
    },
    {
      provide: PePlatformHeaderService,
      useFactory: (injector: Injector) => {
        // Hack providing service for micro apps
        if (!window['pe_PlatformHeaderService']) {
          const service = new PlatformHeaderService(injector);
          window['pe_PlatformHeaderService'] = service;
          return service;
        } else {
          return window['pe_PlatformHeaderService'];
        }
      },
      deps: [Injector]
    },
    // TODO(angular#17606): After introducing MODULE_INITIALIZER this should be
    //                      moved to modules that require this environment
    CosEnvProvider,
    CosEnvInitializer,
    BackgroundActivityService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptorService,
      multi: true,
      deps: [
        BackgroundActivityService,
        PEB_EDITOR_API_PATH,
      ],
    },
  ],
  bootstrap: [RootComponent],
})
export class AppModule {}
