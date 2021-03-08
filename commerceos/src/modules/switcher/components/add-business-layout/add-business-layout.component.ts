import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, take, filter, map } from 'rxjs/operators';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { WindowService } from '@pe/ng-kit/modules/window';
import {
  LinkControlInterface, NavbarControlInterface, NavbarControlPosition,
  NavbarControlType, TextControlInterface
} from '@pe/ng-kit/modules/navbar';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { ApiService, BusinessInterface } from '../../../shared';
import { v4 as uuid } from 'uuid';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'switcher-add-business-layout',
  templateUrl: './add-business-layout.component.html',
  styleUrls: ['./add-business-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AddBusinessLayoutComponent implements OnInit {

  assetsPath: string = '/assets';
  headerControls: NavbarControlInterface[];
  businessData: any;
  errorBag: any = {};
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private translateService: TranslateService,
    private microRegistryService: MicroRegistryService,
    private platformHeaderService: PlatformHeaderService,
    private windowService: WindowService
  ) {}

  get isMobile$(): Observable<boolean> {
    return this.windowService.isMobile$.pipe(take(1), filter(isMobile => !!isMobile));
  }

  ngOnInit(): void {
    // this.loaderManagerService.showGlobalLoader(false);
    this.headerControls = [
      {
        position: NavbarControlPosition.Left,
        text: this.translateService.translate('registration.business.panels.add_new_business'),
        type: NavbarControlType.Text
      } as TextControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-x-16',
        iconPrependSize: 16,
        onClick: () => this.onSwitcherNavigate(),
        classes: 'mat-button-no-padding'
      } as LinkControlInterface
    ];
    this.platformHeaderService.setPlatformHeader(null);
  }

  onFormDataReceive(data: any, needNextStep: boolean = true): void {
    this.businessData = data;
    if (needNextStep) {
      this.createBusiness();
    }
  }

  onSwitcherNavigate(): void {
    window.history.back();
  }

  createBusiness() {
    const businessId: string = uuid();
    this.isLoading = true;
    this.apiService.registerUuid(businessId).subscribe(res => {
      this.authService.setToken(res.accessToken).subscribe(() => {
        this.addCompany(businessId);
      });
    });
  }

  addCompany(_uuid: string): void {
    this.apiService.createCompany({
      id: _uuid,
      active: true,
      name: this.businessData.name,
      companyAddress: {
        city: this.businessData.city,
        country: this.businessData.countryPhoneCode.split(':')[0],
        street: this.businessData.street,
        zipCode: this.businessData.zipCode,
      },
      companyDetails: {
        status: this.businessData.status,
        legalForm: this.businessData.legalForm,
        product: this.businessData.industry.productCode,
        industry: this.businessData.industry.value,
      },
      contactDetails: {
        phone: this.businessData.countryPhoneCode.split(':')[1] + this.businessData.phoneNumber,
      },
    }).pipe(
      switchMap((responseBusinessData: BusinessInterface) => {
        return this.microRegistryService.getRegisteredMicros(responseBusinessData._id).pipe(
          catchError(() => of([])),
          map(() => responseBusinessData)
        );
      })
    ).subscribe((responseBusinessData: BusinessInterface) => {
        this.isLoading = false;

        this.authService.refreshLoginData = {
          activeBusiness: responseBusinessData
        };

        this.router.navigate([`/business/${responseBusinessData._id}/welcome/commerceos`]);
      }, (errors: any) => {
        this.isLoading = false;
        this.errorBag = errors.errorBag;
        this.changeDetectorRef.detectChanges();
      });
  }
}
