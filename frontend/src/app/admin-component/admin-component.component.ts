import { Component, OnInit , ViewChild, Inject} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource, PageEvent} from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material';
import { first } from 'rxjs/operators';
import { TableConfigs, User } from '../_models';
import { CurtainColor } from '../_models';
import { CurtainColorService} from '../_services';
import { AuthenticationService, UserService } from '../_services';
import { Router } from '@angular/router';
import { AddAgentComponent } from 'app/add-agent/add-agent.component';
import { ModifyAgentComponent } from 'app/modify-agent/modify-agent.component';
import { UpdateProfileComponent } from 'app/update-profile/update-profile.component';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
import {FormGroup, FormControl, FormBuilder, NgForm, Validators} from '@angular/forms';
const api = environment.API_URL;

@Component({
  selector: 'app-admin-component',
  templateUrl: './admin-component.component.html',
  styleUrls: ['./admin-component.component.scss']
})
export class AdminComponentComponent implements OnInit {
  displayedColumns: string[] = ['index', 'image', 'name', 'email', 'phone_number', 'iva', 'actions'];
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
    this.UserService.getUsers(tableConfigs).pipe(first()).subscribe(agents => {
      this.dataSource = new MatTableDataSource(agents.original.data);
      this.totalCount = agents.original.recordsTotal;
      this.LoaderInterceptor.setLoader = false;
    });
  }

  addUser() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '580px';
    dialogConfig.width = '620px';
    dialogConfig.data = {
		name: "",
    email: '',
    phone_number: "",
    iva: 0,
    image: "",
    editMode: false,
    showIva: false
	};
    const dialogRef = this.dialog.open(AdminComponentModal, dialogConfig);

    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          console.log(result)
          result.value.image = "user.jpg";
        if (result.value.url)
          result.value.image = Math.random() + ".png";
          this.UserService.addUsers(result.value).pipe().subscribe(response => {
            console.log(response)
            if (response.code == 0) {
              this.getTableData(this.tableConfigs);
              this.toastr.success(response.message, 'Aggiungi administratore', {
                timeOut: 3000
              });
            }
            else {
              this.LoaderInterceptor.setLoader = false;
              this.toastr.error(response.message, 'Aggiungi administratore', {
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
    //dialogConfig.data = dt;
    dialogConfig.data = {
      name: dt.name,
      email: dt.email,
      phone_number: dt.phone_number,
      iva: dt.iva,
      image: dt.image,
      editMode: true,
      showIva: dt.superAdmin,
      id: dt.id
    };
    const dialogRef = this.dialog.open(AdminComponentModal, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          if (data.value.url)
              data.value.image = Math.random() + ".png";
            else
              data.value.image = dt.image;
          this.UserService.updateUser(dt.id, data.value).pipe().subscribe(response => {
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

  deleteAdmin(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          this.UserService.deleteAdmins(id).pipe().subscribe(response => {
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



@Component({
  selector: 'admin-component-modal',
  templateUrl: 'admin-component-modal.html',
})
export class AdminComponentModal implements OnInit {
  motorForm: FormGroup;
  submitted: boolean = false;
  TypeMotor: User;
  image: string;
  url: string;
  baseUrl: string;
  color: string;
  email: string;
  phone_number: number;
  iva: number;
  showIva: boolean = false;
  editMode: boolean = false;

  constructor(
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public LoaderInterceptor: LoaderInterceptor,
    private dialogRef: MatDialogRef<AdminComponentModal>
    ) {
		this.TypeMotor = new User;
		this.TypeMotor.id = data.id;
		this.TypeMotor.name = data.name;
    this.TypeMotor.email = data.email;
    this.TypeMotor.phone_number = data.phone_number;
    this.TypeMotor.iva = data.iva;
    this.editMode = data.editMode;
    this.image = data.image;
    this.showIva = data.showIva;
    this.url = "";
	}

    ngOnInit() {
		this.baseUrl = api;
		this.image = this.baseUrl + this.image;
      this.motorForm = this.formBuilder.group({
		id: [this.TypeMotor.id],
        name: [this.TypeMotor.name, [Validators.required]],
        email: [this.TypeMotor.email, [Validators.required]],
        iva: [this.TypeMotor.iva, [Validators.required]],
        phone_number: [this.TypeMotor.phone_number],
    url: [""],
      });

    }

	get validateFunction() { return this.motorForm.controls; }

	onSelectColor(event) { 
		this.motorForm.controls['value'].setValue(event);
  }
  
  onSelectFile(event) { // called each time file input changes
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        this.motorForm.controls['url'].setValue(event.target["result"]);
        // this.motorForm =  this.formBuilder.group({
        // 	url: [event.target["result"]],
        // });
      }
    }
  }
	

    close() {
      this.dialogRef.close(false);
    }
  
    onSubmit() {
      this.LoaderInterceptor.setLoader = true;
      if (this.motorForm.invalid) {
        this.submitted = true;
        return;
      }
      console.log(this.motorForm)
      this.dialogRef.close(this.motorForm);
    }

}


