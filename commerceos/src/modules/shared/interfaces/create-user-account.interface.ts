export interface CreateUserAccountInterface {
  hasUnfinishedBusinessRegistration?: boolean;
  registrationOrigin?: {
    url: string,
    account: 'merchant' | 'personal' | 'employee'
  }
}
