import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { EnvService, LazyAppsLoaderService, WallpaperService } from '@app/services';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'search-box-container',
  templateUrl: './search-box-container.component.html',
  styleUrls: ['./search-box-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SearchBoxContainerComponent implements OnInit {

  isAdmin$: Observable<boolean> = this.authService.onChange$
    .pipe(
      startWith(null),
      map(() => this.authService.isAdmin())
    );

  outInProgress: boolean = false;
  searchString: string;

  constructor(
    private el: ElementRef,
    protected envService: EnvService,
    private authService: AuthService,
    private platformHeaderService: PlatformHeaderService,
    private lazyAppsLoaderService: LazyAppsLoaderService,
    protected wallpaperService: WallpaperService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
      this.searchString = this.route.snapshot.params.searchText;
      this.wallpaperService.showDashboardBackground(false);
      this.platformHeaderService.setPlatformHeader(null);
      this.lazyAppsLoaderService.clearMicroContainerElement();
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    if (this.el.nativeElement === event.target) {
      this.navigateToDashboard();
    }
  }

  navigateToDashboard(): void {
    this.outInProgress = true;
    history.back();
  }
}
