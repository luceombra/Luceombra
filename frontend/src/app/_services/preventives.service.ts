import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, Shop, Client, Preventive, Response, TableConfigs, Product, TableData } from 'app/_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class PreventivesService {

	constructor(private http: HttpClient) {
	 }

	getclients(user: User) {
		if (user.role == "shop") {
			return this.http.get<Client[]>(api+`/api/retrieveClients/${user.id}`);
		} else {
			return this.http.get<Shop[]>(api+`/api/retrieveShops/${user.id}`);
		}
	}

	getIvaHomeService(shopId)
	{
		let request = {
			shopId : shopId,
		}

		return this.http.post<any>(api+`/api/getIvaHomeService`, request);
	}

	addPreventive(preventive: Preventive) {
		return this.http.post<Response>(api+`/api/addPreventive`, preventive);
	}

	getPreventives(configs: TableConfigs, selfPreventives: boolean) {
		let request = {
			tableConfigs: configs,
			selfPreventives: selfPreventives
		};

		return this.http.post<TableData>(api+`/api/getPreventives`, request);
	}

	checkPreventive(id: number){
		let request = {
			id: id
		}

		return this.http.post<boolean>(api+`/api/checkPreventive`, request);
	}

	checkAvailability(id: number){
		let request = {
			id: id
		}

		return this.http.post<boolean>(api+`/api/checkAvailability`, request);
	}

	getPreventiveData(id: number){
		return this.http.get<Product[]>(api+`/api/getPreventiveData/${id}`);
	}

	updatePreventiveStatus(id: number, data: any, discountId: null) {
		let request = {
			id: id,
			status: data.value.preventiveState,
			invoice: data.value.invoice,
			iva: data.value.iva,
			notes: data.value.notes,
			discount_id: discountId
		}

		return this.http.post<Response>(api+`/api/managePreventivesStatus`, request);
	}

	updatePreventiveData(id: number, data: any) {
		let request = {
			id: id,
			assigned: data.value.assigned,
			discount: data.value.discount.discount,
			shopDiscount: data.value.shopDiscount,
			shipping: data.value.shipping,
			markup: data.value.markup,
			iva: data.value.iva,
			iva_shipping: data.value.iva_shipping,
			iva_home_service: data.value.iva_home_service,
			service_on_home: data.value.service_on_home,
			reference: data.value.reference,
		};

		return this.http.post<Response>(api + `/api/updatePreventiveData`, request);
	}

	deletePreventives(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deletePreventive`, request);
	}
}
