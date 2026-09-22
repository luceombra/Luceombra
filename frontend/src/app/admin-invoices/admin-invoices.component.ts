import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { Invoice, TableConfigs, User } from '../_models';
import { AuthenticationService, PreviousRouteService, OrdersService} from '../_services';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ProcessOrdersComponent } from 'app/process-orders/process-orders.component';
import { AdminProcessOrderComponent } from 'app/admin-process-order/admin-process-order.component';
import { EditInvoiceComponent } from 'app/edit-invoice/edit-invoice.component';
import { ToastrService } from 'ngx-toastr';
import { InvoicesService } from 'app/_services/invoices.service';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
    selector: 'app-admin-invoices',
    templateUrl: './admin-invoices.component.html',
    styleUrls: ['./admin-invoices.component.scss']
})
export class AdminInvoicesComponent implements OnInit {
    displayedColumns: string[] = ['index', 'adminInvoiceNo', 'adminInvoiceNotes', 'client', 'orderStatus', 'download', 'actions'];
    dataSource: MatTableDataSource<Invoice>;
    tableConfigs: TableConfigs;
    user: User;
    totalCount: number;
    baseUrl: string = api;

    constructor(
        private previousRouteService: PreviousRouteService,
        private toastr: ToastrService,
        public dialog: MatDialog,
        public LoaderInterceptor: LoaderInterceptor,
        private router: Router,
        private OrdersService: OrdersService,
        private AuthenticationService: AuthenticationService,
        private InvoicesService: InvoicesService
        ) { }

    ngOnInit() {
        this.previousRouteService.setPreviousUrl = this.router.url;
        this.user = this.AuthenticationService.currentUserValue;
        this.LoaderInterceptor.setLoader = true;

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
        this.InvoicesService.getAdminInvoices(tableConfigs).pipe(first()).subscribe(invoices => {
            console.log('invoices', invoices);
            this.dataSource = new MatTableDataSource(invoices.original.data);
            this.totalCount = invoices.original.recordsTotal;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    viewPreventive(id: number) {
        localStorage.setItem('previousUrl-' + this.user.id, '/admin/orders');
        this.router.navigate(['/admin/view', id]);
    }

    reloadTable() {
        this.getTableData(this.tableConfigs);
    }

    deleteInvoiceFromAdmin(id: number) {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.InvoicesService.deleteInvoice(id).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Elimina la conferma d’ordine', {
                                timeOut: 3000
                            });
                        } else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Elimina la conferma d’ordine', {
                                timeOut: 3000
                            });
                        }
                    });
                }
        });
    }

    changeStatus(id: number, status: string) {
        console.log('invoice', id, status);
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
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Cambiare stato', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Cambiare stato', {
                                timeOut: 3000
                            });
                        }
                    });
                } else {
                    this.LoaderInterceptor.setLoader = false;
                }
            });
    }

    deleteInvoice(id: number) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.OrdersService.deleteOrder(id).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Cancella ordine', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Cancella ordine', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            });
    }

    updateInvoice(id: number) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            id: id,
            status: status
        };

        const dialogRef = this.dialog.open(EditInvoiceComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.OrdersService.updateOrderStatusFromAdmin(id, data.value).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Invoice updated', {
                                timeOut: 3000
                            });
                        } else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Invoice updated', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            });
    }
}
