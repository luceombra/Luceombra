import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User, Client } from 'app/_models';
import { LoaderInterceptor } from '../_helpers/loader';
import { AuthenticationService } from 'app/_services';

@Component({
    selector: 'app-update-client',
    templateUrl: './update-client.component.html',
    styleUrls: ['./update-client.component.scss']
})
export class UpdateClientComponent implements OnInit {
    clientForm: FormGroup;
    submitted: boolean = false;
    user: User;
    client: Client;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public LoaderInterceptor: LoaderInterceptor,
        private formBuilder: FormBuilder,
        private AuthenticationService: AuthenticationService,
        private dialogRef: MatDialogRef<UpdateClientComponent>
        ) {
        this.client = new Client;
        this.client.name = data.name;
        this.client.phone = data.phone;
        this.client.address = data.address;
        this.client.p_iva = data.p_iva;
        this.client.email = data.email;
    }

    ngOnInit() {
        this.user = this.AuthenticationService.currentUserValue;
        this.clientForm = this.formBuilder.group({
            name: [this.client.name, [Validators.required]],
            phone: [this.client.phone],
            address: [this.client.address],
            p_iva: [this.client.p_iva],
            email: [this.client.email, [Validators.required, Validators.email]]
        });
    }

    get validateFunction() { return this.clientForm.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {
        // stop here if form is invalid
        if (this.clientForm.invalid) {
            this.submitted = true;
            return;
        }
        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.clientForm);
    }

}
