import { Component, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { AbstractComponent, PlatformService } from '@pe/ng-kit/modules/common';
import {
  NavbarColor,
  NavbarControl,
  NavbarControlPosition, NavbarControlType,
  NavbarPosition,
  NavbarStyle, TextControlInterface
} from '@pe/ng-kit/modules/navbar';

import { DashboardDataService, HeaderService, EnvService } from '../../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'platform-header-component',
  templateUrl: './platform-header.component.html',
  styleUrls: ['platform-header.component.scss']
})
export class PlatformHeaderComponent extends AbstractComponent {

  @Input() businessesCount: number = 1;
  @Input() isPersonalAccountMode: boolean = false;

  loggedIn$: Observable<boolean> = this.headerService.loggedIn$;
  color: NavbarColor = NavbarColor.DuskyLight;
  position: NavbarPosition = NavbarPosition.FixedTop;
  style: NavbarStyle = NavbarStyle.Transparent;

  isTranslations$: Observable<boolean> = this.translationLoaderService.loadTranslations('commerceos-app').pipe(
    shareReplay(1)
  );

  showBadConnectionAlert$ = this.platformService.internetConnectionStatus$.pipe(
    map((connectionEnabled: boolean) => !connectionEnabled)
  );

  connectionControls: NavbarControl[] = [
    {
      text: 'You have some problems with internet connection',
      position: NavbarControlPosition.Center,
      type: NavbarControlType.Text,
      iconPrepend: 'icon-warning-20',
      iconPrependSize: 16
    } as TextControlInterface
  ];

  constructor(
    public dashboardDataService: DashboardDataService,
    private headerService: HeaderService,
    private platformService: PlatformService,
    private translationLoaderService: TranslationLoaderService,
  ) {
    super();
  }

  navigateToSwitcher(): void {
    this.platformService.dispatchEvent({
      target: 'switcher-back',
      action: ''
    });
  }

  notificationsButtonClick(): void {
    this.headerService.sidebarButtonClick();
  }

}
