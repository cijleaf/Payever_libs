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
      personal: false
    },
    children: [
      /*
      {
        path: '',
        loadChildren: 'modules/personal/personal.module#PEPersonalModule',
        canActivate: [BusinessWallpaperGuard, PersonalWallpaperGuard, PersonalGuard, AuthGuard, TranslationGuard],
        data: {
          i18nDomains: ['commerceos-app', 'commerceos-widgets-app', 'ng-kit-ng-kit'],
        }
      },*/
      {
        path: ':slug',
        loadChildren: () => import('modules/business/business.module').then(m => m.PEBusinessModule),
        canActivate: [AuthGuard, BusinessGuard, TranslationGuard],
        data: {
          i18nDomains: ['commerceos-app', 'commerceos-widgets-app', 'ng-kit-ng-kit'],
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RootLayoutBusinessRoutingModule {}
