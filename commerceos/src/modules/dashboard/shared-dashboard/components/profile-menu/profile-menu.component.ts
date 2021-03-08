import { OverlayContainer } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { EnvService } from '../../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent implements OnDestroy {
  @ViewChild(MatMenuTrigger, { static: true }) trigger: MatMenuTrigger;
  @ViewChild('menu', { static: true }) public menu: MatMenu;
  @Input() loggedIn: boolean = true;
  @Input() businessesCount: number = 1;
  @Input() isPersonalAccountMode: boolean = false;
  @Input() profileButtonTitle: string;
  @Input() profileButtonImage: string;
  @Output() profileButtonClicked: EventEmitter<boolean> = new EventEmitter();
  @Output() notificationsSidebarClicked: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private authService: AuthService,
    private envService: EnvService,
    private router: Router,
    private platformHeaderService: PlatformHeaderService,
    private location: Location,
    public dialog: MatDialog,
    public overlayContainer: OverlayContainer,
  ) {
  }

  @HostListener('document:keydown.n', ['$event.target'])
  navigateToApps(target: HTMLElement): void {
    if (this.platformHeaderService.isProfileMenu &&
      this.isNotBuilder &&
      target.tagName.toLowerCase() !== 'input' &&
      target.tagName.toLowerCase() !== 'textarea' &&
      target.contentEditable !== 'true') {
      this.onNotificationsClick();
    }
  }

  @HostListener('document:keydown.f', ['$event.target'])
  navigateToSearch(target: HTMLElement): void {
    if (this.platformHeaderService.isProfileMenu &&
      this.isNotBuilder &&
      target.tagName.toLowerCase() !== 'input' &&
      target.tagName.toLowerCase() !== 'textarea' &&
      target.contentEditable !== 'true') {
      this.onSearchClick();
    }
  }

  ngOnDestroy(): void {
    this.menuResubscription();
  }

  menuResubscription() {
    // fix for Material menu bug:
    // https://github.com/angular/material2/pull/15667/files/d30ca0da09fe3e1dbbc71b0dcd44cfcbe6096ef3
    if (this.trigger && this.trigger['_menuCloseSubscription']) {
      // resubscribing to all menu events and activating the overlay to fix menu behavior
      this.trigger.menu = undefined;
      if (this.trigger && this.trigger['_overlayRef']) {
        this.trigger['_overlayRef'].dispose();
        this.trigger['_overlayRef'] = null;
      }
      this.trigger.menu = this.menu;

    };
  }

  toggleRoutes(): void {
    this.profileButtonClicked.emit(true);
  }

  onLogOut(): void {
    if (this.loggedIn) {
      this.authService.logout().subscribe();
    } else {
      this.router.navigate(['entry/login']);
    }
  }

  onAddBusinessClick(): void {
    this.router.navigate(['switcher/add-business']);
  }

  onSearchClick(): void {
    const businessUuid: string = this.envService.businessUuid;
    if (this.envService.isPersonalMode) {
      this.router.navigate([`personal/info/search`]);
    } else {
      this.router.navigate([`business/${businessUuid}/info/search`]);
    }
  }

  onNotificationsClick(): void {
    this.notificationsSidebarClicked.emit(true);
  }

  private get isNotBuilder(): boolean {
    return this.location.path().indexOf('builder/editor') === -1;
  }

  openPersonalProfile(): void {
    this.router.navigate(['/personal']);
  }
}
