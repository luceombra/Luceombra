import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLegendComponent } from './product-legend.component';

describe('ProductLegendComponent', () => {
  let component: ProductLegendComponent;
  let fixture: ComponentFixture<ProductLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
