import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { CommonModule } from '@pe/ng-kit/modules/common';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { StoreInfoComponent } from '..';
import { FakeTranslateService } from 'test.helpers';
import { By } from '@angular/platform-browser';

describe('StoreInfoComponent', function () {
  let comp: StoreInfoComponent;
  let fixture: ComponentFixture<StoreInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        I18nModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MediaModule,
        CommonModule,
      ],
      declarations: [
        StoreInfoComponent,
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: new FakeTranslateService()
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreInfoComponent);
    comp = fixture.componentInstance;
  });

  describe('Constructor', () =>
    it('should create component', () => expect(comp).toBeDefined())
  );

  describe('Component Store-info content', () => {

    it('should render store-info title', () => {
      comp.title = 'test title';
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.store-info .store-title'));
      expect(element.nativeElement.textContent.trim()).toEqual('test title');
    });

    it('should render store-info logo', () => {
      comp.logo = 'test_logo';
      fixture.detectChanges();
      const element = fixture.debugElement
        .query(By.css('.store-logo img'));
      expect(element.nativeElement.src).toContain('test_logo');
    });

  });

});
