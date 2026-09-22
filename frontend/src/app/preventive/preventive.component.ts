import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { Preventive, TableConfigs, User } from '../_models';
import { PreventivesService, AuthenticationService, PreviousRouteService } from '../_services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ProcessPreventiveComponent } from 'app/process-preventive/process-preventive.component';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
import { UpdatePreventiveComponent } from 'app/update-preventive/update-preventive.component';
const api = environment.API_URL;

@Component({
	selector: 'app-preventive',
	templateUrl: './preventive.component.html',
	styleUrls: ['./preventive.component.scss']
})

export class PreventiveComponent implements OnInit {
	displayedColumns: string[] = ['index', 'view', 'id', 'client', 'from', 'download', 'status', 'discount', 'shipping', 'amount', 'formatedDate', 'actions'];
	dataSource: MatTableDataSource<Preventive>;
	tableConfigs: TableConfigs;
	user: User;
	totalCount: number;
	ivaShipping: number;
	ivaHomeService: number;
	selfPreventives: string = "true";
	baseUrl: string = api;

	constructor(
		private previousRouteService: PreviousRouteService,
		private toastr: ToastrService,
		public dialog: MatDialog,
		public LoaderInterceptor: LoaderInterceptor,
		private router: Router,
		private AuthenticationService: AuthenticationService,
		private PreventivesService: PreventivesService
		) { }

	ngOnInit() {
		this.previousRouteService.setPreviousUrl = this.router.url;
		this.LoaderInterceptor.setLoader = true;
		this.user = this.AuthenticationService.currentUserValue;

		if (this.user.role == "manager") {
			if(this.selfPreventives == "true"){
				this.displayedColumns = ['index', 'view', 'id', 'client', 'download', 'status', 'discount', 'shipping', 'amount', 'commision', 'formatedDate', 'actions'];
			}
			else {
				this.displayedColumns = ['index', 'view', 'id', 'client', 'from', 'download', 'status', 'discount', 'shipping', 'amount', 'commision', 'formatedDate', 'actions'];
			}
		}
		else if (this.user.role == "shop") {
			if(this.selfPreventives == "true"){
				this.displayedColumns = ['index', 'view', 'id', 'client', 'download', 'status', 'discount', 'shopDiscount', 'shipping', 'service_on_home', 'amount', 'totalAmount', 'formatedDate', 'actions'];
			}
			else {
				this.displayedColumns = ['index', 'view', 'id', 'from', 'download', 'status', 'discount', 'shopDiscount', 'shipping', 'amount', 'formatedDate', 'actions'];
			}
			// this.displayedColumns = ['index', 'view', 'client', 'download', 'status', 'discount', 'shipping', 'service_on_home', 'amount', 'totalAmount', 'formatedDate', 'actions'];
		}
		this.tableConfigs = new TableConfigs;
		this.tableConfigs.filter = "";
		this.tableConfigs.field = "id";
		this.tableConfigs.sortOrder = "desc";
		this.tableConfigs.pageNumber = 0;
		this.tableConfigs.pageSize = 5;
		this.getTableData(this.tableConfigs);
	}

	applyFilter(filterValue: string) {
		this.LoaderInterceptor.setLoader = true;
		this.tableConfigs.filter = filterValue.trim().toLowerCase();
		this.tableConfigs.pageNumber = 0;
		this.getTableData(this.tableConfigs);
	}

	getPaginatorData(event?: PageEvent) {
		this.LoaderInterceptor.setLoader = true;
		this.tableConfigs.pageNumber = event.pageIndex;
		this.tableConfigs.pageSize = event.pageSize;
		this.getTableData(this.tableConfigs);
	}

	sortData(event) {
		this.LoaderInterceptor.setLoader = true;
		this.tableConfigs.field = event.active;
		this.tableConfigs.sortOrder = event.direction;
		this.tableConfigs.pageNumber = 0;
		this.getTableData(this.tableConfigs);
	}

	getTableData(tableConfigs: TableConfigs) {
		let self = this.selfPreventives == "true" ? true : false;
		this.PreventivesService.getPreventives(tableConfigs, self).pipe(first()).subscribe(preventives => {
			this.dataSource = new MatTableDataSource(preventives.original.data);
			this.totalCount = preventives.original.recordsTotal;
			this.LoaderInterceptor.setLoader = false;
		});
	}

	viewPreventive(id: number) {
		this.router.navigate(['/admin/edit', id]);
	}

	reloadTable() {
		this.LoaderInterceptor.setLoader = true;

		if (this.user.role == "manager") {
			if(this.selfPreventives == "true"){
				this.displayedColumns = ['index', 'view', 'id', 'client', 'download', 'status', 'discount', 'shipping', 'amount', 'commision', 'formatedDate', 'actions'];
			}
			else {
				this.displayedColumns = ['index', 'view', 'id', 'client', 'from', 'download', 'status', 'discount', 'shipping', 'amount', 'commision', 'formatedDate', 'actions'];
			}
		}
		else if (this.user.role == "shop") {
			if(this.selfPreventives == "true"){
				this.displayedColumns = ['index', 'view', 'id', 'client', 'download', 'status', 'discount', 'shopDiscount', 'shipping', 'service_on_home', 'amount', 'totalAmount', 'formatedDate', 'actions'];
			} else {
				this.displayedColumns = ['index', 'view', 'id', 'from', 'download', 'status', 'discount', 'shopDiscount', 'shipping', 'amount', 'formatedDate', 'actions'];
			}
		}

		this.getTableData(this.tableConfigs);
	}

