import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurtainColorComponent } from './curtain-color.component';

describe('CurtainColorComponent', () => {
  let component: CurtainColorComponent;
  let fixture: ComponentFixture<CurtainColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurtainColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurtainColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
