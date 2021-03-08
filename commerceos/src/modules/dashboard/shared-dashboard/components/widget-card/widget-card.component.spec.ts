import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MicroRegistryService } from '@pe/ng-kit/modules/micro';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { WidgetCardComponent } from '@modules/dashboard/shared-dashboard/components';
import { ApiService } from '@modules/shared/services';
import { WidgetsApiService } from '@modules/dashboard/widgets/services';
import { AppLauncherService, EnvService, WallpaperService, HeaderService } from '@app/services';
import { EditWidgetsService } from '../../services';
import { FakeTranslateService } from 'test.helpers';
import { SafeStylePipe } from '@pe/ng-kit/src/kit/media';

@Component({
  template: `
  <widget-card
    [appCode]="'stubApp'"
    [title]="'widget-card.title'"
    [iconSrc]="'#'"
    [learMoreUrl]="'#'"
    [showSpinner]="showSpinner$ | async"
    [showButtonSpinner]="showButtonSpinner$ | async"
    [showInstallAppButton]="false"
    [installAppButtonText]="'widget-card.add-new' | translate"
    (onClick)="onOpenButtonClick()"
  >
    <div class="widget-card-container">
    </div>
    <ng-container more>
      <div class="widget-card-details-container">
      </div>
    </ng-container>
  </widget-card>
  `
})
export class StubWidgetCardComponent extends WidgetCardComponent {

}

describe('WidgetCardComponent', function () {
  let comp: StubWidgetCardComponent;
  let fixture: ComponentFixture<StubWidgetCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
      ],
      declarations: [
        WidgetCardComponent,
        StubWidgetCardComponent,
        SafeStylePipe
      ],
      providers: [
        {
          provide: WidgetsApiService,
          useValue: {}
        },
        {
          provide: AppLauncherService,
          useValue: {}
        },
        {
          provide: EnvService,
          useValue: {}
        },
        {
          provide: TranslateService,
          useValue: new FakeTranslateService()
        },
        {
          provide: WallpaperService,
          useValue: {}
        },
        {
          provide: ApiService,
          useValue: {}
        },
        {
          provide: MicroRegistryService,
          useValue: {}
        },
        {
          provide: EditWidgetsService,
          useValue: {}
        },
        {
          provide: HeaderService,
          useValue: {}
        },
        {
          provide: Router,
          useValue: {}
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StubWidgetCardComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined() )
  );

  describe('Widget card container', () => {
    it('should have widget-card-container', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.widget-card-container')).nativeElement).toBeDefined();
    });

    it('should have title', () => {
      fixture.detectChanges();
      const title = fixture.debugElement.query(By.css('.widget-card-header-title')).nativeElement;
      expect(title.innerText).toMatch(/widget-card.title/i, 'App name is empty');
    });

    it('should have "open" button', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.widget-card-header-buttons button.mat-button-rounded')).nativeElement).toBeDefined();
    });

    it('should have "more" button', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.widget-card-header-buttons .widget-card-header-more')).nativeElement).toBeDefined();
    });

    it('should "more" panel opened', async(() => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.widget-card-header-buttons .widget-card-header-more'));
      button.triggerEventHandler('click', {
        type: 'click',
        stopPropagation: function () {},
        preventDefault: function () {}
      });

      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.widget-card-content-more.widget-opened')).nativeElement).toBeDefined();
    }));
  });

  describe('Widget card container more', () =>
    it('should have widget-card-container-more', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.widget-card-content-more')).nativeElement).toBeDefined();
    })
  );

});
