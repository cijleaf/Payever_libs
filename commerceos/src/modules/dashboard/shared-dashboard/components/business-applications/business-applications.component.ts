import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { DockerItemInterface } from '@pe/ng-kit/modules/docker';

import { EnvService, WallpaperService, AppSelectorService } from '../../../../../apps/standalone/app/services';
import { LoaderService } from '../../../../shared/services';
import { WindowService } from '@pe/ng-kit/modules/window';
import { ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'business-applications',
  templateUrl: './business-applications.component.html',
  styleUrls: ['./business-applications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessApplicationsComponent extends AbstractComponent implements OnInit {

  backgroundImageBlurred: string = '';

  @Input() apps: DockerItemInterface[];
  @Input() set isBottomContent(isBottomContent: boolean) {
    this.isBottom = isBottomContent;
  }
  @Input() isWidgetExtendedSection: boolean = false;
  @Input() backWhenOutsideClick: boolean;
  @Input() isCompactItems: boolean = false;
  @Input() itemsPerRow: number = 6;
  @Input() hideUninstalled: boolean = false;
  @Output() appSwitched: EventEmitter<void> = new EventEmitter();
  @HostBinding('class.app-card-content-bottom') isBottom: boolean = false;

  appLoading$: Observable<string> = this.loaderService.appLoading$;
  theme$ = this.themeSwitcherService.theme$;
  assetsPath: string = '/assets';
  isMobile$ = this.windowService.isMobile$;

  constructor(
    private envService: EnvService,
    private router: Router,
    private loaderService: LoaderService,
    private wallpaperService: WallpaperService,
    private appSelectorService: AppSelectorService,
    private windowService: WindowService,
    private themeSwitcherService: ThemeSwitcherService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.backgroundImageBlurred = this.wallpaperService.blurredBackgroundImage;

    this.loaderService.appLoading$.pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        if (data == null) {
          this.appSwitched.emit();
        }
      });
  }

  handleOutsideIconClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('app-item')) {
      this.router.navigate([`/business/${this.envService.businessUuid}/info/overview`]);
    }
  }



  getRetinaIcon(appInstalled: boolean, icon: string) {
    const appIcon = (icon || '').replace('32', '64');

    return appIcon;
  }

}
