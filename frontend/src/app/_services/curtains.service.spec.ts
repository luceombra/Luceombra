import { TestBed } from '@angular/core/testing';

import { CurtainsService } from './curtains.service';

describe('CurtainsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurtainsService = TestBed.get(CurtainsService);
    expect(service).toBeTruthy();
  });
});
