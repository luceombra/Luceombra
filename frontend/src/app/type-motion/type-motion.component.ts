import { Component, OnInit } from '@angular/core';
import { TypeMotion, TypeChain, TypeMotor, TypeTelecomand, Product, Response } from '../_models';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderInterceptor } from '../_helpers/loader';
import { ProductService, TypeMotionService, TypeChainService, TypeMotorService, TypeTelecomandService } from '../_services';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
const api = environment.API_URL;

@Component({
    selector: 'app-type-motion',
    templateUrl: './type-motion.component.html',
    styleUrls: ['./type-motion.component.scss']
})
export class TypeMotionComponent implements OnInit {
    currentTypeMotion: TypeMotion;
    currentTypeMotor: TypeMotor;
    currentTypeChain: TypeChain;
    currentTelecomand: TypeTelecomand;
    typeMotions: TypeMotion[] = [];
    typeMotors: TypeMotor[] = [];
    chains: TypeChain[] = [];
    telecomands: TypeTelecomand[] = [];
    system: number;
    product: Product;
    resp: Response;
    valid: boolean;
    baseUrl: string;
    preventiveId: string;
    productId: string;

    constructor(
        private toastr: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        public LoaderInterceptor: LoaderInterceptor,
        private ProductService: ProductService,
        private TypeMotionService: TypeMotionService,
        private TypeMotorService: TypeMotorService,
        private TypeChainService: TypeChainService,
        private TypeTelecomandService: TypeTelecomandService,
        ) {
    }

    ngOnInit() {
        this.baseUrl = api;
        this.resp = new Response();
        this.resp.code = 0;
        this.resp.message = "";
        this.valid = true;
        this.product = this.ProductService.retrieveCurrentProduct;
        this.system = this.product.system_id;
        this.product.motion_id = 0;
        this.product.chain_id = 0;
        this.product.cart_id = 0;
        this.product.telecomand_id = 0;
        this.product.motor_id = 0;
        this.ProductService.updateCurrentProduct();
        this.getTypeMotion();
        this.getTypeChain();
        this.getTypeMotor();

        this.route
        .queryParams
        .subscribe(params => {
            this.preventiveId = params['preventiveId'];
            this.productId = params['productId'];
        });
    }

    private getTypeMotion() {
        this.TypeMotionService.getTypeMotionIndexBySystemId(this.system).pipe(first()).subscribe(typeMotions => {
            this.typeMotions = typeMotions;
        });
    }

    private getTypeMotor() {
        this.TypeMotorService.getTypeMotorIndexBySystemId(this.system).pipe(first()).subscribe(typeMotors => {
            this.typeMotors = typeMotors;
        });
    }

    private getTypeChain() {
        this.TypeChainService.getTypeChainIndexBySystemId(this.system).pipe(first()).subscribe(typeChains => {
            this.chains = typeChains;
        });
    }

    private getTypeTelecomand() {
        this.TypeTelecomandService.getTypeTelecomandIndexBySystemId(this.product.motor_id).pipe(first()).subscribe(telecomands => {
            this.telecomands = telecomands;
        });
    }

    onChangeMotorType() {
        this.product.telecomand_id = 0;
        this.getTypeTelecomand();
    }

    updateChainName() {
        for (var i = 0; i < this.chains.length; i++) {
            if (this.product.chain_id == this.chains[i].id) {
                this.product.chain = this.chains[i].name;
                this.product.chain_image = this.chains[i].image;
            }
        }
    }

    updateMotorName() {
        for (var i = 0; i < this.typeMotors.length; i++) {
            if (this.product.motor_id == this.typeMotors[i].id) {
                this.product.motor = this.typeMotors[i].name;
                this.product.motor_image = this.typeMotors[i].image;
            }
        }
    }

    updateRemoteControlName() {
        for (var i = 0; i < this.telecomands.length; i++) {
            if (this.product.telecomand_id == this.telecomands[i].id) {
                this.product.telecomand = this.telecomands[i].name;
                this.product.telecomand_image = this.telecomands[i].image;
            }
        }
    }

    updateValid() {
        this.valid = true;
    }

    addToCart() {
        if (
            this.product.motion_id == 0 ||
            (this.product.motion_id == 1 && this.product.chain_id == 0) ||
            (this.product.motion_id == 2 && (this.product.motor_id == 0)
                )) {
            this.valid = false;
        return;
    }

    if (this.preventiveId != null && this.productId != null) {
        this.product.preventive = Number(this.preventiveId);
        this.product.productId = this.productId;

        this.ProductService.updateProduct(this.product).pipe(first()).subscribe(resp => {
            this.resp = resp;

            if (this.resp.code == 0) {
                if(this.preventiveId != "-1") {
                    this.router.navigate(['/admin/edit/' + this.preventiveId]);
                } else {
                    this.router.navigate(['/cart']);
                }
            } else {
                this.toastr.error(this.resp.message, 'Errore nell\'aggiornamento preventivo', {
                    timeOut: 3000
                });
            }
        });
    } else {
        this.ProductService.addToCart(this.product).pipe(first()).subscribe(resp => {
            this.resp = resp;

            if (this.resp.code == 0) {
                // Go to cart...
                this.router.navigate(['/cart']);
            }
        });
    }
}
}
