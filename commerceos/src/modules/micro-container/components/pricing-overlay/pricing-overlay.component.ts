import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { DomSanitizer } from '@angular/platform-browser';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

export enum appNameEnum {
  Products = 'products',
  Checkout = 'checkout',
  Transactions = 'transactions',
  Settings = 'settings'
}

@Component({
  // tslint:disable-next-line component-selector
  selector: 'pricing-overlay',
  templateUrl: './pricing-overlay.component.html',
  styleUrls: ['pricing-overlay.component.scss']
})
export class PricingOverlayComponent extends AbstractComponent implements OnInit, AfterViewInit {
  @Input() selectBarObj: { appName: string, display: boolean } = { appName: '', display: false };
  pricingSrc: any;

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
  ) { super(); }

  async ngOnInit() {
    this.pricingSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://shopplans.${this.shopUrl}?authToken=${encodeURIComponent(this.authToken)}&merchantMode=true&payEverShop=true`);
  }

  ngAfterViewInit() {
    setTimeout(() => { document.getElementById('pricing-overlay').style.opacity = '1'; }, 1500);
  }
}

