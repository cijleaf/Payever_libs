import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EnvService } from '@app/services';

@Component({
  selector: 'pe-shop-builder',
  templateUrl: './shop-builder.component.html',
  styleUrls: [
    './styles.scss',
    './shop-builder.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeShopBuilderComponent {

  constructor(
    private router: Router,
    private envService: EnvService,
  ) {}

  onInstalled(shopId: string) {
    this.router.navigate([`business/${this.envService.businessUuid}/shop-editor/${shopId}`]);
  }
}
