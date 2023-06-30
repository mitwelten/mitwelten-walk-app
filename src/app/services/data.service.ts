import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Deployment, Entry, ImageStack, SectionText, StackImage, WalkPath } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'https://data.mitwelten.org/api/v3';
  // private apiUrl = 'http://localhost:8000';

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

  /**
   * TODO: how to define a specific interval for fetch a stack?
   *       i.e. fetch images with an interval of 5 minutes in capture time
   * TODO: define threshold when to skip fetch requests
   *       (when moving faster than images can be loaded...)
   * @returns Observable<StackImage[]> A selection of image records
   */
  public getImageStack(stack_id: number = 42) {
    return this.http.get<StackImage[]>(`${this.apiUrl}/walk/imagestack_s3/${stack_id}`)
  }

  public getImageStacks() {
    return this.http.get<ImageStack[]>(`${this.apiUrl}/walk/imagestacks_s3/`)
  }

  public getWalk(walk_id?: number) {
    if (walk_id !== undefined) {
      return this.http.get<WalkPath[]>(`${this.apiUrl}/walk/${walk_id}`)
    } else {
      return this.http.get<WalkPath[]>(`${this.apiUrl}/walk/`)
    }
  }

  public putWalk(walk: WalkPath) {
    return this.http.put<number>(`${this.apiUrl}/walk/`, walk);
  }

  public deleteWalk(walk_id: number) {
    return this.http.delete<number>(`${this.apiUrl}/walk/${walk_id}`);
  }

  public getWalkText(walk_id: number) {
    return this.http.get<SectionText[]>(`${this.apiUrl}/walk/text/${walk_id}`)
  }

  public getImageResource(url: string) {
    return this.http.get(`${this.apiUrl}/files/walk/${url}`, {responseType: 'blob'});
  }

  public postError(payload: unknown) {
    this.http.post(`${this.apiUrl}/sentry`, { payload: payload }).subscribe();
  }
}
