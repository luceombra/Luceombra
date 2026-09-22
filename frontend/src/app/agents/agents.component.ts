import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { TableConfigs, User } from '../_models';
import { AuthenticationService, UserService } from '../_services';
import { Router } from '@angular/router';
import { AddAgentComponent } from 'app/add-agent/add-agent.component';
import { ModifyAgentComponent } from 'app/modify-agent/modify-agent.component';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
    selector: 'app-agents',
    templateUrl: './agents.component.html',
    styleUrls: ['./agents.component.scss']
})
export class AgentsComponent implements OnInit {
    displayedColumns: string[] = ['index', 'image', 'name', 'email', 'phone_number', 'zone_covered', 'unpaidCommision', 'total_commision', 'actions'];
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
        this.UserService.getAgents(tableConfigs).pipe(first()).subscribe(agents => {
            this.dataSource = new MatTableDataSource(agents.original.data);
            this.totalCount = agents.original.recordsTotal;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    addAgent() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '580px';
        dialogConfig.width = '620px';
        const dialogRef = this.dialog.open(AddAgentComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.UserService.addAgents(data.value).pipe().subscribe(response => {
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

    updateAgent(dt: any) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.height = '580px';
        dialogConfig.width = '620px';
        dialogConfig.data = dt;
        const dialogRef = this.dialog.open(ModifyAgentComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.UserService.updateAgents(dt.id, data.value).pipe().subscribe(response => {
                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.toastr.success(response.message, "Modifica agente", {
                                timeOut: 3000
                            });
                        }
                        else {
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error(response.message, "Modifica agente", {
                                timeOut: 3000
                            });
                        }
                    });
                }
            }
            );
    }

    deleteAgent(id: number) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data) {
                    this.UserService.deleteAgents(id).pipe().subscribe(response => {
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
