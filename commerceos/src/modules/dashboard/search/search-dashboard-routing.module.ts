import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivateUserLangGuard, TranslationGuard } from '@pe/ng-kit/modules/i18n';
import { MicroLoaderGuard } from '@pe/ng-kit/modules/micro';
import { BusinessWallpaperGuard } from '../../../apps/standalone/app/guards';
import { SearchBoxContainerComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: SearchBoxContainerComponent,
    canActivate: [ ActivateUserLangGuard, TranslationGuard, MicroLoaderGuard, BusinessWallpaperGuard ],
    data: {
      i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
      useMicroUrlsFromRegistry: true,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchDashboardRoutingModule { }
