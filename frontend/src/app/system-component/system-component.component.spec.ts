import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemComponentComponent } from './system-component.component';

describe('SystemComponentComponent', () => {
  let component: SystemComponentComponent;
  let fixture: ComponentFixture<SystemComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
