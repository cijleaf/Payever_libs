import { Injectable, Injector } from '@angular/core';
import { WidgetsApiService } from '../../widgets/services/widgets-api.service';
import { PlatformService, DashboardEventEnum } from '@pe/ng-kit/src/kit/common';
import { EnvService } from '@app/services';
import { filter, map, tap } from 'rxjs/operators';
import { PeWelcomeStepAction, PeWelcomeStepperAction, PeStepperService } from '@pe/stepper';

@Injectable()
export class StepperHelperService { // @deprecated

  private widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);

  constructor(
    private injector: Injector,
    private platformService: PlatformService,
    private envService: EnvService,
    private peStepperService: PeStepperService,
  ) {}

  navigateToStep(action: PeWelcomeStepAction): void {
    if (action !== PeWelcomeStepAction.ShopPreview) {
      this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, true);
    }

    switch (action) {
      case PeWelcomeStepAction.CreateShop:
        this.navigateToCreateShop();
        break;
      case PeWelcomeStepAction.ChooseTheme:
        this.navigateToChooseThemeStep();
        break;
      case PeWelcomeStepAction.UploadProduct:
        this.navigateToUploadProductStep();
        break;
      case PeWelcomeStepAction.ShopPreview:
        this.navigateToBuilderStep();
        break;
    }
  }

  private navigateToCreateShop(): void {
    this.platformService.dispatchEvent({
      target: DashboardEventEnum.MicroNavigation,
      action: '',
      data: {
        url: `shop/create`,
        getParams: {
          themeType: 'business'
        },
        useContainerInsideDashboard: false,
        useCurrentMicroContainer: false,
      }
    });
  }

  private navigateToChooseThemeStep(): void {
    this.widgetsApiService.getShops(this.envService.businessUuid).pipe(
      filter(shops => !!shops && !!shops.length),
      map(shops => shops[0]._id),
      tap(shopId => {
        this.platformService.dispatchEvent({
          target: DashboardEventEnum.MicroNavigation,
          action: '',
          data: {
            url: `builder/shop/${shopId}/builder/themes/list/all`,
            getParams: {
              themeType: 'business'
            },
            useContainerInsideDashboard: false,
            useCurrentMicroContainer: false,
          }
        });
      }),
    ).subscribe();
  }

  private navigateToUploadProductStep(): void {
    this.widgetsApiService.getShops(this.envService.businessUuid).pipe(
      filter(shops => !!shops && !!shops.length),
      map(shops => shops[0]),
      tap(shop => {
        this.platformService.dispatchEvent({
          target: DashboardEventEnum.MicroNavigation,
          action: '',
          data: {
            url: 'products/select-products',
            getParams: {
              embedded: true,
              app: 'shop',
              parentAppId: shop._id,
              parentApp: 'shop',
              appId: shop._id,
              channelSet: shop.channelSet,
              stepper: true,
            },
          },
        });
      }),
    ).subscribe();
  }

  private navigateToBuilderStep(): void {
    this.widgetsApiService.getShops(this.envService.businessUuid).pipe(
      filter(shops => !!shops && !!shops.length),
      map(shops => shops[0]._id),
      tap(shopId => {
        this.platformService.dispatchEvent({
          target: DashboardEventEnum.MicroNavigation,
          action: '',
          data: {
            url: `builder/shop/${shopId}/builder/viewer`,
            getParams: {
              themeType: 'business'
            },
            useContainerInsideDashboard: false,
            useCurrentMicroContainer: false,
          }
        });
      }),
    ).subscribe();
  }

}
