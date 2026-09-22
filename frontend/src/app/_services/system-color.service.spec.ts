import { TestBed } from '@angular/core/testing';

import { SystemColorService } from './system-color.service';

describe('SystemColorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SystemColorService = TestBed.get(SystemColorService);
    expect(service).toBeTruthy();
  });
});
