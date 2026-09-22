import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeMotionComponent } from './type-motion.component';

describe('TypeMotionComponent', () => {
  let component: TypeMotionComponent;
  let fixture: ComponentFixture<TypeMotionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeMotionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeMotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
