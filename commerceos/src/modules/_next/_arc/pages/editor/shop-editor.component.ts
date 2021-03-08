import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cos-shop-editor',
  templateUrl: './shop-editor.component.html',
  styleUrls: ['./shop-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeShopEditorComponent {

  constructor(
    public route: ActivatedRoute,
  ) {
    console.log(this.route)
    document.querySelectorAll('.pe-bootstrap').forEach(el => el.classList.remove('pe-bootstrap'));
  }
}
