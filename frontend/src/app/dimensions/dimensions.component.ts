import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, DimensionsService } from '../_services';
import { Product } from '../_models';
import { ToastrService } from 'ngx-toastr';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
    selector: 'app-dimensions',
    templateUrl: './dimensions.component.html',
    styleUrls: ['./dimensions.component.scss']
})
export class DimensionsComponent implements OnInit {
    system: number;
    product: Product;
    baseUrl: string;
    preventiveId: string;
    productId: string;

    constructor(
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private router: Router,
        public LoaderInterceptor: LoaderInterceptor,
        private DimensionsService: DimensionsService,
        private ProductService: ProductService,
        ) { }

    ngOnInit() {
        this.baseUrl = api;
        this.product = this.ProductService.retrieveCurrentProduct;
        this.system = this.product.system_id;

        if (!this.product.width) {
            this.product.width = '0';
        }

        if (!this.product.height) {
            this.product.height = '0';
        }

        if (!this.product.price) {
            this.product.price = '0';
        }

        if (!this.product.shownPrice) {
            this.product.shownPrice = 0;
        }

        this.product.cart_id = 0;
        this.product.motion_id = 0;
        this.product.telecomand_id = 0;
        this.product.motor_id = 0;
        this.ProductService.updateCurrentProduct();

        this.route
        .queryParams
        .subscribe(params => {
            this.preventiveId = params['preventiveId'];
            this.productId = params['productId'];
        });
    }

    goToMotion() {

        if ((this.product.width == null || this.product.width == "0") || (this.product.height == null || this.product.height == "0")) {
            this.toastr.error("Larghezza e altezza sono necessari!", 'Errore di dimensioni', {
                timeOut: 3000
            });
            return;
        }

        this.DimensionsService.getPrice(this.product).pipe().subscribe(response => {
            console.log(response)

            if (response["code"] == 0 && response["price"] != 0) {
                this.product.price = response["price"];
                this.product.shownPrice = response['priceType'] === 1?  response["price"] : (response["price"] * (parseFloat(this.product.width) /100 * parseFloat(this.product.height)/100))
                console.log(this.product)
                this.router.navigate(['/typemotion'], {queryParams: {preventiveId : this.preventiveId, productId : this.productId}});
                this.ProductService.updateCurrentProduct();
            } else {
                if(response["code"] != 0) {
                    this.toastr.error(response["message"], 'Errore di dimensioni', {
                        timeOut: 3000
                    });
                } else {
                    this.toastr.error("Queste dimensioni non hanno prezzo!", 'Errore di dimensioni', {
                        timeOut: 3000
                    });
                }
            }
        });
    }
}
