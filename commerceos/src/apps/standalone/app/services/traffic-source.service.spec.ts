import { TestBed } from '@angular/core/testing';
import { TrafficSourceService } from '.';

describe('TrafficSourceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: TrafficSourceService,
        useValue: {}
      },
    ]
  }));

  it('should be created', () => {
    const service: TrafficSourceService = TestBed.get(TrafficSourceService);
    expect(service).toBeTruthy();
  });
});
