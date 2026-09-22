import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';
import { User } from 'app/_models';

@Component({
    selector: 'app-modify-agent',
    templateUrl: './modify-agent.component.html',
    styleUrls: ['./modify-agent.component.scss']
})
export class ModifyAgentComponent implements OnInit {
    submitted = false;
    agent: FormGroup;
    user: User;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: FormBuilder,
        public LoaderInterceptor: LoaderInterceptor,
        private dialogRef: MatDialogRef<ModifyAgentComponent>
        ) {
        this.user = new User;
        this.user.name = data.name;
        this.user.email = data.email;
        this.user.phone_number = data.phone_number;
        this.user.zone_covered = data.zone_covered;
        // this.user.commision = data.commision;
        this.user.unpaidCommision = data.unpaidCommision;
    }

    ngOnInit() {
        this.agent = this.formBuilder.group({
            name: [this.user.name, [Validators.required]],
            email: [this.user.email, [Validators.required, Validators.email]],
            // commision: [this.user.commision, [Validators.required]],
            phone_number: [this.user.phone_number],
            zone_covered: [this.user.zone_covered],
            unpaidCommision: [this.user.unpaidCommision, [Validators.required]]
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
