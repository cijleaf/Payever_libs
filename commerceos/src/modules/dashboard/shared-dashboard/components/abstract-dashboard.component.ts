import {Injector, ChangeDetectorRef, OnInit, Type} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';

import { DockerItemInterface } from '@pe/ng-kit/modules/docker';
import { AbstractComponent, LoaderManagerService } from '@pe/ng-kit/modules/common';

import { WallpaperService } from '../../../../apps/standalone/app/services';

export abstract class AbstractDashboardComponent extends AbstractComponent implements OnInit {

  backgroundImage: string;
  dockerItems: DockerItemInterface[] = [];

  protected activatedRoute: ActivatedRoute = this.injector.get<ActivatedRoute>(ActivatedRoute as Type<ActivatedRoute>);
  protected changeDetectorRef: ChangeDetectorRef = this.injector.get<ChangeDetectorRef>(ChangeDetectorRef as Type<ChangeDetectorRef>);
  protected loaderManagerService: LoaderManagerService =
    this.injector.get<LoaderManagerService>(LoaderManagerService as Type<LoaderManagerService>);

  protected wallpaperService: WallpaperService =
    this.injector.get<WallpaperService>(WallpaperService as Type<WallpaperService>);

  constructor(protected injector: Injector) {
    super();
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.children && this.activatedRoute.snapshot.children[0]) {
      const infoBoxType: string = this.activatedRoute.snapshot.children[0].data['infoBox'];
      this.initDocker(infoBoxType);
    }
  }

  onDockerItemsChange(items: DockerItemInterface[]): void {
    this.dockerItems = items;
  }

  protected abstract initDocker(infoBox?: string): void;

  protected showChatButton(): void {}

  protected hideChatButton(): void {}

  private preloadImage(src: string): Observable<Event> {
    const image: HTMLImageElement = new Image();
    image.src = src;
    return fromEvent(image, 'load');
  }

}
