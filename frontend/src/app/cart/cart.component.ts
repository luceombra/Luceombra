import { Component, OnInit } from '@angular/core';
import { AuthenticationService, ProductService } from '../_services';
import { Product, User } from '../_models';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    products: Product[];
    baseUrl: string;
    valid: boolean;
    p: any;
    user: User;

    constructor(
        private toastr: ToastrService,
        private router: Router,
        private AuthenticationService: AuthenticationService,
        public LoaderInterceptor: LoaderInterceptor,
        private ProductService: ProductService
        ) { }

    ngOnInit() {
        this.LoaderInterceptor.setLoader = true;
        this.valid = true;
        this.baseUrl = api;
        this.user = this.AuthenticationService.currentUserValue;
        this.getCartData();
    }

    getCartData() {
        this.ProductService.getCartData().pipe().subscribe(products => {
            this.products = products;
            if (products.length <= 0) {
                this.valid = false;
            }
            this.LoaderInterceptor.setLoader = false;
        });
    }

    updateQuantity(event: any, id: number) {
        this.LoaderInterceptor.setLoader = true;
        this.ProductService.updateQuantity(id, event.target.value).pipe().subscribe(response => {

            this.LoaderInterceptor.setLoader = false;

            if(response.code == 1){
                this.toastr.error(response.message, "Errore nell'aggiornamento", {
                    timeOut: 3000
                });
            }
            else{
                this.toastr.success(response.message, "Successo nell'aggiornamento", {
                    timeOut: 3000
                });
            }

        });
    }

    removeFromCart(id: number) {
        this.LoaderInterceptor.setLoader = true;
        this.ProductService.removeFromCart(id).pipe().subscribe(response => {

            if(response.code == 1){
                this.toastr.error(response.message, "Errore nella rimozione", {
                    timeOut: 3000
                });
            }
            else{
                this.toastr.success(response.message, "Successo nella rimozione", {
                    timeOut: 3000
                });
            }

            if ((this.products.length % 2) == 1) {
                this.p -= 1;
            }

            this.getCartData();
        });
    }

    proceed() {
        if (this.products.length > 0) {
            this.valid = true;
            this.router.navigate(['/processcart']);
        }
        else {
            this.valid = false;
        }
    }

}
