import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SNACK_BAR_TOGGLE_TIMEOUT } from '@modules/constants/snack-bar-toggle-timeout';
import { CreateUserFormInterface } from '@modules/entry/modules/create-user-form/create-user-form.component';
import { LoginFormService } from '@modules/entry/modules/login-form';
import { ApiService } from '@modules/shared/services';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { ErrorNormalizerService } from '@pe/ng-kit/modules/form';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { SnackBarService } from '@pe/ng-kit/modules/snack-bar';
import { WindowService } from '@pe/ng-kit/modules/window';

interface TokenDataInterface {
  id: string;
  businessId: string;
}

enum ModeEnum {
  loading = 1,
  login = 2,
  register = 3,
  none = 4
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class VerificationComponent extends AbstractComponent implements OnInit {

  public mode$: BehaviorSubject<ModeEnum> = new BehaviorSubject<ModeEnum>(ModeEnum.loading);
  public readonly isMobile$: Observable<boolean> = this.windowService.isMobile$;
  public readonly errorBag$ = new Subject<any>();

  public isLoading: boolean = false;
  public errorText: string = null;

  public userData: CreateUserFormInterface;
  public businessData: any;
  public email: string;
  public readonly ModeEnum = ModeEnum;

  private token: string;
  private tokenData: TokenDataInterface;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private errorNormalizerService: ErrorNormalizerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private loginFormService: LoginFormService,
    private translateService: TranslateService,
    private snackBarService: SnackBarService,
    private windowService: WindowService
  ) {
    super();
    this.handleErrors = this.handleErrors.bind(this);
  }

  ngOnInit(): void {

    this.authService.clearSession().pipe(takeUntil(this.destroyed$)).subscribe();

    const snapshot = this.activatedRoute.snapshot;
    this.token = snapshot.queryParamMap.get('token') || '';
    this.email = snapshot.queryParamMap.get('email') || '';

    let error = false;
    try {
      this.tokenData = JSON.parse(atob(this.token.split('.')[1])) as TokenDataInterface;
    } catch (e) {
      error = true;
    }

    const errorAccrued = error || !this.token || !this.email || !this.tokenData.id || !this.tokenData.businessId;

    if (errorAccrued) {
      this.router.navigate(['/']);
      return;
    }

    this.apiService.checkEmployeeIsRegistered(this.tokenData.id).subscribe(isRegistered => {
      this.mode$.next(isRegistered ? ModeEnum.login : ModeEnum.register);
    }, error => {
      this.errorText = error.error && error.error.message ? error.error.message : 'Unknown error!';
      this.mode$.next(ModeEnum.none);
    });

    this.loginFormService.addAfterLoginActions(() => {
      if (!this.destroyed$.isStopped) {
        this.apiService.confirmBusinessForEmployee(this.tokenData.businessId, this.tokenData.id).pipe(takeUntil(this.destroyed$))
          .subscribe(
            () => this.showSuccessSnackBar(),
            // TODO Add error handler
            () => undefined
          );
      }
    });
  }

  onFormDataReceive(data: any, needNextStep: boolean = true): void {
    this.userData = data;
    console.log(`%c user data ${JSON.stringify(this.userData)}`,`font-size:30px; color:white; background-color:black;`);
    console.log(`%c business data ${JSON.stringify(this.tokenData.businessId)}`,`font-size:30px; color:white; background-color:black;`);
    if (needNextStep) {
      this.registerPersonalAccount();
    }
  }

  registerPersonalAccount(): void {
    this.isLoading = true;
    this.apiService
      .registerEmployeeAndConfirmBusiness(
        this.tokenData.id,
        this.tokenData.businessId,
        this.email,
        {
          businessId: this.tokenData.businessId,
          first_name: this.userData.firstName,
          last_name: this.userData.lastName,
          password: this.userData.password
        }
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => {
          this.showSuccessSnackBar();
          this.router.navigate(['switcher/profile']);
          this.isLoading = false;
        },
        this.handleErrors
      );
  }

  private showSuccessSnackBar() {
    this.snackBarService.toggle(
      true,
      this.translateService.translate(
        'forms.business_verification.success'
      ),
      {
        duration: SNACK_BAR_TOGGLE_TIMEOUT,
        showClose: true,
        panelClass: [
          'snack-bar-centered',
          'snackbar-settings',
          'snackbar-icon-left'
        ]
      }
    );
  }

  private handleErrors(errors: any) {
    if (errors.error && errors.error.message) {
      this.errorText = String(errors.error.message);
    }
    else if (errors.error && errors.error.errors) {
      this.errorText = String(errors.error.errors);
    }
    else {
      this.errorText = 'Unknown error!';
    }
    this.errorBag$.next(errors.errorBag || this.errorNormalizerService.nodejsToFlat(errors.error.errors));
    this.isLoading = false;
  }
}
