import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCartComponent } from './process-cart.component';

describe('ProcessCartComponent', () => {
  let component: ProcessCartComponent;
  let fixture: ComponentFixture<ProcessCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
