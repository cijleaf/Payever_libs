import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { ApiService, BusinessInterface } from '../../../shared';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'base-switcher',
  templateUrl: './base-switcher.component.html'
})
export class BaseSwitcherComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.apiService.getBusinessesList()
      .subscribe((data: BusinessInterface[]) => {
        if(!data?.length){
          this.router.navigateByUrl('/personal');
          return
        }
        const activeBusiness: BusinessInterface = data.length === 1 ? data[0] : data.find((business: BusinessInterface) => {
          return business.active;
        });
        const url: string = activeBusiness ? `business/${activeBusiness._id}/info/overview` : 'switcher/profile';
        this.router.navigate([url]);
      });
  }

}
