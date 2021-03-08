import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';

import { BusinessWallpaperGuard, PersonalWallpaperGuard, BusinessGuard, PersonalGuard } from '@app/guards';
import { TranslationGuard } from '@pe/ng-kit/modules/i18n';
import { AuthGuard } from '@pe/ng-kit/modules/auth';
import { RootLayoutComponent } from './components/root-layout/root.component';

const routes: Routes = [
  {
    path: '',
    component: RootLayoutComponent,
    canActivate: [EnvironmentConfigGuard],
    data: {
      personal: true
    },
    children: [
      {
        path: '',
        loadChildren: () => import('modules/personal/personal.module').then(m => m.PEPersonalModule),
        canActivate: [PersonalWallpaperGuard, PersonalGuard, AuthGuard, TranslationGuard],
        data: {
          i18nDomains: ['commerceos-app', 'commerceos-widgets-app', 'ng-kit-ng-kit'],
        }
      },/*
      {
        path: ':slug',
        loadChildren: 'modules/business/business.module#PEBusinessModule',
        canActivate: [AuthGuard, BusinessGuard, TranslationGuard],
        data: {
          i18nDomains: ['commerceos-app', 'commerceos-widgets-app', 'ng-kit-ng-kit'],
        }
      },*/
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RootLayoutPersonalRoutingModule {}
