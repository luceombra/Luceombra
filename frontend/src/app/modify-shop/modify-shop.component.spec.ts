import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyShopComponent } from './modify-shop.component';

describe('ModifyShopComponent', () => {
  let component: ModifyShopComponent;
  let fixture: ComponentFixture<ModifyShopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyShopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
