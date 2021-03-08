import {
  Component, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef,
  ViewChild, ViewEncapsulation, Input, OnInit
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
// import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { WindowService } from '@pe/ng-kit/modules/window';

import { LoaderService } from '@app/services';
import { registrationDisabled as REGISTRATION_DISABLED, entryLogo } from '../../settings';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
 // encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {

  @ViewChild('background', { static: true }) background: ElementRef;

  @Input() hideLogo: boolean;
  @Input() hideLanguageSwitcher: boolean;
  @Input() entryLogo = entryLogo;
  @Input() backgroundImage = '/assets/images/commerceos-background.jpg';

  readonly allowedLocales = ['en', 'de', 'no', 'da', 'sv']; // Spanish is removed

  inited: boolean = false;
  switchEntryButton: string = null;
  switchSocialLabel: string = null;
  isEntryLayoutRegisterClass: boolean;
  showLoginText: boolean;
  showRegistrationButton: boolean = !REGISTRATION_DISABLED;
  showSwitchAccountButton: boolean = false;

  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(take(1), filter(isMobile => !!isMobile));

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    // private platformHeaderService: PlatformHeaderService,
    private translateService: TranslateService,
    private loaderService: LoaderService,
    private windowService: WindowService
  ) {}

  ngOnInit(): void {
    this.init();
    fromEvent(this.background.nativeElement, 'animationend').pipe(
      take(1))
      .subscribe(() => {
        this.inited = true;
        this.loaderService.hideLoader();
        this.changeDetectorRef.detectChanges();
      });
    // this.platformHeaderService.setPlatformHeader(null);

    // To handle case when user press back button
    this.router.events.subscribe(r => {
      if (r instanceof NavigationEnd) {
        this.init();
      }
    });
    // this.loaderManagerService.showGlobalLoader(false);
  }

  onEntryChange(): void {
    const currentRoute: string = this.activatedRoute.snapshot.firstChild &&
      this.activatedRoute.snapshot.firstChild.data['type'] ||
      this.activatedRoute.snapshot.data['type'];
    let path: string[];
    switch (currentRoute) {
      case 'login':
        path = ['entry/registration'];
        this.switchEntryButton = this.translateService.translate('actions.login');
        this.switchSocialLabel = this.translateService.translate('actions.register');
        this.isEntryLayoutRegisterClass = true;
        this.showLoginText = false;
        this.showSwitchAccountButton = false;
        break;
      case 'registration':
        path = ['entry/login'];
        this.switchEntryButton = this.translateService.translate('actions.create');
        this.switchSocialLabel =  this.translateService.translate('actions.login');
        this.showLoginText = true;
        this.showSwitchAccountButton = false;
        break;
      default:
        path = ['entry/login'];
        this.switchEntryButton = this.translateService.translate('actions.create');
        this.switchSocialLabel = this.translateService.translate('actions.login');
        this.showLoginText = true;
        this.showSwitchAccountButton = REGISTRATION_DISABLED;
        break;
    }
    this.router.navigate(path);
  }

  onLocaleChanged(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };
    this.router.navigate([this.router.url]);
  }

  private init(): void {
    const currentRoute: string = this.activatedRoute.snapshot.firstChild &&
      this.activatedRoute.snapshot.firstChild.data['type'] ||
      this.activatedRoute.snapshot.data['type'];
    switch (currentRoute) {
      case 'login':
        this.switchEntryButton = this.translateService.translate('actions.create');
        this.switchSocialLabel = this.translateService.translate('actions.login');
        this.showLoginText = true;
        this.showSwitchAccountButton = false;
        break;
      case 'registration':
        this.switchEntryButton = this.translateService.translate('actions.login');
        this.switchSocialLabel = this.translateService.translate('actions.register');
        this.isEntryLayoutRegisterClass = true;
        this.showLoginText = false;
        this.showSwitchAccountButton = false;
        break;
      case 'refresh-login':
        this.switchEntryButton = this.translateService.translate('actions.other');
        this.switchSocialLabel = this.translateService.translate('actions.login');
        this.showLoginText = false;
        this.showSwitchAccountButton = REGISTRATION_DISABLED;
        break;
    }
  }
}
