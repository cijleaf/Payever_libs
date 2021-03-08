import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { AppSetUpStatusEnum, AppSetUpService } from '@pe/ng-kit/modules/micro';

import {
  PeStepperService,
  PeWelcomeStep,
  PeWelcomeStepAction,
  PeWelcomeStepperAction,
  PeWelcomeStepperControl,
} from '@pe/stepper';
import { take, first, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '../../../shared';
import { AppLauncherService, WallpaperService } from '../../../../apps/standalone/app/services';
import { LoaderService } from '@modules/shared/services';
import { combineLatest } from 'rxjs';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'welcome-screen-business',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss'],
})
export class WelcomeScreenComponent extends AbstractComponent implements OnInit {
  isLoading: boolean;

  readonly defaultPricingLink = 'https://getpayever.com/';
  readonly defaultTermsLink = 'https://getpayever.com/';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private appLauncherService: AppLauncherService,
    private translateService: TranslateService,
    private platformHeaderService: PlatformHeaderService,
    private wallpaperService: WallpaperService,
    private domSanitizer: DomSanitizer,
    private peStepperService: PeStepperService,
    private environmentConfigService: EnvironmentConfigService,
    private appSetUpService: AppSetUpService,
    private loaderService: LoaderService,
  ) {
    super();
  }

  ngOnInit(): void {
    // this.platformHeaderService.visible = false;
    this.platformHeaderService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);

    if (this.appName === 'shop' && !this.peStepperService.steps) {
      const preloadMicroApps = ['products']; // , 'builder'];
      const preloadMicroApps$ = preloadMicroApps.map(app => this.loaderService.loadMicroScript(app));

      combineLatest(preloadMicroApps$).pipe(takeUntil(this.destroyed$), take(1)).subscribe();
    }
  }

  onGetStarted(): void {
    this.isLoading = true;

    // if (this.appName === 'shop') {
    //   this.peStepperService.init([
    //     {
    //       id: '1',
    //       title: this.translateService.translate(`stepper.${PeWelcomeStepAction.CreateShop}`),
    //       showContinue: true,
    //       allowSkip: false,
    //       action: PeWelcomeStepAction.CreateShop,
    //       completed: false,
    //     },
    //     {
    //       id: '2',
    //       title: this.translateService.translate(`stepper.${PeWelcomeStepAction.ChooseTheme}`),
    //       showContinue: false,
    //       allowSkip: false,
    //       action: PeWelcomeStepAction.ChooseTheme,
    //       completed: false,
    //     },
    //     {
    //       id: '3',
    //       title: this.translateService.translate(`stepper.${PeWelcomeStepAction.UploadProduct}`),
    //       showContinue: true,
    //       allowSkip: true,
    //       action: PeWelcomeStepAction.UploadProduct,
    //       completed: false,
    //     },
    //     {
    //       id: '4',
    //       title: this.translateService.translate(`stepper.${PeWelcomeStepAction.ShopPreview}`),
    //       showContinue: true,
    //       allowSkip: true,
    //       action: PeWelcomeStepAction.ShopPreview,
    //       completed: false,
    //     },
    //   ]);
    // }

    const appsWithStepper: string[] = [
      // 'checkout',
      // 'shop',
    ];

    this.appSetUpService
      .setStatus(
        this.params.businessId,
        this.params.appName,
        appsWithStepper.indexOf(this.params.appName) >= 0 ? AppSetUpStatusEnum.Started : AppSetUpStatusEnum.Completed,
      )
      .subscribe(() => {
        let appName = this.params.appName;
        if (appName === 'shop') {
          appName = 'shops';
        }

        const runApp = () => {
          switch (this.params.appName) {
            case 'commerceos':
              this.router.navigate([`business/${this.params.businessId}`]);
              break;
            default:
              this.appLauncherService.launchApp(this.params.appName, this.params.microPath).pipe(take(1)).subscribe();
          }

          // No sense to show header because user will see stepper header in app (and no platform header)
          // this.platformHeaderService.visible = true;
        };

        this.apiService
          .startTrial(appName, this.params.businessId)
          .pipe(take(1))
          .subscribe(
            () => runApp(),
            // TODO Add error handler when all apps have trial support
            () => runApp(),
          );
      });
  }

  get icon() {
    let url = '';
    if (
      [
        'transactions',
        'shop',
        'contacts',
        'connect',
        'products',
        'pos',
        'checkout',
        'shipping',
        'settings',
        'studio',
        'marketing',
        'commerceos',
        'site',
      ].includes(this.appName)
    ) {
      url = this.environmentConfigService.getCustomConfig().cdn + '/images/welcome-icons/' + this.appName + '.png';
    }
    return this.domSanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  private get params(): { businessId: string; appName: string; microPath: string } {
    const businessId: string = this.activatedRoute.snapshot.params['slug'];
    const appName: string = this.activatedRoute.snapshot.params['appName'] || 'commerceos';
    const microPath: string = this.activatedRoute.snapshot.queryParams['path'];
    return { businessId, appName, microPath };
  }

  get appName(): string {
    return this.activatedRoute.snapshot.params['appName'] || 'commerceos';
  }

  get title(): string {
    return this.translateService.translate(`welcome.${this.appName}.title`);
  }

  get message(): string {
    return this.translateService.translate(`welcome.${this.appName}.message`);
  }

  get getStarted(): string {
    return this.translateService.translate(`welcome.get-started`);
  }

  get herebyConfirm(): string {
    return this.translateService.translate(`welcome.hereby-confirm`, {
      appName: this.appName,
      pricingLink: this.pricingLink,
      termsLink: this.termsLink,
    });
  }

  get pricingLink(): string {
    const key = `welcome.${this.appName}.pricing_link`;
    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : this.defaultPricingLink;
  }

  get termsLink(): string {
    const key = `welcome.${this.appName}.terms_link`;
    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : this.defaultTermsLink;
  }
}
