import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@modules/shared';

import { LoginFormService } from '../login-form.service';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'login-layout',
  templateUrl: './login-layout.component.html'
})
export class LoginLayoutComponent implements OnInit {

  @Input() public email: string;

  private returnUrl: string;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loginFormService: LoginFormService,
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
  }

  onSuccessLogin(): void {
    this.loginFormService.executeAfterLoginActions();
    if (this.returnUrl) {
      const fullUrlRegexp = /^(http(s)?:\/\/.).*/;
      if (fullUrlRegexp.test(this.returnUrl)) {
        window.location.replace(this.returnUrl); // use windows instead of router because we can authenticate from external sites
      } else {
        this.router.navigateByUrl(this.returnUrl);
      }
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
  }

  onSecondFactorCode(): void {
    this.router.navigate(['entry/second-factor-code'], { queryParams: { returnUrl: this.returnUrl } });
  }
}
