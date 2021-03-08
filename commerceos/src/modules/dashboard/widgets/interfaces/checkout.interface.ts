
export interface CheckoutInterface {
  readonly _id: string;
  readonly name: string;
  readonly logo: string;
  readonly default: boolean;
}

export interface IntegrationInterface {
  readonly _id: string;
  readonly enabled: boolean;
  readonly installed: boolean;
  readonly integration: IntegrationDetaislInterface;
}

export interface IntegrationDetaislInterface {
  readonly _id: string;
  readonly name: string;
  readonly category: string;
  readonly displayOptions: DisplayOptionsInterface;
}

export interface DisplayOptionsInterface {
  readonly title: string;
  readonly icon: string;
}

export enum IntegrationCategory {
  Payments = 'payments',
  Accountings = 'accountings',
  Shipping = 'shipping',
  Products = 'products',
  ShopSystems = 'shopsystems',
  Communications = 'communications',
  Channels = 'channels',
  Applications = 'applications',
}
