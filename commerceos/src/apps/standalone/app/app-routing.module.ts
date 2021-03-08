import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';

import { TranslationGuard } from '@pe/ng-kit/modules/i18n';
import { TranslationGuard as NewTranslationGuard } from '@pe/i18n';
import { AuthGuard } from '@pe/ng-kit/modules/auth';

import { ResetThemeGuard } from '../../../modules/shared/services/reset-theme.guard';

import { BaseServicesGuard, BusinessWallpaperGuard, GoogleTagManagerGuard, LoaderOffGuard, SetTokensGuard } from './guards';

const appRoutes: Routes = [
  {
    path: '',
    canActivate: [EnvironmentConfigGuard],
    children: [
      {
        path: '',
        canActivate: [SetTokensGuard],
        children: [
          {
            path: '',
            canActivate: [BaseServicesGuard],
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: 'entry/refresh-login',
                canActivate: [BusinessWallpaperGuard],
                data: {
                  noBackgroundBlur: true,
                }
              },
              {
                path: 'entry',
                loadChildren: () => import('modules/entry/entry.module').then(m => m.EntryModule),
                canActivate: [BusinessWallpaperGuard, TranslationGuard, GoogleTagManagerGuard, ResetThemeGuard], // For this one we hide loader manually (LoaderOffGuard removed)
                data: {
                  noBackgroundBlur: true,
                  i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'entry/registration',
                loadChildren: () => import('modules/entry/modules/registration/registration.module').then(m => m.RegistrationModule),
                canActivate: [BusinessWallpaperGuard, TranslationGuard, GoogleTagManagerGuard, ResetThemeGuard, LoaderOffGuard],
                data: {
                  noBackgroundBlur: true,
                  i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'entry/verification',
                loadChildren: () => import('modules/entry/modules/verification/verification.module').then(m => m.VerificationModule),
                canActivate: [BusinessWallpaperGuard, TranslationGuard, GoogleTagManagerGuard, ResetThemeGuard, LoaderOffGuard],
                data: {
                  noBackgroundBlur: true,
                  i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'switcher',
                loadChildren: () => import('modules/switcher/switcher.module').then(m => m.SwitcherModule),
                canActivate: [BusinessWallpaperGuard, AuthGuard, TranslationGuard, LoaderOffGuard],
                data: {
                  i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'personal',
                loadChildren: () => import('modules/root-layout/root-layout-personal.module').then(m => m.RootLayoutPersonalModule),
                canActivate: [AuthGuard, TranslationGuard, LoaderOffGuard],
                data: {
                  i18nDomains: ['commerceos-app', 'commerceos-widgets-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'business',
                loadChildren: () => import('modules/root-layout/root-layout-business.module').then(m => m.RootLayoutBusinessModule),
                canActivate: [AuthGuard, TranslationGuard, LoaderOffGuard, NewTranslationGuard],
                data: {
                  i18nDomains: ['commerceos-app', 'commerceos-widgets-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'help',
                loadChildren: () => import('modules/help/help.module').then(m => m.PEHelpModule),
                canActivate: [BusinessWallpaperGuard, TranslationGuard, LoaderOffGuard],
                data: {
                  isHelp: true,
                  i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'feedback',
                loadChildren: () => import('modules/help/help.module').then(m => m.PEHelpModule),
                canActivate: [BusinessWallpaperGuard, TranslationGuard, LoaderOffGuard],
                data: {
                  isHelp: false,
                  i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: 'password',
                loadChildren: () => import('modules/reset-password/reset-password.module').then(m => m.ResetPasswordModule),
                canActivate: [BusinessWallpaperGuard, TranslationGuard, LoaderOffGuard],
                data: {
                  noBackgroundBlur: true,
                  i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
                }
              },
              {
                path: '**',
                redirectTo: 'switcher',
                canActivate: [BusinessWallpaperGuard, LoaderOffGuard]
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
    appRoutes,
    {
      onSameUrlNavigation: 'reload', // For change language at login page
      enableTracing: false,
    },
  )],
  exports: [RouterModule]
})
export class AppRoutingModule {}
