import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

import { entryLogo } from '../../../../../../settings';
import { WallpaperService } from '../../../../../../apps/standalone/app/services';
import { map, filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface IconInterface {
  icon: string;
  width?: number;
  height?: number;
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-registration-container',
  templateUrl: './registration-container.component.html',
  styleUrls: ['./registration-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationContainerComponent implements OnInit, OnDestroy {

  readonly entryLogo = entryLogo;

  isPersonalMode: boolean;
  destroyed$ = new Subject<boolean>();

  get isMobile(): boolean {
    return this.breakpointObserver.isMatched('(max-width: 459px)');
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private wallpaperService: WallpaperService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    route.queryParams
      .pipe(
        map(params => params && params.fs),
        filter(fs => !!fs),
        map(fs => {
          const interval = setInterval(() => { // TODO: Fix it. Need to find way how to handle FS script load
            if ((window as any).FS) {
              (window as any).FS.identify(fs);
              clearInterval(interval);
            }
          }, 500);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnInit(): void {
    const currentRoute: string = this.activatedRoute.firstChild.snapshot.data[
      'type'
    ];
    this.isPersonalMode = currentRoute === 'personal';
    this.wallpaperService.saveCurrentDefaultBackground();
  }

  onSwitchRegistrationType(): void {
    const currentRoute: string = this.activatedRoute.firstChild.snapshot.data[
      'type'
    ];
    let path: string[];
    switch (currentRoute) {
      case 'personal':
        path = ['./business'];
        this.isPersonalMode = false;
        break;
      case 'business':
        path = ['./personal'];
        this.isPersonalMode = true;
        break;
      default:
        path = ['./business'];
        this.isPersonalMode = true;
        break;
    }
    this.router.navigate(path, { relativeTo: this.activatedRoute });
  }

  getIndustryIcon(): IconInterface {
    const industry: string = this.activatedRoute.firstChild.snapshot.params[
      'industry'
    ];
    const icon = `#icon-industries-${industry}`;
    let result: IconInterface = { icon };
    const iconElement: HTMLElement = document.getElementById(
      icon.replace('#', ''),
    );
    if (iconElement) {
      const viewBox: string =
        iconElement.getAttribute('viewBox') ||
        iconElement.getAttribute('viewbox');
      const size: string[] = viewBox.split(' ');
      const scale = 0.8;
      result.width = parseInt(size[2]) * scale;
      result.height = parseInt(size[3]) * scale;
    } else {
      result = null;
    }
    return result;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
