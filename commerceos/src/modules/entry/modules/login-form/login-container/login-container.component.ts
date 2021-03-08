import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { WallpaperService } from '@app/services';
import { entryLogo } from 'settings';

interface IconInterface {
  icon: string;
  width?: number;
  height?: number;
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-login-container',
  templateUrl: './login-container.component.html',
  styleUrls: ['./login-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginContainerComponent implements OnInit, OnDestroy {

  readonly entryLogo = entryLogo;

  platformElements = [
    '.platform-background-wrap',
    '.platform-background',
    '.platform-background-overlay'
  ];

  destroyed$ = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private wallpaperService: WallpaperService,
  ) {
  }

  ngOnInit(): void {
    this.wallpaperService.saveCurrentDefaultBackground()
  }

  getIndustryIcon(): IconInterface {
    const industry: string = this.activatedRoute.firstChild?.snapshot?.url[0]?.path;

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
      const scale = 1;
      result.width = parseInt(size[2]) * scale + 5;
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
