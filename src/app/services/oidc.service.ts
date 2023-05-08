import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { BehaviorSubject, from, of, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OidcService {

  public authStateSubject: BehaviorSubject<boolean>;
  public userDataSubject: ReplaySubject<KeycloakProfile>;

  constructor(
    private keycloakService: KeycloakService
  ) {
    this.authStateSubject = new BehaviorSubject<boolean>(false);
    this.userDataSubject = new ReplaySubject<KeycloakProfile>();
  }

  // sync return state without verification
  public get isLoggedIn() {
    return this.authStateSubject.getValue();
  }

  // verify state and notify listeners on authStateSubject
  public checkLogin() {
    this.keycloakService.isLoggedIn().then(
      state => this.authStateSubject.next(state),
      error => {
        this.authStateSubject.next(false);
        console.error(error);
      }
      );
  }

  public login() {
    this.keycloakService.login();
  }

  public async logout() {
    await this.keycloakService.logout();
    this.keycloakService.clearToken();
  }

  public userData() {
    return from(this.keycloakService.getKeycloakInstance().loadUserProfile());
  }
}
