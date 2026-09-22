import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyAgentComponent } from './modify-agent.component';

describe('ModifyAgentComponent', () => {
  let component: ModifyAgentComponent;
  let fixture: ComponentFixture<ModifyAgentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyAgentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
