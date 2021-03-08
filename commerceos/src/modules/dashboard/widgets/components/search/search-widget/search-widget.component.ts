import { Component, Injector, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from '@app/services';
import { tap } from 'rxjs/operators';
import { ThemeSwitcherService } from '@pe/ng-kit/modules/theme-switcher/index';
import { PeThemeEnum } from '@app/interfaces/theme.interface';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'search-widget',
  templateUrl: './search-widget.component.html',
  styleUrls: ['./search-widget.component.scss'],
})

export class SearchWidgetComponent {
  theme: string;

  searchText: string;
  showSearchSpinner: boolean = false;

  constructor(
    private router: Router,
    private envService: EnvService,
    private themeSwitcherService: ThemeSwitcherService,
  ) {
    this.themeSwitcherService.theme$.pipe(
      tap((theme) => this.theme = `theme-${theme}`))
      .subscribe();
  }

  clearSearch() {
    this.searchText = '';
  }

  goToSearch () {
    if (this.searchText) {
      this.showSearchSpinner = true;
      this.router.navigate([`/business/${this.envService.businessUuid}/info/search`, { searchText: this.searchText }]);
    }
  }
}
