import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, mergeMap, take } from 'rxjs/operators';

import { WindowService } from '@pe/ng-kit/modules/window';

import { ApiService } from '../../../shared';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.scss'],
})
export class EmailVerificationComponent implements OnInit {

  isLoading: boolean = true;
  errors: any;
  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(take(1), filter(isMobile => !!isMobile));

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private windowService: WindowService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      take(1),
      mergeMap((params: Params) => {
        return this.apiService.verifyEmail(params['token']);
      }))
      .subscribe(
        () => {
          this.isLoading = false;
        },
        (errors: any) => {
          this.isLoading = false;
          this.errors = errors;
        }
      );
  }

  navigateToEntry(): void {
    this.router.navigate([`/entry`]);
  }

}
