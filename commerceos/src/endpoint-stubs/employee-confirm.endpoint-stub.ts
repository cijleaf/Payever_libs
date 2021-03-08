import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

const stubResponse = new HttpResponse({
  body: {}
});

@Injectable()
export class EmployeeConfirmEndpointStub implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const useStubResponse = req.method.toUpperCase() === 'PATCH'
      && req.url.includes(`/api/employees/confirm/`);
    console.log(req.url, req.method.toUpperCase(), useStubResponse);
    return useStubResponse
      ? of(stubResponse)
      : next.handle(req);
  }
}
