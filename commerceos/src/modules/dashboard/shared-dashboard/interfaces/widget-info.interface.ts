import { WidgetNotification } from '@pe/widgets';

export enum WidgetTypeEnum {
  Apps = 'apps',
  Tutorial = 'tutorial',
  Transactions = 'transactions',
  Connect = 'connect',
  Products = 'products',
  Checkout = 'checkout',
  Coupons = 'coupons',
  Shop = 'shop',
  Marketing = 'marketing',
  Contacts = 'contacts',
  Settings = 'settings',
  Pos = 'pos',
  Studio = 'studio',
  Ads = 'ads'
}

export interface WidgetInfoInterface {
  installedApp: boolean;
  defaultApp: boolean;

  _id: string;
  icon: string;
  title: string;
  type: WidgetTypeEnum;
  installed: boolean;
  setupStatus?: 'notStarted' | 'started' | 'completed'; // TODO enum
  default?: boolean;
  order?: number;
  helpUrl?: string;
  showOnTutorial?: boolean;

  notificationCount?: number;
  notifications?: WidgetNotification[];
  onInstallAppClick: (appName: string) => any;
}
