import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor {

  private loading: BehaviorSubject<boolean>;

  constructor() {
    this.loading = new BehaviorSubject<boolean>(false);
  }
  
  public get getLoader(): boolean {
    return this.loading.value;
  }

  public set setLoader(value: boolean){
    this.loading = new BehaviorSubject<boolean>(value);
  }

}
