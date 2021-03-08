import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

interface PricingObj {
  appName: string;
  displayBar: boolean;
  daysLeft: number;
  displayApp: boolean;
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'select-plan-bar',
  templateUrl: './select-plan-bar.component.html',
  styleUrls: ['select-plan-bar.component.scss']
})
export class SelectPlanBarComponent implements OnInit {

  @Input() pricingObj: PricingObj = { appName: '', displayBar: false, daysLeft: 0, displayApp: true };
  @Output() showPricingOverlay: EventEmitter<boolean> = new EventEmitter();
  pricingSrc: any;
  spinner = false;

  get shopUrl(): string  {
    return this.configService.getPrimaryConfig().shopHost;
  }

  get authToken(): string {
    return this.authService.token;
  }

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private configService: EnvironmentConfigService,
  ) { }

  ngOnInit() {
    this.pricingSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://shopplans.${this.shopUrl}?authToken=${encodeURIComponent(this.authToken)}&merchantMode=true&payEverShop=true`);
  }

  showPricing() {
    this.spinner = true;
    this.showPricingOverlay.emit(true);
  }
}

