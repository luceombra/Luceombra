import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'app/_services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-send-password',
  templateUrl: './send-password.component.html',
  styleUrls: ['./send-password.component.scss']
})
export class SendPasswordComponent implements OnInit {
  public token: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private UserService: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = this.activatedRoute.snapshot.params['token'];
    });
  }

  onSubmit() {
    this.UserService.generateNew(this.token).pipe().subscribe(
      data => {
        if (data.success) {
          this.toastr.success(data.message, '', {
            timeOut: 3000
          });

          this.router.navigate(['/login']);

        }
        else {
          this.toastr.error(data.message, '', {
            timeOut: 3000
          });
        }
      }
    );
  }

}
