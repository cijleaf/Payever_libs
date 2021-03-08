import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { AbstractService } from '@pe/ng-kit/modules/common';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import {NavbarColor, NavbarControlType, NavbarStyle, NavbarControlPosition } from '@pe/ng-kit/modules/navbar';
import { PlatformHeaderService, PlatfromHeaderLinkControlInterface } from '@pe/ng-kit/modules/platform-header';

import { EnvService } from './env.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class HeaderService extends AbstractService {

  lastOpenedSubmicro: boolean;

  _loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  set loggedIn(value: boolean) {
    this._loggedIn$.next(value);
  }

  get loggedIn(): boolean {
    return this._loggedIn$.value;
  }

  loggedIn$: Observable<boolean> = this._loggedIn$.asObservable().pipe(
    distinctUntilChanged()
  );

  private sidebarButtonClickSubject$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private envService: EnvService,
    private platformHeaderService: PlatformHeaderService,
    private translateService: TranslateService,
    private router: Router
  ) {
    super();
  }

  get sidebarButtonClick$(): Observable<boolean> {
    return this.sidebarButtonClickSubject$.asObservable();
  }

  sidebarButtonClick(): void {
    this.sidebarButtonClickSubject$.next(true);
  }

  setPersonalDashboardHeader(): void {
    this.platformHeaderService.setPlatformHeader({
      microCode: 'commerceos',
      transparentMode: true,
      disableSubheader: true,
      appDetails: {
        icon: 'icon-commerceos-payever-logo-20',
        text: this.translateService.translate('dashboard.personal_title')
      },
      controls: [
        /*
        {
          type: NavbarControlType.Link,
          title: 'Apps',
          icon: 'icon-apps-apps',
          notSelectable: true,
          classes: 'mobile-icons-only desktop-text-only',
          callbackId: this.platformHeaderService.registerCallback(() => {
            this.router.navigate([`personal/info/apps`]);
          }, 'PersonalDashboardHeader')
        } as PlatfromHeaderLinkControlInterface,*/
      ]
    });
  }

  destroyPersonalDashboardHeader(): void {
    this.platformHeaderService.unregisterComponentCallback('PersonalDashboardHeader');
  }

  setBusinessDashboardHeader(): void {
    this.platformHeaderService.setHeaderColor(NavbarColor.DuskyLight);
    this.platformHeaderService.setHeaderStyle(NavbarStyle.Transparent);

    this.platformHeaderService.setPlatformHeader({
      microCode: 'commerceos',
      transparentMode: true,
      appDetails: {
        icon: 'icon-commerceos-payever-logo-20',
        text: this.translateService.translate('dashboard.logo_title')
      },
      disableSubheader: true,
      controls: [
        /*
        {
          type: NavbarControlType.Link,
          title: 'Apps',
          icon: 'icon-apps-apps',
          notSelectable: true,
          classes: 'mobile-icons-only desktop-text-only',
          tooltipText: this.translateService.translate('tooltips.apps'),
          callbackId: this.platformHeaderService.registerCallback(() => {
            this.router.navigate([`business/${this.envService.businessUuid}/info/apps`]);
          }, 'BusinessDashboardHeader')
        } as PlatfromHeaderLinkControlInterface,*/
      ]
    });
  }

  destroyBusinessDashboardHeader(): void {
    this.platformHeaderService.unregisterComponentCallback('BusinessDashboardHeader');
  }

  setTwoFactorPageHeader(): void {

    this.platformHeaderService.setHeaderColor(NavbarColor.DuskyLight);
    this.platformHeaderService.setHeaderStyle(NavbarStyle.Transparent);

    this.platformHeaderService.setPlatformHeader({
      microCode: 'commerceos',
      transparentMode: false,
      appDetails: {
        icon: 'icon-commerceos-payever-logo-20',
        text: 'payever'
      },
      disableSubheader: true,
      controls: []
    });
  }

  destroyTwoFactorPageHeader(): void {
    this.platformHeaderService.unregisterComponentCallback('TwoFactorPageHeader');
  }

  setEditAppsHeader(): void {
    const returnUrl = this.envService.isPersonalMode ?
      `/personal/info/overview` : `/business/${this.envService.businessUuid}/info/overview`;

    this.platformHeaderService.setPlatformHeader({
      microCode: 'commerceos',
      transparentMode: false,
      disableSubheader: true,
      appDetails: null,
      hideProfileMenu: true,
      closeConfig: {
        showClose: true,
        callbackId: this.platformHeaderService.registerCallback(() => {
          this.router.navigate([returnUrl]);
        }, 'EditAppsHeader')
      },
      controls: [
        {
          type: NavbarControlType.Link,
          title: this.translateService.translate('edit_apps.title'),
          initiallySelected: false
        } as PlatfromHeaderLinkControlInterface
      ]
    });
  }

  destroyEditAppsHeader(): void {
    this.platformHeaderService.unregisterComponentCallback('EditAppsHeader');
  }

  resetHeader(): void {
    this.platformHeaderService.setPlatformHeader(null);
  }
}
