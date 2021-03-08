import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MediaContainerType, MediaUrlPipe } from '@pe/ng-kit/modules/media';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

@Injectable()
export class WallpaperService {
  private _backgroundImage$: BehaviorSubject<string> = new BehaviorSubject(this._defaultBackgroundImage);
  private _blurredBackgroundImage$: BehaviorSubject<string> = new BehaviorSubject(this._defaultBlurredBackgroundImage);

  private _showDashboardBackground$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // tslint:disable-next-line:member-ordering
  backgroundImage$: Observable<string> = this._backgroundImage$.asObservable();
  // tslint:disable-next-line:member-ordering
  blurredBackgroundImage$: Observable<string> = this._blurredBackgroundImage$.asObservable();
  // tslint:disable-next-line:member-ordering
  lastDashboardBackground: string = '';

  constructor(
    private mediaUrlPipe: MediaUrlPipe,
    private environmentConfigService: EnvironmentConfigService
  ) {}

  get _defaultBackgroundImage(): string {
    if (this.isRegistrationOrLogin) {
      const industry = this.getUrlIndustry();
      if (industry) {
        return this.environmentConfigService.getCustomConfig().cdn + `/images/commerceos-industry-background-${industry}.jpg`;
      } else {
        return this.environmentConfigService.getCustomConfig().cdn + '/images/commerceos-background.jpg';
      }
    }
    return this.environmentConfigService.getCustomConfig().cdn + '/images/commerceos-background.jpg';
  }

  get _defaultBlurredBackgroundImage(): string {
    if (this.isRegistrationOrLogin) {
      const industry = this.getUrlIndustry();
      if (industry) {
        return this.environmentConfigService.getCustomConfig().cdn + `/images/commerceos-industry-background-${industry}-blurred.jpg`;
      } else {
        return this.environmentConfigService.getCustomConfig().cdn + '/images/commerceos-background-blurred.jpg';
      }
    }
    return this.environmentConfigService.getCustomConfig().cdn + '/images/commerceos-background-blurred.jpg';
  }

  set backgroundImage(image: string) {
    this._backgroundImage$.next(image);
  }

  get backgroundImage(): string {
    return this._backgroundImage$.value;
  }

  get defaultBackgroundImage(): string {
    return this._defaultBackgroundImage;
  }

  set blurredBackgroundImage(image: string) {

    this._blurredBackgroundImage$.next(image);
  }

  get blurredBackgroundImage(): string {
    return this._blurredBackgroundImage$.value;
  }

  get defaultBlurredBackgroundImage(): string {
    return this._defaultBlurredBackgroundImage;
  }

  get showDashboardBackground$(): Observable<boolean> {
    return this._showDashboardBackground$.asObservable();
  }

  showDashboardBackground(showDashboardBackground: boolean): void {
    this._showDashboardBackground$.next(showDashboardBackground);
  }

  setBackgrounds(wallpaper: string) {
    this._backgroundImage$.next(this.mediaUrlPipe.transform(`${wallpaper}`, MediaContainerType.Wallpapers));
    this._blurredBackgroundImage$.next(this.mediaUrlPipe.transform(`${wallpaper}-blurred`, MediaContainerType.Wallpapers));
    this.saveCurrentDefaultBackground();
    this.lastDashboardBackground = this._blurredBackgroundImage$.getValue();
    localStorage.setItem('lastBusinessWallpaper', this._blurredBackgroundImage$.getValue());
  }

  resetBackgroundsToDefault(noBackgroundBlur: boolean = false): void {
    this._backgroundImage$.next(this._defaultBackgroundImage);
    if (noBackgroundBlur) {
      this._blurredBackgroundImage$.next(this._defaultBackgroundImage);
    } else {
      this._blurredBackgroundImage$.next(this._defaultBlurredBackgroundImage);
    }
  }

  saveCurrentDefaultBackground(): void {
    localStorage.setItem('pe-default-background', this._defaultBackgroundImage);
    localStorage.setItem('pe-default-background-blurred', this._defaultBlurredBackgroundImage);
  }

  private get isRegistrationOrLogin(): boolean {
    const parts = String(window.location.pathname).split('/').filter(d => d !== '');
    return (parts.length === 3 || (parts.length === 5 && parts[3] === 'app')) && parts[0] === 'entry' && (parts[1] === 'registration' || parts[1] === 'login');
  }

  private getUrlIndustry(): string {
    const parts = String(window.location.pathname).split('/').filter(d => d !== '');
    // TODO Remove copypaste
    const ignore = ['personal', 'business'];
    return ignore.indexOf(parts[2]) < 0 ? parts[2] : null;
  }
}
