import { TestBed } from '@angular/core/testing';

import { ProgressSimService } from './progress-sim.service';

describe('ProgressSimService', () => {
  let service: ProgressSimService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressSimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
