import { TestBed } from '@angular/core/testing';

import { TypeChainService } from './type-chain.service';

describe('TypeChainService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypeChainService = TestBed.get(TypeChainService);
    expect(service).toBeTruthy();
  });
});
