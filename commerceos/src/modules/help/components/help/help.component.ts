import { Component, Inject, OnInit } from '@angular/core';

import { LANG } from '@pe/ng-kit/modules/i18n';

import { CoreConfigService } from '../../../shared';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  links: { [key: string]: string; } = {
    helpLink: null,
    chatLink: null,
    webexMeetingLink: null
  };

  constructor(private coreConfigService: CoreConfigService,
              @Inject(LANG) private lang: string) {}

  ngOnInit(): void {
    this.links.helpLink = this.coreConfigService.externalLinks['getHelpLink'](this.lang);
    this.links.chatLink = this.coreConfigService.externalLinks['getBusinessChatLink'](this.lang);
    this.links.webexMeetingLink = this.coreConfigService.externalLinks['getWebexMeetingLink']();
  }
}
