import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { tap, filter } from 'rxjs/operators';
import { MicroAppInterface, AppSetUpStatusEnum } from '@pe/ng-kit/modules/micro';
import { EMPTY } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { EnvService } from '@app/services';
import { StudioMedia } from '@modules/dashboard/widgets/interfaces';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'studio-widget',
  templateUrl: './studio-widget.component.html',
  styleUrls: ['./studio-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StudioWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly studioAppUrl: string = 'widgets.studio.url';
  readonly appName: string = 'studio';
  iconUrl: string;
  installIconUrl: string;
  lastUserMedia = [
    {
      image: 'https://media.graphcms.com/resize=w:1355,h:563,fit:crop/output=format:webp/compress/KUgZm8MXTDS8A1fgIz9u',
    },
    {
      image: 'https://media.graphcms.com/resize=w:1355,h:563,fit:crop/output=format:webp/compress/KUgZm8MXTDS8A1fgIz9u',
    },
    {
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSCXABpWh-p3uzmrKOA-l_XgfIG7lU4aaVpFg&usqp=CAU',
    },
    {
      image:
        'https://www.stevens.edu/sites/stevens_edu/files/styles/news_detail/public/shutterstock_1165123768.jpg?itok=haoBDwhQ',
    },
  ];

  constructor(
    injector: Injector,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    protected envService: EnvService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.showSpinner$.next(false);

    this.widgetsApiService
      .getLastStudioItems(this.envService.businessUuid)
      .pipe(
        filter(items => !!items.length),
        tap(items => {
          this.widget.data = items.map((media: StudioMedia) => ({
            title: media.name,
            subtitle: '',
            imgSrc: this.sanitizer.bypassSecurityTrustStyle(`url('${media.url}')`),
            onSelect: media => {
              this.router.navigate([`business/${this.envService.businessUuid}/studio`]);
              return EMPTY;
            },
            onSelectData: media,
          }));
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  onOpenStudioClick(): void {
    window.open(this.translateService.translate(this.studioAppUrl), '_blank');
  }

  onOpenClick() {
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig('studio') as MicroAppInterface;
    if ((micro && micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      this.appLauncherService.launchApp('studio').subscribe();
    } else {
      const url: string = `business/${this.envService.businessUuid}/welcome/studio`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }
}
