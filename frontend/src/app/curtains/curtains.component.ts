import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Curtains } from '../_models';
import { LoaderInterceptor} from '../_helpers/loader';
import { CurtainsService, ProductService } from '../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
    selector: 'app-curtains',
    templateUrl: './curtains.component.html',
    styleUrls: ['./curtains.component.scss']
})
export class CurtainsComponent implements OnInit {
    currentCurtain: Curtains;
    curtains: Curtains[] = [];
    system: number;
    baseUrl: string;
    p: any;
    preventiveId: string;
    productId: string;

    constructor(
        private route: ActivatedRoute,
        private CurtainsService: CurtainsService,
        private router: Router,
        public LoaderInterceptor: LoaderInterceptor,
        private ProductService: ProductService
        ) { }

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

        this.retrieveCurtains(this.system);
        let product = this.ProductService.retrieveCurrentProduct;
        product.curtain_id = 0;
        product.curtain_color_id = 0;
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

    getMaterialColors(curtain){
        let product = this.ProductService.retrieveCurrentProduct;
        product.curtain_id = curtain;
        this.ProductService.updateCurrentProduct();
        this.router.navigate(['/curtaincolor', curtain], {queryParams: {preventiveId : this.preventiveId, productId : this.productId}});
    }

    private retrieveCurtains(id: number) {
        this.CurtainsService.getCurtains(id).pipe(first()).subscribe(curtains => {
            this.curtains = curtains;
            this.LoaderInterceptor.setLoader = false;
        });
    }
}
