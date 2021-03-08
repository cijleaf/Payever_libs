import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { ApiService } from '@modules/shared';
import { Observable } from 'rxjs';
import { WindowService } from '@pe/ng-kit/src/kit/window';
import { take, filter } from 'rxjs/operators';
import { LoaderService } from '@app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'login-as-user-layout',
  templateUrl: './login-as-user-layout.component.html',
  styleUrls: [
    './login-as-user-layout.component.scss',
    '../../../../layout/layout.component.scss'
  ],
})
export class LoginAsUserLayoutComponent implements OnInit {
  isByEmail: boolean;
  city: string;
  email: string;
  name: string;
  logo: string;
  firstName: string;
  lastName: string;
  id: string;

  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(take(1), filter(isMobile => !!isMobile));

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private loaderService: LoaderService,
    private windowService: WindowService
  ) {
  }

  ngOnInit() {
    this.isByEmail = this.activatedRoute.snapshot.queryParams['isByEmail'];
    this.name = this.activatedRoute.snapshot.queryParams['name'];
    this.city = this.activatedRoute.snapshot.queryParams['city'];
    this.email = this.activatedRoute.snapshot.queryParams['email'];
    this.logo = this.activatedRoute.snapshot.queryParams['logo'];
    this.firstName = this.activatedRoute.snapshot.queryParams['firstName'];
    this.lastName = this.activatedRoute.snapshot.queryParams['lastName'];
    this.name = this.activatedRoute.snapshot.queryParams['name'];
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.loaderService.hideLoader();
  }

  onSuccessLogin(): void {
    this.authService.setToken(this.activatedRoute.snapshot.queryParams['accessToken']).subscribe(() => {
      if (this.isByEmail) {
        this.router.navigate([`business/${this.id}/info/overview`]);
      } else {
        this.apiService.getBusinessesList().subscribe(businesses => {

          if(!businesses?.length){
            this.router.navigateByUrl('/personal');
            return
          }
          if (businesses.length === 1) {
            const url: string = `business/${businesses[0]._id}/info/overview`;
            this.router.navigate([url]);
            return;
          }
          this.router.navigate(['switcher/profile']);
        });
      }
    });
    this.authService.setRefreshToken(this.activatedRoute.snapshot.queryParams['refreshToken']).subscribe();
  }

  onBack(): void {
    window.history.back();
  }

}
