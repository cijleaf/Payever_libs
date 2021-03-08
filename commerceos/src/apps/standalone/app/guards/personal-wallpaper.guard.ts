import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Data } from '@angular/router';
import { WallpaperService } from '../services';
import { BackgroundService } from '@pe/ng-kit/modules/wallpaper';
import { ApiService } from '../../../../modules/shared/services';

@Injectable()
export class PersonalWallpaperGuard implements CanActivate {

  platformElements = [
    '.platform-background-wrap',
    '.platform-background',
    '.platform-background-overlay'
  ];

  constructor(private apiService: ApiService,
              private backgroundService: BackgroundService,
              private wallpaperService: WallpaperService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const parts = window.location.pathname.split('/').filter(d => !!d);
    if (parts[0] !== 'personal') {
      console.error('This guard should be implemented only to the personal routes!');
    }
    this.apiService.getPersonalWallpaper().subscribe(
      (wallpapersData: Data) => {
        if ( wallpapersData && wallpapersData.currentWallpaper ) {
          this.wallpaperService.setBackgrounds(wallpapersData.currentWallpaper.wallpaper);
        }
        else {
          this.wallpaperService.showDashboardBackground(false);
          this.wallpaperService.resetBackgroundsToDefault();
        }
      },
      () => {
        this.wallpaperService.showDashboardBackground(false);
        this.wallpaperService.resetBackgroundsToDefault();
      },
      () => {
        this.backgroundService.setBackgroundImage(this.wallpaperService.blurredBackgroundImage, this.platformElements);
      }
    );
    return true;
  }
}
