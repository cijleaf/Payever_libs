import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthService, RegisterPayload } from '@pe/ng-kit/modules/auth/';

import { EnvironmentConfigService, NodeJsBackendConfigInterface } from '@pe/ng-kit/modules/environment-config';
import { LANG, TranslateService } from '@pe/ng-kit/modules/i18n';

import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo, shareReplay, switchMap } from 'rxjs/operators';

import { BusinessInterface, NotificationInterface, FeatureInterface, TransactionInterface, UserLogoInterface, CreateUserAccountInterface } from '../interfaces';
import { UserFilters } from '../interfaces/user-filters.interface';

export interface IErrorAPIDetails { // TODO We don't use "I" prefix
  children: any[];
  constraints: {
    [key: string]: string
  };
  property: string;
  value: string;
}

export interface IErrorAPIResponse { // TODO We don't use "I" prefix
  error: {
    errors: IErrorAPIDetails[];
    message: string;
    statusCode: number;
  };
  status: number;
  message: string;
}

export interface IndustryInterface {
  code: string;
  slug: string;
}

export interface ProductWithIndustriesInterface {
  code: string;
  industries: IndustryInterface[];
}

export interface BusinessRegistrationData {
  businessStatuses: string[];
  products: ProductWithIndustriesInterface[];
  statuses: string[];
}

