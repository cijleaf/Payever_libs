import { Injectable } from '@angular/core';

import { RestUrlInterface } from '../../shared';
import * as settings from '../../../settings';

@Injectable()
export class CoreConfigService {

  get INDUSTRY_SECTORS(): string[] {
    return settings.INDUSTRY_SECTORS;
  }

  get LEGAL_FORMS(): string[] {
    return settings.LEGAL_FORMS;
  }

  get STATUS_ITEMS(): string[] {
    return settings.STATUS_ITEMS;
  }

  get EMPLOYEES(): object[] {
    return settings.EMPLOYEES;
  }

  get SALES(): object[] {
    return settings.SALES;
  }

  get externalLinks(): RestUrlInterface {
    return settings.externalLinks;
  }

  getHelpLink(language: string): string {
    return settings.helpLink(language);
  }
}
