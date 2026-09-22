import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class DimensionsService {

  constructor(private http: HttpClient) { }

  getPrice(product: Product){

    let productProps = {
      product : product
    };

    return this.http.post<Object>(api + `/api/getPrice`, productProps);
  }
}
