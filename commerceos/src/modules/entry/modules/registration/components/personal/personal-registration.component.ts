import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { ApiService } from '@modules/shared/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-personal-registration',
  templateUrl: './personal-registration.component.html',
  styleUrls: ['./personal-registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalRegistrationComponent {

  userData: any;
  businessData: any;
  errorMessage: string = null;
  errorBag$: Subject<any> = new Subject();
  isCaptcha: boolean = false;
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {
    this.handleErrors = this.handleErrors.bind(this);
  }

  onFormDataReceive(data: any, needNextStep: boolean = true): void {
    this.userData = data;
    if (needNextStep) {
      this.registerPersonalAccount();
    }
  }

  registerPersonalAccount(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.authService.register({
      email: this.userData.email,
      first_name: this.userData.firstName,
      last_name: this.userData.lastName,
      password: this.userData.password,
      recaptchaToken: this.userData.recaptchaToken
      // TODO Update interface via recaptchaToken to remove any
    }).subscribe(() => {
      this.apiService.createUserAccount({
        registrationOrigin: { url: window.location.href, account: 'personal' }
      }).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/personal']);
      }, this.handleErrors);
    }, this.handleErrors);
  }

  private handleErrors(errors: any) {
    if (errors.raw?.statusCode === 401) {
      this.errorMessage = errors.raw?.message;
    }
    this.isLoading = false;
    this.errorBag$.next(errors.errorBag);
    this.isCaptcha = false; // Reset prev captcha
    this.changeDetectorRef.detectChanges();
    this.isCaptcha = errors.raw && ['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(errors.raw.reason) >= 0;
    this.changeDetectorRef.detectChanges();
  }
}
