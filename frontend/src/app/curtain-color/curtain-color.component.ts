import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { SystemColor } from '../_models';
import { LoaderInterceptor } from '../_helpers/loader';
import { CurtainColorService, ProductService } from '../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
  selector: 'app-curtain-color',
  templateUrl: './curtain-color.component.html',
  styleUrls: ['./curtain-color.component.scss']
})
export class CurtainColorComponent implements OnInit {

  currentSystemColor: SystemColor;
  colors: SystemColor[] = [];
  curtain: number;
  p: any;
  baseUrl: string;
  preventiveId: string;
  productId: string;

  constructor(
    private route: ActivatedRoute,
    public LoaderInterceptor: LoaderInterceptor,
    private CurtainColorService: CurtainColorService,
    private router: Router,
    private ProductService: ProductService
  ) {
  }

  ngOnInit() {
    this.LoaderInterceptor.setLoader = true;
    this.baseUrl = api;
    this.curtain = this.route.snapshot.params['id'];
    this.retrieveCurtainColors(this.curtain);
    let product = this.ProductService.retrieveCurrentProduct;
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

  goToSize(color) {
    let product = this.ProductService.retrieveCurrentProduct;
    product.curtain_color_id = color;
    this.ProductService.updateCurrentProduct();
    this.router.navigate(['/dimensions'], {queryParams: {preventiveId : this.preventiveId, productId : this.productId}});
  }

  private retrieveCurtainColors(id: number) {
    this.CurtainColorService.getColors(id).pipe(first()).subscribe(colors => {
      this.colors = colors;
      this.LoaderInterceptor.setLoader = false;
    });
  }

}
