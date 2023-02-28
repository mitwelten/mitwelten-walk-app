import { TestBed } from '@angular/core/testing';

import { TrackRecorderService } from './track-recorder.service';

describe('TrackRecorderService', () => {
  let service: TrackRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
