import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Injector,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Validators } from '@angular/forms';
import { timer } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import {
  ErrorBag, FormAbstractComponent, FormFieldType, FormScheme,
  InputPasswordValidator, InputType, PeValidators
} from '@pe/ng-kit/modules/form';

export interface CreateUserFormInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessId?: string;
  recaptchaToken: string;
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-create-user-form',
  templateUrl: './create-user-form.component.html',
  styleUrls: ['./create-user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag]
})
export class CreateUserFormComponent
  extends FormAbstractComponent<CreateUserFormInterface> implements OnChanges {

  @Input() errors: any;
  @Input() prefilled: boolean = true;
  @Input() email: string;
  @Input() isLoading: boolean = false;
  @Input() submitTextKey = 'actions.register';
  @Output() formDataEmitter: EventEmitter<CreateUserFormInterface> = new EventEmitter<CreateUserFormInterface>();
  @Output() submitClicked: EventEmitter<CreateUserFormInterface> = new EventEmitter<CreateUserFormInterface>();
  @Output() formHasErrorsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input('isCaptcha') set setIsCaptcha(isCaptcha: boolean) {
    this.isCaptcha = isCaptcha;
    this.toggleControl('recaptchaToken', this.isCaptcha);
  }

  formScheme: FormScheme;

  isCaptcha: boolean = false;
  formTranslationsScope: string = 'forms.personal_create';

  protected formStorageKey: string = null;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private translateService: TranslateService
  ) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.errors) {
      this.errorBag.setErrors(this.errors || {});
    }
  }

  protected onSuccess(): void {
    this.submitClicked.emit(this.form.value);
  }

  protected onUpdateFormData(formValues: CreateUserFormInterface): void {
    this.formHasErrorsEmitter.emit(!this.form.valid);
    this.toggleControl('recaptchaToken', this.isCaptcha);
  }

  protected createForm(initialData: CreateUserFormInterface): void {
    this.form = this.formBuilder.group({
      // businessId: [this.prefilled ? initialData.businessId : '', PeValidators.notEmptyStringValidator()],
      firstName: [this.prefilled ? initialData.firstName : '', PeValidators.notEmptyStringValidator()],
      lastName: [this.prefilled ? initialData.lastName : '', PeValidators.notEmptyStringValidator()],
      email: [this.email || (this.prefilled ? initialData.email : ''), PeValidators.validEmailWithDomain()],
      password: [this.prefilled ? initialData.password : '', [Validators.required, InputPasswordValidator.default]],
      recaptchaToken: ['', Validators.required]
    });
    if (Object.keys(initialData).length) {
      this.formDataEmitter.emit(this.form.value);
    }
    this.formScheme = {
      fieldsets: {
        login: [
          {
            name: 'firstName',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-6 name form-fieldset-field-padding-24',
              required: true
            },
            inputSettings: {
              placeholder: this.translateService.translate('forms.personal_create.firstName.placeholder')
            }
          },
          {
            name: 'lastName',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-6 last-name form-fieldset-field-padding-24',
              required: true
            },
            inputSettings: {
              placeholder: this.translateService.translate('forms.personal_create.lastName.placeholder')
            }
          },
          {
            name: 'email',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-12 form-fieldset-field-padding-24',
              required: true,
              readonly: !!this.email
            },
            inputSettings: {
              placeholder: this.translateService.translate('forms.personal_create.email.placeholder'),
              type: InputType.Email
            }
          },
          {
            name: 'password',
            type: 'input-password',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-12 form-fieldset-field-padding-24',
              required: true
            },
            inputSettings: {
                placeholder: this.translateService.translate('forms.login.plainPassword.placeholder'),
            },
            inputPasswordSettings: {
                showPasswordRequirements: true,
                showForgotPassword: false,
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
    timer().subscribe(() => {
      this.toggleControl('recaptchaToken', false);
      this.changeDetectorRef.detectChanges();
    });
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
  }
}
