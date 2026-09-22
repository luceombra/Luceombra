import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialogConfig, MatDialog } from '@angular/material';
import { first } from 'rxjs/operators';
import { PreventivesService, AuthenticationService } from '../_services';
import { OrdersService } from 'app/_services/orders.service';
import { TableConfigs, User, Preventive } from '../_models';
import { Router } from '@angular/router';
import { ProcessPreventiveComponent } from 'app/process-preventive/process-preventive.component';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ProcessOrdersComponent } from 'app/process-orders/process-orders.component';
import { CreateInvoiceComponent } from 'app/create-invoice/create-invoice.component';
import { LoaderInterceptor } from '../_helpers/loader';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';


@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	preventiveColumns: string[] = ['index', 'client', 'from', 'formatedDate', 'status', 'actions'];
	orderColumns: string[] = ['index', 'client', 'from', 'formatedDate', 'orderStatus', 'actions'];
	dataSource1: MatTableDataSource<Preventive>;
	dataSource2: MatTableDataSource<Preventive>;
	tableConfigs: TableConfigs;
	user: User;
	totalCount: number;
	selfPreventives: string = "true";
	count: number = 0;
	loaded: BehaviorSubject<number> = new BehaviorSubject<number>(this.count);
	public loaded$: Observable<number>;

	constructor(
		private toastr: ToastrService,
		public dialog: MatDialog,
		public LoaderInterceptor: LoaderInterceptor,
		private AuthenticationService: AuthenticationService,
		private PreventivesService: PreventivesService,
		private OrdersService: OrdersService
		) {
		this.loaded$ = this.loaded.asObservable();
	}

	ngOnInit() {
		this.LoaderInterceptor.setLoader = true;
		this.loaded$
		.subscribe(loaded => {
			if (loaded >= 2) {
				this.LoaderInterceptor.setLoader = false;
				this.count = 0;
			}
		});

		this.user = this.AuthenticationService.currentUserValue;

		if (this.user.role == "manager") {
			this.orderColumns = ['index', 'client', 'from', 'formatedDate', 'orderStatus'];
		}

		this.tableConfigs = new TableConfigs;
		this.tableConfigs.filter = "";
		this.tableConfigs.field = "id";
		this.tableConfigs.sortOrder = "desc";
		this.tableConfigs.pageNumber = 0;
		this.tableConfigs.pageSize = 5;
		this.getTableData(this.tableConfigs);
	}

	getTableData(tableConfigs: TableConfigs) {
		let self = this.selfPreventives == "true" ? true : false;
		this.PreventivesService.getPreventives(tableConfigs, self).pipe(first()).subscribe(preventives => {
			this.dataSource1 = new MatTableDataSource(preventives.original.data);
			this.totalCount = preventives.original.recordsTotal;
			++this.count;
			this.loaded.next(this.count);
		});
		this.OrdersService.getOrders(tableConfigs, self).pipe(first()).subscribe(preventives => {
			this.dataSource2 = new MatTableDataSource(preventives.original.data);
			this.totalCount = preventives.original.recordsTotal;
			++this.count;
			this.loaded.next(this.count);
		});
	}

	changePreventiveStatus(id: number, status: string, discountId = null) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		dialogConfig.height = '435px';
		dialogConfig.width = '635px';
		dialogConfig.data = {
			id: id,
			status: status
		};

		const dialogRef = this.dialog.open(ProcessPreventiveComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data && status != data.value.preventiveState) {
					this.PreventivesService.updatePreventiveStatus(id, data, discountId = null).pipe().subscribe(response => {

						if (response.code == 0) {
							++this.count;
							this.getTableData(this.tableConfigs);
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
			}
			);
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
							++this.count;
							this.getTableData(this.tableConfigs);
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
			}
			);

	}

	changeOrderStatus(id: number, status: string) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		dialogConfig.data = {
			id: id,
			status: status
		};

		const dialogRef = this.dialog.open(ProcessOrdersComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data && status != data) {
					this.OrdersService.updateOrderStatus(id, data).pipe().subscribe(response => {
						if (response.code == 0) {
							++this.count;
							this.getTableData(this.tableConfigs);
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
			}
			);
	}

	createInvoice(id: number) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		dialogConfig.data = {
			id: id
		};

		const dialogRef = this.dialog.open(CreateInvoiceComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.OrdersService.createInvoice(id, data.value).pipe().subscribe(response => {
						if (response.code == 0) {
							++this.count;
							this.getTableData(this.tableConfigs);
							this.toastr.success(response.message, 'Creazione di conferma d’ordine', {
								timeOut: 3000
							});
						}
						else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Creazione di conferma d’ordine', {
								timeOut: 3000
							});
						}
					});
				}
			}
			);
	}

	deleteOrder(id: number) {

		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.OrdersService.deleteOrder(id).pipe().subscribe(response => {

						if (response.code == 0) {
							++this.count;
							this.getTableData(this.tableConfigs);
							this.toastr.success(response.message, 'Elimina ordine', {
								timeOut: 3000
							});
						} else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Elimina ordine', {
								timeOut: 3000
							});
						}
					});
				}
			}
			);
	}
}


