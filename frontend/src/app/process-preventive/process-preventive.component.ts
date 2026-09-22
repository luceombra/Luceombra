import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from 'app/_models';
import { AuthenticationService } from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
    selector: 'app-process-preventive',
    templateUrl: './process-preventive.component.html',
    styleUrls: ['./process-preventive.component.scss']
})
export class ProcessPreventiveComponent implements OnInit {
    choosenState: string = "";
    processPreventiveForm: FormGroup;
    submitted: boolean = false;
    user: User;
    states: string[] = ['Preventivo', 'Anullato', 'Confermato'];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public LoaderInterceptor: LoaderInterceptor,
        private formBuilder: FormBuilder,
        private AuthenticationService: AuthenticationService,
        private dialogRef: MatDialogRef<ProcessPreventiveComponent>
        ) {
        this.choosenState = data.status;
    }

    ngOnInit() {
        this.user = this.AuthenticationService.currentUserValue;
        this.processPreventiveForm = this.formBuilder.group({
            invoice: ['', [Validators.required]],
            preventiveState: [this.choosenState],
            iva: [''],
            notes: ['']
        });
    }

    get validateFunction() { return this.processPreventiveForm.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {
        // stop here if form is invalid
        if (this.choosenState == 'Confermato' && this.processPreventiveForm.invalid) {
            this.submitted = true;
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.processPreventiveForm);
    }

}
