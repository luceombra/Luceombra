import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderInterceptor } from '../_helpers/loader';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AlertService, AuthenticationService } from '../_services';
import { MatDialogRef } from '@angular/material';
import { ProcessPreventiveComponent } from 'app/process-preventive/process-preventive.component';

@Component({
  selector: 'app-update-password-profile',
  templateUrl: './update-password-profile.component.html',
  styleUrls: ['./update-password-profile.component.scss']
})
export class UpdatePasswordProfileComponent implements OnInit {
  submitted = false;
  returnUrl: string;
  doNotMatch: BehaviorSubject<boolean>;
  updatePassword: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public LoaderInterceptor: LoaderInterceptor,
    private dialogRef: MatDialogRef<UpdatePasswordProfileComponent>
  ) { }

  ngOnInit() {
    this.doNotMatch = new BehaviorSubject<boolean>(false);
    this.updatePassword = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      retypePassword: ['', [Validators.required]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.updatePassword.controls; }

  close() {
    this.dialogRef.close(false);
  }

  clear() {
    this.doNotMatch.next(false);
  }

  onSubmit() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.updatePassword.invalid) {
      return;
    }

    let newPass = this.updatePassword.get('newPassword').value;
    let retypePass = this.updatePassword.get('retypePassword').value;

    if (newPass != retypePass) {
      this.doNotMatch.next(true);
      return
    }

    this.LoaderInterceptor.setLoader = true;
    this.dialogRef.close(this.updatePassword);
  }
}
