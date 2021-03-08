import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { combineLatest, merge, Subject } from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import { EnvService, WallpaperService } from '@app/services';
import { TranslateService } from '@pe/ng-kit/modules/i18n/index';
import { PePlatformHeaderService } from '@pe/platform-header';
import { PEB_SITE_HOST} from '@pe/sites-app';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header/index';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import {filter, takeUntil, tap} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {PePublishSuccessComponent} from "@modules/_next/shared/publish-sccess/publish-success.component";
import { PeSitesHeaderService } from '@app/services/platform-header-apps-services/sites-header.service';
import { AppThemeEnum } from '@pe/common';
import { PebEnvironmentService } from '@app/services/pebEnv.service';
import { PeSimpleStepperService } from '@pe/stepper';
import { PebSiteBuilderViewComponent } from './builder-view/builder-view.component';
import { PeSiteBuilderPublishComponent } from './builder-publish/builder-publish.component';

@Component({
  selector: 'user-sites-root',
  templateUrl: './sites-root.component.html',
  styleUrls: ['./sites-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosSitesRootComponent implements OnInit {
  patchedElements: NodeListOf<HTMLElement> = null;
  destroyed$ = new Subject<boolean>();
  theme = (this.envService.businessData?.themeSettings?.theme) ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default
  
  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private envService: PebEnvService,
    public peSimpleStepperService: PeSimpleStepperService,
    private siteHeaderService: PeSitesHeaderService,
    private translateService: TranslateService,
    private headerService: PlatformHeaderService,
    private platformHeaderService: PePlatformHeaderService,
    private dialog: MatDialog,
    private wallpaperService: WallpaperService,
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    @Inject(PEB_SITE_HOST) private siteHost: string,
  ) {
  }

  openPublished(site){
    const dialogRef = this.dialog.open(PePublishSuccessComponent, {

      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'publish-backdrop',
      panelClass: 'success-dialog',
      autoFocus: false,
    });
    dialogRef.backdropClick().pipe(
      tap(() => {
        dialogRef.close();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    dialogRef.afterClosed().pipe(
      tap((open) => {
        if(open)   this.messageBus.emit(`${this.entityName}.open-site`, site.accessConfig.internalDomain)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnInit() {

    this.headerService.setPlatformHeader(null);
    this.wallpaperService.showDashboardBackground(false);
    this.siteHeaderService.init();
    this.patchedElements = document.querySelectorAll('.pe-bootstrap');
    this.patchedElements.forEach(
      el => el.classList.remove('pe-bootstrap'),
    );
    merge(   
      this.messageBus.listen(`${this.entityName}.navigate.dashboard`).pipe(
        tap((siteId: string) => this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/dashboard`)),
      ),     
      this.messageBus.listen(`${this.entityName}.navigate.themes`).pipe(
        tap((siteId: string) => this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/themes`)),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.settings`).pipe(
        tap((siteId: string) => this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/settings`)),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.edit`).pipe(
        tap((siteId: string) => this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/edit`)
        ),
      ),
      this.messageBus.listen(`${this.entityName}.open-site`).pipe(
        filter((site: any) => !!site?.name),
        tap((site: any) => window.open(`https://${site.name}.${this.siteHost}`, '_blank')),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen(`site.builder.init`).pipe(
      tap((data: any) => {
        console.log(data,"cxs")
        this.platformHeaderService.assignConfig(Object.assign({}, this.platformHeaderService.config, {
          leftSectionItems: [
            {
              title: 'View',
              icon: '#icon-apps-builder-view',
              iconType: 'vector',
              iconSize: '24px',
              isActive: true,
              onClick: () => {
                const dialogRef = this.dialog.open(PebSiteBuilderViewComponent, {
                  position: {
                    top: '42px',
                    left: '47px',
                  },
                  disableClose: false,
                  hasBackdrop: true,
                  backdropClass: 'builder-backdrop',
                  maxWidth: '267px',
                  width: '267px',
                  panelClass: 'builder-dialog',
                  autoFocus: false,
                });
                dialogRef.backdropClick().pipe(
                  tap(() => {
                    dialogRef.close();
                  }),
                  takeUntil(this.destroyed$),
                ).subscribe();
              }
            },
            {
              title: 'Publish',
              icon: '#icon-apps-builder-publish',
              iconType: 'vector',
              iconSize: '24px',
              onClick: () => {
                const dialogRef = this.dialog.open(PeSiteBuilderPublishComponent, {
                  position: {
                    top: '42px',
                    left: '100px',
                  },
                  disableClose: false,
                  hasBackdrop: true,
                  data,
                  backdropClass: 'builder-backdrop',
                  maxWidth: '286px',
                  width: '286px',
                  panelClass: 'builder-dialog',
                  autoFocus: false,
                });
                dialogRef.backdropClick().pipe(
                  tap(() => {
                    dialogRef.close();
                  }),
                  takeUntil(this.destroyed$),
                ).subscribe();
                dialogRef.afterClosed().pipe(
                  takeUntil(this.destroyed$),
                ).subscribe();
              }
            },
          ]
        }))

      }),
      takeUntil(this.destroyed$)
    ).subscribe(),

      this.messageBus.listen(`site.builder.destroy`).pipe(
        tap((shopId: any) => {
          this.platformHeaderService.assignConfig(Object.assign({}, this.platformHeaderService.config, {
            leftSectionItems: null
          }))
        }),
        takeUntil(this.destroyed$)).subscribe()
  }


  ngOnDestroy() {
    this.patchedElements.forEach(
      el => el.classList.add('pe-bootstrap'),
    );
    this.patchedElements = null;
    this.siteHeaderService.destroy();

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
