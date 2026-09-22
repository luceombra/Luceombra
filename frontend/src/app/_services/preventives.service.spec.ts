import { TestBed, inject } from '@angular/core/testing';

import { PreventivesService } from './preventives.service';

describe('PreventivesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreventivesService]
    });
  });

  it('should be created', inject([PreventivesService], (service: PreventivesService) => {
    expect(service).toBeTruthy();
  }));
});
