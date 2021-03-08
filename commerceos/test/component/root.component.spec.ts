import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, async } from '@angular/core/testing';

import { IconsProviderModule } from '@pe/ng-kit/modules/icons-provider';

import { RootComponent } from '../../src/apps/dev/app/root/root.component';

describe('Root component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconsProviderModule, RouterTestingModule],
      declarations: [RootComponent]
    });
  });

  it('Should check if root component is defined.',
    async(() => {
      const fixture = TestBed.createComponent(RootComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeDefined();
    })
  );
});
