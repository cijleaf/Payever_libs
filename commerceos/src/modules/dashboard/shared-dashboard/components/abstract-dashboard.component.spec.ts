import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Component, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@pe/ng-kit/modules/common';
import { DockerModule, DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { nonRecompilableTestModuleHelper } from '@pe/ng-kit/modules/test';

import { AbstractDashboardComponent } from './abstract-dashboard.component';
import { BaseDashboardComponent, ProfileButtonComponent } from '@modules/dashboard/shared-dashboard/components';
import { BrowserModule } from '@pe/ng-kit/modules/browser';
import { WallpaperService } from '@app/services';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { WallpaperModule } from '@pe/ng-kit/modules/wallpaper';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';
import { HttpClient } from '@angular/common/http';
import { FakeHttpClient } from 'test.helpers';

const stubDockerItems: DockerItemInterface[] = [{
  icon: 'stub_icon',
  title: 'stub_item_1',
  count: 3,
  active: false,
  onSelect: (active: boolean) => {
    console.log(`Stub callback action: active ${active}`);
  }
}, {
  icon: 'stub_icon',
  title: 'stub_item_2',
  count: 3,
  active: false,
  onSelect: (active: boolean) => {
    console.log(`Stub callback action: active ${active}`);
  }
}, {
  icon: 'stub_icon',
  title: 'stub_item_3',
  count: 3,
  active: false,
  onSelect: (active: boolean) => {
    console.log(`Stub callback action: active ${active}`);
  }
}];

@Component({
  template: `
    <base-dashboard [backgroundImage]="backgroundImage"
                    [dockerItems]="dockerItems"
                    [loaded]="true"
                    (dockerItemsChange)="onDockerItemsChange($event)"
                    (profileButtonClicked)="navigateToSwitcher()"
    >
      <div>Stub content</div>
    </base-dashboard>
  `
})
export class StubDashboardLayoutComponent extends AbstractDashboardComponent {

  backgroundImageUrl: string = 'https://networklessons.com/wp-content/uploads/2013/02/stub-tree.jpg';

  constructor(injector: Injector) {
    super(injector);
  }

  navigateToSwitcher(): void {
  }

  protected initDocker(infoBox?: string): void {
    this.dockerItems = stubDockerItems;
  }

}

describe('AbstractDashboardComponent', () => {
  let component: StubDashboardLayoutComponent;
  let fixture: ComponentFixture<StubDashboardLayoutComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      StubDashboardLayoutComponent,
      BaseDashboardComponent,
      ProfileButtonComponent
    ],
    imports: [
      BrowserAnimationsModule,
      CommonModule.forRoot(),
      DockerModule,
      BrowserModule,
      MediaModule,
      WallpaperModule,
    ],
    providers: [
      WallpaperService,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            children: [
              {
                data: {
                  infoBox: 'stub'
                }
              }
            ]
          }
        }
      },
      {
        provide: EnvironmentConfigService,
        useValue: {}
      },
      {
        provide: AuthService,
        useValue: {
          getUserData: () => ({})
        }
      },
      {
        provide: PlatformHeaderService,
        useValue: {}
      },
      {
        provide: HttpClient,
        useValue: new FakeHttpClient()
      }
    ]
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StubDashboardLayoutComponent);
    component = fixture.componentInstance;
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy('fail with initialize component');
    });
  });

  describe('Initialization', () => {
    it('Should init docker items', () => {
      component.ngOnInit();
      fixture.detectChanges();
      expect(component.dockerItems).toEqual(stubDockerItems);
    });
  });

  describe('Profile button click event', () => {
    it('Should detect when profile button was clicked', () => {
      fixture.debugElement
        .query(By.directive(BaseDashboardComponent))
        .componentInstance.profileButtonClicked
        .subscribe((event: MouseEvent) => {
          expect(event).toBeUndefined();
        });
      fixture.debugElement.query(By.directive(BaseDashboardComponent)).componentInstance.profileButtonClicked.emit();
    });
  });

  describe('Docker items change event', () => {
    it('Should detect when docker items changed', () => {
      fixture.debugElement
        .query(By.directive(BaseDashboardComponent))
        .componentInstance.dockerItemsChange
        .subscribe((event: DockerItemInterface[]) => {
          expect(event).toEqual(stubDockerItems);
        });
      fixture.debugElement.query(By.directive(BaseDashboardComponent)).componentInstance.dockerItemsChange.emit(stubDockerItems);
    });
  });

});
