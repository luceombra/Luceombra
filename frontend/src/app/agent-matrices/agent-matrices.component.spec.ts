import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentMatricesComponent } from './telecomands.component';

describe('AgentMatricesComponent', () => {
  let component: AgentMatricesComponent;
  let fixture: ComponentFixture<AgentMatricesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentMatricesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentMatricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
