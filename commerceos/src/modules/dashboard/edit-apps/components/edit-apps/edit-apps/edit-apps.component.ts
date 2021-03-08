import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { EditAppsViewEnum } from '../../../../shared-dashboard/enum';
import { HeaderService, WallpaperService } from '../../../../../../apps/standalone/app/services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'edit-apps',
  templateUrl: './edit-apps.component.html',
  styleUrls: ['./edit-apps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAppsComponent implements OnInit, OnDestroy {
  activeView: EditAppsViewEnum = EditAppsViewEnum.apps;
  editAppsViewEnum: typeof EditAppsViewEnum = EditAppsViewEnum;
  boxTitle = this.translateService.translate('edit_apps.title');

  constructor(
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    protected wallpaperService: WallpaperService
  ) {}

  ngOnInit(): void {
    this.headerService.setEditAppsHeader();
    this.wallpaperService.showDashboardBackground(false);
    this.activatedRoute.params
      .subscribe(params => {
        this.activeView = params.view;
      });
  }

  ngOnDestroy(): void {
    this.headerService.destroyEditAppsHeader();
  }

  onToggle(event: MatButtonToggleChange) {
    this.activeView = event.value;
  }

}
