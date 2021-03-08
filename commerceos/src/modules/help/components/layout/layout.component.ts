import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  isHelpActive: boolean = false;
  loading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.isHelpActive = this.activatedRoute.snapshot.data['isHelp'];
  }

  navigateBack(): void {
    this.loading = true;
    this.location.back();
  }

}
