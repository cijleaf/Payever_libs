import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-shop-list',
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeShopListComponent {

  constructor(
    private router: Router,
  ) {}

  onOpen(shopId: string) {

    // this.router.navigate([`/editor/${shopId}`]);
  }


  onEdit(shopId: string) {

  }

}
