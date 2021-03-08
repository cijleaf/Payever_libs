import { TestBed } from '@angular/core/testing';
import { HttpContentTypeInterceptor } from '.';

describe('HttpContentTypeInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: HttpContentTypeInterceptor,
        useValue: {}
      },
    ]
  }));

  it('should be created', () => {
    const service: HttpContentTypeInterceptor = TestBed.get(HttpContentTypeInterceptor);
    expect(service).toBeTruthy();
  });
});
