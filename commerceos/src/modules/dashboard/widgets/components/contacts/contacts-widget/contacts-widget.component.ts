import { Component, Injector, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';

import { SectionInterface } from '../../../../shared-dashboard/components';
import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'contacts-widget',
  templateUrl: './contacts-widget.component.html',
  styleUrls: ['./contacts-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ContactsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  sections: SectionInterface[] = [{
    title: 'widgets.contacts.sections.contacts.title',
    value: '0',
  },
  {
    title: 'widgets.contacts.sections.groups.title',
    value: '0',
  }];
/*
  contacts: any = [
    // {
    //   firstName: 'Harry',
    //   lastName: 'Oldman',
    //   status: 'Cashier'
    // }
  ];
*/
  addContactLoading = false;
  readonly appName: string = 'contacts';

  constructor(injector: Injector, private cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit() {
    this.widget.data = [
      {
        title: 'widgets.contacts.sections.contacts.title',
        icon: '',
        isButton: false,
        subtitle: '0',
      },
      {
        title: 'widgets.contacts.sections.groups.title',
        icon: '',
        isButton: false,
        subtitle: '0',
      },
      {
        title: 'widgets.contacts.actions.add-contact',
        isButton: true,
        icon: '',
      }
    ];
  }

  onAddContact() {
    this.addContactLoading = true;
    this.cdr.detectChanges();
    this.loaderService.loadMicroScript(this.appName, this.envService.businessUuid).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      () => {
        this.router.navigate(['business', this.envService.businessUuid, this.appName, 'add-contact'])
          .then(() => {
            this.addContactLoading = false;
            this.cdr.detectChanges();
          });
      },
      () => {
        this.addContactLoading = false;
        this.cdr.detectChanges();
      }
    );
  }
}
