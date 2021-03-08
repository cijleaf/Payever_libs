import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Location } from '@angular/common';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  FormFieldType,
  InputType,
  PeValidators
} from '@pe/ng-kit/modules/form';
import { WindowService } from '@pe/ng-kit/modules/window';

import { entryLogo } from '../../../../settings';
import { ApiService } from '../../../shared';

interface ForgotPasswordFormInterface {
  email: string;
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag]
})
export class ForgotPasswordComponent extends FormAbstractComponent<ForgotPasswordFormInterface> {

  readonly entryLogo = entryLogo;

  success: boolean = false;
  email: string;
  isLoading: boolean = false;

  formScheme: FormScheme;
  formTranslationsScope: string = 'forms.login';

  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(take(1), filter(isMobile => !!isMobile));
  protected formStorageKey: string = null;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private apiService: ApiService,
    private windowService: WindowService,
    private router: Router,
    private location: Location,
  ) {
    super(injector);
  }

  navigateToEntry(): void {
    this.router.navigate([`/entry`]);
  }

  protected onSuccess(): void {
    this.isLoading = true;

    this.apiService.requestPasswordResetEmail(this.form.value)
      .subscribe(
        () => {
          this.email = this.form.get('email').value;
          this.success = true;
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        },
        (error: any) => {
          this.isSubmitted = true;
          this.isLoading = false;
          this.errorBag.setErrors({
            email: error.message
          });
        }
      );
  }

  protected onUpdateFormData(formValues: ForgotPasswordFormInterface): void {
    //
  }

  protected createForm(initialData: ForgotPasswordFormInterface): void {
    this.form = this.formBuilder.group({
      email: ['', PeValidators.validEmailWithDomain()],
    });
    this.formScheme = {
      fieldsets: {
        login: [
          {
            name: 'email',
            type: FormFieldType.Input,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-12 form-fieldset-field-padding-24',
              required: true,
              label: 'Email'
            },
            inputSettings: {
              placeholder: 'Email',
              type: InputType.Email
            }
          }
        ]
      }
    };
    this.changeDetectorRef.detectChanges();
  }

  back() {
    this.location.back();
  }

}
