import { AuthService } from '@pe/ng-kit/modules/auth';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { of, Subject, Observable, combineLatest } from 'rxjs';
import { catchError, switchMap, take, takeUntil, map } from 'rxjs/operators';

import { MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';

import {
  ApiService,
  BusinessInterface,
  ProfileCardInterface,
  ProfileCardType
} from '../../../shared';

import { WallpaperService } from '@app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'switcher-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitcherProfileListComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;
  showBusinessLoader$: Subject<boolean> = new Subject();
  showPersonalLoader: boolean = false;
  businessWithLoader: string;
  destroyed$: Subject<void> = new Subject();
  backgroundUrl = '';

  businessesList$: Observable<BusinessInterface[]> = combineLatest([
    this.apiService.getBusinessesList(),
    this.apiService.getUserAccount(),
  ]).pipe(
    map(([businesses, userData]) => {
      if ((userData as any).hasUnfinishedBusinessRegistration && !businesses.lenght) {
        this.router.navigate([`/entry/registration`]);
        return;
      }
      if (businesses.length === 1) {
        this.router.navigate([`business/${businesses[0]._id}/info/overview`]);
        return;
      }
      return businesses.map((business: BusinessInterface) => {
        return {
          ...business,
          name: business.name,
          _id: business._id,
          logo: business.logo ? this.mediaUrlPipe.transform(business.logo, 'images') : null,
          uuid: business._id // it is need for profile switcher
        };
      });
    }),
    takeUntil(this.destroyed$),
    catchError(() => this.router.navigate(['/entry'])),
  );

  profileCardConfig$: Observable<ProfileCardInterface> = this.businessesList$.pipe(
    takeUntil(this.destroyed$),
    map(businessesList => {
      if (businessesList && businessesList.length) {
        let activeBusiness: BusinessInterface = businessesList.find((business: BusinessInterface) => business.active);
        activeBusiness = activeBusiness ? activeBusiness : businessesList[0];
        this.authService.refreshLoginData = { activeBusiness };

        // if business count == 1 we have to pass only one image in array
        const images: string[] = businessesList.length === 1
          ? [activeBusiness.logo ? activeBusiness.logo : '']
          : [activeBusiness.logo ? activeBusiness.logo : '', ''];

        return {
          ...activeBusiness,
          type: ProfileCardType.Business,
          cardTitle: this.translateService.translate('switcher.business_type').toLocaleUpperCase(),
          placeholderTitle: activeBusiness.name,
          cardButtonText: businessesList.length > 1
            ? `${this.translateService.translate('switcher.all')} ${businessesList.length}`
            : activeBusiness.name,
          images: images,
        };
      } else {
        return {} as ProfileCardInterface;
      }
    }),
  );

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private microRegistryService: MicroRegistryService,
    private mediaUrlPipe: MediaUrlPipe,
    private router: Router,
    private translateService: TranslateService,
    private wallpaperService: WallpaperService,
    private ref: ChangeDetectorRef,
  ) {
    this.isLoading = false;
  }

  ngOnInit(): void {
    let lastBg = this.wallpaperService.lastDashboardBackground;

    if (!lastBg || !lastBg.length) {
      lastBg = localStorage.getItem('lastBusinessWallpaper');
    }

    this.backgroundUrl = `url(${lastBg})`;

    this.authService.getUserData(); // initialize auth service
    this.ref.detectChanges();
  }



  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  onProfileCardClick(): void {
    this.profileCardConfig$.pipe(
      take(1),
    ).subscribe(activeBusiness => {
      this.showBusinessLoader$.next(true);
      this.apiService.enableBusiness(activeBusiness._id).pipe(
        takeUntil(this.destroyed$),
      ).subscribe(() => {
        this.authService.refreshLoginData = {
          activeBusiness: activeBusiness
        };
        this.router.navigate(['/business', activeBusiness._id]);
      });
    });
  }

  openPersonalProfile(): void {
    this.showPersonalLoader = true;
    this.router.navigate(['/personal']);
  }

  onProfileFromListClick(business: BusinessInterface): void {
    this.businessWithLoader = business._id;

    this.apiService.enableBusiness(business._id).pipe(
      takeUntil(this.destroyed$),
      switchMap(() => this.microRegistryService.getRegisteredMicros(business._id).pipe(
        takeUntil(this.destroyed$),
        catchError(() => of([])),
      ))
    ).subscribe(() => {
      this.authService.refreshLoginData = {
        activeBusiness: business
      };
      this.router.navigate(['/business', business._id]);
    });
  }
}
