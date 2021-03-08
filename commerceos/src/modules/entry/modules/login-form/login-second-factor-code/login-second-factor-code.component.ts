import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostListener,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { HeaderService, LoaderService, WallpaperService } from '@app/services';
import { BusinessInterface, ApiService } from '@modules/shared';

import { AuthService, AuthTokenPayload } from '@pe/ng-kit/modules/auth';
import {
  FormAbstractComponent,
  FormFieldType,
  FormScheme,
  FormSchemeField,
  InputType
} from '@pe/ng-kit/modules/form';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { WindowService } from '@pe/ng-kit/modules/window';
import { LoginFormService } from '../login-form.service';

const CODE_LENGTH = 6;

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[autoFocus]'
})
export class AutofocusDirective implements AfterViewInit, OnChanges {

  @Input() public autoFocus: boolean;

  constructor(
    private el: ElementRef
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.autoFocus && this.autoFocus) {
      this.setFocus();
    }
  }

  public ngAfterViewInit() {
    if (this.autoFocus) {
      this.setFocus();
    }
  }

  private setFocus() {
    const inputNode = this.el.nativeElement.querySelector('input');
    if (inputNode) {
      setTimeout(() => {
        inputNode.focus();
      }, 100);
    } else {
      console.warn('AutoFocus directive: the input node not found');
    }
  }

}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'login-second-factor-code',
  templateUrl: './login-second-factor-code.component.html',
  styleUrls: ['./login-second-factor-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginSecondFactorCodeComponent extends FormAbstractComponent<any> implements OnInit, OnDestroy {

  activeBusiness: BusinessInterface;
  email: string = '';
  returnUrl: string;
  formScheme: FormScheme;
  codeInvalid$: Subject<boolean> = new Subject();
  busy$: Subject<boolean> = new Subject();
  busySendCode$: Subject<boolean> = new Subject();
  currentActive$: BehaviorSubject<number> = new BehaviorSubject(0);

  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(takeUntil(this.destroyed$), filter(isMobile => !!isMobile));

  protected formStorageKey: string = null;
  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private wallpaperService: WallpaperService,
    private platformService: PlatformService,
    private headerService: HeaderService,
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService,
    private loginFormService: LoginFormService,
    private apiService: ApiService,
    private windowService: WindowService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.headerService.loggedIn = false;
    const payload: AuthTokenPayload = this.authService.getRefershTokenData();
    this.email = this.hideEmail(payload.email || '');
    this.platformService.profileMenuChanged = {
      firstName: payload.firstName,
      lastName: payload.lastName
    };
    this.headerService.setTwoFactorPageHeader();
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
    this.wallpaperService.showDashboardBackground(false);
    this.loaderService.hideLoader();
  }

  ngOnDestroy() {
    this.headerService.loggedIn = true;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendCode();
    }
  }

  onSuccessLogin(): void {
    this.loginFormService.executeAfterLoginActions();
    if (this.returnUrl) {
      const fullUrlRegexp = /^(http(s)?:\/\/.).*/;
      if (fullUrlRegexp.test(this.returnUrl)) {
        window.location.replace(this.returnUrl); // use windows instead of router because we can authenticate from external sites
      } else {
        // TODO fix wrong returnUrl
        if (this.returnUrl.includes('second-factor-code')) {
          this.apiService.getBusinessesList().subscribe(businesses => {
            if(!businesses?.length){
              this.router.navigateByUrl('/personal');
              return
            }
            if (businesses.length === 1) {
              const url: string = `business/${businesses[0]._id}/info/overview`;
              this.router.navigate([url]);
              return;
            }
            this.router.navigate(['switcher/profile']);
          });
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      }
    } else {
      this.apiService.getBusinessesList().subscribe(businesses => {
        if(!businesses?.length){
          this.router.navigateByUrl('/personal');
          return
        }
        if (businesses.length === 1) {
          const url: string = `business/${businesses[0]._id}/info/overview`;
          this.router.navigate([url]);
          return;
        }
        this.router.navigate(['switcher/profile']);
      });
    }
  }

  onValueChange(value: string, controlNumber: number) {
    // if user makes copy/paste the code
    if (value && value.length === CODE_LENGTH) {
      Object.keys(this.form.controls).forEach((key, index) => {
        this.form.get(key).setValue(value[index]);
      });
    } else {
      if (value && value.length > 1) {
        this.form.get(`code${controlNumber + 1}`).setValue(value[value.length - 1], { emitEvent: false });
      } else {
        this.form.get(`code${controlNumber + 1}`).setValue(value, { emitEvent: false });
      }

      if (controlNumber < CODE_LENGTH) {
        this.currentActive$.next(controlNumber + 1);
      }
    }

    if (controlNumber === CODE_LENGTH - 1) {
      if (this.checkCodeReady()) {
        this.onSendCode();
      }
    }

    this.codeInvalid$.next(false);
  }

  get code(): string {
    const values: string[] = Object.keys(this.form.value).map(key => this.form.value[key] || '');
    return values.join('');
  }

  checkCodeReady(): boolean {
    let code: string = '';
    if (this.form.valid) {
      code = this.code;

      if (code.length === CODE_LENGTH) {
        return true;
      }
    }
    return false;
  }

  onSendCode() {
    if (!this.checkCodeReady()) {
      this.codeInvalid$.next(true);
    } else {
      this.onSubmit();
      this.busy$.next(true);
    }
  }

  onReSendCode() {
    this.busySendCode$.next(true);
    this.authService.repeatSendCode().subscribe(
      () => this.busySendCode$.next(false),
      () => this.router.navigate(['entry/login'])
    );
  }

  protected createForm(initialData: any): void {

    const groupSettings = {};
    const fieldsets: FormSchemeField[] = [];

    for (let iNumber: number = 1; iNumber <= CODE_LENGTH; iNumber++) {
      const controlName = `code${iNumber}`;
      groupSettings[controlName] = ['', Validators.required];
      fieldsets.push(
        {
          name: controlName,
          type: FormFieldType.Input,
          fieldSettings: {
            classList: `col-xs-12 col-sm-12 form-fieldset-field-padding-24`,
            required: true
          },
          inputSettings: {
            placeholder: '',
            type: InputType.Number,
            nameAttribute: controlName
          }
        }
      );
    }
    this.form = this.formBuilder.group(groupSettings);

    this.formScheme = {
      fieldsets: {
        code: fieldsets
      }
    };
    this.changeDetectorRef.detectChanges();
  }

  protected onSuccess(): void {
    this.authService.secondFactorCode(this.code).subscribe(
      () => {
        window['pe_isSecondFactorJustPassedAsTemporary'] = true; // TODO Remove this hack after ng-kit update
        this.onSuccessLogin();
      },
      () => {
        this.codeInvalid$.next(true);
        this.busy$.next(false);
      }
    );
  }

  protected onUpdateFormData(formValues: any): void {

  }

  private hideEmail(email: string): string {
    if (!email) {
      return email;
    }
    let result: string = email;
    const reg = /(^.{3})(.+)@/g;

    const substr = (reg.exec(email) as Array<string>) || [];
    if (substr && substr.length > 2) {
      result = result.replace(substr[2], '******');
    } else {
        // TODO Remove log
    }

    return result;
  }

}
