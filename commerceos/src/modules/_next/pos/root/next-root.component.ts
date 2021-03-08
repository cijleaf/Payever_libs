import { PePosHeaderService } from '@app/services/platform-header-apps-services/pos-header.service';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { tap, takeUntil, filter, switchMap, flatMap, map } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';

import { PeSimpleStepperService } from '@pe/stepper';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { PEB_TERMINAL_HOST } from '@pe/builder-pos';

import { WallpaperService } from '@app/services';
import { PebPosApi } from '@pe/builder-api';

@Component({
  selector: 'cos-next-root',
  templateUrl: './next-root.component.html',
  styleUrls: [
    './next-root.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;

  destroyed$ = new Subject<boolean>();

  isDashboardRoute: boolean;

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private envService: PebEnvService,
    public peSimpleStepperService: PeSimpleStepperService,
    private posHeaderService: PePosHeaderService,
    private translateService: TranslateService,
    private platformHeaderService: PlatformHeaderService,
    private cdr: ChangeDetectorRef,
    private wallpaperService: WallpaperService,
    private posApi: PebPosApi,
    @Inject(PEB_TERMINAL_HOST) private pebTerminalHost: string,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }

  ngOnInit() {
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'dashboard';
          this.cdr.markForCheck();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'dashboard';

    // Hide old platform header because next root component uses new platform header
    this.platformHeaderService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);

    this.peSimpleStepperService.hide();

    this.patchedElements = document.querySelectorAll('.pe-bootstrap');
    this.patchedElements.forEach(
      el => el.classList.remove('pe-bootstrap'),
    );

    /** Encapsulate builder styles */
    document.body.classList.add('pe-builder-styles');

    // TODO: move to service
    combineLatest([
      this.peSimpleStepperService.isVisible$,
      this.messageBus.listen('terminal.created'),
    ]).pipe(
      tap(([isStepperVisible, terminalId]: [boolean, string]) => {
        if (!isStepperVisible) {
          this.router.navigate([`business/${this.envService.businessId}/pos/${terminalId}/dashboard`]);
        }
      }),
      tap(([isStepperVisible, terminalId]: [boolean, string]) => this.posHeaderService.terminalId$.next(terminalId)),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('terminal.open').pipe(
      tap((terminal: any) => {
        if (terminal?.accessConfig?.internalDomain) {
          window.open(`https://${terminal.accessConfig.internalDomain}.${this.pebTerminalHost}`);
        }
      }),
      tap((terminal: any) => this.posHeaderService.terminalId$.next(terminal._id)),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('terminal.edit').pipe(
      tap(terminalId => this.router.navigate([`business/${this.envService.businessId}/pos/${terminalId}/edit`])),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('terminal.edited').pipe(
      tap(terminalId => this.router.navigate([`business/${this.envService.businessId}/pos/${terminalId}/dashboard`])),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('terminal.open-dashboard').pipe(
      tap(terminalId => this.router.navigate([`business/${this.envService.businessId}/pos/${terminalId}/dashboard`])),
      tap((terminalId: string) => this.posHeaderService.terminalId$.next(terminalId)),
      takeUntil(this.destroyed$),
    ).subscribe();

    // TODO: do
    combineLatest([
      this.peSimpleStepperService.isVisible$,
      this.messageBus.listen('terminal.theme.installed'),
    ])
      .pipe(
        // filter(([isStepperVisible]) => isStepperVisible),
        tap(_ =>
          this.router.navigate([
            `business/${this.envService.businessId}/pos/${this.envService.terminalId}/dashboard`,
          ]),
        ),
        switchMap(() =>
          this.posApi
            .getTerminalActiveTheme(
              this.envService.terminalId,
              this.envService.businessId,
            )
            .pipe(
              map(([{ theme }]) => theme as string),
              tap(async themeId => {
                const version =  await this.posApi.createTerminalThemeVersion(themeId, Date.now().toString()).toPromise()
                await this.posApi.publishTerminalThemeVersion(themeId, version._id).toPromise();
              }),
            ),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe();


    this.posHeaderService.initialize();
  }

  ngOnDestroy() {
    this.patchedElements.forEach(
      el => el.classList.add('pe-bootstrap'),
    );
    this.patchedElements = null;
    this.posHeaderService.destroy();

    /** Encapsulate builder styles */
    document.body.classList.remove('pe-builder-styles');

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
