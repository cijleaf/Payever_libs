import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';
import { PebTerminalCreateComponent } from '@pe/builder-pos';
import { AppSetUpService } from '@pe/ng-kit/modules/micro';
import { EnvService } from '@app/services';
import { PeSimpleStepperService } from '@pe/stepper';
import { AppSetUpStatusEnum } from '@pe/widgets';

import { SetupStepEnum } from '../../enums/setup-step.enum';
import { take } from 'rxjs/operators';

@Component({
  selector: 'cos-create-terminal',
  templateUrl: './create-terminal.component.html',
  styleUrls: ['./create-terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CosCreateTerminalComponent implements OnInit, OnDestroy {
  @ViewChild(PebTerminalCreateComponent) terminalCreateComponent: PebTerminalCreateComponent;

  onInvalidSubject = new BehaviorSubject<boolean>(true);
  onLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private appSetUpService: AppSetUpService,
    public envService: EnvService,
    private pebEnvService: PebEnvService,
    private peStepperService: PeSimpleStepperService,
    private router: Router,
  ) {}

  ngOnInit() {
    combineLatest([
      this.appSetUpService.setStatus(this.envService.businessUuid, 'pos', AppSetUpStatusEnum.Started),
      this.appSetUpService.setStep(this.envService.businessUuid, 'pos', SetupStepEnum.Create),
    ]).pipe(take(1)).subscribe();
  }

  ngOnDestroy() {
    this.peStepperService.hide();
  }

  onCreated(terminalId: string) {
    this.pebEnvService.terminalId = terminalId;
    this.router.navigate([`business/${this.envService.businessUuid}/pos/${terminalId}/dashboard`]);
    this.appSetUpService.setStatus(this.envService.businessUuid, 'pos', AppSetUpStatusEnum.Completed).pipe(take(1)).subscribe();
  }
}
