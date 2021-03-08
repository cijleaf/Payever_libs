import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { takeUntil, filter, tap } from 'rxjs/operators';

import { MicroAppInterface, AppSetUpStatusEnum } from '@pe/ng-kit/modules/micro';
import { TerminalInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'pos-widget',
  templateUrl: './pos-widget.component.html',
  styleUrls: ['./pos-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PosWidgetComponent extends AbstractWidgetComponent implements OnInit {
  terminal$: BehaviorSubject<TerminalInterface> = new BehaviorSubject(null);
  showEditButtonSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  terminals: TerminalInterface[] = [];

  readonly appName: string = 'pos';

  constructor(injector: Injector, private cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit(): void {
    // NOTE: this need to open selected terminal when click "Open" in widget
    this.terminal$
      .pipe(
        takeUntil(this.destroyed$),
        filter(terminal => !!terminal),
        tap(terminal => {
          if (terminal) {
            this.widget.data = [
              {
                title: 'widgets.pos.actions.edit-terminal',
                isButton: true,
                onSelect: () => {
                  this.onTerminalEditClick();
                  return EMPTY;
                },
              },
            ];

            this.widget.data.unshift({
              title: terminal.name,
              isButton: false,
              imgSrc: terminal.logo,
            });

            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe((terminal: TerminalInterface) => {
        this.appUrlPath = `${this.appName}/${terminal._id}/dashboard`;
      });

    // Get terminals
    this.widgetsApiService
      .getTerminals(this.envService.businessUuid)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((terminals: TerminalInterface[]) => {
        this.terminals = terminals;

        let terminal: TerminalInterface;
        if (terminals && terminals.length) {
          terminal = terminals.find((t: TerminalInterface) => t.active);
          terminal = terminal || terminals[0];
        }
        this.terminal$.next(terminal);
      });
  }

  onTerminalEditClick(): void {
    this.showEditButtonSpinner$.next(true);
    this.router.navigate(['business', this.envService.businessUuid, 'pos', this.terminal$.value._id, 'edit']);
  }

  onOpenButtonClick(): void {
    this.showButtonSpinner$.next(true);
    if (this.terminal$?.value) {
      this.router.navigate(['business', this.envService.businessUuid, 'pos', this.terminal$.value._id, 'dashboard']);
      return;
    }

    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(this.appName) as MicroAppInterface;
    if ((micro && micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      this.appLauncherService.launchApp(this.appName, this.appUrlPath).subscribe(
        () => {},
        () => {
          this.showButtonSpinner$.next(false);
        },
      );
    } else {
      const url: string = `business/${this.envService.businessUuid}/welcome/${this.appName}`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }
}
