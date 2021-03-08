import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Params, Router, NavigationEnd } from '@angular/router';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { tap, takeUntil } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { isString } from "lodash-es";
import { ResizedEvent } from 'angular-resize-event';

import { PeSimpleStepperService } from '@pe/stepper';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { ThemeSwitcherService, PeThemeEnum } from "@pe/ng-kit/modules/theme-switcher/index";
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header'; // @TODO deprecated

import { PeConnectHeaderService, WallpaperService } from '@app/services';
import { PebPosApi } from '@pe/builder-api';

@Component({
  selector: 'cos-connect-root',
  templateUrl: './connect-root.component.html',
  styleUrls: [
    './connect-root.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.None,
})
export class CosConnectRootComponent implements OnInit, OnDestroy {

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
    private pePlatformHeaderService: PeConnectHeaderService,
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
    this.wallpaperService.showDashboardBackground(false);
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'dashboard';
          this.pePlatformHeaderService.reassign();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'dashboard';

    this.platformHeaderService.setPlatformHeader(null); // @TODO deprecated

    if (this.router.url.indexOf('checkoutWelcomeScreen=true') > 0) {
      // Small non-necessary hack to not show header for welcome screen of checkout
    } else {
      // Hide old platform header because new connect root component uses new platform header
      this.pePlatformHeaderService.init();
    }

    this.peSimpleStepperService.hide();

    this.messageBus.listen('connect.navigate-to-app').pipe(
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

    this.messageBus.listen('connect.back-to-dashboard').pipe(
      tap(() => {
        this.router.navigate([`business/${this.envService.businessId}/info/overview`]);
      }),
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
