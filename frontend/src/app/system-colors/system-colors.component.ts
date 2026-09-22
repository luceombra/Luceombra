import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { SystemColor } from '../_models';
import { SystemColorService } from '../_services';
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
  value: string;
  updated_at: string;
  created_at: string;
}


@Component({
  selector: 'app-system-colors',
  templateUrl: './system-colors.component.html',
  styleUrls: ['./system-colors.component.scss']
})
export class SystemColorsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'value', 'image', 'actions'];
  dataSource: MatTableDataSource<MotorData>;
  motors: SystemColor[] = [];
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
    private SystemColorService: SystemColorService,
    public LoaderInterceptor: LoaderInterceptor,
    public dialog: MatDialog
  ) { }

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '580px';
    dialogConfig.width = '620px';
    dialogConfig.data = {
      name: "",
      value: "",
      image: "",
      editMode: false,
    };
    const dialogRef = this.dialog.open(DialogSystemColorsComponent, dialogConfig);
    dialogRef.beforeClosed().subscribe(result => {
      if (result) {
        result.value.image = "user.jpg";
        if (result.value.url)
          result.value.image = Math.random() + ".png";
        this.SystemColorService.add(result.value).subscribe(data => {
          if (data["code"] == 1) {
            this.toastr.error(data["message"], 'Aggiungi colori', {
              timeOut: 3000
            });
          }

          else {
            result.value.id = data;
            result.value.image = "/images/" + result.value.image;
            this.motors.unshift(result.value);
            this.dataSource = new MatTableDataSource(this.motors);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.toastr.success("Il colore è stato aggiunto con successo", 'Aggiungi colori', {
              timeOut: 3000
            });
          }
          this.LoaderInterceptor.setLoader = false;
        });
      }
    });
  }

  updateMotor(dt: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '523px';
    dialogConfig.width = '620px';
    dialogConfig.data = {
      id: dt.id,
      name: dt.name,
      value: dt.value,
      editMode: true,
      image: dt.image,
    };

    const dialogRef = this.dialog.open(DialogSystemColorsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          if (data.value.url)
          data.value.image = Math.random() + ".png";
        else
          data.value.image = dt.image;
          this.SystemColorService.update(data.value.id, data.value).pipe().subscribe(response => {
            data.value.image = data.value.url ? "/images/" + data.value.image : data.value.image;
            if (response["code"] == 0) {
              this.toastr.success("Colore aggiornato con successo", 'Aggiungi colori', {
                timeOut: 3000
              });
              this.motors = this.motors.map(motor => {
                if (motor.id === data.value.id) {
                  motor = data.value;
                }
                return motor;
              });
              this.dataSource = new MatTableDataSource(this.motors);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }
            else {
              this.valid = false;
              this.toastr.error("Il colore non può essere cancellato", 'Aggiungi colori', {
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
          this.SystemColorService.delete(id).pipe().subscribe(data => {


            if (data["code"] === 0) {
              this.motors = this.motors.filter(line => line.id !== id);
              this.dataSource = new MatTableDataSource(this.motors);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.toastr.success("Colore cancellato con successo", 'Elimina colore', {
                timeOut: 3000
              });
            }
            else {
              this.toastr.error("Si è verificato un errore durante l'eliminazione del colore", 'Elimina colore', {
                timeOut: 3000
              });
              this.valid = false;
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
    this.SystemColorService.getAllColors().pipe(first()).subscribe(typeMotors => {
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
  selector: 'dialog-systemcolors-component',
  templateUrl: 'dialog-systemcolors-component.html',
})
export class DialogSystemColorsComponent implements OnInit {
  motorForm: FormGroup;
  submitted: boolean = false;
  TypeMotor: SystemColor;
  baseUrl: string;
  color: string;
  image: string;
  url: string;
  editMode: boolean = false;

  constructor(
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public LoaderInterceptor: LoaderInterceptor,
    private dialogRef: MatDialogRef<DialogSystemColorsComponent>
  ) {
    this.TypeMotor = new SystemColor;
    this.TypeMotor.id = data.id;
    this.TypeMotor.name = data.name;
    this.TypeMotor.value = data.value;
    this.editMode = data.editMode;
    this.image = data.image;
    this.url = "";
  }

  ngOnInit() {
    this.baseUrl = api;
    this.image = this.baseUrl + this.image;
    this.motorForm = this.formBuilder.group({
      id: [this.TypeMotor.id],
      name: [this.TypeMotor.name, [Validators.required]],
      value: [this.TypeMotor.value],
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
    if (this.motorForm.value.url == "" && this.motorForm.value.value == "" && this.editMode === false){
      this.toastr.error("Colori non dovrebbe essere vuoto!", 'Aggiungi colori', {
        timeOut: 3000
      });
      return;
    }
    this.LoaderInterceptor.setLoader = true;
    if (this.motorForm.invalid) {
      this.submitted = true;
      return;
    }

    this.dialogRef.close(this.motorForm);
  }

}

