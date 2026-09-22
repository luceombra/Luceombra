import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { TypeMotor } from '../_models';
import { TypeMotorService } from '../_services';
import { environment } from '../../environments/environment';
const api = environment.API_URL;
import { LoaderInterceptor } from '../_helpers/loader';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { FormGroup, FormControl, FormBuilder, NgForm, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


export interface MotorData {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  motion_id: number;
  updated_at: string;
  created_at: string;
}


@Component({
  selector: 'app-motor-component-admin',
  templateUrl: './motor-component-admin.component.html',
  styleUrls: ['./motor-component-admin.component.scss']
})
export class MotorComponentAdminComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'price', 'image', 'actions'];
  dataSource: MatTableDataSource<MotorData>;
  motors: TypeMotor[] = [];
  baseUrl: string;
  message: string;
  name: string;
  valid: boolean;
  show: boolean;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private toastr: ToastrService,
    private TypeMotorService: TypeMotorService,
    public LoaderInterceptor: LoaderInterceptor,
    public dialog: MatDialog
  ) { }

  openDialog(): void {
    this.LoaderInterceptor.setLoader = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '580px';
    dialogConfig.width = '620px';
    dialogConfig.data = {
      name: "",
      price: 0,
      image: "",
      description: "",
      editMode: false,
    };
    const dialogRef = this.dialog.open(DialogMotorComponent, dialogConfig);
    dialogRef.beforeClosed().subscribe(result => {
      if (result) {
        result.value.image = "user.jpg";
        if (result.value.url)
          result.value.image = Math.random() + ".png";
        this.TypeMotorService.add(result.value).subscribe(data => {
          result.value.id = data;
          result.value.image = "/images/" + result.value.image;
          this.motors.unshift(result.value);
          this.dataSource = new MatTableDataSource(this.motors);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.LoaderInterceptor.setLoader = false;
          this.toastr.success("Il motore è stato aggiunto con successo", 'Aggiungi motori', {
            timeOut: 3000
          });
        });
      }
      
    });
  }

  updateMotor(dt: any) {
    this.LoaderInterceptor.setLoader = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '523px';
    dialogConfig.width = '620px';
    dialogConfig.data = {
      id: dt.id,
      name: dt.name,
      price: dt.price,
      image: dt.image,
      description: dt.description,
      editMode: true,
    };

    const dialogRef = this.dialog.open(DialogMotorComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          if (data.value.url)
            data.value.image = Math.random() + ".png";
          else
            data.value.image = dt.image;
          this.TypeMotorService.update(data.value.id, data.value).pipe().subscribe(response => {
            data.value.image = data.value.url ? "/images/" + data.value.image : data.value.image;

            if (response["code"] == 0) {
              this.motors = this.motors.map(motor => {
                if (motor.id === data.value.id) {
                  motor = data.value;
                }
                return motor;
              });
              this.dataSource = new MatTableDataSource(this.motors);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.toastr.success("Il motore è stato aggiornato con successo!", 'Modifica motori', {
                timeOut: 3000
              });
            }
            else {
              this.valid = false;
              this.toastr.error("Il motori non può essere cancellato", 'Modifica motori', {
                timeOut: 3000
              });
            }
            this.LoaderInterceptor.setLoader = false;
          });
        }
        
      }
    );
  }

  deleteClient(id: number) {
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.beforeClose().subscribe(
      data => {
        if (data) {
			this.LoaderInterceptor.setLoader = true;
          this.TypeMotorService.delete(id).pipe().subscribe(data => {

            if (data["code"] === 0) {
              this.motors = this.motors.filter(line => line.id !== id);
              this.dataSource = new MatTableDataSource(this.motors);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.toastr.success("Il motore è stato cancellato con successo!", 'Elimina motori', {
                timeOut: 3000
              });
            }
            else {
              this.valid = false;
              this.toastr.error("Si è verificato un errore durante l’eliminazione del motore!", 'Elimina motori', {
                timeOut: 3000
              });
      }
      
			this.LoaderInterceptor.setLoader = false;
          })
        }
        
      }
      
    );

  }

  ngOnInit() {
    this.baseUrl = api;
    this.valid = true;
    this.show = false;
    this.LoaderInterceptor.setLoader = true;
    this.TypeMotorService.getTypeMotor().pipe(first()).subscribe(typeMotors => {
      this.LoaderInterceptor.setLoader = true;
      this.motors = typeMotors;
      this.dataSource = new MatTableDataSource(this.motors);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.LoaderInterceptor.setLoader = false;
    });

  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

@Component({
  selector: 'dialog-motor-component',
  templateUrl: 'dialog-motor-component.html',
})
export class DialogMotorComponent implements OnInit {
  motorForm: FormGroup;
  submitted: boolean = false;
  url: string;
  image: string;
  TypeMotor: TypeMotor;
  baseUrl: string;
  editMode: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public LoaderInterceptor: LoaderInterceptor,
    private dialogRef: MatDialogRef<DialogMotorComponent>
  ) {
    this.TypeMotor = new TypeMotor;
    this.TypeMotor.id = data.id;
    this.TypeMotor.name = data.name;
    this.TypeMotor.price = data.price;
    // this.TypeMotor.image = data.image;
    this.url = "";
    this.image = data.image;
    this.editMode = data.editMode;
    this.TypeMotor.description = data.description;
  }

  ngOnInit() {
    this.LoaderInterceptor.setLoader = true;
    this.baseUrl = api;
    this.image = this.baseUrl + this.image;
    this.motorForm = this.formBuilder.group({
      id: [this.TypeMotor.id],
      name: [this.TypeMotor.name, [Validators.required]],
      price: [this.TypeMotor.price, [Validators.required]],
      url: [""],

      description: [this.TypeMotor.description]
    });
    this.LoaderInterceptor.setLoader = false;
  }

  get validateFunction() { return this.motorForm.controls; }


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
    // stop here if form is invalid
    this.LoaderInterceptor.setLoader = true;
    if (this.motorForm.invalid) {
      this.submitted = true;
      return;
    }

    this.dialogRef.close(this.motorForm);
  }

}

