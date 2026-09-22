    import { Component, OnInit, Inject } from '@angular/core';
    import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
    import { LoaderInterceptor } from '../_helpers/loader';

    @Component({
      selector: 'app-process-orders',
      templateUrl: './process-orders.component.html',
      styleUrls: ['./process-orders.component.scss']
  })
    export class ProcessOrdersComponent implements OnInit {
      choosenState: string = "";
      submitted: boolean = false;
      states: string[] = ['Spedito', 'Annulato', 'Confermato'];

      constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public LoaderInterceptor: LoaderInterceptor,
        private dialogRef: MatDialogRef<ProcessOrdersComponent>
        ) {
        this.choosenState = data.status;
    }

    ngOnInit() {
    }

    close() {
        this.dialogRef.close(false);
    }

    save() {
        this.LoaderInterceptor.setLoader = true;
        this.dialogRef.close(this.choosenState);
    }
}
