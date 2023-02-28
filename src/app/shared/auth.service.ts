import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { DataService } from './data.service';

export interface Credentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _token: string | null = null;

  public authStateSubject: BehaviorSubject<boolean>;

  constructor(
    private router: Router,
    private dataService: DataService,
  ) {
    const token = localStorage.getItem('credentials');
    this._token = token ? JSON.parse(token) : token;
    this.authStateSubject = new BehaviorSubject<boolean>(false);
  }

  public get token(): string | null {
    return this._token;
  }

  public set token(value: string | null) {
    this._token = value;
    if (value === null) {
      localStorage.removeItem('credentials');
      this.authStateSubject.next(false);
    }
  }

  public get isLoggedIn() {
    return this.authStateSubject.getValue();
  }

  public login(credentials: Credentials): Observable<boolean> {
    this._token = btoa(`${credentials.username}:${credentials.password}`);
    return this.dataService.login().pipe(
      map(response => response.authenticated),
      map(loggedIn => {
        if (loggedIn) {
          history.pushState('logged in', '');
          this.authStateSubject.next(true);
          localStorage.setItem('credentials', JSON.stringify(this._token));
        }
        return loggedIn;
      })
    );
  }

  public logout() {
    this.token = null;
  }

  public checkLogin() {
    if (this.authStateSubject.getValue()) {
      this.authStateSubject.next(true);
    } else if (this._token !== null) {
      this.dataService.login().pipe(map(state => state.authenticated))
        .subscribe(state => this.authStateSubject.next(state));
    } else {
      this.authStateSubject.next(false);
    }
  }

}
