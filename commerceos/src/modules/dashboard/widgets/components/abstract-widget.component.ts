import { Injector, Input, Directive, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AbstractComponent, PlatformService } from '@pe/ng-kit/modules/common';
import { MicroRegistryService, MicroAppInterface, AppSetUpStatusEnum } from '@pe/ng-kit/modules/micro';
import { AppLauncherService, EnvService, HeaderService } from '../../../../apps/standalone/app/services';
import { LoaderService } from '../../../shared/services';
import { WidgetsApiService } from '../services';
import { Widget } from '@pe/widgets';
import { ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher';

export abstract class AbstractWidgetComponent extends AbstractComponent {

  @Input() widget: Widget;

  /**
   * Show spinner in button 'Open' (near the 'More' button)
   */
  showButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Show spinner for the whole widget
   */
  showSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  appUrlPath: string;
  installAppButtonText: string = '';

  protected appLauncherService: AppLauncherService = this.injector.get(AppLauncherService);
  protected microRegistryService: MicroRegistryService = this.injector.get(MicroRegistryService);

  protected envService: EnvService = this.injector.get(EnvService);
  protected router: Router = this.injector.get(Router);
  protected loaderService: LoaderService = this.injector.get(LoaderService);
  protected platformService: PlatformService = this.injector.get(PlatformService);
  protected widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);
  protected headerService: HeaderService = this.injector.get(HeaderService);
  protected themeSwitcherService: ThemeSwitcherService = this.injector.get(ThemeSwitcherService);

  protected abstract appName: string;

  theme$ = this.themeSwitcherService.theme$;

  constructor(
    protected injector: Injector
  ) {
    super();
  }

  /**
   * Show button like "Try for free" to install app
   */
  get showInstallButton(): boolean {
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(this.appName) as MicroAppInterface;
    return !this.widget.defaultApp && (
      !this.widget.installedApp || (this.widget.installedApp && micro && micro.setupStatus !== AppSetUpStatusEnum.Completed)
    );
  }

  onOpenButtonClick(): void {
    this.showButtonSpinner$.next(true);
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(this.appName) as MicroAppInterface;
    // this.headerService.resetHeader();
    if (micro && (micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      this.appLauncherService.launchApp(this.appName, this.appUrlPath).subscribe(
        () => {
          this.showButtonSpinner$.next(false);
        },
        () => {
          this.showButtonSpinner$.next(false);
        }
      );
    } else {
      const url: string = `business/${this.envService.businessUuid}/welcome/${this.appName}`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }
}
