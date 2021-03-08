import { TestBed, async } from '@angular/core/testing';
import { NotificationsService } from '.';
import { EnvService } from '@app/services';
import {
  FakeEnvService, FakeEnvironmentConfigService, FakePlatformService,
  FakeHttpClient, FakeRouter, FakeActivatedRoute
} from 'test.helpers';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        {
          provide: EnvService,
          useValue: new FakeEnvService()
        },
        {
          provide: EnvironmentConfigService,
          useValue: new FakeEnvironmentConfigService()
        },
        {
          provide: PlatformService,
          useValue: new FakePlatformService()
        },
        {
          provide: HttpClient,
          useValue: new FakeHttpClient()
        },
        {
          provide: Router,
          useValue: new FakeRouter()
        },
        {
          provide: ActivatedRoute,
          useValue: new FakeActivatedRoute()
        }
      ]
    });
    service = TestBed.get(NotificationsService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
