import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { EmployeeConfirmEndpointStub } from './employee-confirm.endpoint-stub';

export const endpointStubsProviders: any[] = [
  { provide: HTTP_INTERCEPTORS, useClass: EmployeeConfirmEndpointStub, multi: true },
];
