import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Product, User, Response } from '../_models';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';
const api = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private managedProductSubject: BehaviorSubject<Product>;
    public managedProduct: Observable<Product>;
    private currentUser: User;
    private loading: BehaviorSubject<boolean>;
    public loadingObservable: Observable<boolean>;

    constructor(
        private http: HttpClient,
        private router: Router,
        private authenticationService: AuthenticationService
        ) {
        if (this.authenticationService.currentUserValue) {
            this.currentUser = this.authenticationService.currentUserValue;
            this.managedProductSubject = new BehaviorSubject<Product>(JSON.parse(localStorage.getItem('product-' + this.currentUser.id)));
            this.managedProduct = this.managedProductSubject.asObservable();
            this.loading = new BehaviorSubject<boolean>(false);
            this.loadingObservable = this.loading.asObservable();
        }
    }

    public get retrieveCurrentProduct(): Product {
        console.log('test on product service', this.managedProductSubject.value);
        return this.managedProductSubject.value;
    }

    updateCurrentProduct() {
        localStorage.setItem('product-' + this.currentUser.id, JSON.stringify(this.managedProductSubject.value));
    }

    getCartData() {
        return this.http.get<Product[]>(api + `/api/listProducts`);
    }

    addToCart(product: Product) {
        return this.http.post<Response>(api + `/api/addToCart`, product);
    }

    updateCart(product: Product) {
        return this.http.post<Response>(api + `/api/updateCart`, product);
    }

    getProductData(id: number) {
        return this.http.get<Product>(api + `/api/getProductData/${id}`);
    }

    getNonPreventivedProductData(id: number){
        return this.http.get<Product>(api + `/api/getNonPreventivedProduct/${id}`);
    }

    updateProduct(product: Product) {
        return this.http.post<Response>(api + `/api/updateProduct`, product);
    }

    updateQuantity(id: number, value: number) {
        let request = {
            id: id,
            value: value
        };

        return this.http.post<Response>(api + `/api/updateQuantity`, request);
    }

    removeFromCart(id: number) {
        let request = {
            id: id
        };

        return this.http.post<Response>(api + `/api/deleteProductFromCart`, request);
    }
}
