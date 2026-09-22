import { Component, OnInit } from '@angular/core';
import { Product } from 'app/_models/product.model';
import { AuthenticationService, PreventivesService, PreviousRouteService } from 'app/_services';
import { LoaderInterceptor } from '../_helpers/loader';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from 'app/_models';
const api = environment.API_URL;

@Component({
  selector: 'app-view-products',
  templateUrl: './view-products.component.html',
  styleUrls: ['./view-products.component.scss']
})
export class ViewProductsComponent implements OnInit {
  products: Product[];
  user: User;
  baseUrl: string;
  previousUrl: string;
  p: any;

  constructor(
	private previousRouteService: PreviousRouteService,
	private route: ActivatedRoute,
	private router: Router,
	public LoaderInterceptor: LoaderInterceptor,
	private AuthenticationService: AuthenticationService,
	private PreventivesService: PreventivesService
	){ }

  ngOnInit() {
	this.user = this.AuthenticationService.currentUserValue;
	this.previousUrl = this.previousRouteService.getPreviousUrl();

	if(this.previousUrl != "/admin/orders" && this.previousUrl != "/admin/invoices"){
	  this.previousUrl = localStorage.getItem('previousUrl-' + this.user.id);
	}

	this.LoaderInterceptor.setLoader = true;
	this.baseUrl = api;
	let id = this.route.snapshot.params['id'];
	this.checkPreventive(id);
	this.getPreventiveData(id);
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
	// this.ProductService.removeFromCart(id).pipe().subscribe(response => {

	//   if(response.code == 1){
	//     this.toastr.error(response.message, "Errore nella rimozione", {
	//       timeOut: 3000
	//     });
	//   }
	//   else{
	//     this.toastr.success(response.message, "Successo nella rimozione", {
	//       timeOut: 3000
	//     });
	//   }

	//   if ((this.products.length % 2) == 1) {
	//     this.p -= 1;
	//   }

	//   this.getCartData();
	// });
  }

  updateQuantity(event: any, id: number) {
	this.LoaderInterceptor.setLoader = true;
	// this.ProductService.updateQuantity(id, event.target.value).pipe().subscribe(response => {

	//   this.LoaderInterceptor.setLoader = false;

	//   if(response.code == 1){
	//     this.toastr.error(response.message, "Errore nell'aggiornamento", {
	//       timeOut: 3000
	//     });
	//   }
	//   else{
	//     this.toastr.success(response.message, "Successo nell'aggiornamento", {
	//       timeOut: 3000
	//     });
	//   }

	// });
  }

}
