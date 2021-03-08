import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  LoginAsUserLayoutComponent,
  LoginFormModule,
  LoginLayoutComponent,
  LoginRefreshLayoutComponent,
  LoginSecondFactorCodeComponent
} from '@modules/entry/modules/login-form';
import { EmailVerificationComponent, EntryLayoutWrapperComponent } from './components';
import { LoginContainerComponent } from './modules/login-form/login-container/login-container.component';

const routes: Routes = [
  {
    path: '',
    component: EntryLayoutWrapperComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        component: LoginContainerComponent,
        data: {
          type: 'login',
          hideLogo: true,
        },
        children: [
          {
            path: '**',
            component: LoginLayoutComponent,
          },
          {
            path: ':industry',
            component: LoginLayoutComponent,
          }
        ]
      },
    ]
  },
  {
    path: 'login-as-user',
    component: LoginAsUserLayoutComponent,
    data: {
      type: 'login'
    }
  },
  {
    path: 'refresh-login',
    component: LoginRefreshLayoutComponent,
    data: {
      type: 'refresh-login'
    }
  },
  {
    path: 'confirmation/:token',
    component: EmailVerificationComponent
  },
  {
    path: 'second-factor-code',
    component: LoginSecondFactorCodeComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    LoginFormModule
  ],
  exports: [RouterModule]
})
export class EntryRoutingModule {}
