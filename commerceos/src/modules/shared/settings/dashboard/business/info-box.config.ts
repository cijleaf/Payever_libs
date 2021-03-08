import { PanelInterface } from '../../../interfaces';

export const notificationsPanels: PanelInterface[] = [
  {
    name: 'pos',
    icon: '#icon-apps-pos',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'products',
    icon: '#icon-apps-products',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'orders',
    icon: '#icon-apps-orders',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'store',
    icon: '#icon-apps-store',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'commerce_os',
    icon: '#icon-apps-apps',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'settings',
    icon: '#icon-apps-settings',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'payments',
    icon: '#icon-apps-payments',
    disabled: false,
    adminPanel: false
  }
];

export const posPanels: PanelInterface[] = [
  {
    name: 'notifications_list',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'self_terminal',
    icon: '#icon-apps-checkout',
    disabled: true,
    hasUrl: true,
    adminPanel: false
  },
  {
    name: 'create_order',
    icon: '#icon-apps-orders',
    disabled: true,
    hasUrl: true,
    adminPanel: false
  },
  {
    name: 'settings',
    icon: '#icon-apps-settings',
    disabled: false,
    adminPanel: false
  },
];

export const settingsPanels: PanelInterface[] = [
  {
    name: 'notifications_list',
    disabled: false,
    adminPanel: false
  },
  {
    name: 'settings',
    icon: '#icon-apps-settings',
    disabled: true,
    hasUrl: true,
    adminPanel: false
  },
  {
    name: 'dashboard_skin',
    icon: '#icon-settings-dashboard-skin-48',
    disabled: true,
    hasUrl: true,
    adminPanel: false
  },
  {
    name: 'affiliates',
    icon: '#icon-settings-affiliates-48',
    disabled: true,
    hasUrl: true,
    adminPanel: false
  },
  {
    name: 'staff',
    icon: '#icon-settings-staff-48',
    disabled: true,
    hasUrl: true,
    adminPanel: false
  },
  {
    name: 'mailer',
    icon: '#icon-settings-mailer-48',
    disabled: true,
    hasUrl: true,
    adminPanel: false
  },
  {
    name: 'notifications_builder',
    icon: '#icon-settings-notifications-48',
    disabled: true,
    hasUrl: true,
    adminPanel: true
  }
];

