// TODO: move all to backend db, call on deploy and store as json
export const LEGAL_FORMS: string[] = [
  'LEGAL_FORM_AG',
  'LEGAL_FORM_EG',
  'LEGAL_FORM_EINZELUNTERN',
  'LEGAL_FORM_EK',
  'LEGAL_FORM_EV',
  'LEGAL_FORM_GBR',
  'LEGAL_FORM_GMBH',
  'LEGAL_FORM_KG',
  'LEGAL_FORM_OHG',
  'LEGAL_FORM_SONSTIGES',
  'LEGAL_FORM_UG'
];

export const INDUSTRY_SECTORS: string[] = [
  'BRANCHE_COMPUTER_ELECTRONIC',
  'BRANCHE_SPIELWAREN',
  'BRANCHE_MUSIK',
  'BRANCHE_GESUNDEIT_PFLEGE',
  'BRANCHE_NOBLE_ACCESSORIES',
  'BRANCHE_HAUSHALTSGARATE_TECHNIK',
  'BRANCHE_MODE_TEXTILIEN',
  'BRANCHE_UHREN_SCHMUCK',
  'BRANCHE_EROTIC',
  'BRANCHE_DIGITAL_GOODS',
  'BRANCHE_SONSTIGES'
];

export const STATUS_ITEMS: string[] = [
  "BUSINESS_STATUS_JUST_LOOKING",
  "BUSINESS_STATUS_HAVE_IDEA",
  "BUSINESS_STATUS_TURN_EXISTING",
  "BUSINESS_STATUS_GROWING_BUSINESS",
  "BUSINESS_STATUS_REPLACE_BUSINESS"
];

export const EMPLOYEES: object[] = [
  {label: 'RANGE_1', min: 1, max: 5},
  {label: 'RANGE_2', min: 6, max: 18},
  {label: 'RANGE_3', min: 19, max: 99},
  {label: 'RANGE_4', min: 100, max: 349},
  {label: 'RANGE_5', min: 350, max: 1499},
  {label: 'RANGE_6', min: 1500}
];

export const SALES: object[] = [
  {label: 'RANGE_1', max: 0},
  {label: 'RANGE_2', min: 0, max: 5000},
  {label: 'RANGE_3', min: 5000, max: 50000},
  {label: 'RANGE_4', min: 50000, max: 250000},
  {label: 'RANGE_5', min: 250000, max: 1000000},
  {label: 'RANGE_6', min: 1000000}
];


export const helpLinksPerLanguage: { [key: string]: string; } = {
  en: 'https://getpayever.com/contact/',
  de: 'https://payever.de/fragen/',
  es: 'https://payever.es/contactanos/',
  no: 'https://payever.no/contact/',
  da: 'https://payever.dk/contact/',
  sv: 'https://payever.se/contact/'
};

export const externalLinks: { [propName: string]: (param?: string) => string } = {
  getHelpLink: (language: string): string => (language === 'en') ? `https://getpayever.com/help` : `https://payever.${language}/help`,
  getBusinessChatLink: (language: string): string =>  {
    return helpLinksPerLanguage[language];
  },
  getWebexMeetingLink: (): string => 'https://calendly.com/payeveren'
};

// apps that should be launched by window event like 'pe-run-<appname>'
export const appsLaunchedByEvent: string[] = [
  'connect',
  'checkout',
  'products',
  'builder',
  'builder-translate',
  'products',
  'shop',
  'pos',
  'marketing',
  'coupons',
  'transactions'
];

// apps that could be added on the same page with dashboard. These apps dispatch event MicroAppReady
export const appsShownWithoutRedirect: string[] = [
  'checkout',
  // 'shop',
  'pos',
  'transactions',
  'connect',
  'products',
  'shipping',
  'statistics',
  'settings',
  'marketing',
  'coupons',
  // 'contacts',
  'builder'
];

// Apps that use new platform header
export const appsUsingGlobalHeader: string[] = [
  'pos',
  'connect',
  'checkout',
  'marketing',
  'coupons',
  'shop',
  'settings',
  'shipping',
  'statistics',
  'products',
  'contacts',
  'builder',
  'transactions'
];

/**
 * Apps that are preloaded when navigating to route
 * @deprecated shouldn't be used
 */
export const preloadedApps: string[] = [];

export const helpLink: (arg: string) => string =
  (language: string) => (language === 'en')
    ? 'https://getpayever.com/help'
    : `https://payever.${language}/help`
;

export const registrationDisabled: boolean = true;

export const entryLogo = {
  width: 148,
  height: 28,
  href: '#icon-commerceos-payever-entry-logo'
};

