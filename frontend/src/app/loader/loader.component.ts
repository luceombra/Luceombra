import { Component, OnInit } from '@angular/core';
import { LoaderInterceptor } from '../_helpers/loader';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  baseUrl: string;

  constructor(
    public LoaderInterceptor: LoaderInterceptor
    ) { }

  ngOnInit() {
    this.baseUrl = api;
  }

}
