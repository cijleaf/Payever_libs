import { Component, Injector, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable, EMPTY } from 'rxjs';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { AppSetUpStatusEnum, MicroAppInterface } from '@pe/ng-kit/modules/micro';

import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { WallpaperService } from '../../../../../../apps/standalone/app/services';
import { takeUntil } from 'rxjs/operators';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'settings-widget',
  templateUrl: './settings-widget.component.html',
  styleUrls: ['./settings-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SettingsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  showWallpaperSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showLanguageSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly appName: string = 'settings';

  constructor(
    injector: Injector,
    private authService: AuthService,
    protected wallpaperService: WallpaperService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit() {
    this.widget.data = [
      {
        title: 'widgets.settings.actions.edit-wallpaper',
        isButton: true,
        // icon: '#icon-settings-dashboard-skin-48',
        onSelect: () => {
          this.onEditWallpaper();
          return EMPTY;
        },
      },
      {
        title: 'widgets.settings.actions.edit-language',
        isButton: true,
        // icon: '#icon-settings-translations-48',
        onSelect: () => {
          this.onEditLanguage();
          return EMPTY;
        },
      }
    ];
  }

  onEditWallpaper(): void {
    this.showWallpaperSpinner$.next(true);
    const micro: MicroAppInterface = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appName);
    if (micro && (micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      let loadMicroRequest: Observable<boolean>;
      let url: string[];
      if (this.envService.isPersonalMode) {
        loadMicroRequest = this.loaderService.loadMicroScript('settings');
        url = [`personal/${this.authService.getUserData().uuid}/settings/wallpaper`];
      } else {
        loadMicroRequest = this.loaderService.loadMicroScript('settings', this.envService.businessUuid);
        url = [`business/${this.envService.businessUuid}/settings/wallpaper`];
      }
      loadMicroRequest.pipe(
        takeUntil(this.destroyed$),
      ).subscribe(
        () => {
          this.router.navigate(url)
            .then(() => {
              this.showWallpaperSpinner$.next(false);
              this.wallpaperService.showDashboardBackground(false);
            });
        },
        () => {
          this.showWallpaperSpinner$.next(false);
        }
      );
    } else {
      const url: string[] = [`business/${this.envService.businessUuid}/welcome/${this.appName}`];
      const params = {
        path: 'settings/wallpaper'
      };
      this.router.navigate(url, { queryParams: params });
    }
  }

  onEditLanguage(): void {
    this.showLanguageSpinner$.next(true);
    const micro: MicroAppInterface = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appName);
    if (micro && (micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      let loadMicroRequest: Observable<boolean>;
      let url: string[];
      if (this.envService.isPersonalMode) {
        loadMicroRequest = this.loaderService.loadMicroScript('settings');
        url = [`personal/${this.authService.getUserData().uuid}/settings/language`];
      } else {
        loadMicroRequest = this.loaderService.loadMicroScript('settings', this.envService.businessUuid);
        url = [`business/${this.envService.businessUuid}/settings/general/language`];
      }
      loadMicroRequest.pipe(
        takeUntil(this.destroyed$),
      ).subscribe(() => {
        this.router.navigate(url)
          .then(() => {
            this.showLanguageSpinner$.next(false);
            this.wallpaperService.showDashboardBackground(false);
          });
      },
      () => {
        this.showLanguageSpinner$.next(false);
      });
    } else {
      const url: string[] = [`business/${this.envService.businessUuid}/welcome/${this.appName}`];
      const params = {
        path: 'settings/general/language'
      };
      this.router.navigate(url, { queryParams: params });
    }
  }
}
