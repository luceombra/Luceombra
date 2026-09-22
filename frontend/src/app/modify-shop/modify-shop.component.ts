import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';
import { AuthenticationService, UserService } from '../_services';
import { User } from 'app/_models';

@Component({
	selector: 'app-modify-shop',
	templateUrl: './modify-shop.component.html',
	styleUrls: ['./modify-shop.component.scss']
})
export class ModifyShopComponent implements OnInit {
	submitted = false;
	shop: FormGroup;
	user: User;
	shopsDiscount: Object[];
	currentUser: User;
	assignees: Object[];
	selected : string = "";
	discountSelected: string = "";

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private formBuilder: FormBuilder,
		public LoaderInterceptor: LoaderInterceptor,
		private AuthenticationService: AuthenticationService,
		private UserService: UserService,
		private dialogRef: MatDialogRef<ModifyShopComponent>
		) {

		this.user = new User;
		this.user.name = data.name;
		this.user.email = data.email;
		this.user.iva = data.iva;
		this.selected = data.assignedID;
		this.discountSelected = data.discount_id;
		this.user.address = data.address;
		this.user.phone_number = data.phone_number;
		this.user.shipping = data.shipping;
		this.user.description = data.description;
	}

	ngOnInit() {
		this.currentUser = this.AuthenticationService.currentUserValue;

		if ((this.currentUser.role == "admin") || (this.currentUser.role == "manager")) {
			this.getShopsDiscount();
		}

		if (this.currentUser.role == "admin") {
			this.retrieveAssignees();
		}

		else {
			this.shop = this.formBuilder.group({
				name: [this.user.name, [Validators.required]],
				email: [this.user.email, [Validators.required, Validators.email]],
				iva: [this.user.iva, [Validators.required]],
				assignee: [this.selected],
				phone_number: [this.user.phone_number],
				shop_discount: [this.discountSelected],
				shipping: [this.user.shipping],
				address: [this.user.address],
				description: [this.user.description]
			});
		}
	}

	get f() { return this.shop.controls; }

	close() {
		this.dialogRef.close(false);
	}

	getShopsDiscount() {
		this.UserService.getShopsDiscount().pipe().subscribe(response => {
			this.shopsDiscount = response;
		});
	}

	retrieveAssignees() {
		this.UserService.retrieveAssignees().pipe().subscribe(response => {
			this.assignees = response;
			this.shop = this.formBuilder.group({
				name: [this.user.name, [Validators.required]],
				email: [this.user.email, [Validators.required, Validators.email]],
				iva: [this.user.iva, [Validators.required]],
				assignee: [this.selected],
				phone_number: [this.user.phone_number],
				shop_discount: [this.discountSelected],
				shipping: [this.user.shipping],
				address: [this.user.address],
				description: [this.user.description]
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
