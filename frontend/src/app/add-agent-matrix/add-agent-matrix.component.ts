import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
	selector: 'app-add-agent-matrix',
	templateUrl: './add-agent-matrix.component.html',
	styleUrls: ['./add-agent-matrix.component.scss']
})
export class AddAgentMatrixComponent implements OnInit {
	submitted = false;
	matrix: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		public LoaderInterceptor: LoaderInterceptor,
		private dialogRef: MatDialogRef<AddAgentMatrixComponent>
		) { }

	ngOnInit() {
		this.matrix = this.formBuilder.group({
			discount: ["", [Validators.required]],
			fee: ["", [Validators.required]],
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
