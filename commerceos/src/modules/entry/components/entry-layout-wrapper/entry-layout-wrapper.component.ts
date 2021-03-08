import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WallpaperService } from '../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'entry-layout-wrapper',
  templateUrl: './entry-layout-wrapper.component.html',
  styleUrls: ['./entry-layout-wrapper.component.scss'],
})
export class EntryLayoutWrapperComponent implements OnInit {

  hideLogo: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private wallpaperService: WallpaperService
  ) {
  }

  ngOnInit() {
    this.wallpaperService.showDashboardBackground(false);
    this.hideLogo = !!this.activatedRoute.firstChild.snapshot.data['hideLogo'];
  }
}
