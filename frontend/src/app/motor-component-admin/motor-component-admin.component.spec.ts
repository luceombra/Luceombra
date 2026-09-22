import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorComponentAdminComponent } from './motor-component-admin.component';

describe('MotorComponentAdminComponent', () => {
  let component: MotorComponentAdminComponent;
  let fixture: ComponentFixture<MotorComponentAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorComponentAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorComponentAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
