import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { Client, TableConfigs, User } from '../_models';
import { AuthenticationService, ClientsService } from '../_services';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { UpdateClientComponent } from 'app/update-client/update-client.component';
import { ToastrService } from 'ngx-toastr';
import { AddClientComponent } from 'app/add-client/add-client.component';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
    selector: 'app-clients',
    templateUrl: './clients.component.html',
    styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
    displayedColumns: string[] = ['index', 'name', 'email', 'phone', 'address', 'p_iva', 'actions'];
    dataSource: MatTableDataSource<Client>;
    tableConfigs: TableConfigs;
    user: User;
    totalCount: number;

    constructor(
        private toastr: ToastrService,
        public dialog: MatDialog,
        private router: Router,
        public LoaderInterceptor: LoaderInterceptor,
        private AuthenticationService: AuthenticationService,
        private ClientsService: ClientsService
        ) { }

    ngOnInit() {
        this.user = this.AuthenticationService.currentUserValue;

        if (this.user.role != "shop") {
            this.router.navigate(['/admin/dashboard']);
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
        this.ClientsService.getClients(tableConfigs).pipe(first()).subscribe(invoices => {
            this.dataSource = new MatTableDataSource(invoices.original.data);
            this.totalCount = invoices.original.recordsTotal;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    reloadTable() {
        this.getTableData(this.tableConfigs);
    }

    addClient() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '640px';
        dialogConfig.width = '620px';

        const dialogRef = this.dialog.open(AddClientComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.ClientsService.addClient(data.value).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Aggiungi cliente', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Aggiungi cliente', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            }
            );
    }

    updateClient(dt: any) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '620px';
        dialogConfig.width = '620px';
        dialogConfig.data = {
            id: dt.id,
            name: dt.name,
            phone: dt.phone,
            address: dt.address,
            email: dt.email,
            p_iva: dt.p_iva,
        };

        const dialogRef = this.dialog.open(UpdateClientComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.ClientsService.updateClient(dt.id, data.value).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Modifica cliente', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Modifica cliente', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            }
            );
    }

    deleteClient(id: number) {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.ClientsService.deleteClient(id).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(response.message, 'Cancella cliente', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Cancella cliente', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            }
            );
    }
}
