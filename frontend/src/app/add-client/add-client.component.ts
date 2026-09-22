import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
    selector: 'app-add-client',
    templateUrl: './add-client.component.html',
    styleUrls: ['./add-client.component.scss']
})
export class AddClientComponent implements OnInit {
    submitted = false;
    client: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        public LoaderInterceptor: LoaderInterceptor,
        private dialogRef: MatDialogRef<AddClientComponent>
        ) { }

    ngOnInit() {
        this.client = this.formBuilder.group({
            name: ["", [Validators.required]],
            email: ["", [Validators.required, Validators.email]],
            phone: [""],
            address: [""],
            p_iva: [""]
        });
    }

    get f() { return this.client.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {
        this.submitted = true;

        if (this.client.invalid) {
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.client);
    }

}
