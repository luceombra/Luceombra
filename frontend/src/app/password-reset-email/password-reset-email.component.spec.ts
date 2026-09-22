import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetEmailComponent } from './password-reset-email.component';

describe('PasswordResetEmailComponent', () => {
  let component: PasswordResetEmailComponent;
  let fixture: ComponentFixture<PasswordResetEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordResetEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
