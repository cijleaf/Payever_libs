import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from '@app/services';

@Component({
  selector: 'pe-shop-themes',
  templateUrl: './shop-themes.component.html',
  styleUrls: ['./shop-themes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeShopThemesComponent {

  constructor(
    private router: Router,
    private envService: EnvService,
  ) {}

  onInstalled(shopId: string) {
    this.router.navigate([`business/${this.envService.businessUuid}/builder-next/editor/${shopId}`]);
  }
}
