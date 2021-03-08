import { Component, OnInit } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'dashboard-notifications-switcher',
  templateUrl: './dashboard-notifications-switcher.component.html',
  styleUrls: ['./dashboard-notifications-switcher.component.scss']
})
export class DashboardNotificationsSwitcherComponent implements OnInit {
  currentRoute: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.currentRoute = this.activatedRoute.snapshot.children[0].data['page'];
  }

  onChange(button: MatButtonToggleChange) {
    const url = button.value === 'overview' ? './info/apps' : './info/notifications';
    this.router.navigate([url], { relativeTo: this.activatedRoute });
  }
}
