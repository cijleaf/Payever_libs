import { Component, ChangeDetectionStrategy, EventEmitter, Injector, Input, Output, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  SelectOptionInterface,
  PeValidators,
  AutocompleteSettingsInterface,
} from '@pe/forms';
import { AddressInterface } from '@pe/ng-kit/modules/address';
import { AddressService } from '@pe/ng-kit/modules/address';
import { TranslateService } from '@pe/i18n';
import {
  ProductWithIndustriesInterface,
  ApiService,
  CoreConfigService,
  IndustryInterface,
} from '@modules/shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { AutocompleteOptions } from '@pe/forms';

const countryTelephoneCodes = require('country-telephone-code/data.json').countryTelephoneCodes;

interface CreateBusinessFormIndustryOptionsInterface extends SelectOptionInterface {
  value: string;
  slug: string;
  label: string;
  productCode: string;
}

export interface CreateBusinessFormInterface {
  businessStatus?: string;
  name?: string;
  status?: string;
  salesRange?: object;
  // country?: string;
  industry?: CreateBusinessFormIndustryOptionsInterface;
  // employeesRange?: object;
  countryPhoneCode?: string;
  phoneNumber?: string;
  // foundationYear: string;
}

const isSuggestedValueValidator = (options: BehaviorSubject<AutocompleteOptions>): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    return (control.value || !control.dirty) ? null :  {match: true}
  };
};

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-create-business-form',
  templateUrl: './create-business-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class CreateBusinessFormComponent extends FormAbstractComponent<CreateBusinessFormInterface> implements OnInit {
  @Input() set errors(errors: any) {
    this.errorBag.setErrors(errors);
  }
  @Input() isLoading: boolean;
  @Input() submitTextKey = 'actions.register';
  @Output() formDataEmitter: EventEmitter<CreateBusinessFormInterface> = new EventEmitter<
    CreateBusinessFormInterface
  >();
  @Output() submitClicked: EventEmitter<CreateBusinessFormInterface> = new EventEmitter<CreateBusinessFormInterface>();
  @Output() formHasErrorsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  address: AddressInterface = {};
  formScheme: FormScheme;
  formTranslationsScope: string = 'forms.business_create';

  protected formStorageKey: string = 'create_business.form';
  private readonly nameMaxLength: number = 40;
  private salesRangeOptions: any;
  // private employeesRangeOptions: any;
  private businessStatusOptions$: BehaviorSubject<SelectOptionInterface[]> = new BehaviorSubject<
    SelectOptionInterface[]
  >(null);
  private statusOptions$: BehaviorSubject<SelectOptionInterface[]> = new BehaviorSubject<SelectOptionInterface[]>(null);
  private industryOptions$: BehaviorSubject<CreateBusinessFormIndustryOptionsInterface[]> = new BehaviorSubject<
    CreateBusinessFormIndustryOptionsInterface[]
  >(null);
  private businessNameLabelKey$: BehaviorSubject<string> = new BehaviorSubject<string>(
    'forms.business_create.name.placeholder',
  );
  // private foundationYearOptions: any;
  private readonly DEFUALT_VALUE: CreateBusinessFormInterface = {
    countryPhoneCode: 'DE:+49',
  };
  private readonly OTHER_INDUSTRY_CODES = {
    PRODUCT_CODE: 'BUSINESS_PRODUCT_OTHERS',
    INDUSTRY_CODE: 'BRANCHE_OTHER',
  };

  private initialIndustrySlug: string;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private addressService: AddressService,
    private apiService: ApiService,
    private coreConfigService: CoreConfigService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // get initial industry from route
    this.initialIndustrySlug = (this.route.snapshot.params.industry || '').toLowerCase();

    this.apiService.getBusinessRegistrationData().subscribe(businessRegistrationData => {
      this.setBusinessStatusOptions(businessRegistrationData.businessStatuses);
      this.setStatusOptions(businessRegistrationData.statuses);
      this.setIndustriesOptions(businessRegistrationData.products);
    });

    // this.foundationYearOptions = this.getFoundationYearOptions();
    this.salesRangeOptions = this.getFormOptions(this.coreConfigService.SALES, 'sales');
  }

  onError(formControl: FormControl) {
    console.log(formControl);
  }


  protected onSuccess(): void {
    this.submitClicked.emit(this.form.value);
  }

  protected onUpdateFormData(formValues: CreateBusinessFormInterface): void {
    this.formHasErrorsEmitter.emit(!this.form.valid);

    if (formValues.businessStatus && formValues.businessStatus === 'SOLO_ENTREPRENEUR') {
      this.businessNameLabelKey$.next('forms.business_create.nameOnInvoice.placeholder');
    } else {
      this.businessNameLabelKey$.next('forms.business_create.name.placeholder');
    }
  }

  protected createForm(initial: CreateBusinessFormInterface): void {
    const detected = this.getDetectedLocale();
    const country = this.addressService.countriesContinent.find(c => c.code === detected);
    const defaultCountryPhoneCode = country ? `${country.code}:+${countryTelephoneCodes[country.code]}` : '';

    this.form = this.formBuilder.group({
      businessStatus: ['', Validators.required],
      name: ['', [PeValidators.notEmptyStringValidator(), Validators.maxLength(this.nameMaxLength)]],
      status: ['', Validators.required],
      salesRange: [this.salesRangeOptions[0].value, Validators.required],
      industry: ['', [isSuggestedValueValidator(this.industryOptions$), Validators.required]],
      // employeesRange: [this.employeesRangeOptions[0].value, Validators.required],
      countryPhoneCode: [defaultCountryPhoneCode || this.DEFUALT_VALUE.countryPhoneCode, Validators.required],
      // foundationYear: [this.foundationYearOptions[0].value, Validators.required],
      phoneNumber: [this.DEFUALT_VALUE.phoneNumber, Validators.required],
    });
    this.formDataEmitter.emit(this.form.value);

    this.formScheme = {
      fieldsets: {
        login: [
          {
            name: 'businessStatus',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-6 form-fieldset-field-padding-24',
              label: this.translateService.translate('forms.business_create.businessStatus.label'),
              required: false,
            },
            selectSettings: this.businessStatusOptions$.pipe(
              map(businessStatuses => ({
                panelClass: 'mat-select-dark',
                options: businessStatuses,
                placeholder: this.translateService.translate('forms.business_create.businessStatus.placeholder'),
              })),
            ),
          },
          {
            name: 'name',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-6 form-fieldset-field-padding-24',
              required: true,
            },
            inputSettings: this.businessNameLabelKey$.pipe(
              map(businessNameLabelKey => ({
                placeholder: this.translateService.translate(businessNameLabelKey),
              })),
            ),
          },
          {
            name: 'status',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-6 col-sm-6 form-fieldset-field-padding-24',
              label: this.translateService.translate('forms.business_create.status.label'),
              required: false,
            },
            selectSettings: this.statusOptions$.pipe(
              map(statuses => ({
                panelClass: 'mat-select-dark',
                options: statuses,
                placeholder: this.translateService.translate('forms.business_create.status.placeholder'),
              })),
            ),
          },
          {
            name: 'salesRange',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-6 col-sm-6 form-fieldset-field-padding-24',
              label: this.translateService.translate('forms.business_create.sales.label'),
              required: false,
            },
            selectSettings: {
              panelClass: 'mat-select-dark',
              options: this.salesRangeOptions,
              placeholder: this.translateService.translate('forms.business_create.sales.placeholder'),
            },
          },
          {
            name: 'industry',
            type: 'autocomplete',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-12 form-fieldset-field-padding-24',
              required: true,
            },
            autocompleteSettings: this.industryOptions$.pipe(
              map(
                industries =>
                  ({
                    options: industries,
                    placeholder: this.translateService.translate('forms.business_create.industry.placeholder'),
                    autoActiveFirstOption: true,
                    displayByField: 'label',
                    filter: (options: CreateBusinessFormIndustryOptionsInterface[], value: string) => {
                      if (value && value !== '') {
                        return options
                          .filter((option: CreateBusinessFormIndustryOptionsInterface) => {
                            return option.label.toLowerCase().indexOf(value.toLowerCase()) >= 0;
                          })
                          .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
                      }
                      return [];
                    },
                    onBlur: () => {
                      const industryFormValue = this.form.get('industry').value;
                      if (industryFormValue && !industryFormValue.value) {
                        const option = this.industryOptions$.value.find(
                          industry => industry.label === industryFormValue,
                        );
                        if (option) {
                          this.form.get('industry').setValue(option);
                        }
                      }
                    },
                  } as AutocompleteSettingsInterface),
              ),
            ),
          },
          /*
          {
            name: 'employeesRange',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-6 form-fieldset-field-padding-24',
              label: this.translateService.translate('forms.business_create.employees.label'),
              required: false,
            },
            selectSettings: {
              panelClass: 'mat-select-dark',
              options: this.employeesRangeOptions,
              placeholder: this.translateService.translate('forms.business_create.employees.placeholder')
            }
          },*/
          {
            name: 'countryPhoneCode',
            type: 'select-country',
            fieldSettings: {
              classList: 'col-xs-6 col-sm-6 form-fieldset-field-padding-24',
              label: this.translateService.translate('forms.business_create.countryPhoneCode.label'),
              required: true,
            },
            selectCountrySettings: {
              panelClass: 'mat-select-dark',
              placeholder: this.translateService.translate('forms.business_create.countryPhoneCode.placeholder'),
              scrollToInitElement: 'EU',
              panelHeight: 600,
              showPhoneCodes: true,
              addPhoneCodeToValue: true,
            },
          },
          /*
          {
            name: 'foundationYear',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-6 form-fieldset-field-padding-24',
              label: this.translateService.translate('forms.business_create.foundationYear.label'),
              required: false
            },
            selectSettings: {
              panelClass: 'mat-select-dark',
              options: this.foundationYearOptions,
              placeholder: this.translateService.translate('forms.business_create.foundationYear.placeholder'),
            },
          },*/
          {
            name: 'phoneNumber',
            type: 'phone-input',
            fieldSettings: {
              classList: 'col-xs-6 col-sm-6 form-fieldset-field-padding-24',
              label: this.translateService.translate('forms.business_create.phoneNumber.label'),
              required: true,
            },
          },
        ],
      },
    };
    this.changeDetectorRef.detectChanges();
  }

  /*
  private get countryList(): any {
    return this.addressService.countriesContinent
      .map((value: CountryContinentArrayInterface) => {
        return {
          value: value.code,
          label: value.name,
          groupId: value.continent
        };
      });
  }

  private get continentList(): any {
    return this.addressService.continents
      .map((value: ContinentArrayInterface) => {
        return {
          id: value.code,
          label: value.name
        };
      });
  }

  private get legalFormsValues(): any {
    return this.coreConfigService.LEGAL_FORMS.map((field: string) => {
      return {
        value: field,
        label: this.translateService.translate(`assets.legal_form.${field}`)
      };
    });
  }*/

  private getFormOptions(data: object[], label: string): any {
    return data.map((field: { label: string; min?: number; max?: number }) => {
      const value: { min?: number; max?: number } = {};

      if (field.min !== undefined) {
        value.min = field.min;
      }
      if (field.max !== undefined) {
        value.max = field.max;
      }

      return {
        value: value,
        label: this.translateService.translate(`assets.${label}.${field.label}`),
      };
    });
  }

  private setBusinessStatusOptions(businessStatuses: string[]) {
    this.businessStatusOptions$.next(
      businessStatuses.map((businessStatus: string) => {
        return {
          value: businessStatus,
          label: this.translateService.translate(`assets.business_status.${businessStatus}`),
        };
      }),
    );
    this.form.get('businessStatus').setValue(businessStatuses[0]);
  }

  private setStatusOptions(statuses: string[]) {
    this.statusOptions$.next(
      statuses.map((status: string) => {
        return {
          value: status,
          label: this.translateService.translate(`assets.status.${status}`),
        };
      }),
    );
    this.form.get('status').setValue(statuses[0]);
  }

  private setIndustriesOptions(products: ProductWithIndustriesInterface[]) {
    let initialIndustry: CreateBusinessFormIndustryOptionsInterface;

    this.industryOptions$.next(
      Array.prototype.concat.apply(
        [],
        products.map(product => {
          const industries = product.industries.map((industry: IndustryInterface) => ({
            value: industry.code,
            slug: industry.code.replace('BRANCHE_', '').toLowerCase(), // industry.slugs created with industry.code
            label: this.translateService.translate(`assets.industry.${industry.code}`),
            productCode: product.code,
          }));

          // check if this product has initial industry slug
          // also checks if industry is valid
          industries.every(industry => {
            if (this.initialIndustrySlug === industry.slug) {
              initialIndustry = industry;
            }
            return true;
          });

          if (this.initialIndustrySlug && !initialIndustry) {
            // For case when slug is 'home' but branch is BRANCHE_HOME_KITCHEN
            industries.every(industry => {
              if (
                this.initialIndustrySlug.indexOf(industry.slug) >= 0 ||
                industry.slug.indexOf(this.initialIndustrySlug) >= 0
              ) {
                initialIndustry = industry;
              }
              return true;
            });
          }

          return industries.filter(industry => {
            return (
              industry.value !== this.OTHER_INDUSTRY_CODES.INDUSTRY_CODE ||
              product.code === this.OTHER_INDUSTRY_CODES.PRODUCT_CODE
            );
          });
        }),
      ),
    );

    if (initialIndustry) {
      setTimeout(() => {
        this.form.get('industry').setValue(initialIndustry);
      }, 700);
    }
  }

  private getDetectedLocale(): string {
    let result: string = (require('locale2') || '').split('-')[0];
    if (result === 'nb') {
      result = 'no';
    }
    return result.toUpperCase();
  }

  /*
  private getFoundationYearOptions(): any {
    const start = 1900;
    const end = new Date().getFullYear();
    const options: object[] = [];

    for (let year = end; year >= start; year--) {
      options.push({value: year.toString(), label: year});
    }

    return options;
  }*/
}
