import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Data } from '@angular/router';
import { WallpaperService } from '../services';
import { BackgroundService } from '@pe/ng-kit/modules/wallpaper';
import { ApiService } from '../../../../modules/shared/services';

@Injectable()
export class BusinessWallpaperGuard implements CanActivate {

  platformElements = [
    '.platform-background-wrap',
    '.platform-background',
    '.platform-background-overlay'
  ];

  constructor(private apiService: ApiService,
              private backgroundService: BackgroundService,
              private wallpaperService: WallpaperService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const noBackgroundBlur = !!route.data['noBackgroundBlur'];
    const slug = route.params['slug'] || (route.children && route.children[0] && route.children[0].params ? route.children[0].params['slug'] : null);
    if (slug || route.params['businessUuid']) {
      this.apiService.getBusinessWallpaper(slug || route.params['businessUuid']).subscribe(
        (wallpapersData: Data) => {
          if (wallpapersData && wallpapersData.currentWallpaper) {
            this.wallpaperService.setBackgrounds(wallpapersData.currentWallpaper.wallpaper);
          } else {
            this.wallpaperService.showDashboardBackground(false);
            this.wallpaperService.resetBackgroundsToDefault(noBackgroundBlur);
          }
        },
        () => {
          this.wallpaperService.showDashboardBackground(false);
          this.wallpaperService.resetBackgroundsToDefault(noBackgroundBlur);
        },
        () => {
          this.backgroundService.setBackgroundImage(this.wallpaperService.blurredBackgroundImage, this.platformElements);
        }
      );
    } else {
      this.wallpaperService.showDashboardBackground(false);
      this.wallpaperService.resetBackgroundsToDefault(noBackgroundBlur);
      this.backgroundService.setBackgroundImage(this.wallpaperService.blurredBackgroundImage, this.platformElements);
    }
    return true;
  }
}
