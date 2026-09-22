import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';
import { AgentMatrix } from 'app/_models';

@Component({
    selector: 'app-edit-agent-matrix',
    templateUrl: './edit-agent-matrix.component.html',
    styleUrls: ['./edit-agent-matrix.component.scss']
})
export class EditAgentMatrixComponent implements OnInit {
    submitted = false;
    matrix: FormGroup;
    single: AgentMatrix;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: FormBuilder,
        public LoaderInterceptor: LoaderInterceptor,
        private dialogRef: MatDialogRef<EditAgentMatrixComponent>
        ) {
        this.single = new AgentMatrix;
        this.single.discount = data.discount;
        this.single.agent_fee = data.agent_fee;
    }

    ngOnInit() {
        this.matrix = this.formBuilder.group({
            discount: [this.single.discount, [Validators.required]],
            agent_fee: [this.single.agent_fee, [Validators.required]],
        });
    }

    get f() { return this.matrix.controls; }

    close() {
        this.dialogRef.close(false);
    }

    onSubmit() {
        this.submitted = true;

        if (this.matrix.invalid) {
            return;
        }

        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.matrix);
    }

}
