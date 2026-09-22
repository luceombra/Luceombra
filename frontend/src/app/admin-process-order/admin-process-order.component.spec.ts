import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessPreventiveComponent } from './process-preventive.component';

describe('ProcessPreventiveComponent', () => {
  let component: ProcessPreventiveComponent;
  let fixture: ComponentFixture<ProcessPreventiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessPreventiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessPreventiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
