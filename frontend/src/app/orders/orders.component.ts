import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import {FormControl, FormGroup } from '@angular/forms';
import { Preventive, TableConfigs, User } from '../_models';
import { AuthenticationService, UserService, OrdersService, PreviousRouteService, PreventivesService } from '../_services';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ProcessOrdersComponent } from 'app/process-orders/process-orders.component';
import { AdminProcessOrderComponent } from 'app/admin-process-order/admin-process-order.component';
import { EditInvoiceComponent } from 'app/edit-invoice/edit-invoice.component';
import { CreateInvoiceComponent } from 'app/create-invoice/create-invoice.component';
import { environment } from '../../environments/environment';
import { LoaderInterceptor } from '../_helpers/loader';
const api = environment.API_URL;

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
    displayedColumns: string[] = [
        'index', 'invoiceNo', 'view', 'client', 'from', 'download', 'orderStatus', 'discount', 'shipping', 'fee', 'amount', 'formatedDate', 'actions'
    ];
    dataSource: MatTableDataSource<Preventive>;
    tableConfigs: TableConfigs;
    user: User;
    totalCount: number;
    agents: any;
    commissions: any;
    selectedAgent: any;
    selfOrders: string = "true";
    baseUrl: string = api;
    public startDate;
    public endDate;
    public dateForm = new FormGroup({
        agent : new FormControl(),
        start: new FormControl(),
        end: new FormControl(),
      });

    constructor(
        private previousRouteService: PreviousRouteService,
        private toastr: ToastrService,
        public dialog: MatDialog,
        public LoaderInterceptor: LoaderInterceptor,
        private router: Router,
        private AuthenticationService: AuthenticationService,
        private OrdersService: OrdersService,
        private UserService: UserService,
        private route: ActivatedRoute,
        ) { }

    ngOnInit() {
        let id = this.route.snapshot.params['id'] ? this.route.snapshot.params['id'] : 0;
        this.previousRouteService.setPreviousUrl = this.router.url;
        this.user = this.AuthenticationService.currentUserValue;
        this.LoaderInterceptor.setLoader = true;
        this.UserService.retrieveAgents().pipe(first()).subscribe(response => {
            this.agents = response;
            if (id) {
                this.selectedAgent = this.agents.find(x => x.id == id);
                this.applyFilter(this.selectedAgent.name);
            } else {
                this.selectedAgent = 'default';
            }
        });
        if (this.user.role == "manager") {

            if(this.selfOrders == "true") {
                this.displayedColumns = [
                'index', 'invoiceNo', 'view', 'client', 'download', 'orderStatus',
                'discount', 'shipping', 'amount', 'commision', 'formatedDate'
                ];
            } else {
                this.displayedColumns = [
                'index', 'invoiceNo', 'view', 'client', 'from', 'download', 'orderStatus',
                'discount', 'shipping', 'amount', 'commision', 'formatedDate'
                ];
            }
        } else if (this.user.role == "shop") {
            if(this.selfOrders == "true") {
                this.displayedColumns = [
                'index', 'invoiceNo', 'view', 'client', 'download', 'discount', 'shipping',
                'service_on_home', 'amount', 'totalAmount', 'formatedDate', 'actions'
                ];
            } else {
                this.displayedColumns = [
                'index', 'invoiceNo', 'view', 'from', 'download', 'discount', 'shipping',
                'amount', 'formatedDate', 'actions'
                ];
            }
            // this.displayedColumns = [
            //   'index', 'invoiceNo', 'view', 'client', 'download', 'orderStatus', 'discount', 'shipping',
            //   'service_on_home', 'amount', 'totalAmount', 'formatedDate', 'actions'
            // ];
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
        let self = this.selfOrders == "true" ? true : false;
        this.OrdersService.getOrders(tableConfigs, self).pipe(first()).subscribe(preventives => {
            this.dataSource = new MatTableDataSource(preventives.original.data);
            this.totalCount = preventives.original.recordsTotal;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    getFilteredOrders() {
        this.startDate = this.dateForm.get('start').value;
        this.endDate = this.dateForm.get('end').value;
    }

    onSubmit() {
        this.startDate = new Date(this.startDate).toLocaleDateString();
        this.endDate = new Date(this.endDate).toLocaleDateString();
        this.OrdersService.retrieveFilteredOrders(this.tableConfigs, this.startDate, this.endDate, this.selectedAgent.name, this.selectedAgent.id).pipe(first()).subscribe(response => {
            this.dataSource = new MatTableDataSource(response.data.original.data);
            this.totalCount = response.data.original.recordsTotal;
            this.commissions = response.commissions;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    viewPreventive(id: number) {
        localStorage.setItem('previousUrl-' + this.user.id, '/admin/orders');
        this.router.navigate(['/admin/view', id]);
    }

    reloadTable() {
        this.LoaderInterceptor.setLoader = true;

        if (this.user.role == "manager") {

            if(this.selfOrders == "true"){
                this.displayedColumns = [
                    'index', 'invoiceNo', 'view', 'client', 'download', 'orderStatus', 'discount', 'shipping', 'amount', 'commision', 'formatedDate'
                ];
            } else {
                this.displayedColumns = [
                'index', 'invoiceNo', 'view', 'client', 'from', 'download', 'orderStatus',
                'discount', 'shipping', 'amount', 'commision', 'formatedDate'
                ];
            }
        } else if (this.user.role == "shop") {
            if(this.selfOrders == "true"){
                this.displayedColumns = [
                'index', 'invoiceNo', 'view', 'client', 'download', 'downloadAdminPdf', 'orderStatus', 'discount', 'shipping',
                'service_on_home', 'amount', 'totalAmount', 'formatedDate', 'actions'
                ];
            } else {
                this.displayedColumns = [
                'index', 'invoiceNo', 'view', 'from', 'download', 'downloadAdminPdf', 'orderStatus', 'discount', 'shipping',
                'amount', 'formatedDate', 'actions'
                ];
            }
        }

        this.getTableData(this.tableConfigs);
    }

    changeStatus(id: number, status: string) {
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
            }
            );
    }

    updateInvoiceShop(id: number, status: string) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '455px';
        dialogConfig.width = '650px';
        dialogConfig.data = {
            id: id,
            status: status
        };

        const dialogRef = this.dialog.open(EditInvoiceComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.OrdersService.updateInvoiceShop(id, data).pipe().subscribe(response => {
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

    changeStatusFromAdmin(id: number, status: string, adminStatus) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            id: id,
            status: status,
            adminStatus: adminStatus
        };

        const dialogRef = this.dialog.open(AdminProcessOrderComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.OrdersService.updateOrderStatusFromAdmin(id, data.value, adminStatus).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Aggiorna Order', {
                                timeOut: 3000
                            });
                        } else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Aggiorna Order', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            });
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
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
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
            });
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

}
