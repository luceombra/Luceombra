import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableConfigs, TableData, Response } from 'app/_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class ClientsService {

	constructor(private http: HttpClient) { }

	getClients(configs: TableConfigs){
		let request = {
			tableConfigs: configs
		};

		return this.http.post<TableData>(api+`/api/getClients`, request);
	}

	addClient(data: any) {
		return this.http.post<Response>(api+`/api/addClients`, data);
	}

	updateClient(id: number, data: any){
		let request = {
			id: id,
			name: data.name,
			phone: data.phone,
			address: data.address,
			email: data.email,
			p_iva: data.p_iva
		}

		return this.http.post<Response>(api+`/api/updateClient`, request);
	}

	deleteClient(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteClient`, request);
	}

}
