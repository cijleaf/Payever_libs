export enum NotificationsTarget {
  'builder.theme.editTheme' = '/builder/shop/{id}/builder/editor',
  'shops.live.goLive' = '/shop/{id}/settings',
  'shops.url.setUrlName' = '/shop/{id}/settings',
  'shops.url.selectBilling' = '/shop/{id}/settings',
  'shops.url.addLogo' = '/shop/{id}/edit/general-details',
  'shops.theme.addTheme' = '/builder/shop/{id}/builder/themes/list/my?themeType=business',
  'shops.url.tour' = '/shop',
  'products.chooseProducts' = '/products/list',
  'pos.url.tour' = '/pos',
  'pos.theme.addTheme' = '/pos', // pos themes not implemented - ignore for now
  'product.newProduct' = '/products/products-editor?addExisting=true&prevProductsPath=list',
  'product.missingImage' = '/products/products-editor/{id}',
  'product.url.tour' = '/products/list',
  'checkout.url.tour' = '/checkout',
  'checkout.payment.addOption' = '/checkout/{id}/panel-payments',
  'checkout.settings.setStyles' = '/checkout/{id}/settings/color-and-style',
  'connect.url.tour' = '/connect',
  'connect.payment.installPayment' = '/connect/payments',
  'transactions.url.tour' = '/transactions',
  'transactions.title.new_transaction' = '/transactions/{id}',
  'legalDocuments.review' = '/settings/policies'
}
