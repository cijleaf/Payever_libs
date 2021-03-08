import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivateUserLangGuard, TranslationGuard } from '@pe/ng-kit/modules/i18n';
import { WidgetsLayoutComponent } from './components';
import { WidgetsResolver } from './resolvers';

const routes: Routes = [
  {
    path: '',
    component: WidgetsLayoutComponent,
    canActivate: [ ActivateUserLangGuard, TranslationGuard ],
    resolve: {
      widgets: WidgetsResolver
    },
    data: {
      i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WidgetsDashboardRoutingModule { }
