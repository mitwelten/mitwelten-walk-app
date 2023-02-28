import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Deployment } from './deployment.type';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'https://data.mitwelten.org/manager/v2';

  constructor(public readonly http: HttpClient) { }

  public listDeployments(node_id?: number): Observable<Array<Deployment>> {
    const queryParams = node_id !== undefined ? `?node_id=${node_id}` : '';
    return this.http.get<Array<Deployment>>(`${this.apiUrl}/deployments${queryParams}`);
  }
}
