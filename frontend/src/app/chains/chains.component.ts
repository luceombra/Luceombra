import { Component, OnInit , ViewChild, Inject} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material';
import { first } from 'rxjs/operators';
import { TypeChain, TypeMotor} from '../_models';
import { TypeChainService } from '../_services';
import { environment } from '../../environments/environment';
const api = environment.API_URL;
import { LoaderInterceptor } from '../_helpers/loader';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import {FormGroup, FormControl, FormBuilder, NgForm, Validators} from '@angular/forms';
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
  selector: 'app-chains',
  templateUrl: './chains.component.html',
  styleUrls: ['./chains.component.scss']
})
export class ChainsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'price', 'image', 'actions'];
  dataSource: MatTableDataSource<MotorData>;
  motors: TypeChain[] = [];
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
    private TypeChainService: TypeChainService,
    public LoaderInterceptor: LoaderInterceptor,
    public dialog: MatDialog
  ) {}

  openDialog(): void {
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
    const dialogRef = this.dialog.open(DialogChainsComponent, dialogConfig);
    dialogRef.beforeClosed().subscribe(result => {
      if(result){
        result.value.image = "user.jpg";
		if (result.value.url)
			result.value.image = Math.random() +".png";
        this.TypeChainService.add(result.value).subscribe(data =>{
          result.value.id = data;
          result.value.image = "/images/" + result.value.image;
          this.motors.unshift(result.value);
          this.dataSource = new MatTableDataSource(this.motors);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.LoaderInterceptor.setLoader = false;
          this.toastr.success("La catena è stata creata con successo!", 'Aggiungi catene', {
            timeOut: 3000
          });
        });
      }
    });
  }

  updateMotor(dt: any){
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
	  editMode: true
    };
    
    const dialogRef = this.dialog.open(DialogChainsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        if (data){
		if (data.value.url)
			data.value.image = Math.random() +".png";
		else
			data.value.image = dt.image;
          this.TypeChainService.update(data.value.id, data.value).pipe().subscribe(response => {
			  data.value.image =  data.value.url ? "/images/" + data.value.image : data.value.image;

            if (response["code"] == 0) {
              this.toastr.success("La catena è stata aggiornata con successo!", 'Modifica catene', {
                timeOut: 3000
              });
              this.motors = this.motors.map(motor => {
				  if (motor.id === data.value.id){
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
              this.toastr.error("Il catene non può essere cancellato", 'Aggiungi catene', {
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
          this.TypeChainService.delete(id).pipe().subscribe(data => {

            if (data["code"] === 0) {
              this.motors = this.motors.filter(line => line.id !== id);
              this.dataSource = new MatTableDataSource(this.motors);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.toastr.success("La catena è stata cancellata con successo!", 'Elimina catene', {
                timeOut: 3000
              });
            }
            else {
              this.toastr.error("Si è verificato un errore durante l’eliminazione delle catene!", 'Elimina catene', {
                timeOut: 3000
              });
              this.valid = false;
            }
            this.LoaderInterceptor.setLoader = false;
        })
      }}
    );

  }
  
  ngOnInit() {
  this.baseUrl = api;
  this.valid = true;
	this.show = false;
	this.LoaderInterceptor.setLoader = true;
   this.TypeChainService.getTypeChain().pipe(first()).subscribe(typeMotors => {
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
  selector: 'dialog-chains-component',
  templateUrl: 'dialog-chains-component.html',
})
export class DialogChainsComponent implements OnInit {
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
    private dialogRef: MatDialogRef<DialogChainsComponent>
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
		this.baseUrl = api;
		this.image = this.baseUrl + this.image;
		
      this.motorForm = this.formBuilder.group({
		id: [this.TypeMotor.id],
        name: [this.TypeMotor.name, [Validators.required]],
		price: [this.TypeMotor.price, [Validators.required]],
		url: [""],
		
        description: [this.TypeMotor.description]
      });
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
      this.LoaderInterceptor.setLoader = true;
      if (this.motorForm.invalid) {
        this.submitted = true;
        return;
      }
      
      this.dialogRef.close(this.motorForm);
    }

}

