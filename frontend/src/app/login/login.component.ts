import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../_services';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
const api = environment.API_URL;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    submitted = false;
    returnUrl: string;
    baseUrl: string;

    constructor(
        private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        public LoaderInterceptor: LoaderInterceptor,
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.baseUrl = api;
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.email, Validators.required]],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.authenticationService.login(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe(data => {
                if(data.error === 'your_shop_is_disabled') {
                    this.LoaderInterceptor.setLoader = false;
                    this.toastr.error("Il vostro negozio è stato disabilitato dall'amministratore", 'Errore di accesso', {
                        timeOut: 5000
                    });
                } else {
                        this.router.navigate([this.returnUrl]);
                    }
                },
                error => {
                    this.LoaderInterceptor.setLoader = false;
                    this.toastr.error("L'e-mail o la password che hai inserito non sono corretti!", 'Errore di accesso', {
                        timeOut: 5000
                    });
                });
    }

}
