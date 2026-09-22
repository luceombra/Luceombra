import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorComponenttAddComponent } from './motor-componentt-add.component';

describe('MotorComponenttAddComponent', () => {
  let component: MotorComponenttAddComponent;
  let fixture: ComponentFixture<MotorComponenttAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorComponenttAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorComponenttAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
