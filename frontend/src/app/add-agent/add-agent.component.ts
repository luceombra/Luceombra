import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
    selector: 'app-add-agent',
    templateUrl: './add-agent.component.html',
    styleUrls: ['./add-agent.component.scss']
})
export class AddAgentComponent implements OnInit {
    submitted = false;
    agent: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        public LoaderInterceptor: LoaderInterceptor,
        private dialogRef: MatDialogRef<AddAgentComponent>
        ) { }

    ngOnInit() {
        this.agent = this.formBuilder.group({
            name: ["", [Validators.required]],
            email: ["", [Validators.required, Validators.email]],
            // commision: ["", [Validators.required]],
            phone_number: [""],
            zone_covered: [""]
        });
    }

    get f() { return this.agent.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {
        this.submitted = true;

        if (this.agent.invalid) {
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.agent);
    }

}
