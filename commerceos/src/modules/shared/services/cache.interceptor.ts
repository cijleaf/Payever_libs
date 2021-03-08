import { RequestCacheService } from './request-cache.service';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

  constructor(private requestCacheService: RequestCacheService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const cache = this.requestCacheService.getItem(request.url, request.body);

    if (cache) {
      return of(cache)
    }

    return next.handle(request).pipe(
      tap((res: any) => this.requestCacheService.setItem(request.url, request.body, res)),
    );
  }
}
