import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { SystemColor } from '../_models';
import { SystemColorService, ProductService } from '../_services';
import { LoaderInterceptor} from '../_helpers/loader';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
  selector: 'app-system-color',
  templateUrl: './system-color.component.html', 
  styleUrls: ['./system-color.component.scss']
})
export class SystemColorComponent implements OnInit {
  currentSystemColor: SystemColor;
  colors: SystemColor[] = [];
  system: number;
  p: any;
  baseUrl: string;
  preventiveId: string;
  productId: string;

  constructor(
    private route: ActivatedRoute,
    private SystemColorService: SystemColorService,
    public LoaderInterceptor: LoaderInterceptor,
    private router: Router,
    private ProductService: ProductService
    ) {
      
    }

  ngOnInit() {
    this.LoaderInterceptor.setLoader = true;
    this.baseUrl = api;

    this.route
    .queryParams
    .subscribe(params => {
      this.preventiveId = params['preventiveId'];
      this.productId = params['productId'];
      this.system = params['id'];
    });

    this.retrieveSystemColors(this.system);
    let product = this.ProductService.retrieveCurrentProduct;
    product.system_color_id = 0;
    product.system_id = this.system;
    product.curtain_id = 0;
    product.curtain_color_id =0;
    product.width = '0';
    product.height = '0';
    product.cart_id = 0;
    product.cart_id = 0;
    product.motion_id =0;
    product.telecomand_id =0;
    product.motor_id = 0;
    product.price = '0';
    this.ProductService.updateCurrentProduct();
  }

  getMaterials(color){
    let product = this.ProductService.retrieveCurrentProduct;
    product.system_color_id = color;
    this.ProductService.updateCurrentProduct();
    this.router.navigate(['/curtains'], {queryParams: {id: this.system, preventiveId : this.preventiveId, productId : this.productId}});
  }

  private retrieveSystemColors(id: number) {
    this.SystemColorService.getColors(id).pipe(first()).subscribe(colors => {
        this.colors = colors;
        this.LoaderInterceptor.setLoader = false;
      });
  }

}
