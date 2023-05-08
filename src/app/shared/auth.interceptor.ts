import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.startsWith('https://data.mitwelten.org') && this.authService.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${this.authService.token}`,
          Accept: 'application/json',
        }
      });
    }
    return next.handle(request);
  }
}
