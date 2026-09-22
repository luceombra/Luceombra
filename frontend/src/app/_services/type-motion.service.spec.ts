import { TestBed } from '@angular/core/testing';

import { TypeMotionService } from './type-motion.service';

describe('TypeMotionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypeMotionService = TestBed.get(TypeMotionService);
    expect(service).toBeTruthy();
  });
});
