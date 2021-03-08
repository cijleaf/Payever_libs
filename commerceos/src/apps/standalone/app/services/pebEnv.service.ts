import { Injectable } from '@angular/core';
import { EnvService } from '@app/services';
import { PebEnvService, BusinessInterface } from '@pe/builder-core';
import { BehaviorSubject } from 'rxjs';
import { MediaUrlPipe, MediaContainerType } from '@pe/ng-kit/modules/media';

@Injectable({
  providedIn: 'platform'
})
export class PebEnvironmentService implements PebEnvService {

  constructor(
    private envService: EnvService,
    private mediaUrlPipe: MediaUrlPipe,
  ) {
  }

  protected shopIdSubject$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  protected terminalIdSubject$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  set shopId(value: string) {
    this.shopIdSubject$.next(value);
  }

  get shopId(): string {
    return this.shopIdSubject$.value;
  }

  get businessId(): string {
    return this.envService.businessUuid;
  }

  get businessData(): BusinessInterface {
    const businessData = this.envService.businessData;
    if (businessData && businessData?.logo)
      businessData.logo = this.mediaUrlPipe.transform(businessData?.logo, MediaContainerType.Images);
    return businessData;
  }

  get channelId(): string {
    return 'channelId';
  }

  set terminalId(value: string) {
    this.terminalIdSubject$.next(value);
  }

  get terminalId(): string {
    return this.terminalIdSubject$.value;
  }

}
