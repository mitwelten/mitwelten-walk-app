import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.startsWith('https://data.mitwelten.org')) {
      const token = '*****';
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${token}`,
          Accept: 'application/json',
        }
      });
    }
    return next.handle(request);
  }
}
