import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SidebarService {
  sideBarOpened$: BehaviorSubject<boolean> = new BehaviorSubject(false);
}