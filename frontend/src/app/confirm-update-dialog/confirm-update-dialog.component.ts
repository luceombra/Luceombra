import { Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
	selector: 'app-confirm-update-dialog',
	templateUrl: './confirm-update-dialog.component.html',
	styleUrls: ['./confirm-update-dialog.component.scss']
})

export class ConfirmUpdateDialogComponent {
	constructor(
		public LoaderInterceptor: LoaderInterceptor,
		private dialogRef: MatDialogRef<ConfirmUpdateDialogComponent>
		) {
	}

	ngOnInit() {

	}

	change() {
		this.LoaderInterceptor.setLoader = true;
		this.dialogRef.close(true);
	}

	close() {
		this.dialogRef.close(false);
	}
}
