import { Component, OnInit , ViewChild, Inject} from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { first } from 'rxjs/operators';
import { System, TableConfigs, User, TypeMotor } from '../_models';
import { AuthenticationService } from '../_services';
import { Router, ActivatedRoute } from '@angular/router';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ConfirmDialogComponent } from 'app/confirm-dialog/confirm-dialog.component';
import { SystemService, CurtainsService, TypeMotorService, CurtainColorService} from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
import { FormGroup, FormControl, FormBuilder, NgForm, FormArray, Validators } from '@angular/forms';
const api = environment.API_URL;
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-material-component',
    templateUrl: './material-component.component.html',
    styleUrls: ['./material-component.component.scss']
})
export class MaterialComponentComponent implements OnInit {
    displayedColumns: string[] = ['index', 'name', 'image', 'actions'];
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
    xlsxData: string[] = [];
    wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "array" };
    fileName: string = "SheetJS.xlsx";
    constructor (
        public dialog: MatDialog,
        private toastr: ToastrService,
        public LoaderInterceptor: LoaderInterceptor,
        private router: Router,
        private AuthenticationService: AuthenticationService,
        private CurtainsService: CurtainsService,
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
        this.CurtainsService.getAllCurtains(tableConfigs).pipe(first()).subscribe(invoices => {
            this.dataSource = new MatTableDataSource(invoices["response"].original.data);
            this.totalCount = invoices["response"].original.recordsTotal;
            this.typeMotors = invoices["data"].motors;
            this.chains = invoices["data"].chains;
            this.colors = invoices["data"].colors;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    openDialog(): void {
        this.router.navigate(['/admin/newCurtain']);

        return;
    }

    updateMotor(dt: any){
        this.router.navigate(['/admin/updateCurtain', dt.id]);

        return;
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
                    this.CurtainsService.deleteSystem(id).pipe().subscribe(response => {

                        if (response.code == 0) {
                            this.getTableData(this.tableConfigs);
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.success(data['message'], 'Elimina Tessuti', {
                                timeOut: 3000
                            });
                        } else {
                            this.valid = false;
                            this.LoaderInterceptor.setLoader = false;
                            this.toastr.error("La tenda è correlata a un preventivo", 'Elimina Tessuti', {
                                timeOut: 3000
                            });
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
    selector: 'dialog-material-component',
    templateUrl: 'dialog-material-component.html',
})

export class DialogMaterialComponent implements OnInit {
    displayedColumns: string[] = ['index', 'name', 'priceName','actions'];
    dataSource: MatTableDataSource<string>;
    tableConfigs: TableConfigs;
    motorForm: FormGroup;
    submitted: boolean = false;
    url: any;
    image: string;
    name: string  = "";
    id: number = 0;
    motors: TypeMotor[] =[];
    chains: string[] = [];
    colors: string[] =[];
    colorsOld: string[] =[];
    allSystems: string[] = [];
    systems: string[] = [];
    types: string[] = [];
    systemToDelete: string[] = [];
    motion: [];
    totalCount: 0;
    TypeMotor: System;
    baseUrl: string;
    isChain: boolean = false;
    editMode: boolean = false;
    rowsColors = [];
    xlsxData: string[] = [];
    wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "array" };
    fileName: string = "SheetJS.xlsx";
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    constructor(
        // @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: FormBuilder,
        public dialog: MatDialog,
        private toastr: ToastrService,
        public LoaderInterceptor: LoaderInterceptor,
        private router: Router,
        private route: ActivatedRoute,
        private AuthenticationService: AuthenticationService,
        private CurtainsService: CurtainsService
        // private dialogRef: MatDialogRef<DialogMaterialComponent>
        ) {
        this.TypeMotor = new System;
    }

    ngOnInit() {
        this.LoaderInterceptor.setLoader = true;
        this.baseUrl = api;
        let id = this.route.snapshot.params['id'] ? this.route.snapshot.params['id'] : 0;
        this.id = id;
        this.tableConfigs = new TableConfigs;
        this.tableConfigs.filter = "";
        this.tableConfigs.field = "id";
        this.tableConfigs.sortOrder = "desc";
        this.tableConfigs.pageNumber = 0;
        this.tableConfigs.pageSize = 5;
        this.CurtainsService.getCurtainIdexByIdWithData(id).pipe(first()).subscribe(typeMotors => {
            this.LoaderInterceptor.setLoader = false;
            let systems = typeMotors['systems'];
            this.systems = systems || [];
            this.dataSource = new MatTableDataSource(systems || []);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.colors = typeMotors['colors'].map(line =>{
                if (typeMotors['curtainColors'].find(row => row.color_id === line.id)) {
                    line["checked"]= true;
                    line["defaultChecked"] = true;
                    return line;
                }

                line["defaultChecked"] = false;
                return line;
            });
            this.allSystems = typeMotors['allSystems'];
            this.types = typeMotors['types'];
            this.name = typeMotors['data'] ? typeMotors['data'].name : "";
            this.image = this.baseUrl + (typeMotors['data'] ? typeMotors['data'].image : "");
            this.editMode = typeMotors['data'] ? true : false;

            for (var i = 0; i < this.colors.length; i+= 6) {
                this.rowsColors.push(this.colors.slice(i, i+6))
            }
        });
    }

    applyFilter(filterValue: string) {
        this.LoaderInterceptor.setLoader = true;
        this.tableConfigs.filter = filterValue.trim().toLowerCase();
        this.tableConfigs.pageNumber = 0;
        this.getTableData(this.tableConfigs);
    }

    getTableData(tableConfigs: TableConfigs) {
        this.CurtainsService.getAllCurtains(tableConfigs).pipe(first()).subscribe(invoices => {
            this.dataSource = new MatTableDataSource(invoices["response"].original.data);
            this.totalCount = invoices["response"].original.recordsTotal;
            this.chains = invoices["data"].chains;
            this.colors = invoices["data"].colors;
            this.LoaderInterceptor.setLoader = false;
        });
    }

    deleteSystem(id) {
        this.systemToDelete = this.systemToDelete.concat(id);
        this.systems = this.systems.filter(line => line['id'] !== id);
        this.dataSource = new MatTableDataSource(this.systems);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    changeName(event) {
        this.name = event.target.value;
    }

    get validateFunction() { return this.motorForm.controls; }

    checkMotion(event, name){
        this.isChain = !this.isChain;
    }

    checkCheckBoxvalue(event, name){
        this.motors = this.motors.map(line =>{
            if (line.name === name){
                return {...line,  checked: event.target.checked};
            }
            return line;
        })
    }

    checkChain(event, name){
        this.chains = this.chains.map(line =>{
            if (line['name'] === name){
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
                this.url = event.target["result"];
                // this.motorForm =  this.formBuilder.group({
                    //  url: [event.target["result"]],
                    // });
                }
            }
        }
        updateSystem(row): void {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = true;
            dialogConfig.height = '80%';
            dialogConfig.width = '620px';
            dialogConfig.data = {
                allSystems: this.allSystems,
                editMode: true,
                types: this.types,
                system: row,
                systemAvaible: this.systems,
            };

            const dialogRef = this.dialog.open(DialogPriceComponent, dialogConfig);
            dialogRef.beforeClosed().subscribe(result => {
                if(result) {
                    this.systems = this.systems.map(line =>{
                        if (line['name'] === result.name){
                            result['id'] = line['id'];

                            return result;
                        }

                        return line;
                    });
                    // this.xlsxData = result.xlsxData;
                    this.dataSource = new MatTableDataSource(this.systems);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                }
                this.LoaderInterceptor.setLoader = false;
            });
        }

        openDialog(): void {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = true;
            dialogConfig.height = '80%';
            dialogConfig.width = '620px';
            dialogConfig.data = {
                allSystems: this.allSystems,
                editMode: false,
                types: this.types,
                systemAvaible: this.systems,
                curtainId: this.id,
            };

            const dialogRef = this.dialog.open(DialogPriceComponent, dialogConfig);
            dialogRef.beforeClosed().subscribe(result => {
                if(result){
                    this.systems = this.systems.concat(result);
                    this.dataSource = new MatTableDataSource(this.systems);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                }
                this.LoaderInterceptor.setLoader = false;
            });
        }

        close() {
            this.router.navigate(['/admin/curtain']);
        }

        onSubmit() {
            if (this.name === ""){
                this.toastr.error("Il nome è obbligatorio", 'Aggiungi tessuti', {
                    timeOut: 3000
                });
                return;
            }
            this.LoaderInterceptor.setLoader = true;
            if (!this.editMode) {
                let result = {
                    name: this.name,
                    image: Math.random() +".png",
                    url: this.url,
                    colors: this.colors.filter(line => line["checked"] === true),
                    systems: this.systems,
                }

                this.CurtainsService.add(result).subscribe(data => {
                    if (data["code"] === 0){
                        this.toastr.success("Il tessuto è stato creato con successo!", 'Aggiungi tessuti', {
                            timeOut: 3000
                        });
                    } else {
                        this.toastr.error(data['message'], 'Aggiungi tessuti', {
                            timeOut: 3000
                        });
                    }
                    this.router.navigate(['/admin/curtain']);
                    this.LoaderInterceptor.setLoader = false;
                });

                return;
            }

            let colors = this.colors.map(line => {
                if (line["checked"] && line["defaultChecked"] === false ){
                    line["toInsert"] = true;
                    line["toDelete"] = false;

                    return line;
                }
                if (!line["checked"] && line["defaultChecked"] === true){
                    line["toDelete"] = true;
                    line["toInsert"] = false;
                    return line;
                }
                return line;
            }).filter(row => row["toInsert"] === true || row["toDelete"] === true);
            let result = {
                id: this.id,
                name: this.name,
                image: Math.random() +".png",
                url: this.url,
                colors: colors,
                systems: this.systems,
                systemToDelete: this.systemToDelete,
            }
            this.CurtainsService.update(this.id, result).pipe().subscribe(data => {
                if (data["code"] === 0){
                    this.toastr.success("Il tessuto è stato aggiornato con successo!", 'Modifica tessuti', {
                        timeOut: 3000
                    });
                } else {
                    this.toastr.error(data['message'], 'Aggiungi tessuti', {
                        timeOut: 3000
                    });
                }
                this.router.navigate(['/admin/curtain']);
                this.LoaderInterceptor.setLoader = false;
            });

            return;
        }

    }

    @Component({
        selector: 'dialog-price-component',
        templateUrl: 'dialog-price-component.html',
    })
    export class DialogPriceComponent implements OnInit {
        displayedColumns: string[] = ['min', 'max', 'price','actions'];
        dataSource: MatTableDataSource<{id: Number, rand: number, toInsert: Boolean,  min: Number, max: Number, price: Number}>;
        tableConfigs: TableConfigs;
        motorForm: FormGroup;
        submitted: boolean = false;
        allSystems: string[] = [];
        types: string[] =[];
        editMode: boolean = false;
        system: string = "";
        type: string = "";
        price: string = "0";
        markup: number = 0;
        markupFromDb: number = 0;
        min: number = 0;
        max: number = 0;
        id: number = 0;
        curtainId: number = 0;
        systemId: number = 0;
        defaultPrice: number = 0;
        showMatrix: boolean = true;
        rowsToDelete: number[] = [];
        updatedId: number = -1;
        systemAvaible: string[] = [];
        insertedDataFromXlsx: [] = [];
        minHeight: number = 0;
        maxHeight: number = 0;
        minWidth: number = 0;
        maxWidth: number = 0;
        xlsxData: string[] = [];
        wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "array" };
        fileName: string = "SheetJS.xlsx";
        rows: Array<{id: Number, rand: number, toInsert: Boolean, min: Number, max: Number, price: Number}>= [];
        fakeRows: [] = [];
        @ViewChild(MatPaginator) paginator: MatPaginator;
        @ViewChild(MatSort) sort: MatSort;
        constructor(
            @Inject(MAT_DIALOG_DATA) public data: any,
            private formBuilder: FormBuilder,
            private toastr: ToastrService,
            public LoaderInterceptor: LoaderInterceptor,
            private dialogRef: MatDialogRef<DialogPriceComponent>,
            private CurtainsService: CurtainsService,
            private router: Router,
            private route: ActivatedRoute
            ) {
            this.allSystems = data.allSystems;
            this.types = data.types;
            this.editMode = data.editMode;
            this.systemAvaible = data.systemAvaible;
            this.rows = data.system ? data.system.rows : [];
            this.fakeRows = data.system ? data.system.rows : [];
            this.type = data.system ? data.system.price_calculation_type + "" : "";
            this.system = data.system ? data.system.system + "" : "";
            this.systemId = data.system ? data.system.id : 0;
            this.curtainId = data.curtainId ? data.curtainId : 0;
            this.price = data.system ? data.system.price : "0";
            this.minHeight = data.system ? data.system.minHeight : 0;
            this.maxHeight = data.system ? data.system.maxHeight : 0;
            this.minWidth = data.system ? data.system.minWidth : 0;
            this.maxWidth = data.system ? data.system.maxWidth : 0;
        }

        ngOnInit() {
            this.tableConfigs = new TableConfigs;
            this.tableConfigs.filter = "";
            this.tableConfigs.field = "id";
            this.tableConfigs.sortOrder = "desc";
            this.tableConfigs.pageNumber = 0;
            this.tableConfigs.pageSize = 5;
            this.dataSource = new MatTableDataSource(this.rows);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.getMarkupFromDb();
        }

        applyFilterOnMatrix(filterValue) {
            filterValue = filterValue.trim().toLowerCase();
           if (filterValue) {
                this.CurtainsService.getMatrixFiltered(filterValue, this.systemId).pipe(first()).subscribe(response => {
                    this.rows = response;
                    this.dataSource = new MatTableDataSource(this.rows);
                    this.LoaderInterceptor.setLoader = false;
                });
           } else {
               this.loadData();
           }
        }

        loadData() {
            this.rows = this.fakeRows;
            this.dataSource = new MatTableDataSource(this.rows);
        }

        getMarkupFromDb() {
            this.CurtainsService.getMarkup().pipe().subscribe(markup => {
                this.markupFromDb = markup;
            });
        }

        changeValue(name, value) {
            if (name === "system"){
                this.system = value; //this.allSystems.find(row => row["id"] === value).name;
            } else {
                this.type = value;
                if (value == "1")
                    this.showMatrix = true;
                else
                    this.showMatrix = false;
            }
        }

        onFileChange(evt) {
            /* wire up file reader */
            const target: DataTransfer = <DataTransfer>(evt.target);
            if (target.files.length !== 1) throw new Error('Cannot use multiple files');
            const reader: FileReader = new FileReader();
            reader.onload = (e: any) => {
                /* read workbook */
                const bstr: string = e.target.result;
                const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

                /* grab first sheet */
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                /* save data */
                this.xlsxData = XLSX.utils.sheet_to_json(ws, { header: 1 });
            };

            reader.readAsBinaryString(target.files[0]);
        }

        uploadOrMarkup() {
            this.CurtainsService.uploadOrMarkup(this.systemId, this.xlsxData, this.markup, this.system, this.curtainId).pipe().subscribe(response => {
                this.rows = response.data;
                this.dataSource = new MatTableDataSource(this.rows);
                if (response.resp['code'] === 0){
                    this.toastr.success("Il tessuto è stato aggiornato con successo!", 'Modifica tessuti', {
                        timeOut: 3000
                    });
                } else {
                    this.toastr.error(response.resp['message'], 'Aggiungi tessuti', {
                        timeOut: 3000
                    });
                }
                this.LoaderInterceptor.setLoader = false;
            });
        }

        getMarkup(event) {
            if (event.target.value) {
                this.markup = event.target.value;
            }
        }

        changeName(event) {
            this.price = event.target.value;
        }

        close() {
            this.dialogRef.close(false);
        }

        changeValues(name, event) {
            if (name === "min")
                this.min = event.target.value;
            else if (name === "max")
                this.max = event.target.value;
            else
                this.defaultPrice = event.target.value;
        }

        changeLimitValues(name, event) {
            if (name === "minWidth")
                this.minWidth = event.target.value;
            else if (name === "maxWidth")
                this.maxWidth = event.target.value;
            else if (name === "minHeight")
                this.minHeight = event.target.value;
            else if (name === "maxHeight")
                this.maxHeight = event.target.value;
        }

        addNew() {
            if (this.insertedDataFromXlsx.length > 0) {
                this.rows = this.insertedDataFromXlsx
            }

            if (this.system === "") {
                this.toastr.error("Il sistema deve essere soddisfatto", 'Aggiungi prezzo', {
                    timeOut: 3000
                });
                return;
            }
            if (this.type === "") {
                this.toastr.error("Tipo de prezzo deve essere soddisfatto", 'Aggiungi prezzo', {
                    timeOut: 3000
                });
                return;
            }
            if (this.updatedId == -1) {
                if (this.defaultPrice > 0 ){
                    let invalid = this.rows.filter(row =>
                        (this.min >= row['min'] && this.min <= row['max']) ||
                        (this.max >= row['min'] && this.max <= row['max']));
                    if (invalid.length>0 && this.type == '2'){
                        this.toastr.error("Si prega di verificare il valore dell'intervallo", 'Aggiungi prezzo', {
                            timeOut: 3000
                        });
                        return;
                    }
                    let datas= {};
                    datas["id"]= 0;
                    datas["toInsert"] = true;
                    datas['rand'] = new Date();
                    datas["min"] = this.min;
                    datas["max"] = this.max;
                    datas["price"] = this.defaultPrice;
                    this.rows = this.rows.concat({id: 0, rand: Math.random(), toInsert: true, min: this.min, max: this.max, price: this.defaultPrice});
                    console.log('concat', this.rows);
                    this.dataSource = new MatTableDataSource(this.rows);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this.min = this.max = this.defaultPrice = 0;
                }
            } else {
                this.rows = this.rows.map(row => {
                    if ((row.id !== 0 && row.id === this.updatedId) || row.rand == this.updatedId){
                        row = {...row, min: this.min, max: this.max, price: this.defaultPrice};
                    }

                    return row;
                });

                this.updatedId = -1;
                this.dataSource = new MatTableDataSource(this.rows);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.min =this.max = this.defaultPrice = 0;
            }
        }

        deleteRow(id, rand, event) {
            console.log('delete', id, rand, event);
            event.preventDefault();
            if (id) {
                this.rowsToDelete = this.rowsToDelete.concat(id);
                this.rows = this.rows.filter(line => line.id !== id);
                this.dataSource = new MatTableDataSource(this.rows);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.min =this.max = this.defaultPrice = 0;
            } else {
                this.rows = this.rows.filter(line => line.rand !==rand);
                this.dataSource = new MatTableDataSource(this.rows);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.min = this.max = this.defaultPrice = 0;
            }
        }

        updateMotor(row) {
            this.min = row.min;
            this.max = row.max;
            this.defaultPrice = row.price;
            this.updatedId = row.id ? row.id : row.rand;
        }

        onSubmit() {
            if (this.system === "") {
                this.toastr.error("Il sistema deve essere soddisfatto", 'Aggiungi prezzo', {
                    timeOut: 3000
                });
                return;
            }
            if (this.type === ""){
                this.toastr.error("Tipo de prezzo deve essere soddisfatto", 'Aggiungi prezzo', {
                    timeOut: 3000
                });
                return;
            }
            let nr = this.systemAvaible.find(row => row['system'] == this.system);
            if (!this.editMode) {
                if (nr){
                    this.toastr.error("Il sistema deve essere soddisfatto", 'Aggiungi prezzo', {
                        timeOut: 3000
                    });
                    return;
                }
            }
            if (this.type == '2' || this.type == '1'){
                if (this.rows.length === 0){
                    this.toastr.error("Il sistema deve essere soddisfatto", 'Aggiungi prezzo', {
                        timeOut: 3000
                    });
                    return;
                }
            }
            this.LoaderInterceptor.setLoader = true;

            let data = {
                system: this.system,
                price_calculation_type: this.type,
                toInsert: true,
                name: this.allSystems.find(row => row["id"] == this.system)["name"],
                priceName: this.types.find(row => row["id"] == this.type)["name"],
                rows: this.rows,
                rowsToDelete: this.rowsToDelete,
                minWidth: this.minWidth,
                maxWidth: this.maxWidth,
                minHeight: this.minHeight,
                maxHeight: this.maxHeight
            };

            this.dialogRef.close(data);
        }

    }
