import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { cloneDeep, assign } from 'lodash-es';

import { MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { PePlatformHeaderConfig, PePlatformHeaderService, PePlatformHeaderItem } from '@pe/platform-header';

import { BusinessInterface } from '@modules/shared';
import { HeaderService } from '@app/services/header.service';
import { EnvService } from '@app/services/env.service';

@Injectable({
  providedIn: 'platform'
})
export class PlatformHeaderService extends PePlatformHeaderService {

  config$: Observable<PePlatformHeaderConfig> = null;
  routeChanged$: Subject<string> = new Subject<string>();
  closeButtonClicked$: Subject<void> = new Subject<void>();
  previousUrlForBackChanged$: Subject<string> = new Subject<string>();

  contactHref: string = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref: string =
    'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';

  /** Used to change current micro base url
   * If user clicks on something that need to show short header
   * This changing previousUrl so user could come back to the right place if he clicks 'Close"
   */
  previousUrl: string;

  private configData$: BehaviorSubject<PePlatformHeaderConfig> = new BehaviorSubject(null);

  private authService: AuthService = this.injector.get(AuthService);
  private headerService: HeaderService = this.injector.get(HeaderService);
  private mediaUrlPipe: MediaUrlPipe = this.injector.get(MediaUrlPipe);
  private oldEnvService: EnvService = this.injector.get(EnvService);
  private router: Router = this.injector.get(Router);

  constructor(private injector: Injector) {
    super();

    this.config$ = this.configData$; // TODO add .asObservable() when other apps don't use config$.next() and config$.getValue()
    this.previousUrlForBackChanged$.asObservable().pipe(
      tap((url) => {
        this.previousUrl = url;
      })
    ).subscribe();
  }

  get config(): PePlatformHeaderConfig {
    return this.configData$.getValue();
  }

  /** @deprecated use setConfig(...) instead */
  set config(config: PePlatformHeaderConfig) {
    this.configData$.next(config);
  }

  setConfig(config: PePlatformHeaderConfig) {
    this.configData$.next(config);
  }

  assignConfig(config: PePlatformHeaderConfig) {
    const data = cloneDeep(this.configData$.getValue());
    assign(data, config);
    this.configData$.next(data);
  }

  setShortHeader(shortHeaderTitleItem: PePlatformHeaderItem): void {
    const config: PePlatformHeaderConfig = this.config;
    config.shortHeaderTitleItem = shortHeaderTitleItem;
    config.isShowShortHeader = true;
    config.currentMicroBaseUrl = this.previousUrl || config.currentMicroBaseUrl;
    this.configData$.next({ ...config });
  }

  setFullHeader(): void {
    const config: PePlatformHeaderConfig = this.configData$.getValue();
    config.shortHeaderTitleItem = null;
    config.isShowShortHeader = false;
    this.configData$.next({ ...config });
  }

  // Default extended right part

  onSearchClick = () => {
    const businessUuid: string = this.oldEnvService.businessUuid;
    if (this.oldEnvService.isPersonalMode) {
      this.router.navigate([`personal/info/search`]);
    } else {
      this.router.navigate([`business/${businessUuid}/info/search`]);
    }
  };

  onNotificationsClick = () => {
    this.headerService.sidebarButtonClick();
  };

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
  };

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  };

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  };

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  };

  assignAppPlatformMenu(businessData?: BusinessInterface): void {

    const logo = businessData?.logo || null;
    const config: PePlatformHeaderConfig = {
      mainDashboardUrl: businessData
        ? `/business/${businessData._id}/info/overview`
        : '',
        currentMicroBaseUrl:'',
      closeItem: {
        title: 'Close',
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px',
      },
      isShowCloseItem: true,
      rightSectionItems: [
        {
          icon: '#icon-menu-search',
          iconSize: '14px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-n-bell-32',
          iconSize: '14px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-hamburger-16',
          iconSize: '14px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
          ],
        },
      ],
      isShowBusinessItemText:true,
      businessItem: {
        title: businessData?.name || '',
        icon:
          logo
            ? this.mediaUrlPipe.transform(logo, 'images')
            : '#icon-account-circle-24',
        iconSize: logo ? '18px' : '14px',
        iconType: logo ? 'raster' : 'vector',
      },
      isShowBusinessItem: true,
      isShowShortHeader:false
    } as PePlatformHeaderConfig;

    this.assignConfig(config);
  }
}
