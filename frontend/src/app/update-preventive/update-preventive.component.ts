import { Component, OnInit, Inject } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderInterceptor } from '../_helpers/loader';
import { User, Preventive } from '../_models';
import { AuthenticationService, PreventivesService, ProductService, UserService } from '../_services';
import { environment } from '../../environments/environment';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
const api = environment.API_URL;

@Component({
	selector: 'app-update-preventive',
	templateUrl: './update-preventive.component.html',
	styleUrls: ['./update-preventive.component.scss']
})
export class UpdatePreventiveComponent implements OnInit {
	baseUrl: string;
	user: User;
	clients: any;
	preventive: Preventive;
	discountsOfShop: any;
	matrices: any;
	discountMatrix: any;
	shopOrClient: any;
	assignedId = 0;
	message: string;
	preventiveForm: FormGroup;
	preventiveId: number;
	available = false;
	fullName: string;
	assignedType: string;
	discountWhenUserIsShop: any;
	discountId: number;



	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private toastr: ToastrService,
		public dialog: MatDialog,
		private router: Router,
		public LoaderInterceptor: LoaderInterceptor,
		private AuthenticationService: AuthenticationService,
		private PreventivesService: PreventivesService,
		private formBuilder: FormBuilder,
		private UserService: UserService,
		private dialogRef: MatDialogRef<UpdatePreventiveComponent>
		) {
		this.user = this.AuthenticationService.currentUserValue;
		this.preventive = new Preventive();
		this.preventiveId = Number(data.id);
		this.preventive.discount = Number(data.discount);
		// this.discountSelected = data.discountId;
		this.discountId = data.discountId;
		this.preventive.shopDiscount = Number(data.shopDiscount);
		this.preventive.shipping = Number(data.shipping);
		this.preventive.iva_shipping = Number(data.iva_shipping);
		this.preventive.iva_home_service = Number(data.iva_home_service);
		this.preventive.reference = data.reference;
		this.preventive.amount = Number(data.amount);
		this.fullName = data.fullName;
		this.assignedType = data.type;
		this.available = Boolean(data.available);

		if (data.service_on_home) {
			this.preventive.service_on_home = Number(data.service_on_home);
		} else {
			this.preventive.service_on_home = 0;
		}

		if (data.markup) {
			this.preventive.markup = Number(data.markup);
		} else {
			this.preventive.markup = 0;
		}

		if ((this.user.role === 'shop' && data.type === 'client') || (this.user.role !== 'shop' && data.type === 'shop')) {
			this.assignedId = Number(data.assigned);
		} else {
			this.assignedId = 0;
		}

		if(this.user.role === 'shop') {
			this.discountWhenUserIsShop = data.shopDiscount;
		}

	}

	ngOnInit() {
		this.LoaderInterceptor.setLoader = true;
		this.preventiveForm = this.formBuilder.group({
			assigned: [this.assignedId],
			iva: [this.user.iva],
			discount: [this.preventive.discount],
			discountWhenUserIsShop: [this.discountWhenUserIsShop],
			shopDiscount: [this.preventive.shopDiscount],
			shipping: [this.preventive.shipping],
			iva_shipping: [this.preventive.iva_shipping],
			iva_home_service: [this.preventive.iva_home_service],
			reference: [this.preventive.reference],
			// discount: [this.discountSelected],
			discountId: [this.discountId],
			service_on_home: [this.preventive.service_on_home],
			markup: [this.preventive.markup],
			amount: [0],
			totalAmount: [0]
		});

		this.baseUrl = api;
		this.getClients(this.user);
		this.getMatrices();

		this.UserService.getShopsDiscount().pipe().subscribe(response => {
			this.discountsOfShop = response;
			if(this.discountId !== null) {
				 this.discountMatrix = this.discountsOfShop.find(x => x.id == this.discountId);
	        } else {
	            this.discountMatrix = null;
	        }
		});

	}

	private getClients(user: User) {
		this.PreventivesService.getclients(user).pipe(first()).subscribe(response => {
			this.clients = response;
			this.preventiveForm.patchValue({assigned: this.assignedId});
		});

		this.LoaderInterceptor.setLoader = false;
	}

	private getShopsDiscount() {
		this.UserService.getShopsDiscount().pipe().subscribe(response => {
			this.discountsOfShop = response;
		});
	}

	private getMatrices() {
        this.UserService.retrieveMatrices().pipe(first()).subscribe(response => {
            this.matrices = response;
        });
    }

	changeDiscount(event)
    {
    	this.assignedId = this.shopOrClient.id;
        if (event.value.discount_id != null) {
            this.discountMatrix = this.matrices.find(x => x.id === event.value.discount_id);
        } else {
            this.discountMatrix = null;
        }
    }

	// changeDiscountByShop(event)
 //    {
 //        if (event.value.discount_id != null) {
 //            this.discountMatrix = this.matrices.find(x => x.id === event.value.discount_id);
 //        } else {
 //            this.discountMatrix = null;
 //        }
 //    }

	updateShipping(event) {

		let formDt = this.preventiveForm.value;

		if (this.preventiveForm) {
			let client = this.clients.find(function(element){
				if (element.id === formDt.assigned){
					return true;
				}

			});
				if (event.value != null) {
            		this.discountMatrix = this.discountsOfShop.find(x => x.id == client.discount_id);
		        }

			this.preventiveForm.patchValue({shipping: client.shipping});
		}
	}

	close() {
		this.dialogRef.close(false);
	}

	onSubmit() {
		this.LoaderInterceptor.setLoader = true;
		this.dialogRef.close(this.preventiveForm);
	}
}
