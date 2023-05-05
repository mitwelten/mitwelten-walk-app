import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StackImage } from './stack-image.type';
import { Deployment } from './deployment.type';
import { Entry } from './entry.type';
import { SectionText } from './section-text.type';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'https://data.mitwelten.org/api/v3';

  constructor(public readonly http: HttpClient) { }

  public login(): Observable<{authenticated: boolean}> {
    return this.http.get<{authenticated: boolean}>(`${this.apiUrl}/login`);
  }

  public listDeployments(node_id?: number): Observable<Array<Deployment>> {
    const queryParams = node_id !== undefined ? `?node_id=${node_id}` : '';
    return this.http.get<Array<Deployment>>(`${this.apiUrl}/deployments${queryParams}`);
  }

  public listEntries(from?: Date, to?: Date): Observable<Array<Entry>> {
    let params = new HttpParams()
    if (from) params = params.set('from', from?.toISOString());
    if (to) params = params.set('to', to?.toISOString());
    return this.http.get<Array<Entry>>(`${this.apiUrl}/entries`, { params });
  }

  public getEntryById(id: number): Observable<Entry> {
    return this.http.get<Entry>(`${this.apiUrl}/entry/${id}`);
  }

  public postEntry(entry: Partial<Entry>): Observable<Entry> {
    return this.http.post<Entry>(`${this.apiUrl}/entries`, entry);

  }
  public patchEntry(entry: Partial<Entry>): Observable<Entry> {
    if (entry.entry_id) return this.http.patch<Entry>(`${this.apiUrl}/entry/${entry.entry_id}`, entry);
    else throw new Error('entry is missing an ID');
  }

  public deleteEntry(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/entry/${id}`);
  }

  public getImageStack() {
    return this.http.get<StackImage[]>(`${this.apiUrl}/walk/imagestack_s3/42`)
  }

  public getWalkText(walk_id: number) {
    return this.http.get<SectionText[]>(`${this.apiUrl}/walk/text/${walk_id}`)
  }

  public getImageResource(url: string) {
    return this.http.get(`${this.apiUrl}/files/walk/${url}`, {responseType: 'blob'});
  }
}
