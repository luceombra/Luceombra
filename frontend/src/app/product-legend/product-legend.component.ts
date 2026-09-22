import { Component, OnInit, Input } from '@angular/core';
import { Product, User } from 'app/_models';
import { AuthenticationService, ProductService } from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
  selector: 'app-product-legend',
  templateUrl: './product-legend.component.html',
  styleUrls: ['./product-legend.component.scss']
})
export class ProductLegendComponent implements OnInit {
  @Input() productId: number;
  @Input() preventiveId: number;
  product: Product;
  user: User;
  baseUrl: string;
  commision: number;
  
  constructor(
    public LoaderInterceptor: LoaderInterceptor,
    private AuthenticationService: AuthenticationService,
    private ProductService: ProductService
    ) {
      this.user = this.AuthenticationService.currentUserValue;
      this.commision = this.user.commision;
      this.baseUrl = api;
     }

  ngOnInit() {
    this.LoaderInterceptor.setLoader = true;
    this.getProductData(this.productId, this.preventiveId);
  }

  getProductData(productId: number, preventiveId: number){

    if(preventiveId == -1) {
      this.ProductService.getNonPreventivedProductData(productId).pipe().subscribe(product => {
        this.product = product;
        this.LoaderInterceptor.setLoader = false;
      });
    }
    else{
      this.ProductService.getProductData(productId).pipe().subscribe(product => {
        this.product = product;
        this.commision = product.markup;
        this.LoaderInterceptor.setLoader = false;
      });
    }

    
  }

}
