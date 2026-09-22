import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from 'app/_models';
import { AuthenticationService } from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
    selector: 'app-edit-invoice',
    templateUrl: './edit-invoice.component.html',
    styleUrls: ['./edit-invoice.component.scss']
})
export class EditInvoiceComponent implements OnInit {
    choosenState: string = "Confermato";
    editInvoiceForm: FormGroup;
    submitted: boolean = false;
    user: User;
    states: string[] = ['Order', 'Anullato', 'Confermato'];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public LoaderInterceptor: LoaderInterceptor,
        private formBuilder: FormBuilder,
        private AuthenticationService: AuthenticationService,
        private dialogRef: MatDialogRef<EditInvoiceComponent>
        ) {
        // if (data.status == 'Confermato') {
        //     this.choosenState = 'Order';
        // };
    }

    ngOnInit() {
        this.user = this.AuthenticationService.currentUserValue;
        this.editInvoiceForm = this.formBuilder.group({
            invoice: ['', [Validators.required]],
            orderState: [this.choosenState],
            iva: [''],
            notes: ['']
        });
    }

    get validateFunction() { return this.editInvoiceForm.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {
        console.log('data', this.editInvoiceForm);
        // stop here if form is invalid
        if (this.choosenState == 'Confermato' && this.editInvoiceForm.invalid) {
            this.submitted = true;
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.editInvoiceForm);
    }

}
