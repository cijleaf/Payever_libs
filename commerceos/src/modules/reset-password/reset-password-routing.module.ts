import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ForgotPasswordComponent,
  LayoutComponent,
  ResetPasswordComponent
} from './components';

const routes: Routes = [{
  path: '',
  component: LayoutComponent,
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'forgot'
    },
    {
      path: 'forgot',
      component: ForgotPasswordComponent
    },
    {
      path: 'reset/:token',
      component: ResetPasswordComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResetPasswordRoutingModule {}
