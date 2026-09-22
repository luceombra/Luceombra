import { Component, OnInit , ViewChild, Inject} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material';
import { first } from 'rxjs/operators';
import {  TypeTelecomand, TypeMotor } from '../_models';
import { TypeTelecomandService, TypeMotorService } from '../_services';
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
	updated_at: string;
	created_at: string;
}


@Component({
	selector: 'app-telecomands',
	templateUrl: './telecomands.component.html',
	styleUrls: ['./telecomands.component.scss']
})
export class TelecomandsComponent implements OnInit {
	displayedColumns: string[] = ['id', 'name', 'price', 'image', 'actions'];
	dataSource: MatTableDataSource<MotorData>;
	motors: TypeTelecomand[] = [];
	allMotors: TypeMotor[] = [];
	baseUrl: string;
	message: string;
	name: string;
	valid: boolean;
	show: boolean;
	typeMotors: string[] = [];
	emailFormControl = new FormControl('', [
		Validators.required,
		Validators.email,
		]);


	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	constructor(
		private toastr: ToastrService,
		private TypeTelecomandService: TypeTelecomandService,
		public LoaderInterceptor: LoaderInterceptor,
		private TypeMotorService: TypeMotorService,
		public dialog: MatDialog
		) {}


	private getTypeMotor() {
		this.TypeMotorService.getTypeMotor().pipe(first()).subscribe(typeMotors => {
			this.typeMotors = typeMotors;
		});
	}

