import { TestBed } from '@angular/core/testing';

import { TypeMotorService } from './type-motor.service';

describe('TypeMotorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypeMotorService = TestBed.get(TypeMotorService);
    expect(service).toBeTruthy();
  });
});
