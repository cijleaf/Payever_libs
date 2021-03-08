import { Component, OnInit } from '@angular/core';

import { Observable, merge } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

import { PlatformService } from '@pe/ng-kit/modules/common';

const TOGGLE_BUTTON_WIDTH: number = 144;

@Component({
  // tslint:disable-next-line component-selector
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  readonly toggleButtonWidth: number = TOGGLE_BUTTON_WIDTH;

  private microAppReady$: Observable<string> = this.platformService.microAppReady$.pipe(distinctUntilChanged(), startWith(undefined));
  private microNavigation$: Observable<string> = this.platformService.microNavigation$.pipe(
    map((navData: string | { url: string }) => {
      if (typeof navData === 'string') {
        return navData;
      } else {
        return (navData || {url: undefined}).url;
      }
    }),
  );

  // tslint:disable-next-line:member-ordering
  microActive$: Observable<boolean> = merge(
    this.microAppReady$,
    this.microNavigation$,
  ).pipe(
    map(appName => !!appName),
    startWith(false),
    distinctUntilChanged(),
  );

  constructor(
    private platformService: PlatformService,
  ) {}

  ngOnInit(): void {
  }

}
