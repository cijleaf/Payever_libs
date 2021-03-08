import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef, ViewEncapsulation
} from '@angular/core';
import { Params, Router, NavigationEnd } from '@angular/router';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { tap, takeUntil } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { isString } from "lodash-es";
import { ResizedEvent } from 'angular-resize-event';

import { PebPosApi } from '@pe/builder-api';
import { PeSimpleStepperService } from '@pe/stepper';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { ThemeSwitcherService, PeThemeEnum } from "@pe/ng-kit/modules/theme-switcher/index";
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header'; // @TODO deprecated

import { PeCheckoutHeaderService, WallpaperService } from '@app/services';

@Component({
  selector: 'cos-checkout-root',
  templateUrl: './checkout-root.component.html',
  styleUrls: [
    './checkout-root.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosCheckoutRootComponent implements OnInit, OnDestroy {

  hideHeader: boolean;
  destroyed$ = new Subject<boolean>();

  platformHeaderHeight$ = new BehaviorSubject(0);
  welcomeStepperHeight$ = new BehaviorSubject(0);

  isDashboardRoute: boolean;

  PeThemeEnum = PeThemeEnum;
  theme = this.themeSwitcherService.theme;

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private envService: PebEnvService,
    public peSimpleStepperService: PeSimpleStepperService,
    private translateService: TranslateService,
    private platformHeaderService: PlatformHeaderService,
    private pePlatformHeaderService: PeCheckoutHeaderService,
    private themeSwitcherService: ThemeSwitcherService,
    // private contactsHeaderService: PeContactsHeaderService, // TODO Why we need it?
    private cdr: ChangeDetectorRef,
    private wallpaperService: WallpaperService,
    private posApi: PebPosApi,
    // @Inject(PEB_TERMINAL_HOST) private pebTerminalHost: string,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }

  ngOnInit() {
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.hideHeader = event.url.includes('/channels/');
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'dashboard';
          this.pePlatformHeaderService.reassign();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'dashboard';

    // Hide old platform header because new checkout root component uses new platform header
    this.platformHeaderService.setPlatformHeader(null); // @TODO deprecated

    this.pePlatformHeaderService.init();
    this.wallpaperService.showDashboardBackground(false);

    this.peSimpleStepperService.hide();

    this.messageBus.listen('checkout.navigate-to-app').pipe(
      tap(data => {
        if (isString(data)) {
          this.router.navigate([`business/${this.envService.businessId}/${data}`])
        } else {
          const dataEx = data as { url: string, getParams?: Params; };
          /*
          let path = `${dataEx.url}?`;
          for (const key of keys(dataEx.getParams || {})) {
            path += `${key}=${dataEx.getParams[key]}&`;
          }
          this.router.navigate([`business/${this.envService.businessId}/${path}`]);*/
          this.router.navigate([`business/${this.envService.businessId}/${dataEx.url}`], { queryParams: dataEx.getParams });
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('checkout.back-to-dashboard').pipe(
      tap(() => this.router.navigate([`business/${this.envService.businessId}/info/overview`])),
      takeUntil(this.destroyed$),
    ).subscribe();

    // this.posHeaderService.initialize();

    // TODO Remove when deprecated welcome stepper will be completely removed
    const deprecated = document.getElementById('cos-deprecated-simple-welcome-stepper');
    if (deprecated) deprecated.style.marginTop = '-10000px';
  }

  ngOnDestroy() {
    // this.posHeaderService.destroy();

    this.destroyed$.next(true);
    this.destroyed$.complete();

    // TODO Remove when deprecated welcome stepper will be completely removed
    const deprecated = document.getElementById('cos-deprecated-simple-welcome-stepper');
    if (deprecated) deprecated.style.marginTop = null;
  }

  onPlatformHeaderResized(event: ResizedEvent) {
    this.platformHeaderHeight$.next(event.newHeight);
  }

  onWelcomeStepperResized(event: ResizedEvent) {
    this.welcomeStepperHeight$.next(event.newHeight);
  }

}
