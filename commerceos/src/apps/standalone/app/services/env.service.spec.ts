import { TestBed } from '@angular/core/testing';
import { EnvService } from '.';

describe('EnvService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: EnvService,
        useValue: {}
      },
    ]
  }));

  it('should be created', () => {
    const service: EnvService = TestBed.get(EnvService);
    expect(service).toBeTruthy();
  });
});
