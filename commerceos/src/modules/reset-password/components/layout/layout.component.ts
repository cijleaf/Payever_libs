import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { WindowService } from '@pe/ng-kit/modules/window';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
//  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {

  switchEntryButton: string = null;

  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(take(1), filter(isMobile => !!isMobile));

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private windowService: WindowService
  ) {}

  ngOnInit(): void {
    this.switchEntryButton = 'Create Account';
  }

  onEntryChange(): void {
    const currentRoute: string = this.activatedRoute.firstChild.snapshot.data['type'];
    let path: string[];
    switch (currentRoute) {
      case 'login':
        path = ['./registration'];
        this.switchEntryButton = 'Login';
        break;
      case 'registration':
        path = ['./login'];
        this.switchEntryButton = 'Create Account';
        break;
      case 'refresh-login':
        path = ['./login'];
        this.switchEntryButton = 'Other account';
        break;
      default:
        path = ['./login'];
        this.switchEntryButton = 'Create Account';
        break;
    }
    this.router.navigate(path, { relativeTo: this.activatedRoute });
  }

}
