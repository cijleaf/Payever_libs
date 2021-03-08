export interface ConnectIntegrationInterface {
  enabled: boolean;
  installed: boolean;
  integration: {
    _id: string;
    category: 'payments',
    name: string;
    displayOptions: {
      icon: string;
      title: string;
    },
    installationOptions: {
      countryList: string[];
    }
  };
}
