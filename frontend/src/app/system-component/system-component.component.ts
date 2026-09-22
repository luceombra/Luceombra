import { Component, OnInit , ViewChild, Inject} from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { System, TableConfigs, User, TypeMotor } from '../_models';
import { AuthenticationService } from '../_services';
import { Router } from '@angular/router';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { SystemService, TypeMotorService, } from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
import {FormGroup, FormControl, FormBuilder, NgForm, FormArray, Validators} from '@angular/forms';
const api = environment.API_URL;
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-system-component',
  templateUrl: './system-component.component.html',
  styleUrls: ['./system-component.component.scss']
})
export class SystemComponentComponent implements OnInit {
  displayedColumns: string[] = ['index', 'name', 'image','actions'];
  dataSource: MatTableDataSource<System>;
  tableConfigs: TableConfigs;
  user: User;
  typeMotors: string[] = [];
  baseUrl: string;
  totalCount: number;
  valid: boolean;
  show: boolean;
  message: string;
  chains: string[] = [];
  colors: string[] = [];
  constructor(
		private toastr: ToastrService,
    public dialog: MatDialog,
    public LoaderInterceptor: LoaderInterceptor,
    private router: Router,
    private AuthenticationService: AuthenticationService,
	private SystemService: SystemService,
	private TypeMotorService: TypeMotorService
  ) { }

  ngOnInit() {
	this.baseUrl = api;
    this.user = this.AuthenticationService.currentUserValue;
    this.LoaderInterceptor.setLoader = true;
    this.valid = true;
    this.show = false;
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
    this.SystemService.getSystems(tableConfigs).pipe(first()).subscribe(invoices => {
			this.dataSource = new MatTableDataSource(invoices["response"].original.data);
	  this.totalCount = invoices["response"].original.recordsTotal;
	  this.typeMotors = invoices["data"].motors;
	  this.chains = invoices["data"].chains;
	  this.colors = invoices["data"].colors;
      this.LoaderInterceptor.setLoader = false;
    });
  }

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '620px';
    dialogConfig.data = {
		name: "",
    	price: 0,
    	image: "",
	  description: "",
	  motors: this.typeMotors.map(row => {
			row["checked"]=false;
			return row;
		}),
	  editMode: false,
	  chains: this.chains.map(row => {
			row["checked"]=false;
			return row;
		}),
	  colors: this.colors.map(row => {
			row["checked"]=false;
			return row;
		}),
	};
    const dialogRef = this.dialog.open(DialogSystemsComponent, dialogConfig);
    dialogRef.beforeClosed().subscribe(result => {
      if(result){
		result.image = Math.random() +".png";
		result.motors = result.motors ? result.motors.filter(line => line.checked === true) : [];
		result.chains = result.chains ? result.chains.filter(line => line.checked === true) : [];
		result.colors = result.colors ? result.colors.filter(line => line.checked === true) : [];
		
        this.SystemService.add(result).subscribe(data =>{
          result.image = "/images/" + result.image;

          if (data["code"] == 0) {
						this.toastr.success("Il sistema è stato creato con successo!", 'Aggiungi sistema', {
							timeOut: 3000
						});
            this.getTableData(this.tableConfigs);
          }
          else {
						this.toastr.error(data["message"], 'Aggiungi sistema', {
							timeOut: 3000
						});
            this.valid = false;
            this.LoaderInterceptor.setLoader = false;
          }

          setTimeout(() => {
            this.show = false;
            this.valid = true;
          }
            , 3000);
        });
      }
    });
  }

  updateMotor(dt: any){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '580px';
    dialogConfig.width = '620px';
    dialogConfig.data = { 
      id: dt.id,
      name: dt.name,
      price: dt.price,
      image: dt.image,
	  description: dt.description,
		editMode: true,
		motion_id: dt.motion_id
	};
	
	this.SystemService.getSystemLines(dt.id).pipe().subscribe(data => {
		let chains =  this.chains ? this.chains.map(line =>{
			if (data["data"]["chains"].find(row => row.chain_id === line["id"])){
				line['checked'] = true;
				return line;
			}
			line['checked'] = false;
			return line;
		}) : [];

		let colors = this.colors ? this.colors.map(line =>{
			if (data["data"]["colors"].find(row => row.color_id === line["id"])){
				line['checked'] = true;
				return line;
			}
			line['checked'] = false;
			return line;
		}) : [];


		let motors = this.typeMotors ?  this.typeMotors.map(line =>{
			if (data["data"]["motors"].find(row => row.motor_id === line["id"])){
				line['checked'] = true;
				return line;
			}
			line['checked'] = false;
			return line;
		}) : [];

		dialogConfig.data = {
			id: dt.id,
			name: dt.name,
			image: dt.image,
			motors: motors,
			editMode: true,
			chains: chains,
			colors: colors,
			motion_id: dt.motion_id
		};

		const dialogRef = this.dialog.open(DialogSystemsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      result => {
        if (result){
			if (result.url)
				result.image = Math.random() +".png";
			else
				result.image = dt.image;
				result.motors = result.motors.map(line =>{
					if (line.checked && !data["data"]["motors"].find(row => row.motor_id === line.id)){
						line["toInsert"] = true;
						line["toDelete"] = false;
						
						return line;
					}
					if (!line.checked && data["data"]["motors"].find(row => row.motor_id === line.id)){
						line["toDelete"] = true;
						line["toInsert"] = false;
						return line;
					}
					return line;
				}).filter(row => row["toInsert"] === true || row["toDelete"] === true);

				result.chains = result.chains.map(line =>{
					if (line.checked && !data["data"]["chains"].find(row => row.chain_id === line.id)){
						line["toInsert"] = true;
						line["toDelete"] = false;
						return line;
					}
					if (!line.checked && data["data"]["chains"].find(row => row.chain_id === line.id)){
						line["toDelete"] = true;
						line["toInsert"] = false;
						return line;
					}
					return line;
				}).filter(row => row["toInsert"] === true || row["toDelete"] === true);
				result.colors = result.colors.map(line =>{
					if (line.checked && !data["data"]["colors"].find(row => row.color_id=== line.id)){
						line["toInsert"] = true;
						line["toDelete"] = false;
						return line;
					}
					if (!line.checked && data["data"]["colors"].find(row => row.color_id === line.id)){
						line["toDelete"] = true;
						line["toInsert"] = false;
						return line;
					}
					return line;
				}).filter(row => row["toInsert"] === true || row["toDelete"] === true);
			result.id = dt.id;
          this.SystemService.update(dt.id, result).pipe().subscribe(data => {
			result.image = "/images/" + result.image;
  
			if (data["code"] == 0) {
				this.getTableData(this.tableConfigs);
				this.toastr.success("Il sistema è stato aggiornato con successo!", 'Modifica sistema', {
					timeOut: 3000
				});
			}
			else {
			  this.valid = false;
				this.LoaderInterceptor.setLoader = false;
				this.toastr.error(data["message"], 'Modifica sistema', {
					timeOut: 3000
				});
			}
  
			setTimeout(() => {
			  this.show = false;
			  this.valid = true;
			}
			  , 3000);
          });
        }
      }
    );

	});
    
    
  }

  viewPreventive(id: number) {
    this.router.navigate(['/admin/viewPreventive', id]);
  }

  reloadTable() {
    this.getTableData(this.tableConfigs);
  }

  deleteSystem(id: number) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          this.SystemService.deleteSystem(id).pipe().subscribe(response => {

            if (response.code == 0) {
			  this.getTableData(this.tableConfigs);
				this.LoaderInterceptor.setLoader = false;
				this.toastr.success(response.message, 'Elimina sistemi', {
					timeOut: 3000
				});
            }
            else {
							this.toastr.error(response.message, 'Elimina sistemi', {
								timeOut: 3000
							});
              this.valid = false;
              this.LoaderInterceptor.setLoader = false;
            }
            setTimeout(() => {
              this.show = false;
              this.valid = true;
            }
			  , 3000);
			this.LoaderInterceptor.setLoader = false;
          });
        }
      }
    );

  }

}



