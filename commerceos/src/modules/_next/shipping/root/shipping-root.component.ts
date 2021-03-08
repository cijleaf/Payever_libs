import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { WallpaperService } from '@app/services';
import { PeShippingHeaderService } from '@app/services/platform-header-apps-services/shipping-header.service';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { PeSimpleStepperService } from '@pe/stepper';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'cos-shipping-root',
  templateUrl: './shipping-root.component.html',
  styleUrls: ['./shipping-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosShippingRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  theme = (this.envService.businessData.themeSettings?.theme) ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default

  destroyed$ = new Subject<boolean>();

  constructor(
    public peSimpleStepperService: PeSimpleStepperService,
    private wallpaperService: WallpaperService,
    private headerService: PlatformHeaderService,
    private shippingHeaderService: PeShippingHeaderService,
    public router: Router,
    private messageBus: MessageBus,
    private envService: PebEnvService,
  ) {}

  ngOnInit(): void {    
    this.headerService.setPlatformHeader(null);
    this.shippingHeaderService.init();
    this.wallpaperService.showDashboardBackground(false);

    this.patchedElements = document.querySelectorAll('.pe-bootstrap');
    this.patchedElements.forEach(
      el => el.classList.remove('pe-bootstrap'),
    );

    this.messageBus.listen('setting.currency.open').pipe(
      tap(() => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/settings/details/currency`)
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    
  }

  ngOnDestroy(): void {
    this.patchedElements.forEach(
      el => el.classList.add('pe-bootstrap'),
    );
    this.patchedElements = null;
    this.shippingHeaderService.destroy();

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
