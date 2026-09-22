import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TelecomandsComponent } from './telecomands.component';

describe('TelecomandsComponent', () => {
  let component: TelecomandsComponent;
  let fixture: ComponentFixture<TelecomandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TelecomandsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TelecomandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
