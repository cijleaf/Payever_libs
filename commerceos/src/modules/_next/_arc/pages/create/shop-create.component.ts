import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { PebEnvService } from '@pe/builder-core';

@Component({
  selector: 'pos-shop-create',
  templateUrl: './shop-create.component.html',
  styleUrls: ['./shop-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeShopCreateComponent {

  constructor(
    private router: Router,
    private envService: PebEnvService,
  ) {}

  onCreated(shopId: string) {
    this.router.navigate([`business/${this.envService.businessId}/builder-next/themes`]);
  }

}