@Component({
	selector: 'dialog-systems-component',
	templateUrl: 'dialog-systems-component.html',
  })
  export class DialogSystemsComponent implements OnInit {
	motorForm: FormGroup;
	submitted: boolean = false;
	url: string;
	image: string;
	motors: TypeMotor[] =[];
	chains: string[] = [];
	colors: string[] =[];
	motion: [];
	TypeMotor: System;
	baseUrl: string;
	isChain: boolean = false;
	editMode: boolean = false;
	rowsMotors = [];
	rowsChains = [];
	rowsColors = [];
  
	constructor(
	  @Inject(MAT_DIALOG_DATA) public data: any,
	  private formBuilder: FormBuilder,
	  public LoaderInterceptor: LoaderInterceptor,
	  private dialogRef: MatDialogRef<DialogSystemsComponent>
	  ) {
		  this.TypeMotor = new System;
		  this.TypeMotor.id = data.id;
		  this.TypeMotor.name = data.name;
		  // this.TypeMotor.image = data.image;
		  this.url = "";
		  this.image = data.image;
		  this.motors = data.motors;
		  this.chains = data.chains;
		  this.colors = data.colors;
		  this.editMode = data.editMode;
			this.isChain = data.motion_id == 2 ? true : false;
	  }
  
	  ngOnInit() {
		  this.baseUrl = api;
			this.image = this.baseUrl + this.image;
			// motors
			for (var i=0; i < this.motors.length; i+= 3) {
				this.rowsMotors.push(this.motors.slice(i, i+3))
			}

			// chains
			for (var i=0; i < this.chains.length; i+= 3) {
				this.rowsChains.push(this.chains.slice(i, i+3))
			}

			// colors
			for (var i=0; i < this.colors.length; i+= 3) {
				this.rowsColors.push(this.colors.slice(i, i+3))
			}
		  
		this.motorForm = this.formBuilder.group({
		  id: [this.TypeMotor.id],
		  name: [this.TypeMotor.name, [Validators.required]],
		  url: [""],
		});
	  }

  
    get validateFunction() { return this.motorForm.controls; }
    
    checkMotion(event, name){
      this.isChain = !this.isChain;
	}
	
	checkCheckBoxvalue(event, name){
		this.motors = this.motors.map(line =>{
		  if (line["id"] === name){
			return {...line,  checked: event.target.checked};
		  }
		  return line;
		})
	  }

	  checkChain(event, name){
		this.chains = this.chains.map(line =>{
		  if (line['id'] === name){
			  	line["checked"] = event.target.checked;
				return line;
		  }
		  return line;
		})
	  }

	  checkColor(event, name){
		this.colors = this.colors.map(line =>{
		  if (line['id'] === name){
			  	line["checked"] = event.target.checked;
				return line;
		  }
		  return line;
		})
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
	let data = {motors: this.motors, 
		name: this.motorForm.value.name, 
		url: this.motorForm.value.url,
		motion_id: this.isChain ? 2 : 1,
		chains: this.chains,
		colors: this.colors};
		
		this.dialogRef.close(data);
	  }
  
  }
  
  
