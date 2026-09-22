import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { System } from '../_models';
import { LoaderInterceptor } from '../_helpers/loader';
import { SystemService, ProductService } from '../_services';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit {
  currentSystem: System;
  systems: System[] = [];
  baseUrl: string;
  p: any;
  preventiveId: string;
  productId: string;

  constructor(
    private router: Router,
    public LoaderInterceptor: LoaderInterceptor,
    private SystemService: SystemService,
    private ProductService: ProductService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.LoaderInterceptor.setLoader = true;
    this.baseUrl = api;
    this.loadAllSystems();
    let product = this.ProductService.retrieveCurrentProduct;
    product.system_id = 0;
    product.system_color_id = 0;
    product.curtain_id = 0;
    product.curtain_color_id = 0;
    product.width = '0';
    product.height = '0';
    product.cart_id = 0;
    product.cart_id = 0;
    product.motion_id = 0;
    product.telecomand_id = 0;
    product.motor_id = 0;
    product.price = '0';
    this.ProductService.updateCurrentProduct();

    this.route
      .queryParams
      .subscribe(params => {
        this.preventiveId = params['preventiveId'];
        this.productId = params['productId'];
      });
  }

  private loadAllSystems() {
    this.SystemService.getAll().pipe(first()).subscribe(systems => {
      this.systems = systems;
      this.LoaderInterceptor.setLoader = false;
    });
  }

}
