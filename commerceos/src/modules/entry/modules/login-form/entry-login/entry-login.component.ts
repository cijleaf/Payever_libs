import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@modules/shared';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { ErrorBag, FormAbstractComponent, FormFieldType, FormScheme, InputType } from '@pe/ng-kit/modules/form';
import { retrieveLocale, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { BehaviorSubject, Observable, Subscription, of, timer } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { LoaderService } from '@app/services';

const DEBOUNCE_PERIOD = 300;

interface LoginFormInterface   {
  email: string;
  plainPassword: string;
  recaptchaToken: string;
}

const blockReasons = [
  'REASON_BLOCKED', // This one not used anymore
  'REASON_20_MINUTES_BAN',
  'REASON_3_HOURS_BAN',
  'REASON_PERMANENT_BAN'
];

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-login',
  templateUrl: './entry-login.component.html',
  styleUrls: ['./entry-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
  encapsulation: ViewEncapsulation.None
})
export class EntryLoginComponent extends FormAbstractComponent<LoginFormInterface> {
  @Input() withoutCreds: boolean;
  @Input() username: string;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSuccessLogin: EventEmitter<void> = new EventEmitter<void>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSecondFactorCode: EventEmitter<void> = new EventEmitter<void>();

  formScheme: FormScheme;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showErrorText$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  formTranslationsScope: string = 'forms.login';

  protected formStorageKey: string = null;

  constructor(
    injector: Injector,
    private apiService: ApiService,
    private authService: AuthService,
    protected errorBag: ErrorBag,
    private loaderService: LoaderService,
    private translateService: TranslateService,
    private translationLoaderService: TranslationLoaderService,
    private router: Router
  ) {
    super(injector);
  }

  onLoginClick() {
    if (this.withoutCreds) {
      this.activateAccountLang().subscribe(() => {
        this.onSuccessLogin.emit();
      });
    } else {
      this.onSubmit();
    }
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
  }

  navigateToPassword(): void {
    this.router.navigate(['/password']);
  }

  protected activateAccountLang(): Observable<boolean> {
    return this.apiService.getUserAccount().pipe(flatMap((accountModel: any) => {
      if (accountModel && accountModel.language && retrieveLocale() !== accountModel.language) {
        return this.translationLoaderService.reloadTranslations(accountModel.language).pipe(map(() => {
          return true;
        }));
      } else {
        return of(true);
      }
    }));
  }

  protected onSuccess(): void {
    this.isLoading$.next(true);
    this.showErrorText$.next(null);
    this.authService.login(this.form.value).subscribe(
      (accessToken: string) => {
        if (!accessToken) {
          this.onSecondFactorCode.emit();
        } else {
          this.activateAccountLang().subscribe(() => {
            this.onSuccessLogin.emit();
          });
        }
      },
      (errors: any) => {
        this.isLoading$.next(false);
        this.toggleControl('recaptchaToken', errors.raw && ['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(errors.raw.reason) >= 0);
        if ((errors.raw && errors.raw.reason && blockReasons.indexOf(errors.raw.reason) >= 0) || !errors.errorBag || Object.keys(errors.errorBag).length === 0) {
          // For too many tries case
          this.errorBag.setErrors({});
          timer(100).subscribe(() => this.showErrorText$.next(
            errors.raw.reason ? this.translateService.translate(`forms.login.error_reasons.${errors.raw.reason}`) : (errors.message || 'Unknown error')
          ));
        } else {
          this.errorBag.setErrors(errors.errorBag || {});
        }
      }
    );
  }

  protected onUpdateFormData(formValues: LoginFormInterface): void {
    if (this.form && !this.form.valid && this.form.get('email').getError('external')) {
      this.form.get('email').setErrors(null);
    }
    if (this.form.get('email') && !this.form.get('email').value) {
      // Small hack to prevent showing on first focus
      this.toggleControl('recaptchaToken', false);
    }
  }

  protected createForm(initialData: LoginFormInterface): void {
    this.form = this.formBuilder.group({
      email: [this.username || '', [Validators.email, Validators.required]],
      plainPassword: ['', Validators.required],
      recaptchaToken: ['', Validators.required]
    });
    this.formScheme = {
      fieldsets: {
        login: [
          {
            name: 'email',
            type: FormFieldType.Input,
            fieldSettings: {
              classList: `col-xs-12 col-sm-12 form-fieldset-field-padding-24 ${this.username ? 'hidden' : ''}`,
              required: true
            },
            inputSettings: {
              placeholder: this.translateService.translate('forms.login.email.placeholder'),
              type: InputType.Email,
              nameAttribute: 'UserName'
            }
          },
          {
            name: 'plainPassword',
            type: FormFieldType.InputPassword,
            fieldSettings: {
              classList: `col-xs-12 col-sm-12 form-fieldset-field-padding-24 ${this.username ? 'top-rounded' : ''}`,
              required: false
            },
            inputSettings: {
              placeholder: this.translateService.translate('forms.login.plainPassword.placeholder'),
            },
            inputPasswordSettings: {
              showPasswordRequirements: false,
              /*
              showForgotPassword: true,
              forgotPasswordClick: () => {
                this.router.navigate(['/password']);
              }*/
            }
          },
          {
            name: 'recaptchaToken',
            type: FormFieldType.Input,
            fieldSettings: {
              classList: `hidden`
            }
          }
        ]
      }
    };
    this.changeDetectorRef.detectChanges();
    timer().subscribe(() => {
      this.toggleControl('recaptchaToken', false);
      this.changeDetectorRef.detectChanges();
      this.loaderService.hideLoader();
    });
  }

}
