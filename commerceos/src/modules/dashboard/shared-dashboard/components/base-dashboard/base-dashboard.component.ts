import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Input, OnInit, OnDestroy, Output, ViewChild,
} from '@angular/core';

import { BehaviorSubject, combineLatest, fromEvent, Observable } from 'rxjs';
import { take, takeWhile, switchMap, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import {
  AbstractComponent,
  MicroContainerTypeEnum,
  PlatformService
} from '@pe/ng-kit/modules/common';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { WindowService } from '@pe/ng-kit/modules/window';

import { WallpaperService, DashboardDataService } from '../../../../../apps/standalone/app/services';
import { TranslatePipe } from '@pe/ng-kit/modules/i18n';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'base-dashboard',
  templateUrl: './base-dashboard.component.html',
  styleUrls: ['./base-dashboard.component.scss']
})
export class BaseDashboardComponent extends AbstractComponent implements OnDestroy, OnInit {
  @Input()
  set backgroundImage(url: string) {
    this.backgroundImageUrl = url;
    if (this.backgroundElement) {
      fromEvent(this.backgroundElement.nativeElement, 'animationend').pipe(
        take(1))
        .subscribe(() => {
          this.inited = true;
        });
    }
  }

  @Input() dockerItems: DockerItemInterface[];
  @Input() loaded: boolean = false;
  @Input() withEditButton: boolean;

  @Output() dockerItemsChange: EventEmitter<DockerItemInterface[]> = new EventEmitter<DockerItemInterface[]>();
  @Output() profileButtonClicked: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('background') backgroundElement: ElementRef;
  @ViewChild('dashboardElement', { static: true }) dashboardElement: ElementRef<HTMLElement>;

  inited: boolean = false;
  backgroundImageUrl: string;
  showDashboardBackground: boolean = true;

  isFullscreenMode: boolean;
  isLayoutMode: boolean;
  isDoubleHeaderHeight: boolean;
  isSidebarOpen: boolean = false;
  appsRightTranslation: number = 0;

  contentScrollPosition$: BehaviorSubject<number> = new BehaviorSubject(0);
  sidebarScrollPosition$: BehaviorSubject<number> = new BehaviorSubject(0);

  isMobile$ = this.windowService.isMobile$;

  showMobileToolbar$: Observable<boolean> = this.isMobile$.pipe(
    takeUntil(this.destroyed$),
    takeWhile(isMobile => isMobile),
    switchMap(() => this.contentScrollPosition$.pipe(
      map((contentPosition) => contentPosition > 8)
    )),
    distinctUntilChanged()
  );
  // showToolbar$: Observable<boolean> = this.windowService.isMobile$.pipe(
  //   takeUntil(this.destroyed$),
  //   switchMap(() => this.contentScrollPosition$.pipe(
  //     map((contentPosition) => contentPosition > 22)
  //   )),
  //   distinctUntilChanged()
  // );
  showToolbar$: Observable<boolean> = combineLatest(
    this.contentScrollPosition$,
    this.platformService.internetConnectionStatus$
  ).pipe(
    map(([contentPosition, isInternetConnectionEnabled]) => {
      let showToolbar: boolean;
      if (isInternetConnectionEnabled) {
        showToolbar = contentPosition > this.HEADER_HEIGHT;
      } else {
        showToolbar = contentPosition > this.HEADER_NOTIFICATION_HEIGHT - this.HEADER_HEIGHT;
      }
      return showToolbar;
    }),
    distinctUntilChanged()
  );

  showContent$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  private HEADER_HEIGHT: number = 26;
  private HEADER_NOTIFICATION_HEIGHT: number = 26;

  private greetingVariant: number = Math.floor(Math.random() * 4) + 1;

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private platformHeaderService: PlatformHeaderService,
    private platformService: PlatformService,
    private wallpaperService: WallpaperService,
    private windowService: WindowService,
    private dashboardDataService: DashboardDataService,
    private translate: TranslatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.wallpaperService.showDashboardBackground$.pipe(
      takeUntil(this.destroyed$),
    )
    .subscribe((showDashboardBackground: boolean) => {
      this.showDashboardBackground = showDashboardBackground;
      this.showContent$.next(showDashboardBackground);
    });

    this.platformService.microContainerType$.pipe(
      takeUntil(this.destroyed$),
    )
    .subscribe((microContainerType: MicroContainerTypeEnum) => {
      switch (microContainerType) {
        case MicroContainerTypeEnum.FullScreen:
          this.isFullscreenMode = true;
          this.isLayoutMode = false;
          break;
        case MicroContainerTypeEnum.Layout:
          this.isFullscreenMode = false;
          this.isLayoutMode = true;
          break;
        default:
          this.isFullscreenMode = false;
          this.isLayoutMode = false;
          break;
      }
      this.changeDetectorRef.detectChanges();
    });

    // this.showToolbar$.pipe(takeUntil(this.destroyed$)).subscribe((showToolbar: boolean) => {
    //   this.platformHeaderService.showToolbar = showToolbar;
    // });
    this.platformHeaderService.showToolbar = true;
  }

  get greeting1(): string {
    return this.dashboardDataService.userName
      ? `${this.translate.transform('greeting.welcome')} ${this.dashboardDataService.userName || ''},`
      : `${this.translate.transform('greeting.welcome')},`;
  }

  get greeting2(): string {
    return this.translate.transform(
      `greeting.variant_${this.greetingVariant}`
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  onDashboardScroll(event: Event): void {
    this.contentScrollPosition$.next(event.srcElement['scrollTop']);
  }
}