	openDialog(): void {
		this.typeMotors = this.typeMotors.map(line =>{
			line["checked"] = false;
			return line;
		})
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
			motors: this.typeMotors,
		};
		const dialogRef = this.dialog.open(DialogTelecomandsComponent, dialogConfig);
		dialogRef.beforeClosed().subscribe(result => {
			if(result){
				result.value.image = "user.jpg";
				if (result.value.url)
					result.value.image = Math.random() +".png";
				result.value.motors = result.value.motors.length ? result.value.motors.filter(line => line.checked === true) : [];
				this.TypeTelecomandService.add(result.value).subscribe(data =>{
					result.value.id = data;
					result.value.image = "/images/" + result.value.image;
					this.motors.unshift(result.value);
					this.dataSource = new MatTableDataSource(this.motors);
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
					this.LoaderInterceptor.setLoader = false;
					this.toastr.success("Il telecomando è stato creato con successo!", 'Aggiungi telecomando', {
						timeOut: 3000
					});
					this.typeMotors = this.typeMotors.map(line =>{
						line["checked"] = false;
						line["check"] = false;
						return line;
					})
				});
			}
			else {
				this.typeMotors = this.typeMotors.map(line =>{
					line["checked"] = false;
					line["check"] = false;
					return line;
				})
			}
		});
	}

	updateMotor(dt: any){
		this.typeMotors = this.typeMotors.map(line =>{
			line["checked"] = false;
			line['check'] = false;
			line['toInsert'] = false;
			line['toDelete'] = false;
			return line;
		})
		this.TypeTelecomandService.getSystemLines(dt.id).pipe().subscribe(dtServer => {
			let motors = this.typeMotors ?  this.typeMotors.map(line =>{
				if (dtServer["data"]["motors"].find(row => row.motor_id === line["id"])){
					line['checked'] = true;
					line['check'] = true;
					return line;
				}
				line['checked'] = false;
				line['check'] = false;
				return line;
			}) : [];
			console.log(motors)
			const dialogConfig = new MatDialogConfig();
			dialogConfig.autoFocus = true;
			dialogConfig.height = '580px';
			dialogConfig.width = '620px';
			dialogConfig.data = {
				id: dt.id,
				name: dt.name,
				price: dt.price,
				motors: motors,
				image: dt.image,
				description: dt.description,
				editMode: true
			};

			const dialogRef = this.dialog.open(DialogTelecomandsComponent, dialogConfig);

			dialogRef.afterClosed().subscribe(
				data => {
					if (data){
						if (data.value.url)
							data.value.image = Math.random() +".png";
						else
							data.value.image = dt.image;
						console.log(data.value.motors)
						data.value.motors = data.value.motors.map(line =>{
							if (line.check && !dtServer["data"]["motors"].find(row => row.motor_id === line.id)){
								line["toInsert"] = true;
								line["toDelete"] = false;

								return line;
							}
							if (!line.check && dtServer["data"]["motors"].find(row => row.motor_id === line.id)){
								line["toDelete"] = true;
								line["toInsert"] = false;
								return line;
							}
							return line;
						}).filter(row => row["toInsert"] === true || row["toDelete"] === true);
						this.TypeTelecomandService.update(data.value.id, data.value).pipe().subscribe(response => {
							data.value.image =  data.value.url ? "/images/" + data.value.image : data.value.image;


							if (response["code"] == 0) {
								this.motors = this.motors.map(motor => {
									if (motor.id === data.value.id){
										motor = data.value;
									}
									return motor;
								});
								this.toastr.success("Il telecomando è stato aggiornato con successo!", 'Modifica telecomando', {
									timeOut: 3000
								});
								this.dataSource = new MatTableDataSource(this.motors);
								this.dataSource.paginator = this.paginator;
								this.dataSource.sort = this.sort;
								this.typeMotors = this.typeMotors.map(line =>{
									line["checked"] = false;
									line["check"] = false;
									return line;
								})
							}
							else {
								this.toastr.error("Il telecomando non può essere cancellato", 'Modifica telecomando', {
									timeOut: 3000
								});
								this.valid = false;
								this.typeMotors = this.typeMotors.map(line =>{
									line["checked"] = false;
									line["check"] = false;
									return line;
								})
							}
							this.LoaderInterceptor.setLoader = false;
							this.typeMotors = this.typeMotors.map(line =>{
								line["checked"] = false;
								line["check"] = false;
								return line;
							});
						});
					}
				}
				);
		});

	}

	deleteClient(id: number) {

		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;
		const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

		dialogRef.beforeClose().subscribe(
			data => {
				if (data) {
					this.LoaderInterceptor.setLoader = true;
					this.TypeTelecomandService.delete(id).pipe().subscribe(data => {

						if (data["code"] === 0) {
							this.motors = this.motors.filter(line => line.id !== id);
							this.dataSource = new MatTableDataSource(this.motors);
							this.dataSource.paginator = this.paginator;
							this.dataSource.sort = this.sort;
							this.toastr.success("Telecomando cancellato con successo!", 'Elimina telecomando', {
								timeOut: 3000
							});
						}
						else {
							this.toastr.error("Si è verificato un errore durante l’eliminazione del telecomando!", 'Elimina telecomando', {
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
		this.getTypeMotor();

		this.TypeTelecomandService.getTypeTelecomand().pipe(first()).subscribe(typeMotors => {
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
	selector: 'dialog-telecomands-component',
	templateUrl: 'dialog-telecomands-component.html',
})
export class DialogTelecomandsComponent implements OnInit {
	motorForm: FormGroup;
	submitted: boolean = false;
	url: string;
	image: string;
	TypeMotor: TypeTelecomand;
	baseUrl: string;
	allmotors: string[] =[];
	editMode: boolean = false;
	rows = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private formBuilder: FormBuilder,
		public LoaderInterceptor: LoaderInterceptor,
		private dialogRef: MatDialogRef<DialogTelecomandsComponent>
		) {
		this.TypeMotor = new TypeTelecomand;
		this.TypeMotor.id = data.id;
		this.TypeMotor.name = data.name;
		this.TypeMotor.price = data.price;
		// this.TypeMotor.image = data.image;
		this.url = "";
		this.allmotors = data.motors;
		this.image = data.image;
		this.editMode = data.editMode;
		this.TypeMotor.description = data.description;
		this.rows = [];
	}


	ngOnInit() {
		this.baseUrl = api;
		this.image = this.baseUrl + this.image;

		for (var i=0; i < this.allmotors.length; i+= 3) {
			this.rows.push(this.allmotors.slice(i, i+3))
		}

		this.motorForm = this.formBuilder.group({
			id: [this.TypeMotor.id],
			name: [this.TypeMotor.name, [Validators.required]],
			price: [this.TypeMotor.price, [Validators.required]],
			url: [""],

			description: [this.TypeMotor.description]
		});
	}

	get validateFunction() { return this.motorForm.controls; }

	checkCheckBoxvalue(event, name) {
		console.log('telecomando', event, name);
		this.allmotors = this.allmotors.map(line => {
			if (line["name"]== name) {
				line["checked"] = event.target.checked;
				line["check"] = event.target.checked;

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

			this.motorForm.value.motors = this.allmotors.map(line => {
				line["checked"] = line["check"];

				return line;
			});

			this.dialogRef.close(this.motorForm);
		}
	}

