import { Component, Injector, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';

import { map, takeUntil, tap } from 'rxjs/operators';

import { retrieveLocale } from '@pe/ng-kit/modules/i18n';

import { AbstractWidgetComponent } from '../../abstract-widget.component';
import { WidgetTutorialInterface } from '../../../../shared-dashboard/interfaces';
import { EditWidgetsService } from '../../../../shared-dashboard/services';
import { EMPTY } from 'rxjs';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'tutorial-widget',
  templateUrl: './tutorial-widget.component.html',
  styleUrls: ['./tutorial-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TutorialWidgetComponent extends AbstractWidgetComponent implements OnInit {
  protected appName: string = '';

  protected defaultTutorial: string = 'tutorial';

  constructor(injector: Injector, private editWidgetsService: EditWidgetsService, private cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit() {
    this.editWidgetsService.widgetTutorials$
      .pipe(
        takeUntil(this.destroyed$),
        map(list => {
          const firstList = [];
          const defaultTutorial = list.find(tutorial => tutorial.type === this.defaultTutorial);
          if (defaultTutorial) {
            firstList.push(defaultTutorial);
          }

          const listWithoutDefaultTutorial = list.filter(tutorial => tutorial.type !== this.defaultTutorial);
          while (firstList.length < 2 && firstList.length !== list.length) {
            const index = Math.round(Math.random() * (listWithoutDefaultTutorial.length - 1));
            if (firstList.indexOf(listWithoutDefaultTutorial[index]) === -1) {
              firstList.push(listWithoutDefaultTutorial[index]);
            }
          }

          const otherTutorialsList = list.filter(item => !firstList.includes(item));

          return [firstList, otherTutorialsList];
        }),
        tap(([firstList, otherTutorialsList]) => {
          this.widget.data = firstList.map(tutorial => ({
            title: 'widgets.tutorial.type.' + tutorial.type,
            icon: '#icon-video-camera-20',
            subIcon: tutorial.watched ? '#icon-visibility-16' : '',
            onSelect: () => {
              this.onWatchTutorial(tutorial);
              return EMPTY;
            },
            onSelectData: tutorial,
            isButton: true,
            buttonText: 'widgets.tutorial.watch',
            // buttonIcon: '#icon-tutorial-open-link',
          }));
          this.widget.notificationCount = otherTutorialsList.length;
          this.widget.notifications = otherTutorialsList.map(tutorial => ({
            message: 'widgets.tutorial.type.' + tutorial.type,
            openFn: () => {
              this.onWatchTutorial(tutorial);
              return EMPTY;
            },
            notProcessLoading: true,
          }));

          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  onUninstall() {
    this.editWidgetsService.uninstall(this.widget._id);
  }

  onWatchTutorial(tutorial: WidgetTutorialInterface) {
    if (!tutorial.watched) {
      this.editWidgetsService.tutorialWatched(tutorial._id).toPromise().then();
    }
    const translatedTutor = tutorial.urls ? tutorial.urls.find(a => a.language === retrieveLocale()) : null;
    const defaultTutor = tutorial.urls ? tutorial.urls.find(a => a.language === 'en') : null; // TODO Use constant
    if (translatedTutor && translatedTutor.url) {
      window.open(translatedTutor.url, '_blank');
    } else if (defaultTutor && defaultTutor.url) {
      window.open(defaultTutor.url, '_blank');
    } else if (tutorial.url) {
      window.open(tutorial.url, '_blank');
    } else {
      console.error('The selected tutorial has no proper URL');
    }
  }
}
