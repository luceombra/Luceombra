import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { TableConfigs, User } from '../_models';
import { AuthenticationService, UserService } from '../_services';
import { Router } from '@angular/router';
import { AddAgentMatrixComponent } from 'app/add-agent-matrix/add-agent-matrix.component';
import { EditAgentMatrixComponent } from 'app/edit-agent-matrix/edit-agent-matrix.component';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
    selector: 'app-agent-matrices',
    templateUrl: './agent-matrices.component.html',
    styleUrls: ['./agent-matrices.component.scss']
})
export class AgentMatricesComponent implements OnInit {
    displayedColumns: string[] = ['index', 'discount', 'agent_fee', 'actions'];
    dataSource: MatTableDataSource<User>;
    tableConfigs: TableConfigs;
    user: User;
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

        if (this.user.role != "admin") {
            this.router.navigate(['/admin/dashboard']);
        }

        this.tableConfigs = new TableConfigs;
        this.tableConfigs.filter = "";
        this.tableConfigs.field = "index";
        this.tableConfigs.sortOrder = "asc";
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
        this.UserService.getAgentsMatrix(tableConfigs).pipe(first()).subscribe(matrices => {
            this.dataSource = new MatTableDataSource(matrices.original.data);
            this.totalCount = matrices.original.recordsTotal;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    addAgentMatrix() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '400px';
        dialogConfig.width = '620px';
        const dialogRef = this.dialog.open(AddAgentMatrixComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.UserService.addAgentMatrix(data.value).pipe().subscribe(response => {

                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.toastr.success(response.message, 'Aggiungi agente', {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, 'Aggiungi agente', {
                                timeOut: 3000
                            });
                        }
                    });
                }
            }
            );
    }

    updateAgentMatrix(dt: any) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '400px';
        dialogConfig.width = '620px';
        dialogConfig.data = dt;
        const dialogRef = this.dialog.open(EditAgentMatrixComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.UserService.updateAgentMatrix(dt.id, data.value).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.toastr.success(response.message, "Modifica matrice", {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, "Modifica matrice", {
                                timeOut: 3000
                            });
                        }
                    });
                }
            }
            );
    }

    deleteAgentMatrix(id: number) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.UserService.deleteAgentMatrix(id).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.toastr.success(response.message, "Cancella agente", {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, "Cancella agente", {
                                timeOut: 3000
                            });
                        }
                    });
                }
            }
            );
    }
}
