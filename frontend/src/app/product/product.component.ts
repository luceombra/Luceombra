import { Component, OnInit } from '@angular/core';
import { Product } from '../_models';
import { System, SystemColor, Curtains, CurtainColor, } from '../_models';
import { SystemColorService, ProductService, SystemService, CurtainsService, CurtainColorService } from '../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
    product: Product;
    system: System;
    systemColor: SystemColor;
    curtain: Curtains;
    curtainColor: CurtainColor;
    chainName: string;
    remoteControlName: string;
    baseUrl: string;

    constructor(
        private ProductService: ProductService,
        private SystemService: SystemService,
        public LoaderInterceptor: LoaderInterceptor,
        private SystemColorService: SystemColorService,
        private CurtainsService: CurtainsService,
        private CurtainColorService: CurtainColorService,
        ) { }

    ngOnInit() {
        this.LoaderInterceptor.setLoader = true;
        this.baseUrl = api;
        let product = this.ProductService.retrieveCurrentProduct;
        console.log(product)

        if (product.system_id){
            this.systemIdexById(product.system_id);
        }

        if (product.system_color_id && product.system_id){
            this.systemColorIdexById(product.system_color_id);
        }

        if (product.curtain_id && product.system_color_id && product.system_id){
            this.curtainIdexById(product.curtain_id);
        }

        if (product.curtain_color_id && product.curtain_id && product.system_color_id && product.system_id) {
            this.curtainColorIdexById(product.curtain_color_id);
        }
    }

    private systemIdexById(id: number) {
        this.SystemService.getSystemIdexById(id).pipe().subscribe(system => {
            this.system = system;
        });
    }

    private systemColorIdexById(id: number) {
        this.SystemColorService.getSystemColorIdexById(id).pipe().subscribe(systemColor => {
            this.systemColor = systemColor;
        });
    }

    private curtainIdexById(id: number) {
        this.CurtainsService.getCurtainIdexById(id).pipe().subscribe(curtain => {
            this.curtain = curtain;
        });
    }

    private curtainColorIdexById(id: number) {
        this.CurtainColorService.getCurtainColorIdexById(id).pipe().subscribe(curtainColor => {
            this.curtainColor = curtainColor;
            this.product = this.ProductService.retrieveCurrentProduct;
            this.LoaderInterceptor.setLoader = false;
        });
    }
}
