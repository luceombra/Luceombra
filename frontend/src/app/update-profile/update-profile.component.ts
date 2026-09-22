import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatIconModule } from '@angular/material';
import { LoaderInterceptor } from '../_helpers/loader';
import { EditorModule } from '@tinymce/tinymce-angular';

class ImageSnippet {
	constructor(public src: string, public file: File) { }
}

@Component({
	selector: 'app-update-profile',
	templateUrl: './update-profile.component.html',
	styleUrls: ['./update-profile.component.scss']
})

export class UpdateProfileComponent implements OnInit {
	submitted = false;
	isShop = false;
	returnUrl: string;
	updateProfile: FormGroup;
	selectedFile: ImageSnippet;
	user: any = new Object();
	formData: FormData = new FormData();
	tinyMceSettings = {
		height: 350,
	};

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private formBuilder: FormBuilder,
		public LoaderInterceptor: LoaderInterceptor,
		private dialogRef: MatDialogRef<UpdateProfileComponent>
		) {
		console.log('data', data.shop);
		this.user.name = data.user.name;
		this.user.role = data.user.role;
		this.user.email = data.user.email;
		this.user.phone = data.user.phone_number;
		this.user.iva = data.user.iva;
		this.user.iva_shipping = data.user.iva_shipping;
		this.user.zone_covered = data.user.zone_covered;
		// this.user.markup = data.user.commision;
		this.user.superAdmin = data.user.superAdmin;

		if (data.shop) {
			this.isShop = true;
			this.user.address = data.shop.address;
			this.user.pdfFooter = data.shop.pdfFooter;
			this.user.confirmation_order_note = data.shop.confirmation_order_note;
			this.user.piva = data.shop.iva;
			this.user.iva = data.user.iva;
			this.user.iva_home_service = data.shop.iva_home_service;
			this.user.iva_shipping = data.user.iva_shipping;
		} else {
			this.user.piva = data.config.p_iva;
			this.user.pdfFooter = data.config.admin_footer;
			this.user.confirmation_order_note = data.config.confirmation_order_note;
			this.user.address = data.config.address;
			this.user.website = data.config.website;
		}
	}

	ngOnInit() {
		this.updateProfile = this.formBuilder.group({
			fullName: [this.user.name, [Validators.required]],
			email: [this.user.email, [Validators.required, Validators.email]],
			phone: [this.user.phone],
			iva: [this.user.iva, [Validators.required]],
			iva_shipping: [this.user.iva_shipping, [Validators.required]],
			iva_home_service: [this.user.iva_home_service],
			zone_covered: [this.user.zone_covered],
			// markup: [this.user.markup, [Validators.required]],
			piva: [this.user.piva],
			address: [this.user.address],
			website: [this.user.website],
			pdfFooter: [this.user.pdfFooter],
			confirmation_order_note: [this.user.confirmation_order_note],
			image: [''],
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.updateProfile.controls; }

	close() {
		this.dialogRef.close(false);
	}

	processFile(imageInput: any) {
		const file: File = imageInput.files[0];
		this.formData = new FormData();
		this.formData.append('image', file, file.name);
	}

	onSubmit() {
		this.submitted = true;

		if (this.updateProfile.invalid) {
			return;
		}

		if ((this.isShop || (this.user.role == 'admin' && this.user.superAdmin)) && this.updateProfile.value.piva == "") {
			return;
		}

		this.LoaderInterceptor.setLoader = true;
		this.formData.append('fullName', this.updateProfile.value.fullName);
		this.formData.append('email', this.updateProfile.value.email);
		this.formData.append('phone', this.updateProfile.value.phone);
		this.formData.append('iva', this.updateProfile.value.iva);
		this.formData.append('iva_shipping', this.updateProfile.value.iva_shipping);
		this.formData.append('iva_home_service', this.updateProfile.value.iva_home_service);
		this.formData.append('piva', this.updateProfile.value.piva);
		this.formData.append('zone_covered', this.updateProfile.value.zone_covered);
		// this.formData.append('markup', this.updateProfile.value.markup);
		this.formData.append('address', this.updateProfile.value.address);
		this.formData.append('website', this.updateProfile.value.website);
		this.formData.append('pdfFooter', this.updateProfile.value.pdfFooter);
		this.formData.append('confirmation_order_note', this.updateProfile.value.confirmation_order_note);

		this.dialogRef.close(this.formData);
	}
}
