import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from 'app/_models';
import { AuthenticationService } from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
    selector: 'app-admin-process-order',
    templateUrl: './admin-process-order.component.html',
    styleUrls: ['./admin-process-order.component.scss']
})
export class AdminProcessOrderComponent implements OnInit {
    choosenState: string = "";
    adminProcessOrderForm: FormGroup;
    submitted: boolean = false;
    user: User;
    states: string[] = ['Order', 'Anullato', 'Confermato'];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public LoaderInterceptor: LoaderInterceptor,
        private formBuilder: FormBuilder,
        private AuthenticationService: AuthenticationService,
        private dialogRef: MatDialogRef<AdminProcessOrderComponent>
        ) {
        if (data.status == 'Confermato') {
            this.choosenState = 'Order';
        };
    }

    ngOnInit() {
        this.user = this.AuthenticationService.currentUserValue;
        this.adminProcessOrderForm = this.formBuilder.group({
            invoice: ['', [Validators.required]],
            orderState: [this.choosenState],
            iva: [''],
            notes: ['']
        });
    }

    get validateFunction() { return this.adminProcessOrderForm.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {
        // stop here if form is invalid
        if (this.choosenState == 'Confermato' && this.adminProcessOrderForm.invalid) {
            this.submitted = true;
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.adminProcessOrderForm);
    }

}
