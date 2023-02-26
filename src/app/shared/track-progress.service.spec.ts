import { TestBed } from '@angular/core/testing';

import { TrackProgressService } from './track-progress.service';

describe('TrackProgressService', () => {
  let service: TrackProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
