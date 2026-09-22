import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { TableConfigs, User } from '../_models';
import { AuthenticationService, UserService } from '../_services';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ConfirmUpdateDialogComponent } from 'app/confirm-update-dialog/confirm-update-dialog.component';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
import { AddShopComponent } from 'app/add-shop/add-shop.component';
import { ToastrService } from 'ngx-toastr';
import { ModifyShopComponent } from 'app/modify-shop/modify-shop.component';
const api = environment.API_URL;

@Component({
	selector: 'app-shops',
	templateUrl: './shops.component.html',
	styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit {
	displayedColumns: string[] = ['index', 'image', 'name', 'email', 'iva', 'address', 'description', 'assignee', 'phone_number', 'status', 'actions'];
	dataSource: MatTableDataSource<User>;
	tableConfigs: TableConfigs;
	user: User;
	color = 'primary';
	totalCount: number;
	baseUrl: string;

	constructor(
		private toastr: ToastrService,
		public dialog: MatDialog,
		private router: Router,
		public LoaderInterceptor: LoaderInterceptor,
		private AuthenticationService: AuthenticationService,
		private UserService: UserService
		) { }

	ngOnInit() {
		this.LoaderInterceptor.setLoader = true;
		this.user = this.AuthenticationService.currentUserValue;
		this.baseUrl = api;

		if (this.user.role == "shop") {
			this.router.navigate(['/admin/dashboard']);
		}
		else if (this.user.role == "manager") {
			this.displayedColumns = [
			'index', 'image', 'name', 'email', 'iva', 'address', 'description', 'phone_number', 'status', 'actions'
			];
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
		this.UserService.getShops(tableConfigs).pipe(first()).subscribe(agents => {
			this.dataSource = new MatTableDataSource(agents.original.data);
			this.totalCount = agents.original.recordsTotal;
			this.LoaderInterceptor.setLoader = false;
		});
	}

	addShop() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		dialogConfig.height = '580px';
		dialogConfig.width = '620px';
		const dialogRef = this.dialog.open(AddShopComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.UserService.addShop(data.value).pipe().subscribe(response => {
						if (response.code == 0) {
							this.getTableData(this.tableConfigs);
							this.LoaderInterceptor.setLoader = false;
							this.toastr.success(response.message, 'Aggiungi negozio', {
								timeOut: 3000
							});
						} else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Aggiungi negozio', {
								timeOut: 3000
							});
						}
					});
				}
			}
			);
	}

	updateShop(dt: any) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		dialogConfig.height = '580px';
		dialogConfig.width = '620px';
		dialogConfig.data = dt;
		const dialogRef = this.dialog.open(ModifyShopComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.UserService.updateShop(dt.id, data.value).pipe().subscribe(response => {
						if (response.code == 0) {
							this.getTableData(this.tableConfigs);
							this.LoaderInterceptor.setLoader = false;
							this.toastr.success(response.message, 'Modifica negozio', {
								timeOut: 3000
							});
						}
						else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Modifica negozio', {
								timeOut: 3000
							});
						}
					});
				}
			}
			);
	}

	deleteShop(id: number) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.UserService.deleteShop(id).pipe().subscribe(response => {
						if (response.code == 0) {
							this.getTableData(this.tableConfigs);
							this.LoaderInterceptor.setLoader = false;
							this.toastr.success(response.message, 'Elimina negozio', {
								timeOut: 3000
							});
						}
						else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Elimina negozio', {
								timeOut: 3000
							});
						}
					});
				}
			}
			);
	}

	changeStatusOfShop(id: number, checked) {
		checked = !checked;
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		event.preventDefault();
		const dialogRef = this.dialog.open(ConfirmUpdateDialogComponent, dialogConfig);
		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.UserService.changeStatusOfShop(id, checked).pipe().subscribe(response => {
						if (true) {
							this.getTableData(this.tableConfigs);
							this.LoaderInterceptor.setLoader = false;
							this.toastr.success(response.message, 'Elimina negozio', {
								timeOut: 3000
							});
						} else {
							this.LoaderInterceptor.setLoader = false;
							this.toastr.error(response.message, 'Elimina negozio', {
								timeOut: 3000
							});
						}
					});
				}
			});
	}
}
