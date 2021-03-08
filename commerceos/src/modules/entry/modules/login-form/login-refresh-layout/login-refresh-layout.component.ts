import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { WallpaperService } from '@app/services';
import { BusinessInterface, ApiService } from '@modules/shared';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'login-refresh-layout',
  templateUrl: './login-refresh-layout.component.html',
})
export class LoginRefreshLayoutComponent implements OnInit {

  public activeBusiness: BusinessInterface;
  public email: string;
  public returnUrl: string;
  private filterUrlRegexp: RegExp = /^http(s)?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i;
  private allowedDomain: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private wallpaperService: WallpaperService,
    private authService: AuthService,
    private configService: EnvironmentConfigService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
  ) {
  }

  onSuccessLogin(): void {
    if (this.returnUrl) {
      if (this.allowedDomain) { // if it's domain and it's allowed
        window.location.replace(this.returnUrl); // use windows instead of router because we can authenticate from external sites
      } else if (!this.filterUrlRegexp.test(this.returnUrl)) { // if not domain
        this.router.navigateByUrl(this.returnUrl);
      }
    } else {
      this.apiService.getBusinessesList().subscribe(businesses => {
        if(!businesses?.length){
          this.router.navigateByUrl('/personal');
          return
        }
        const active = businesses.find((b: any) => b.active);
        this.checkWallpaper(active._id);
        if (businesses.length === 1) {
          const url: string = `business/${businesses[0]._id}/info/overview`;
          this.router.navigate([url]);
        } else {
          this.router.navigate(['switcher/profile']);
        }
      });
    }
  }

  checkWallpaper (id: string): void {
    let lastBg = this.wallpaperService.lastDashboardBackground;

    if (!lastBg || !lastBg.length) {
      lastBg = localStorage.getItem('lastBusinessWallpaper');
    }
    if (!lastBg || !lastBg.length) {
      this.apiService.getBusinessWallpaper(id).subscribe(
        (wallpapersData: any) => {
          if (wallpapersData && wallpapersData.currentWallpaper) {
            this.wallpaperService.setBackgrounds(wallpapersData.currentWallpaper.wallpaper);
          }
        });
    }
  }

  ngOnInit() {
    this.returnUrl = this.sanitizer.sanitize(SecurityContext.URL, this.activatedRoute.snapshot.queryParams['returnUrl']);
    const { activeBusiness, email } = this.authService.refreshLoginData;
    let matchesHttp: boolean = this.filterUrlRegexp.test(this.returnUrl);

    this.allowedDomain = this.authService.isPayeverDomain(this.returnUrl); // check if domain in returnURl belongs to Payever

    if (matchesHttp && !this.allowedDomain) {
      this.router.navigate(['entry/login']); // redirect to login in case of unrecognized domain in returnUrl to avoid phishing links
    }

    if (activeBusiness && email) {
      this.activeBusiness = activeBusiness;
      this.email = email;
    } else {
      this.router.navigate(['entry/login']);
    }
    this.wallpaperService.showDashboardBackground(false);
  }

  onSecondFactorCode(): void {
    this.router.navigate(['entry/second-factor-code'], { queryParams: { returnUrl: this.returnUrl } });
  }

}
