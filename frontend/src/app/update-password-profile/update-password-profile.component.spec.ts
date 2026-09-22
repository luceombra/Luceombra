import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePasswordProfileComponent } from './update-password-profile.component';

describe('UpdatePasswordProfileComponent', () => {
  let component: UpdatePasswordProfileComponent;
  let fixture: ComponentFixture<UpdatePasswordProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePasswordProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePasswordProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
