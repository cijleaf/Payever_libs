import { Component, EventEmitter, Input, OnInit, Output, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, empty, timer } from 'rxjs';
import { take, tap, filter, map } from 'rxjs/operators';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { AppSetUpStatusEnum, MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { MicroAppInterface } from '@pe/ng-kit/modules/micro';

import { WidgetsApiService } from '../../../../../modules/dashboard/widgets/services';
import { AppLauncherService, EnvService, WallpaperService, HeaderService } from '../../../../../apps/standalone/app/services';
import { ApiService } from '../../../../shared/services';
import { EditWidgetsService } from '../../services';
import { PeStepperService } from '@pe/stepper';
import { StepperHelperService } from '../../services/stepper-helper.service';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'widget-card',
  templateUrl: './widget-card.component.html',
  styleUrls: ['./widget-card.component.scss']
})
export class WidgetCardComponent extends AbstractComponent implements OnInit {

  @Input() appCode: string;
  @Input() title: string;
  @Input() iconSrc: string;
  @Input() installIconSrc: string;
  @Input() closable: boolean;
  @Input() showSpinner: boolean; // show spinner over the whole widget
  @Input() showButtonSpinner: boolean;
  @Input() showInstallAppButton: boolean = true;
  @Input() showTodosButton: boolean = false;
  @Input() hasExtendedContent: boolean = false;
  @Input() installAppButtonText: string;
  @Input() learMoreUrl: string;
  @Input() editButton: boolean;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() uninstall: EventEmitter<void> = new EventEmitter<void>();

  showInstallAppButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  backgroundImageBlurred: string = '';
  clickable: boolean;
  showTodos: boolean;
  showExtendedContent: boolean;
  notificationsCount: number = 0;

  setupCompleted: boolean;
  appInstalled: boolean;

  constructor(
    private appLauncherService: AppLauncherService,
    private envService: EnvService,
    private wallpaperService: WallpaperService,
    private apiService: ApiService,
    private router: Router,
    private microRegistryService: MicroRegistryService,
    private editWidgetsService: EditWidgetsService,
    private headerService: HeaderService,
    private peStepperService: PeStepperService,
    private stepperHelperService: StepperHelperService,
    private widgetsApiService: WidgetsApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.backgroundImageBlurred = this.wallpaperService.blurredBackgroundImage;

    if (this.onClick.observers.length > 0) {
      this.clickable = true;
    }

    this.setupCompleted = this.setupIsCompleted();

    this.appInstalled = this.appIsInstalled();
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appCode);
    if (micro && micro.code === 'shop') {
      // Small hack for shops when installed=true but shops count is 0. It's not correct.
      this.widgetsApiService.getShops(this.envService.businessUuid).subscribe(shops => {
        if (!shops || shops.length === 0) {
          this.setupCompleted = false;
        }
      });
    }
  }

  setupIsCompleted(): boolean {
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appCode);
    return micro && (micro.setupStatus === AppSetUpStatusEnum.Completed);
  }

  appIsInstalled(): boolean {
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appCode);
    return micro && micro.installed;
  }

  onClose(e: Event) {
    e.stopPropagation();
    this.uninstall.emit();
  }

  onInstallAppClick(): void {
    this.showInstallAppButtonSpinner$.next(true);
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appCode);

    if (this.appCode) {
      this.install().pipe(take(1)).subscribe(() => {
        if (micro && ([AppSetUpStatusEnum.Completed, AppSetUpStatusEnum.Started].indexOf(micro.setupStatus) >= 0)) {
          this.appLauncherService.launchApp(this.appCode).subscribe(
            () => {
              this.editWidgetsService.updateList$.next({});
              this.showInstallAppButtonSpinner$.next(false);
            }
          );
        } else {
          this.navigateToWelcomeScreen();
        }
      });
    }
  }

  onShowTodoClick(): void {
    this.showTodos = !this.showTodos;
  }

  onNotificationCountChange(count: number): void {
    this.notificationsCount = count;
  }

  private install(): Observable<any> {
    const businessId: string = this.envService.businessUuid;
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appCode);
    if (micro) {
      const data = {
        microUuid: micro._id,
        installed: true
      };
      micro.installed = true;
      return this.apiService.toggleInstalledApp(businessId, data);
    }
    return empty();
  }

  private navigateToWelcomeScreen(): void {
    const micro = <MicroAppInterface>this.microRegistryService.getMicroConfig(this.appCode);
    this.headerService.resetHeader();
    this.wallpaperService.showDashboardBackground(false);

    timer(100).subscribe(() => {
      if (micro.setupStatus === AppSetUpStatusEnum.Started && micro.code === 'shop' && this.peStepperService.currentStep) {
        this.stepperHelperService.navigateToStep(this.peStepperService.currentStep.action);
        return;
      }

      const url: string[] = [`business/${this.envService.businessUuid}/welcome/${this.appCode}`];
      this.router.navigate(url);
    });
  }

}
