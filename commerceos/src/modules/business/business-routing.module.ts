import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivateUserLangGuard, TranslationGuard } from '@pe/ng-kit/modules/i18n';
import { MicroLoaderGuard } from '@pe/ng-kit/modules/micro';

import {
  BusinessDashboardLayoutComponent, BusinessLayoutComponent,
  WelcomeScreenComponent
} from './components';

import { BusinessAppRegistryGuard } from './guards';
import { BusinessDataResolver } from './resolvers';
import { BusinessWallpaperGuard } from '../../apps/standalone/app/guards';
import { WelcomeScreenBusinessGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'info/overview'
    // redirectTo: ''
  },
  {
    path: '',
    component: BusinessDashboardLayoutComponent,
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [
      BusinessWallpaperGuard,
      BusinessAppRegistryGuard,
      ActivateUserLangGuard,
      TranslationGuard
    ],
    data: {
      i18nDomains: ['commerceos-app', 'ng-kit-ng-kit']
    },
    children: [
      {
        path: 'info/overview',
        // canActivate: [ MicroLoaderGuard ],
        loadChildren: () => import('../dashboard/widgets/widgets-dashboard.module').then(m => m.WidgetsDashboardModule),
        data: {
          dependencies: {
            //micros: ['builder'] // TODO Maybe can remove as MicroLoaderGuard removed
          },
          useMicroUrlsFromRegistry: true,
        }
      },
    ],
  },
  {
    path: '',
    component: BusinessLayoutComponent,
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [ BusinessWallpaperGuard, BusinessAppRegistryGuard, ActivateUserLangGuard, TranslationGuard ],
    data: {
      i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
    }
  },

  // modules that defined in other packages
  {
    path: 'shop', // NEW SHOP ENABLED
    loadChildren: () => import('../_next/shop/next-shop.module').then(
      m => m.CosNextShopModule,
    ),
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [ BusinessAppRegistryGuard ]
  },
  {
    path: 'studio',
    loadChildren: () => import('../_next/studio/next-studio.module').then(
      m => m.CosNextStudioModule
    ),
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [BusinessWallpaperGuard]
  },
  {
    path: 'contacts',
    loadChildren: () => import('../_next/contacts/cos-contacts.module').then(
      m => m.CosContactsModule,
      ),
      resolve: {
        businessData: BusinessDataResolver
    },
    canActivate: [ BusinessAppRegistryGuard ]
  },
  {
    path: 'site',
    loadChildren: () => import('../_next/sites/cos-sites.module').then(m => m.CosSitesModule),
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [ BusinessAppRegistryGuard ]

  },
  // {
  //   path: 'transactions',
  //   loadChildren: () => import('../_next/transactions/cos-transactions.module').then(
  //     m => m.CosTransactionsModule,
  //     ),
  //     resolve: {
  //       businessData: BusinessDataResolver
  //   },
  //   canActivate: [ BusinessAppRegistryGuard ]
  // },
  {
    path: 'pos',
    loadChildren: () =>
      import('../_next/pos/next-pos.module').then(m => m.CosNextPosModule),
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [BusinessAppRegistryGuard],
  },
  {
    path: 'info/search',
    loadChildren: () => import('../dashboard/search/search-dashboard.module').then(m => m.SearchDashboardModule),
    resolve: {
      businessData: BusinessDataResolver
    }
  },
  {
    path: 'info/edit',
    loadChildren: () => import('../dashboard/edit-apps/edit-apps-dashboard.module').then(m => m.EditAppsDashboardModule),
    resolve: {
      businessData: BusinessDataResolver
    }
  },
  {
    path: 'welcome/commerceos',
    component: WelcomeScreenComponent,
    canActivate: [ ActivateUserLangGuard, BusinessWallpaperGuard, TranslationGuard, WelcomeScreenBusinessGuard ],
    data: {
      i18nDomains: ['commerceos-welcome-app', 'ng-kit-ng-kit'],
    }
  },
  {
    path: 'welcome/:appName',
    component: WelcomeScreenComponent,
    canActivate: [ ActivateUserLangGuard, BusinessWallpaperGuard, BusinessAppRegistryGuard, TranslationGuard ],
    data: {
      i18nDomains: ['commerceos-welcome-app', 'ng-kit-ng-kit'],
    }
  },
  // {
  //   path: 'connect',
  //   loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
  //   canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
  //   resolve: {
  //     businessData: BusinessDataResolver
  //   }
  // },
  //  {
  //    path: 'checkout',
  //    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
  //    canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
  //    resolve: {
  //       businessData: BusinessDataResolver
  //    }
  //  },
  {
    path: 'connect',
    loadChildren: () => import('../_next/connect/cos-connect.module').then(
      m => m.CosConnectModule,
    ),
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [ BusinessAppRegistryGuard ]
  },
  {
    path: 'checkout',
    loadChildren: () => import('../_next/checkout/cos-checkout.module').then(
      m => m.CosCheckoutModule,
    ),
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [ BusinessAppRegistryGuard ]
  },
  {
    path: 'shipping',
    loadChildren: () => import('../_next/shipping/cos-shipping.module').then(m => m.CosShippingModule),
    // canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
    // resolve: {
    //   businessData: BusinessDataResolver
    // }
  },
  {
    path: 'statistics',
    loadChildren: () => import('../_next/statistics/cos-statistics.module').then(m => m.CosStatisticsModule),
    // canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
    // resolve: {
    //   businessData: BusinessDataResolver
    // }
  },
  // {
  //   path: 'shop',
  //   loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
  //   canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
  //   resolve: {
  //     businessData: BusinessDataResolver
  //   }
  // },
  {
    path: 'pos',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
    resolve: {
      businessData: BusinessDataResolver
    }
  },
  {
    path: 'products',
    loadChildren: () => import('../_next/products/cos-products.module').then(
      m => {
        return m.CosProductsModule
      },
    ),
    // resolve: {
    //   businessData: BusinessDataResolver
    // },
    canActivate: [ BusinessAppRegistryGuard ]
    // loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    // canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
    // resolve: {
    //   businessData: BusinessDataResolver
    // }
  },
  {
    path: 'transactions',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
    resolve: {
      businessData: BusinessDataResolver
    }
  },
  {
    path: 'settings',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
    resolve: {
      businessData: BusinessDataResolver
    }
  },
  {
    path: 'old-builder',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
    resolve: {
      businessData: BusinessDataResolver
    }
  },
  {
    path: 'builder-translate',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard]
  },
  {
    path: 'marketing',
    loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
    resolve: {
      businessData: BusinessDataResolver
    },
    canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard, TranslationGuard],
    data: {
      i18nDomains: ['commerceos-app', 'ng-kit-ng-kit'],
    }
  },
  // {
  //   path: 'contacts',
  //   loadChildren: () => import('../micro-container/micro-container.module').then(m => m.MicroContainerModule),
  //   canActivate: [BusinessWallpaperGuard, BusinessAppRegistryGuard],
  //   resolve: {
  //     businessData: BusinessDataResolver
  //   }
  // },
  {
    path: 'coupons',
    loadChildren: () => import('../_next/coupons/cos-coupons.module').then(m => m.CosCouponsModule),
    canActivate: [BusinessWallpaperGuard],
    resolve: {
      businessData: BusinessDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PEBusinessRoutingModule {
}
