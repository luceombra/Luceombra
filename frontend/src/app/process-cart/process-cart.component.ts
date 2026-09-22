import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderInterceptor } from '../_helpers/loader';
import { User, Preventive } from '../_models';
import { AuthenticationService, PreventivesService, ProductService, UserService } from '../_services';
import { ClientsService } from 'app/_services/clients.service';
import { environment } from '../../environments/environment';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { AddClientComponent } from 'app/add-client/add-client.component';
import { AddShopComponent } from 'app/add-shop/add-shop.component';
import { ToastrService } from 'ngx-toastr';
const api = environment.API_URL;

@Component({
    selector: 'app-process-cart',
    templateUrl: './process-cart.component.html',
    styleUrls: ['./process-cart.component.scss']
})
export class ProcessCartComponent implements OnInit {
    baseUrl: string;
    user: User;
    admin: any;
    clients: any;
    matrices: any;
    arr: [];
    preventive: Preventive;
    shopOrClient: any;
    index: any;
    discountMatrix: any;
    message: string;

    constructor(
        private toastr: ToastrService,
        public dialog: MatDialog,
        private router: Router,
        public LoaderInterceptor: LoaderInterceptor,
        private AuthenticationService: AuthenticationService,
        private PreventivesService: PreventivesService,
        private ProductService: ProductService,
        private UserService: UserService,
        private ClientsService: ClientsService,
        ) {
        this.preventive = new Preventive();
    }

    ngOnInit() {
        this.preventive.discount = null;
        this.preventive.shipping = 0;
        this.preventive.reference = '';
        this.preventive.service_on_home = 0;
        this.preventive.markup = 0;
        this.LoaderInterceptor.setLoader = true;
        this.baseUrl = api;
        this.user = this.AuthenticationService.currentUserValue;
        this.preventive.iva_shipping = this.user.iva_shipping;
        this.preventive.iva = this.user.iva;
        this.getClients(this.user);
        this.getMatrices();

        if (this.user.role == 'shop') {
            this.PreventivesService.getIvaHomeService(this.user.shop).pipe(first()).subscribe(response => {
                this.preventive.iva_home_service = response.iva_home_service;
            });
        }

        if (this.user.role == 'manager') {
            this.UserService.getAdmin().pipe(first()).subscribe(response => {
                this.preventive.iva = response.iva;
            });
        }
    }

    private getClients(user: User) {
        this.PreventivesService.getclients(user).pipe(first()).subscribe(response => {
            this.clients = response;
            this.getCartData();
        });
    }

    private getMatrices() {
        this.UserService.retrieveMatrices().pipe(first()).subscribe(response => {
            this.matrices = response;
        });
    }

    changeDiscount(event)
    {
        if (event.value.discount_id != null) {
            this.discountMatrix = this.matrices.find(x => x.id === event.value.discount_id);
        } else {
            this.discountMatrix = null;
        }
    }

    getCartData() {
        this.ProductService.getCartData().pipe().subscribe(products => {
            this.preventive.amount = 0;
            this.preventive.markup = this.user.commision;

            for (let i = 0; i < products.length; i++) {
                this.preventive.amount += products[i].totalPrice * parseInt(products[i].quantity);
            }

            this.LoaderInterceptor.setLoader = false;
        });
    }

      submitPreventive() {
        this.LoaderInterceptor.setLoader = true;
        if (this.shopOrClient) {
            if (this.preventive.discount == null && this.user.role != 'shop') {
                this.toastr.error("Seleziona il matrice per la prevenzione", 'Aggiunta preventivo', {
                    timeOut: 3000
                });
            }

            if (this.user && this.user.role == 'shop') {
                this.preventive.client = this.shopOrClient.id;
                if(this.preventive.iva != this.user.iva) {
                    this.preventive.iva = this.preventive.iva
                } else {
                    this.preventive.iva = this.user.iva;
                }

                // Changed admin calculations logic from : this.preventive.shipping to : this.shopOrClient.shipping
                // this.preventive.amount = (baseAmount + this.shopOrClient.shipping) * (1 + this.user.iva  / 100);
                // this.preventive.totalAmount = baseAmount * (1 + this.user.iva / 100) * (1 + this.preventive.markup / 100) * (1 - this.preventive.discount / 100) * (1 + this.user.iva / 100) + this.preventive.shipping * (1 + this.user.iva  / 100) + this.preventive.service_on_home;
                this.preventive.totalAmount = (this.preventive.amount * (1 + this.preventive.markup / 100) * (1 - this.preventive.discount / 100) * (1 + this.preventive.iva / 100) + this.preventive.shipping * (1 + this.preventive.iva_shipping  / 100) + this.preventive.service_on_home * (1 + this.preventive.iva_home_service  / 100));
            } else {
                this.preventive.shop = this.shopOrClient.id;
                this.preventive.totalAmount = this.preventive.amount;
            }

            this.PreventivesService.addPreventive(this.preventive).pipe().subscribe(response => {
                if (response.code == 1) {
                    this.toastr.error(response.message, 'Aggiunta preventivo', {
                        timeOut: 3000
                    });
                }
                else {
                    this.router.navigate(['/admin/preventive']);
                }
                this.LoaderInterceptor.setLoader = false;
            });
        } else {
            if (this.user && this.user.role == 'shop') {
                this.toastr.error("Seleziona il client per la prevenzione", 'Aggiunta preventivo', {
                    timeOut: 3000
                });
            }
            else {
                this.toastr.error("Seleziona il negozio per la prevenzione", 'Aggiunta preventivo', {
                    timeOut: 3000
                });
            }

            this.LoaderInterceptor.setLoader = false;
        }
    }

    addClient() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '650px';
        dialogConfig.width = '620px';

        const dialogRef = this.dialog.open(AddClientComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.ClientsService.addClient(data.value).pipe().subscribe(response => {

                        if (response.code == 0) {
                            this.getClients(this.user);
                            this.toastr.success(response.message, 'Aggiunta cliente', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.toastr.error(response.message, 'Aggiunta cliente', {
                                timeOut: 3000
                            });
                        }

                        this.LoaderInterceptor.setLoader = false;
                    });
                }
            }
            );
    }

    addShop() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '580px';
        dialogConfig.width = '620px';
        const dialogRef = this.dialog.open(AddShopComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.UserService.addShop(data.value).pipe().subscribe(response => {

                        this.LoaderInterceptor.setLoader = false;

                        if (response.code == 0) {
                            this.getClients(this.user);
                            this.toastr.success(response.message, 'Aggiunta negozio', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.toastr.error(response.message, 'Aggiunta negozio', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            });
    }

}
