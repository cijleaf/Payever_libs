import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { PeThemeEnum, ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher';

@Injectable()
export class ResetThemeGuard implements CanActivate {

  constructor(
    private themeSwitcherService: ThemeSwitcherService,
  ) {}

  canActivate(): boolean {
    this.themeSwitcherService.changeTheme(PeThemeEnum.DARK); // Reset theme for login page
    return true;
  }
}
