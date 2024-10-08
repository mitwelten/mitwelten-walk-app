import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Deployment, Note, ImageStack, SectionText, StackImage, WalkPath } from '../shared';
import { HotspotCommunity, HotspotDataPayload, HotspotType, WildeNachbarnProperties } from './hotspot.service';
import { Feature, FeatureCollection, Point } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'https://data.mitwelten.org/api/v3';
  // private apiUrl = 'http://localhost:8000';

  public deployments = new BehaviorSubject<Array<Deployment>>([]);

  constructor(public readonly http: HttpClient) { }

  public login(): Observable<{authenticated: boolean}> {
    return this.http.get<{authenticated: boolean}>(`${this.apiUrl}/login`);
  }

  public listDeployments(node_id?: number): Observable<Array<Deployment>> {
    const queryParams = node_id !== undefined ? `?node_id=${node_id}` : '';
    return this.http.get<Array<Deployment>>(`${this.apiUrl}/deployments${queryParams}`)
      .pipe(tap(deployments => this.deployments.next(deployments)));
  }

  public listNotes(from?: Date, to?: Date): Observable<Array<Note>> {
    let params = new HttpParams()
    if (from) params = params.set('from', from?.toISOString());
    if (to) params = params.set('to', to?.toISOString());
    return this.http.get<Array<Note>>(`${this.apiUrl}/notes`, { params });
  }

  public getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/note/${id}`);
  }

  public postNote(note: Partial<Note>): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/notes`, note);

  }
  public patchNote(note: Partial<Note>): Observable<Note> {
    if (note.note_id) return this.http.patch<Note>(`${this.apiUrl}/note/${note.note_id}`, note);
    else throw new Error('note is missing an ID');
  }

  public deleteNote(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/note/${id}`);
  }

  /**
   * TODO: how to define a specific interval for fetch a stack?
   *       i.e. fetch images with an interval of 5 minutes in capture time
   * TODO: define threshold when to skip fetch requests
   *       (when moving faster than images can be loaded...)
   * @returns Observable<StackImage[]> A selection of image records
   */
  public getImageStack(stack_id: string = "42") {
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

  public getWalkHotspots(walk_id: number) {
    return this.http.get<HotspotType[]>(`${this.apiUrl}/walk/hotspots/${walk_id}`)
      .pipe(map(hotspots => {
        return hotspots.map(h => {
          h.viewtime = 0;
          h.distanceTraveled = 0;
          h.lastLocation = null;
          h.lastTimestamp = null;
          if (h.type === 1) h.url = this.apiUrl+h.url
          else if (h.type === 2) h.sequence.forEach(s => s.url = this.apiUrl+s.url)
          else if (h.type === 4) {
            h.portraitUrl = this.apiUrl+h.portraitUrl
            h.audioUrl = this.apiUrl+h.audioUrl
          }
          return h;
        })
      }))
  }

  public getCommunityHotspots(): Observable<HotspotCommunity[]> {
    const url = `${this.apiUrl}/walk/community-hotspots`;
    return this.http.get<FeatureCollection>(url).pipe(map(fc => {
      return fc.features.map((f: Feature) => {
        const p = (f.properties as WildeNachbarnProperties);
        const hotspot: HotspotCommunity = {
          type: 5,
          location: {
            lat: (f.geometry as Point).coordinates[1],
            lon: (f.geometry as Point).coordinates[0]
          },
          subject: `WN: ${p.Art}`,
          id: Number(p.ID),
          species: p.Art,
          observation: p.Beobachtungsart,
          observation_type: p.Beobachtungstyp,
          comment: p.Bemerkungen,
          copyright: p.Copyright,
          date: p.Datum,
          time_range: p.Zeitraum,
          post_url: p.Meldung,
          portrait_url: p.Artportraet,
          weight: p.weight,
          media: p.media,
          viewtime: 0,
          distanceTraveled: 0,
          lastLocation: null,
          lastTimestamp: null,
        }
        return hotspot;
      })
    }));
  }

  public getImageResource(url: string) {
    return this.http.get(`${this.apiUrl}/files/walk/${url}`, {responseType: 'blob'});
  }

  /* public postError(payload: unknown) {
    this.http.post(`${this.apiUrl}/sentry`, { payload: payload }).subscribe();
  } */

  public queryDataHotspots(endpoint: string, summaryOption?: number) {
    return this.http.get<HotspotDataPayload>(`${this.apiUrl}/walk/data-hotspots/${endpoint}${summaryOption ? `&summary=${summaryOption}` : ''}`);
  }
}
