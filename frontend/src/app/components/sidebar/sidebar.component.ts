import { Component, OnInit } from '@angular/core';
import { User } from 'app/_models';
import { AuthenticationService } from 'app/_services';

declare const $: any;
declare interface RouteInfo {
	path: string;
	title: string;
	icon: string;
	class: string;
}
export const ROUTES: RouteInfo[] = [

{ path: '/admin/dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
{ path: '/admin/system', title: 'Sistemi', icon: 'settings_applications', class: '' },
{ path: '/admin/shops', title: 'Negozi', icon: 'shop', class: '' },
{ path: '/admin/agent', title: 'Agenti', icon: 'account_circle', class: '' },
{ path: '/admin/users', title: 'Admin', icon: 'account_circle', class: '' },
{ path: '/admin/preventive', title: 'Preventivi', icon: 'assessment', class: '' },
{ path: '/admin/orders', title: 'Ordini', icon: 'assignment', class: '' },
{ path: '/admin/clients', title: 'Clienti', icon: 'contacts', class: '' },
{ path: '/admin/invoices', title: 'Ordini', icon: 'receipt', class: '' },
{ path: '/admin/admin-invoices', title: 'Conferma d’ordine', icon: 'receipt', class: '' },
{ path: '/admin/curtain', title: 'Tessuti', icon: 'layers', class: '' },
{ path: '/admin/curtain-colors', title: 'Colori Dei Tessuti', icon: 'invert_colors', class: '' },
{ path: '/admin/system-colors', title: 'Colori Dei Sistemi', icon: 'format_color_fill', class: '' }

];


export const SUB_ROUTES: RouteInfo[] = [

{ path: '/admin/motori', title: 'Motori', icon: 'settings', class: '' },
{ path: '/admin/chains', title: 'Catene', icon: 'drag_indicator', class: '' },
{ path: '/admin/telecomands', title: 'Telecomandi', icon: 'games', class: '' },
// { path: '/admin/agent-matrices', title: 'Matrice', icon: 'line_style', class: '' },

];

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
	menuItems: any[];
	subMenus: any[];
	user: User;

	constructor(
		private AuthenticationService: AuthenticationService
		) { }

	ngOnInit() {

		this.user = this.AuthenticationService.currentUserValue;
		this.subMenus =  this.user.role === "admin" ? SUB_ROUTES : [];
		this.menuItems = ROUTES.filter(menuItem => {
			if (this.user.role == "shop" && menuItem.path == "/admin/orders") {
				menuItem.title = "Conferma D’ordine";
			}

			if (this.user.role == "shop" && menuItem.path == "/admin/invoices") {
				menuItem.title = "Ordini Fornitore";
			}

			if (
				(
					this.user.role == "shop" &&
					(
						menuItem.path == "/admin/dashboard" || menuItem.path == "/admin/preventive" ||
						menuItem.path == "/admin/orders" || menuItem.path == "/admin/invoices" ||
						menuItem.path == "/admin/clients"
						)
					)
				||
				(
					this.user.role == "manager" &&
					(
						menuItem.path == "/admin/dashboard" || menuItem.path == "/admin/preventive" ||
						menuItem.path == "/admin/orders" || menuItem.path == "/admin/shops"
					)
				)
				||
				(
					this.user.role == "admin" &&
					(
						menuItem.path != "/admin/invoices" && menuItem.path != "/admin/clients"
					)
				)
				) {
				return menuItem;
		} else {
			return false;
		}
	});
	}
	isMobileMenu() {
		if ($(window).width() > 991) {
			return false;
		}
		return true;
	};
}