export interface RegisterEmployeeAndConfirmBusinessBodyInterface {
  businessId?: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface TokensInterface {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class ApiService {

  get config(): NodeJsBackendConfigInterface {
    return this.configService.getBackendConfig();
  }

  constructor(
    private httpClient: HttpClient,
    private configService: EnvironmentConfigService,
    private translateService: TranslateService,
    private authService: AuthService,
    @Inject(LANG) private lang: string,
  ) {
  }

  getUserLogo(email: string): Observable<UserLogoInterface> {
    const url: string = `${this.config.auth}/api/user-logo/${email}`;
    return this.httpClient.get<UserLogoInterface>(url).pipe(
      catchError((error: Response) => throwError(error)));
  }

  // TODO: implement real API call hen BE is ready
  getNotifications(): Observable<NotificationInterface[]> {
    return of([]);
  }

  getTransactions(pattern: string, limit: number, businessId: string): Observable<TransactionInterface[]> {
    const url: string = `${this.config.transactions}/api/business/${businessId}/list`;
    let params = new HttpParams();
    params = params.append('limit', limit.toString() || '10');
    params = params.append('query', pattern);
    params = params.append('orderBy', 'created_at');
    params = params.append('direction', 'desc');

    return this.httpClient.get<any>(url, { params: params }).pipe(
      map(data => data.collection),
      catchError((error: Response) => throwError(error)));
  }

  getBusinessesList(): Observable<any> {
    const url: string = `${this.config.users}/api/business`;
    return this.httpClient.get(url).pipe(
      catchError((error: Response) => throwError(error)),
      shareReplay(1),
    );
  }

  getUsersByFilters(filters: UserFilters, limit: number): Observable<{ id: number }[]> {
    const url: string = `${this.config.auth}/api/users`;
    let params = new HttpParams();
    params = params.append('limit', limit.toString() || '100');
    if (filters.email) {
      params = params.append('filters[email]', filters.email);
    }

    if (filters.roles) {
      filters.roles.forEach(role => params = params.append('filters[roles][]', role));
    }

    return <Observable<{ id: number }[]>>this.httpClient.get(url, { params: params }).pipe(
      catchError((error: Response) => throwError(error)),
    );
  }

  getBusinessesListWithParams(userIds: number[], query: string): Observable<any> {
    const url: string = `${this.config.users}/api/business`;
    let params = new HttpParams();
    params = params.append('admin', 'true');
    params = params.append('query', query);
    userIds.forEach(id => params = params.append('userIds[]', id.toString()));
    return this.httpClient.get(url, { params: params }).pipe(
      catchError((error: Response) => throwError(error)));
  }

  getBusinessData(businessId: string): Observable<any> {
    const url: string = `${this.config.users}/api/business/${businessId}`;
    return this.httpClient.get(url).pipe(
      catchError((error: Response) => throwError(error)));
  }

  getAppsData(businessId: string, data: any): Observable<any> {
    const url: string = `${this.config.commerceos}/api/apps/business/${businessId}`;
    return this.httpClient.get<any>(url, data).pipe(
      catchError((error: Response) => throwError(error)));
  }


  getBusinessWallpaper(businessId: string) {
    return this.httpClient.get(`${this.config.wallpapers}/api/business/${businessId}/wallpapers`);
  }

  getPersonalWallpaper() {
    return this.httpClient.get(`${this.config.wallpapers}/api/personal/wallpapers`);
  }

  getUserAccount() {
    return this.httpClient.get(`${this.config.users}/api/user`).pipe(
      catchError((error: Response) => throwError(error)),
      map(user => user || {})
    );
  }

  createUserAccount(data?: CreateUserAccountInterface): Observable<void> {
    const url: string = `${this.config.users}/api/user`;
    data = data || {};
    console.log(`%c register data ${JSON.stringify(data)}`, `font-size:30px; color:red; background-color:black;`);
    console.log(`%c register data from token ${JSON.stringify(JSON.parse(atob(this.authService.token.split('.')[1])))}`, `font-size:30px; color:red; background-color:black;`);
    return this.httpClient.post<void>(url, data).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  addBusinessToUser(userId: string, businessId: string): Observable<void> {
    const url: string = `${this.config.users}/api/user/${userId}/business/${businessId}`;
    console.log(`%c add business data ${JSON.stringify(businessId)}`, `font-size:30px; color:red; background-color:black;`);
    return this.httpClient.patch<void>(url, businessId).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  getBusinessProductWithIndustriesList(): Observable<ProductWithIndustriesInterface[]> {
    const url: string = `${this.config.commerceos}/api/business-products`;
    return this.httpClient.get<ProductWithIndustriesInterface[]>(url).pipe(
      catchError((error: Response) => throwError(error)));
  }

  getBusinessRegistrationData(): Observable<BusinessRegistrationData> {
    const url: string = `${this.config.commerceos}/api/business-registration/form-data`;
    return this.httpClient.get<BusinessRegistrationData>(url).pipe(
      catchError((error: Response) => throwError(error)));
  }

  enableBusiness(businessId: string): Observable<any> {
    const url: string = `${this.config.users}/api/business/${businessId}/enable`;
    return this.httpClient.patch<any>(url, {}).pipe(
      catchError((error: Response) => throwError(error)));
  }

  createCompany(data: any): Observable<BusinessInterface> {
    const url: string = `${this.config.users}/api/business`;
    return this.httpClient.post<BusinessInterface>(url, data).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  registerUuid(businessId: string): Observable<any> {
    const url: string = `${this.config.auth}/api/${businessId}`;
    return this.httpClient.put<any>(url, {}).pipe(
      catchError((error: Response) => throwError(error)));
  }

  requestPasswordResetEmail(data: any): Observable<any> {
    const url: string = `${this.config.auth}/api/forgot`;
    return this.httpClient.post<any>(url, data).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  resetPassword(data: any, token: string): Observable<any> {
    const url: string = `${this.config.auth}/api/reset/${token}`;
    return this.httpClient.post<any>(url, data).pipe(
      catchError((errors: IErrorAPIResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
    );
  }

  verifyEmail(token: string): Observable<any> {
    const url: string = `${this.config.auth}/api/confirm/${token}`;
    return this.httpClient.post<any>(url, {}).pipe(
      catchError((error: Response) => throwError(error)));
  }

  toggleInstalledApp(businessId: string, data: any): Observable<any> {
    const url: string = `${this.config.commerceos}/api/apps/business/${businessId}/toggle-installed`;
    return this.httpClient.post<any>(url, data).pipe(
      catchError((error: Response) => throwError(error)));
  }

  checkEmployeeIsRegistered(id: string): Observable<boolean> {
    const url: string = `${this.config.auth}/api/employees/${id}/isRegistered`;
    return this.httpClient.get<boolean>(url);
  }

  // registerEmployeeAndConfirmBusiness(
  //   id: string,
  //   businessId: string,
  //   email: string,
  //   body: RegisterEmployeeAndConfirmBusinessBodyInterface,
  //   // businessId: string,
  // ): Observable<void> {
  //   const url: string = `${this.config.auth}/api/employees/confirm/${id}`;
  //   return this.httpClient.patch<TokensInterface>(url, body)
  //     .pipe(
  //       switchMap((tokens: TokensInterface) => this.authService.setTokens(tokens)),
  //       switchMap(() =>
  //         this.createUserAccount({
  //           email,
  //           first_name: body.first_name,
  //           last_name: body.last_name,
  //           businessId: businessId
  //         })
  //           .pipe(
  //             mapTo(null)
  //           )
  //       )
  //     );
  // }

  registerEmployeeAndConfirmBusiness(
    id: string,
    businessId: string,
    email: string,
    body: RegisterEmployeeAndConfirmBusinessBodyInterface,
  ): Observable<void> {
    const url: string = `${this.config.auth}/api/employees/confirm/${id}`;
    console.log(`%c register data ${JSON.stringify(body)}`, `font-size:30px; color:red; background-color:black;`);
    console.log(`%c register data ID ${JSON.stringify(id)}`, `font-size:30px; color:red; background-color:black;`);
    console.log(`%c register dataBUSINESSID ${JSON.stringify(businessId)}`, `font-size:30px; color:red; background-color:black;`);
    return this.httpClient.patch<TokensInterface>(url, body)
      .pipe(
        switchMap((tokens: TokensInterface) => this.authService.setTokens(tokens)),
        switchMap(() => {
          return this.createUserAccount({
            registrationOrigin: { url: window.location.href, account: 'employee' }
          }).pipe(
            mapTo(null)
          )
        }),
        switchMap(() => {
          return this.addBusinessToUser(
            id,
            businessId,
          )
            .pipe(
              mapTo(null)
            )
        })
      );
  }

  confirmBusinessForEmployee(businessId: string, employeeId: string): Observable<void> {
    const url: string = `${this.config.auth}/api/employees/confirm/${businessId}/${employeeId}`;
    return this.httpClient.post<void>(url, {});
  }

  getSubscriptionInfo(appName: string): Observable<FeatureInterface> {
    if (!this.config[appName]) {
      console.error('Cant get subscription info', appName);
    }
    const url = `${this.config[appName]}/api/subscriptions/features`;

    return this.httpClient.get<FeatureInterface>(url);
  }

  startTrial(appName: string, businessId: string): Observable<void> {
    const url: string = `${this.config[appName]}/api/subscriptions/trials/${businessId}`;
    return this.httpClient.post<void>(url, {
      appName: appName
    });
  }

  private createErrorBag(errors: IErrorAPIResponse): any {
    const result: any = {
      errorBag: {},
    };

    switch (errors.status) {
      case 401:
        result.errorBag['email'] = this.translateService.translate('forms.error.unauthorized.invalid_credentials');
        result.errorBag['plainPassword'] = this.translateService.translate('forms.error.unauthorized.invalid_credentials');
        break;
      case 400:
        const errorList: any = errors.error.errors;
        if (errorList) {
          const errorBag: any = result.errorBag;
          if (errorList instanceof Array) {
            errorList.forEach((paramError: any) => {
              const errorText: string = Object.keys(paramError.constraints)
                .reduce((res, key) => res + paramError.constraints[key], '');

              errorBag[paramError.property] = this.translateService.translate(errorText);
            });
          } else {
            Object.keys(errorList).forEach(key => {
              const keyVal: any = errorList[key];
              if (keyVal && keyVal.message) {
                errorBag[key] = this.translateService.translate(keyVal.message);
              }
            });
          }
        }
        break;
      default:
    }

    if (errors.error.message) {
      result['message'] = errors.error.message;
    }

    return result;
  }
}
