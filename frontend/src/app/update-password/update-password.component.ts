import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AlertService, AuthenticationService } from '../_services';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {
  updatePasswordForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  doNotMatch: BehaviorSubject<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) {  
      this.doNotMatch = new BehaviorSubject<boolean>(false);
      if (this.authenticationService.currentUserValue) { 
        this.router.navigate(['/']);
      }
   }

   
   onKeyUp(event){
     this.doNotMatch.next(false);
     this.alertService.hide();
   }

  ngOnInit() {
    this.doNotMatch = new BehaviorSubject<boolean>(false);

    this.updatePasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      retypePassword: ['', Validators.required]
    });
  
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.updatePasswordForm.controls; }

  onSubmit() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.updatePasswordForm.invalid) {
        return;
      }

      let newPass = this.updatePasswordForm.get('newPassword').value;
      let retypePass = this.updatePasswordForm.get('retypePassword').value;

      if(newPass != retypePass){
        this.doNotMatch.next(true);
        return
      }

      
      this.loading = true;
      this.authenticationService.updatePassword(newPass)
          .pipe(first())
          .subscribe(
              data => {
                  this.router.navigate([this.returnUrl]);
              },
              error => {
                  this.alertService.error("Si è verificato un errore durante l'aggiornamento della password!");
                  this.loading = false;
              });
  }

}
