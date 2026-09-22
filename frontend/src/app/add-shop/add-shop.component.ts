import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';
import { AuthenticationService, UserService } from '../_services';
import { User } from 'app/_models';

@Component({
	selector: 'app-add-shop',
	templateUrl: './add-shop.component.html',
	styleUrls: ['./add-shop.component.scss']
})
export class AddShopComponent implements OnInit {
	submitted = false;
	shop: FormGroup;
	user: User;
	assignees: Object[];
	selected : string = "";

	constructor(
		private formBuilder: FormBuilder,
		public LoaderInterceptor: LoaderInterceptor,
		private AuthenticationService: AuthenticationService,
		private UserService: UserService,
		private dialogRef: MatDialogRef<AddShopComponent>
		) { }

	ngOnInit() {
		this.user = this.AuthenticationService.currentUserValue;

		if (this.user.role == "admin") {
			this.retrieveAssignees();
		}
		else{
			this.shop = this.formBuilder.group({
				name: ["", [Validators.required]],
				email: ["", [Validators.required, Validators.email]],
				iva: ["", [Validators.required]],
				assignee: [this.selected],
				phone_number: [""],
				shipping: [0],
				address: [""],
				description: [""]
			});
		}
	}

	get f() { return this.shop.controls; }

	close() {
		this.dialogRef.close(false);
	}

	retrieveAssignees() {
		this.UserService.retrieveAssignees().pipe().subscribe(response => {
			this.selected = String(response[0]["id"]);
			this.assignees = response;
			this.shop = this.formBuilder.group({
				name: ["", [Validators.required]],
				email: ["", [Validators.required, Validators.email]],
				iva: ["", [Validators.required]],
				assignee: [this.selected],
				phone_number: [""],
				shipping: [0],
				address: [""],
				description: [""]
			});
		});
	}

	onSubmit() {
		this.submitted = true;

		if (this.shop.invalid) {
			return;
		}

		this.LoaderInterceptor.setLoader = true;
		this.dialogRef.close(this.shop);
	}
}