	changeStatus(id: number, status: string, discountId: null) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		dialogConfig.height = '455px';
		dialogConfig.width = '650px';
		dialogConfig.data = {
			id: id,
			status: status,
			discountId: discountId,
		};

		const dialogRef = this.dialog.open(ProcessPreventiveComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data && status != data.value.preventiveState) {
					this.PreventivesService.updatePreventiveStatus(id, data, discountId).pipe().subscribe(response => {
						if (response.code == 0) {
							this.getTableData(this.tableConfigs);
							this.LoaderInterceptor.setLoader = false;
							this.toastr.success(response.message, 'Cambio di stato', {
								timeOut: 3000
							});
						}
						else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Cambio di stato', {
								timeOut: 3000
							});
						}
					});
				}
			});
	}

	changePreventive(id: number) {
		this.LoaderInterceptor.setLoader = true;

		this.PreventivesService.getPreventiveData(id).pipe().subscribe(products => {
			console.log('asdasdasd', products);
			let selectedPreventive = this.dataSource.data.find(function(element) {
				if(element.id === id) {
					return true;
				}
			});

			let amount = 0;

			products.forEach(element => {
				amount = amount + element.totalPrice * Number(element.quantity);
			});

			const dialogConfig = new MatDialogConfig();
			dialogConfig.autoFocus = true;
			dialogConfig.maxHeight = '690px';

			// if ((this.user.role != 'shop') && (selectedPreventive.assignedType != 'client') ||
			// (this.user.role == 'shop') && (selectedPreventive.assignedType == 'client'))
			// {
				//   dialogConfig.maxHeight = '690px';
				// }
				// else {
					//   dialogConfig.maxHeight = '690px';
					// }

					this.PreventivesService.checkAvailability(id).pipe().subscribe(available => {

						if (!available) {//(this.user.role !== 'shop') && (selectedPreventive.assignedType === 'client')) {
							// console.log(this.user.role, selectedPreventive.assignedType);
							dialogConfig.maxHeight = '600px';
						}

						if (this.user.iva_shipping !== products[0].iva_shipping) {
							this.ivaShipping = products[0].iva_shipping;
						} else {
							this.ivaShipping = this.user.iva_shipping;
						}

						if (this.user.iva_home_service !== products[0].iva_home_service) {
							this.ivaHomeService = products[0].iva_home_service;
						} else {
							this.ivaHomeService = this.user.iva_home_service;
						}

						dialogConfig.data = {
							id: id,
							amount: amount,
							assigned: selectedPreventive.assignedId,
							discount: selectedPreventive.discount,
							shopDiscount: selectedPreventive.shopDiscount,
							shipping: selectedPreventive.shipping,
							markup : selectedPreventive.markup,
							discountId: selectedPreventive.discountId,
							reference: products[0].reference,
							iva_shipping: this.ivaShipping,
							iva_home_service: this.ivaHomeService,
							service_on_home: selectedPreventive.service_on_home,
							available: available,
							fullName: selectedPreventive.client,
							type: selectedPreventive.assignedType
						};

						if(!available) {
							dialogConfig.height = '600px';
							dialogConfig.width = '600px';

						} else {
							dialogConfig.height = '800px';
						}

						this.LoaderInterceptor.setLoader = false;

						const dialogRef = this.dialog.open(UpdatePreventiveComponent, dialogConfig);
						dialogRef.afterClosed().subscribe(
							data => {
							console.log('dataaaaa', data);
								if (data) {
									this.PreventivesService.updatePreventiveData(id, data).pipe().subscribe(response => {
										if (response.code == 0) {
											this.getTableData(this.tableConfigs);
											this.LoaderInterceptor.setLoader = false;
											this.toastr.success(response.message, 'Aggiorna Preventivo', {
												timeOut: 3000
											});
										}
										else {
											this.LoaderInterceptor.setLoader = false;
											this.toastr.error(response.message, 'Aggiorna Preventivo', {
												timeOut: 3000
											});
										}
									});
								}
							});
					});
				});
	}

	deletePreventive(id: number) {

		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.PreventivesService.deletePreventives(id).pipe().subscribe(response => {
						if (response.code == 0) {
							this.getTableData(this.tableConfigs);
							this.LoaderInterceptor.setLoader = false;
							this.toastr.success(response.message, 'Elimina preventivo', {
								timeOut: 3000
							});
						}
						else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Elimina preventivo', {
								timeOut: 3000
							});
						}
					});
				}
			});
	}
}
