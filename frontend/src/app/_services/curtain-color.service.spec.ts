import { TestBed } from '@angular/core/testing';

import { CurtainColorService } from './curtain-color.service';

describe('CurtainColorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurtainColorService = TestBed.get(CurtainColorService);
    expect(service).toBeTruthy();
  });
});
