import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationGuard } from '@modules/entry/guards/registration.guard';
import { EntryLayoutWrapperComponent } from '@modules/entry/components';
import { VerificationContainerComponent, VerificationComponent } from './components';


const routes: Routes = [
  {
    path: '',
    component: EntryLayoutWrapperComponent,
    children: [
      {
        path: '',
        component: VerificationContainerComponent,
        data: {
          type: 'verification'
        },
        children: [
          {
            path: '',
            component: VerificationComponent,
            canActivate: [RegistrationGuard],
            data: {
              type: 'personal'
            }
          }
        ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerificationRoutingModule {}
