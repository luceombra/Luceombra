import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
    selector: 'app-create-invoice',
    templateUrl: './create-invoice.component.html',
    styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit {
    invoiceForm: FormGroup;
    submitted: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public LoaderInterceptor: LoaderInterceptor,
        private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<CreateInvoiceComponent>
        ) {
    }

    ngOnInit() {
        this.invoiceForm = this.formBuilder.group({
            invoice: ['', [Validators.required]],
            notes: ['']
        });
    }

    get validateFunction() { return this.invoiceForm.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {

        // stop here if form is invalid
        if (this.invoiceForm.invalid) {
            this.submitted = true;
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.invoiceForm);
    }

}

