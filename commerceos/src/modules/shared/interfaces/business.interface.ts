import { PeThemeEnum } from '@app/interfaces/theme.interface';

export interface BusinessInterface {
  _id: string;
  active?: boolean;
  city: string;
  country: string;
  hidden: string;
  legalForm: string;
  name: string;
  phone: string;
  street: string;
  zipCode: string;
  logo?: string;
  companyAddress?: {
    country: string;
    city: string;
  };
  companyDetails?: {
    industry: string;
    product: string;
    status: string;
  };
  contactDetails?: any;
  email?: string;
  wallpaper: string;
  themeSettings?: {
    _id?: string;
    theme?: PeThemeEnum;
  };
  currentWallpaper?: {
    _id?: string;
    theme?: PeThemeEnum;
    auto?: boolean;
  };
}
