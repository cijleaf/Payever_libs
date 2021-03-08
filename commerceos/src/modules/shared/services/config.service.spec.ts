import { TestBed } from '@angular/core/testing';
import { CoreConfigService } from '.';

describe('CoreConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: CoreConfigService,
        useValue: {}
      },
    ]
  }));

  it('should be created', () => {
    const service: CoreConfigService = TestBed.get(CoreConfigService);
    expect(service).toBeTruthy();
  });
});
