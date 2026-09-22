import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendPasswordComponent } from './send-password.component';

describe('SendPasswordComponent', () => {
  let component: SendPasswordComponent;
  let fixture: ComponentFixture<SendPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
