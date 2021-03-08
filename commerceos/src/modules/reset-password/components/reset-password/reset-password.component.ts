import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import {AbstractControl, ValidationErrors, Validators} from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap, filter, take } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme, FormFieldType, InputPasswordValidator } from '@pe/ng-kit/modules/form';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { WindowService } from '@pe/ng-kit/modules/window';

import { entryLogo } from '../../../../settings';
import { ApiService } from '../../../shared';
import { ResetPasswordFormInterface } from '../../interfaces';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag]
})
export class ResetPasswordComponent extends FormAbstractComponent<ResetPasswordFormInterface> {

  readonly entryLogo = entryLogo;

  success: boolean = false;
  formScheme: FormScheme;

  formTranslationsScope: string = 'forms.reset_password';
  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(take(1), filter(isMobile => !!isMobile));

  protected formStorageKey: string = null;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private windowService: WindowService,
    private translateService: TranslateService
  ) {
    super(injector);
    this.validateConfirmPassword = this.validateConfirmPassword.bind(this);
  }

  protected onSuccess(): void {
    this.activatedRoute.params.pipe(
      take(1),
      mergeMap((params: Params) => {
        return this.apiService.resetPassword({ plainPassword: this.form.value.password }, params['token']);
      }))
      .subscribe(
        () => {
          this.success = true;
          this.changeDetectorRef.detectChanges();
        },
        (errors: any) => {
          this.errorBag.setErrors({
            newPassword: errors.error.message
          });
          this.changeDetectorRef.detectChanges();
        });
  }

  protected onUpdateFormData(formValues: ResetPasswordFormInterface): void {}

  protected createForm(initialData: ResetPasswordFormInterface): void {
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, InputPasswordValidator.default]],
      confirm_password: ['', [Validators.required]]
    }, { validator: this.validateConfirmPassword });
    this.formScheme = {
      fieldsets: {
        reset_password: [
          {
            name: 'password',
            type: FormFieldType.InputPassword,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-12 form-fieldset-field-padding-24 new-password-control',
              required: true
            },
            inputSettings: {
              placeholder: this.translateService.translate(`${this.formTranslationsScope}.password.placeholder`)
            },
            inputPasswordSettings: {
              showPasswordRequirements: true
            }
          },
          {
            name: 'confirm_password',
            type: FormFieldType.InputPassword,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-12 form-fieldset-field-padding-24',
              required: true
            },
            inputSettings: {
              placeholder: this.translateService.translate(`${this.formTranslationsScope}.confirm_password.placeholder`)
            },
            inputPasswordSettings: {
              showPasswordRequirements: false
            }
          }
        ]
      }
    };
    this.changeDetectorRef.detectChanges();
  }

  private validateConfirmPassword(formGroup: AbstractControl): ValidationErrors {
    const value = formGroup.value;
    if (value.password.length > 0 && formGroup.get('password').valid) {
      if (value.password !== value.confirm_password) {
        this.errorBag.setErrors({
          confirm_password: this.translateService.translate(`${this.formTranslationsScope}.errors.confirm_password`)
        });
        this.changeDetectorRef.detectChanges();
      }
      return value.password === value.confirm_password ? null : {confirm_password: true};
    }
    return null;
  }

}
