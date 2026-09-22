import { Component, OnInit } from '@angular/core';
import { LoaderInterceptor } from '../_helpers/loader';
import { User } from 'app/_models/user';
import { AuthenticationService, ProfileService } from 'app/_services';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { UpdatePasswordProfileComponent } from 'app/update-password-profile/update-password-profile.component';
import { UpdateProfileComponent } from 'app/update-profile/update-profile.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Configurations } from 'app/_models';
const api = environment.API_URL;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    user: User;
    configs: Configurations;
    shop: any;
    baseUrl: string;
    tinyMceSettings = {
        height: 180,
        width: 500,
        plugins: "print preview noneditable",
        menubar: false,
        toolbar: "",
        setup: function (ed) {
            ed.on('PreInit', function (event) {
                var ed = event.target, dom = ed.dom;
                dom.setAttrib(ed.getBody(), 'contenteditable', 'false');
            });
        }
    };

    constructor(
        private toastr: ToastrService,
        public dialog: MatDialog,
        private AuthenticationService: AuthenticationService,
        public LoaderInterceptor: LoaderInterceptor,
        private ProfileService: ProfileService
        ) {
    }

    ngOnInit() {
        this.LoaderInterceptor.setLoader = true;
        this.baseUrl = api;
        this.user = this.AuthenticationService.currentUserValue;
        this.retrieveUserData();
        this.retrieveConfigurations();

        if (this.user.role == "shop") {
            this.retrieveShopData();
        }
        else {
            this.LoaderInterceptor.setLoader = false;
        }
    }

    retrieveUserData() {
        this.ProfileService.getUserData().pipe().subscribe(user => {
            console.log('user', user);
            this.user = user;
        });
    }

    retrieveConfigurations() {
        this.ProfileService.getConfigurationData().pipe().subscribe(config => {
            this.configs = config;
        });
    }

    retrieveShopData() {
        this.ProfileService.getShopData().pipe().subscribe(shop => {
            this.shop = shop;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    updateProfile() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            user: this.user,
            shop: this.shop,
            config: this.configs
        };

        dialogConfig.height = '580px';
        dialogConfig.width = '620px';
        const dialogRef = this.dialog.open(UpdateProfileComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.ProfileService.updateProfile(data).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.retrieveConfigurations();
                            this.user = response.user;

                            if (this.user.role == "shop") {
                                this.shop.address = response.address;
                                this.shop.iva = response.iva;
                                this.shop.iva_home_service = response.iva_home_service;
                                this.shop.pdfFooter = response.pdfFooter;
                                this.shop.confirmation_order_note = response.confirmation_order_note;
                            }

                            localStorage.setItem('currentUser', JSON.stringify(response.user));
                            this.AuthenticationService.setCurrentUser = response.user;

                            this.toastr.success(response.message, 'Aggiorna il profilo', {
                                timeOut: 3000
                            });
                        } else {
                            this.toastr.error(response.message, 'Aggiorna il profilo', {
                                timeOut: 3000
                            });
                        }

                        this.LoaderInterceptor.setLoader = false;
                    });
                }
            }
            );
    }

    updatePassword() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '500px';
        dialogConfig.width = '620px';
        const dialogRef = this.dialog.open(UpdatePasswordProfileComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.ProfileService.updatePass(data.value).pipe().subscribe(response => {

                        if (response.code == 0) {
                            localStorage.setItem('currentUser', JSON.stringify(response.data));
                            this.AuthenticationService.setCurrentUser = response.data;

                            this.toastr.success(response.message, 'Aggiorna password', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.toastr.error(response.message, 'Aggiorna password', {
                                timeOut: 3000
                            });
                        }

                        this.LoaderInterceptor.setLoader = false;
                    });
                }
            }
            );
    }
}
