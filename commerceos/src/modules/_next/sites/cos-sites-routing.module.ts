import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CosSitesRootComponent} from "./sites-root/sites-root.component";

const routes: Routes = [{
  path: '',
  component: CosSitesRootComponent,
  children:[{
    path: '',
    loadChildren: () => import('@pe/sites-app').then(m => m.PebSiteModule),
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CosSitesRoutingModule {
}
