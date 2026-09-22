import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialComponentComponent } from './material-component.component';

describe('MaterialComponentComponent', () => {
  let component: MaterialComponentComponent;
  let fixture: ComponentFixture<MaterialComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
