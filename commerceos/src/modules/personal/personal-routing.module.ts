import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalDashboardLayoutComponent, PersonalLayoutComponent } from './components';
import { PersonalAppRegistryGuard } from './guards';
import { ActivateUserLangGuard } from '@pe/ng-kit/modules/i18n';
import { PersonalWallpaperGuard } from '../../apps/standalone/app/guards';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'info/overview'
  },
  {
    path: '',
    component: PersonalDashboardLayoutComponent,
    canActivate: [ PersonalWallpaperGuard, PersonalAppRegistryGuard, ActivateUserLangGuard ],
    children: [
      {
        path: 'info/overview',
        loadChildren: () => import('../dashboard/widgets/widgets-dashboard.module').then(m => m.WidgetsDashboardModule)
      },
    ],
  },
  {
    path: '',
    component: PersonalLayoutComponent,
    canActivate: [ PersonalWallpaperGuard, PersonalAppRegistryGuard, ActivateUserLangGuard ],
    children: [
      {
        path: 'info/edit',
        loadChildren: () => import('../dashboard/edit-apps/edit-apps-dashboard.module').then(m => m.EditAppsDashboardModule)
      },
      {
        path: 'info/search',
        loadChildren: () => import('../dashboard/search/search-dashboard.module').then(m => m.SearchDashboardModule)
      },
    ]
  },
  {
    path: ':slug/transactions',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    canActivate: [PersonalWallpaperGuard, PersonalAppRegistryGuard]
  },
  {
    path: ':slug/settings',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    canActivate: [PersonalWallpaperGuard, PersonalAppRegistryGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PEPersonalRoutingModule { }
