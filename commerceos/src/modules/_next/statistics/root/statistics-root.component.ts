import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { WallpaperService } from '@app/services';
import { PeStatisticsHeaderService } from '@app/services/platform-header-apps-services/statistics-header.service';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { PeSimpleStepperService } from '@pe/stepper';
import { Subject } from 'rxjs';

@Component({
  selector: 'cos-statistics-root',
  templateUrl: './statistics-root.component.html',
  styleUrls: ['./statistics-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosStatisticsRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  body: HTMLElement = document.body;
  theme = 'dark'

  destroyed$ = new Subject<boolean>();

  constructor(
    public peSimpleStepperService: PeSimpleStepperService,
    private wallpaperService: WallpaperService,
    private headerService: PlatformHeaderService,
    private statisticsHeaderService: PeStatisticsHeaderService,
    public router: Router,
    private messageBus: MessageBus,
    private envService: PebEnvService,
  ) {}

  ngOnInit(): void {    
    this.headerService.setPlatformHeader(null);
    this.statisticsHeaderService.init();
    this.wallpaperService.showDashboardBackground(false);

    this.patchedElements = document.querySelectorAll('.pe-bootstrap');
    this.patchedElements.forEach(
      el => el.classList.remove('pe-bootstrap'),
    );

    this.body.classList.add(`dark-dropdown`);
    
  }

  ngOnDestroy(): void {
    this.patchedElements.forEach(
      el => el.classList.add('pe-bootstrap'),
    );

    this.body.classList.remove(`dark-dropdown`);
    this.body = null;
    this.patchedElements = null;
    this.statisticsHeaderService.destroy();

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
