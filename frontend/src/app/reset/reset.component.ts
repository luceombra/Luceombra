import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../_services';
import { ToastrService } from 'ngx-toastr';
import { LoaderInterceptor } from '../_helpers/loader';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {
  sendEmailForm: FormGroup;
  loading = false;
  submitted = false;
  public requestBody: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UserService,
    private router: Router,
    public LoaderInterceptor: LoaderInterceptor,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.sendEmailForm = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  get f() { return this.sendEmailForm.controls; }

  returnLogin(){
    return this.router.navigate(['/']);
  }

  onSubmit() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.sendEmailForm.invalid) {
      return;
    }

    this.LoaderInterceptor.setLoader = true;

    this.requestBody.email = this.f.email.value;

    this.usersService.forgotPassword(this.requestBody).pipe()
      .subscribe(
        data => {
          if (data.success) {
            this.toastr.success(data.message, '', {
              timeOut: 3000
            });
          }
          else {
            this.toastr.error(data.error, '', {
              timeOut: 3000
            });
          }
          this.LoaderInterceptor.setLoader = false;
        });
  }

}
