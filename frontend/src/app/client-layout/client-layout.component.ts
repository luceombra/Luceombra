import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../_services';
import { User } from '../_models';
const api = environment.API_URL;

@Component({
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.scss']
})
export class ClientLayoutComponent implements OnInit {
  title = 'TendeClient';
  currentUser: User;
  baseUrl: string;

  constructor(
      public LoaderInterceptor: LoaderInterceptor,
      private router: Router,
      private authenticationService: AuthenticationService
  ) {
      this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }
  ngOnInit() {
    this.baseUrl = api;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
