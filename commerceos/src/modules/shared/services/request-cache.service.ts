import { Injectable } from "@angular/core";
import { HttpResponse } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class RequestCacheService {
  private readonly _cache = new Map<string, HttpResponse<any>>();

  getItem<T>(url: string, request: T): HttpResponse<any> {
    return this._cache.get(`${url}-${JSON.stringify(request)}`);
  }

  setItem<T>(url: string, request: T, response: HttpResponse<any>): void {
    this._cache.set(`${url}-${JSON.stringify(request)}`, response);
  }
}
