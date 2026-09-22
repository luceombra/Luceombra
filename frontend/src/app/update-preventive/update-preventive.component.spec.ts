import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePreventiveComponent } from './update-preventive.component';

describe('UpdatePreventiveComponent', () => {
  let component: UpdatePreventiveComponent;
  let fixture: ComponentFixture<UpdatePreventiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePreventiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePreventiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
