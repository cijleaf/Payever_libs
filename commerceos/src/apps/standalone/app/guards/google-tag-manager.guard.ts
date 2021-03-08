import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';


@Injectable()
export class GoogleTagManagerGuard implements CanActivate {

  readonly GTM = 'GTM-MBL7K5';
  readonly elemId = 'pe-google-tag-manager';

  constructor() {}

  canActivate(): boolean {
    if (!document.getElementById(this.elemId)) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = this.elemId;
      script.innerHTML =
        "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n" +
        "        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n" +
        "      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n" +
        "      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n" +
        "    })(window,document,'script','dataLayer','" + this.GTM + "');";
      document.getElementsByTagName('head')[0].appendChild(script);
    }
    return true;
  }
}
