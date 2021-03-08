import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivateUserLangGuard } from '@pe/ng-kit/modules/i18n';

import { ResetThemeGuard } from '../../modules/shared/services/reset-theme.guard';

import { AddBusinessLayoutComponent, BaseSwitcherComponent, SwitcherProfileListComponent } from './components';

const routes: Routes = [
  {
    path: 'profile',
    component: SwitcherProfileListComponent,
    canActivate: [ ActivateUserLangGuard, ResetThemeGuard ]
  },
  {
    path: 'add-business',
    component: AddBusinessLayoutComponent
  },
  {
    path: '',
    pathMatch: 'full',
    component: BaseSwitcherComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwitcherRoutingModule {}
