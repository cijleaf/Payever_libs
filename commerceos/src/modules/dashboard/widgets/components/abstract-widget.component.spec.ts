import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { LoaderService } from '@modules/shared/services';
import { WidgetsApiService } from '@modules/dashboard/widgets/services';
import { AppLauncherService, EnvService, HeaderService } from '@app/services';
import { AbstractWidgetComponent } from './abstract-widget.component';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { WidgetInfoInterface } from '@modules/dashboard/shared-dashboard/interfaces';
import { skip } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  template: `
  <div></div>
  `
})
export class StubAbstractWidgetComponent extends AbstractWidgetComponent {
  appName: string;

  widget: WidgetInfoInterface = {
    _id: '',
    defaultApp: false,
    icon: '',
    installed: false,
    title: 'stub',
    type: null
  }

  constructor(
    injector: Injector
  ) {
    super(injector);
  }
}

describe('AbstractWidgetComponent', function () {
  let comp: StubAbstractWidgetComponent;
  let fixture: ComponentFixture<StubAbstractWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        StubAbstractWidgetComponent
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: {}
        },
        {
          provide: AppLauncherService,
          useValue: {
            launchApp: new Subject()
          }
        },
        {
          provide: MicroRegistryService,
          useValue: {
            getMicroConfig: () => ({
              micro: {
                started: false
              }
            })
          }
        },
        {
          provide: EnvService,
          useValue: {}
        },
        {
          provide: Router,
          useValue: {
            navigate: () => {}
          }
        },
        {
          provide: LoaderService,
          useValue: {}
        },
        {
          provide: PlatformService,
          useValue: {}
        },
        {
          provide: HeaderService,
          useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StubAbstractWidgetComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Widget info input', () =>
    it('should have showInstallButton = true', () =>
      expect(comp.showInstallButton).toBeTruthy()
    )
  );

  describe('Open click handler is available', () =>
    it('should have onOpenButtonClick handler', () =>
      expect(comp.onOpenButtonClick).toBeTruthy()
    )
  );

  describe('Open click handler shows spinner', () =>
    it('should show spinner', () => {
      comp.showButtonSpinner$.pipe(skip(1)).subscribe((show) =>
        expect(show).toBeTruthy()
      );

      comp.onOpenButtonClick();
      fixture.detectChanges();
    })
  );

  describe('Open click handler hides spinner', () =>
    it('should hide spinner', () => {
      comp['microRegistryService'] = {
        getMicroConfig: () => ({
          micro: {
            started: true
          }
        })
      } as any;

      comp.showButtonSpinner$.pipe(skip(2)).subscribe((show) =>
        expect(show).toBeFalsy()
      );

      comp.onOpenButtonClick();
      fixture.detectChanges();
    })
  );

});
