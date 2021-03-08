import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { RegistrationGuard } from '@modules/entry/guards/registration.guard';
import { EntryLayoutWrapperComponent } from '@modules/entry/components';
import {
  RegistrationContainerComponent,
  PersonalRegistrationComponent,
  BusinessRegistrationComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: EntryLayoutWrapperComponent,
    data: {
      hideLogo: true,
      i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
    },
    canActivate: [TranslationGuard],
    children: [
      {
        path: '',
        component: RegistrationContainerComponent,
        data: {
          type: 'registration',
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'business',
          },
          {
            path: 'personal',
            component: PersonalRegistrationComponent,
            canActivate: [RegistrationGuard],
            data: {
              type: 'personal',
            },
          },
          {
            path: 'business',
            children: [
              {
                path: 'app/:app',
                component: BusinessRegistrationComponent,
                canActivate: [RegistrationGuard],
                data: {
                  type: 'business',
                },
              },
              {
                path: '',
                component: BusinessRegistrationComponent,
                canActivate: [RegistrationGuard],
                data: {
                  type: 'business',
                },
              },
            ],
          },
          {
            path: ':industry',
            children: [
              {
                path: 'app/:app',
                component: BusinessRegistrationComponent,
                canActivate: [RegistrationGuard],
                data: {
                  type: 'business',
                },
              },
              {
                path: '',
                component: BusinessRegistrationComponent,
                canActivate: [RegistrationGuard],
                data: {
                  type: 'business',
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule {}
