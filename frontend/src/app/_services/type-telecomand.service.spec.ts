import { TestBed } from '@angular/core/testing';

import { TypeTelecomandService } from './type-telecomand.service';

describe('TypeTelecomandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypeTelecomandService = TestBed.get(TypeTelecomandService);
    expect(service).toBeTruthy();
  });
});
