import { TestBed, async } from '@angular/core/testing';
import { ApiService } from '.';
import { FakeHttpClient, FakeEnvironmentConfigService, FakeTranslateService, FakeAuthService } from 'test.helpers';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { TranslateService, LANG } from '@pe/ng-kit/modules/i18n';
import { AuthService } from '@pe/ng-kit/src/kit/auth';

// TODO: Made proper tests to all methods
describe('ApiService', () => {
  let service: ApiService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        {
          provide: TranslateService,
          useValue: new FakeTranslateService()
        },
        {
          provide: AuthService,
          useValue: new FakeAuthService()
        },
        {
          provide: EnvironmentConfigService,
          useValue: new FakeEnvironmentConfigService()
        },
        {
          provide: HttpClient,
          useValue: new FakeHttpClient()
        },
        {
          provide: LANG,
          useValue: ''
        },
      ]
    });
    service = TestBed.get(ApiService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get UserLogo', () => {
    let result: any;
    service.getUserLogo('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get Notifications', () => {
    let result: any;
    service.getNotifications().subscribe(r => result = r);
    expect(result).toBeDefined();
  });

  it('should get Transactions', () => {
    let result: any;
    service.getTransactions('', 1, '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get BusinessesList', () => {
    let result: any;
    service.getBusinessesList().subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get UsersByFilters', () => {
    let result: any;
    service.getUsersByFilters({}, 1).subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get BusinessesListWithParams', () => {
    let result: any;
    service.getBusinessesListWithParams([1], '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get BusinessData', () => {
    let result: any;
    service.getBusinessData('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get BusinessWallpaper', () => {
    let result: any;
    service.getBusinessWallpaper('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get PersonalWallpaper', () => {
    let result: any;
    service.getPersonalWallpaper().subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get UserAccount', () => {
    let result: any;
    service.getUserAccount().subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should create UserAccount', () => {
    let result: any;
    service.createUserAccount({} as any).subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should get BusinessProductWithIndustriesList', () => {
    let result: any;
    service.getBusinessProductWithIndustriesList().subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should enable Business', () => {
    let result: any;
    service.enableBusiness('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should create Company', () => {
    let result: any;
    service.createCompany({}).subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should register Uuid', () => {
    let result: any;
    service.registerUuid('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should request PasswordResetEmail', () => {
    let result: any;
    service.requestPasswordResetEmail({}).subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should reset Password', () => {
    let result: any;
    service.resetPassword({}, '').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should verify Email', () => {
    let result: any;
    service.verifyEmail('').subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

  it('should toggle InstalledApp', () => {
    let result: any;
    service.toggleInstalledApp('', {}).subscribe(r => result = r);
    expect(result).not.toBeDefined();
  });

});
