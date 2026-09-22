import { Component, OnInit } from '@angular/core';
import { Product } from 'app/_models/product.model';
import { AuthenticationService, PreventivesService, PreviousRouteService, ProductService } from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from 'app/_models';
import { ToastrService } from 'ngx-toastr';
const api = environment.API_URL;

@Component({
  selector: 'app-edit-products',
  templateUrl: './edit-products.component.html',
  styleUrls: ['./edit-products.component.scss']
})
export class EditProductsComponent implements OnInit {
  products: Product[];
  user: User;
  baseUrl: string;
  previousUrl: string;
  p: any;
  available: boolean = true;
  preventiveId: number;
  
  constructor(
    private toastr: ToastrService,
    private previousRouteService: PreviousRouteService,
    private route: ActivatedRoute,
    private router: Router,
    public LoaderInterceptor: LoaderInterceptor,
    private AuthenticationService: AuthenticationService,
    private PreventivesService: PreventivesService,
    private ProductService: ProductService
    ){ }

  ngOnInit() {
    this.previousUrl = this.previousRouteService.getPreviousUrl();
    this.user = this.AuthenticationService.currentUserValue;
    this.LoaderInterceptor.setLoader = true;
    this.baseUrl = api;
    this.preventiveId = this.route.snapshot.params['id'];
    this.checkPreventive(this.preventiveId);
    this.getPreventiveData(this.preventiveId);
  }
  
  checkPreventive(id: number){
    this.PreventivesService.checkPreventive(id).pipe().subscribe(exists => {
      if(!exists){
        this.router.navigate(['/admin/preventive']);        
      }
    });
  }

  getPreventiveData(id: number) {
    this.PreventivesService.getPreventiveData(id).pipe().subscribe(products => {
      this.products = products;
      this.LoaderInterceptor.setLoader = false;
    });
  }

  removeFromCart(id: number) {
    this.LoaderInterceptor.setLoader = true;
    this.ProductService.removeFromCart(id).pipe().subscribe(response => {

      if(response.code == 1){
        this.toastr.error(response.message, "Errore nella rimozione", {
          timeOut: 3000
        });
      }
      else{
        this.toastr.success(response.message, "Successo nella rimozione", {
          timeOut: 3000
        });
      }
      
      if ((this.products.length % 2) == 1) {
        this.p -= 1;
      }

      this.getPreventiveData(this.preventiveId);
    });
  }

  updateQuantity(event: any, id: number) {
    this.LoaderInterceptor.setLoader = true;
    this.ProductService.updateQuantity(id, event.target.value).pipe().subscribe(response => {

      this.LoaderInterceptor.setLoader = false;

      if(response.code == 1){
        this.toastr.error(response.message, "Errore nell'aggiornamento", {
          timeOut: 3000
        });
      }
      else{
        this.toastr.success(response.message, "Successo nell'aggiornamento", {
          timeOut: 3000
        });
      }
      
    });
  }

}
