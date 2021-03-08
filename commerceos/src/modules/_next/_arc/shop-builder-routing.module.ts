import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PeShopBuilderComponent } from './shop-builder.component';
import { PeShopThemesComponent } from './pages/themes/shop-themes.component';
import { PeShopEditorComponent } from './pages/editor/shop-editor.component';
import { PeShopResolver } from './shop.resolver';
import { PeShopCreateComponent } from './pages/create/shop-create.component';
import { PeShopListComponent } from './pages/list/shop-list.component';
import { PeShopSettingsComponent } from './pages/settings/shop-settings.component';
import { PeShopsResolver } from './shops.resolver';

const routes: Routes = [
  {
    path: '',
    component: PeShopBuilderComponent,
    children: [
      {
        path: 'create',
        component: PeShopCreateComponent,
      },
      {
        path: ':shopId',
        component: PeShopEditorComponent,
        resolve: {
          shop: PeShopResolver,
        },
      },
      {
        path: ':shopId/themes',
        component: PeShopThemesComponent,
      },
      {
        path: ':shopId/settings',
        component: PeShopSettingsComponent,
      },
      {
        path: '',
        component: PeShopListComponent,
        resolve: {
          shops: PeShopsResolver,
        },
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeShopBuilderRoutingModule { }
