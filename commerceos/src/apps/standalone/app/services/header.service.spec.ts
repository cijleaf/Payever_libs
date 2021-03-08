import { TestBed } from '@angular/core/testing';
import { HeaderService } from '.';

describe('HeaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: HeaderService,
        useValue: {}
      },
    ]
  }));

  it('should be created', () => {
    const service: HeaderService = TestBed.get(HeaderService);
    expect(service).toBeTruthy();
  });
});
