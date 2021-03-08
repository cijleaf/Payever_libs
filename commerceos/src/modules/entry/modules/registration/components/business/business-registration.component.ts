import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { takeUntil, switchMap } from 'rxjs/operators';
import { isEqual, isUndefined, keys } from 'lodash-es';

import { TrafficSourceService } from '@app/services';
import { TrafficSourceInterface } from '@modules/shared/interfaces';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { ApiService } from '@modules/shared';
import { AbstractComponent, FrontendAppsEnum } from '@pe/ng-kit/modules/common';
import { CreateBusinessFormInterface } from '..';

enum RegisterStep {
  Account = 'account',
  Business = 'business',
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-business-registration',
  templateUrl: './business-registration.component.html',
  styleUrls: ['./business-registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessRegistrationComponent extends AbstractComponent {
  RegisterStep = RegisterStep;
  userData: any;
  errorMessage: string = null;
  businessData: CreateBusinessFormInterface;
  errorBag: any = {};

  currentStep = RegisterStep.Account;
  isLoading: boolean = false;
  isCaptcha: boolean = false;

  formValid = {
    [RegisterStep.Business]: false,
    [RegisterStep.Account]: false
  };

  private initialApp: string;

  // these are either not an app or not allow in url
  private readonly frontendAppsNotAllowed: string[] = [
    'Builder',
    'CheckoutWrapper',
    'Commerceos',
    'PosClient',
    'ShopsClient',
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private trafficSourceService: TrafficSourceService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroyed$))
      .subscribe(params => {
        // get initial App from route
        // check if it is valid
        if (!isUndefined(params.app)) {
          let appNameIsValid = false;

          keys(FrontendAppsEnum)
            .filter(key => this.frontendAppsNotAllowed.indexOf(key) === -1)
            .map(key => {
              if (!appNameIsValid && FrontendAppsEnum[key] === params.app) {
                appNameIsValid = true;
              }
            });

          if (appNameIsValid) {
            this.initialApp = params.app;
          } else {
            // if not valid redirect to default register page
            this.router.navigate(['/entry/registration/business']);
          }
        }
      });
    if (this.authService.token && JSON.parse(atob(this.authService.token.split('.')[1])).user) {
      this.currentStep = RegisterStep.Business;
      this.changeDetectorRef.detectChanges();
    }
  }

  onFormDataReceive(panelName: RegisterStep, data: any, needNextStep: boolean = true): void {
    if (panelName === RegisterStep.Account) {
      this.userData = data;
      if (needNextStep && this.formValid[RegisterStep.Account]) {
        this.createUserAccount();
      }
    } else {
      this.businessData = data;
      if (needNextStep && this.formValid[RegisterStep.Business]) {
        this.createBusiness();
      }
    }
  }

  onFormErrorReceive(hasErrors: boolean, formName: RegisterStep): void {
    this.formValid[formName] = !hasErrors;
  }

  /*onRegistration(): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML =
      "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n" +
      "        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n" +
      "      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n" +
      "      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n" +
      "    })(window,document,'script','dataLayer','GTM-MBL7K5');";
    document.getElementsByTagName('head')[0].appendChild(script);
  }*/

  private createUserAccount() {
    this.isLoading = true;
    this.errorMessage = null;
    this.authService.register({
      email: this.userData.email,
      first_name: this.userData.firstName,
      last_name: this.userData.lastName,
      password: this.userData.password
    }).pipe(
      switchMap(() => this.apiService.createUserAccount({
        hasUnfinishedBusinessRegistration: true,
        registrationOrigin: { url: window.location.href, account: 'merchant' }
      })),
    ).subscribe(() => {
      this.isLoading = false;
      this.currentStep = RegisterStep.Business;
      this.changeDetectorRef.detectChanges();
    }, (errors: any) => {
      console.log('---------------------: ', errors);
      this.isLoading = false;
      if (isEqual(this.errorBag, {})) {
        // For network error
        this.errorBag['email'] = 'Unknown error';
      }
      if (errors.raw?.statusCode === 401) {
        this.errorMessage = errors.raw?.message;
      }
      this.errorBag = errors.errorBag;
      this.isCaptcha = false; // Reset prev captcha
      this.changeDetectorRef.detectChanges();
      this.isCaptcha = errors.raw && ['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(errors.raw.reason) >= 0;
      this.changeDetectorRef.detectChanges();
    });
  }

  private createBusiness() {
    const businessId: string = uuid();
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.registerUuid(businessId).subscribe(res => {
      this.authService.setToken(res.accessToken).subscribe(() => {
        this.addCompany(businessId);
      });
    });
  }

  private addCompany(businessId: string) {
    const trafficSource: TrafficSourceInterface = this.trafficSourceService.getSource();

    const createCompanyData = {
      id: businessId,
      name: this.businessData.name,
      email: this.userData ? this.userData.email : null,
      firstName: this.userData ? this.userData.firstName : null,
      lastName: this.userData ? this.userData.lastName : null,
      companyAddress: {
        // country: this.businessData.country,
        country: this.businessData.countryPhoneCode.split(':')[0],
      },
      companyDetails: {
        /*
        industry: this.businessData.industry,
        product: this.businessData.product,
        employeesRange: this.businessData.employeesRange,
        salesRange: this.businessData.salesRange,
        foundationYear: this.businessData.foundationYear,
        */
        businessStatus: this.businessData.businessStatus,
        status: this.businessData.status,
        salesRange: this.businessData.salesRange,
        product: this.businessData.industry.productCode,
        industry: this.businessData.industry.value,
        phone: this.businessData.countryPhoneCode.split(':')[1] + this.businessData.phoneNumber,
        employeesRange: null as string,
        foundationYear: null as string,
      },
      /* contactDetails: {
        phone: this.businessData.phone,
      }, */
    };

    if (trafficSource) {
      createCompanyData['trafficSource'] = trafficSource;
    }

    this.apiService
      .createCompany(createCompanyData)
      .subscribe((responseBusinessData: any) => {
        this.isLoading = false;

        // remove traffic source data
        this.trafficSourceService.removeSource();

        if (!this.initialApp) {
          this.router.navigate([`/business/${responseBusinessData._id}/info/overview`]);
        } else {
          this.router.navigate([`/business/${responseBusinessData._id}/welcome/${this.initialApp}`]);
        }
      }, (errors: any) => {
        this.isLoading = false;
        if (errors.raw?.statusCode === 401) {
          this.errorMessage = errors.raw?.message;
        }
        this.errorBag = errors.errorBag;
        this.changeDetectorRef.detectChanges();
      });
  }

}
