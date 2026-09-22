import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableConfigs, DataTableResponse, Response } from 'app/_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;
export interface TableData {
	headers: object;
	original: DataTableResponse;
}

@Injectable({
	providedIn: 'root'
})
export class OrdersService {

	constructor(private http: HttpClient) { }

	getOrders(configs: TableConfigs, selfOrders: boolean) {
		let request = {
			tableConfigs: configs,
			selfOrders: selfOrders
		};

		return this.http.post<TableData>(api+`/api/getOrders`, request);
	}

	retrieveFilteredOrders(configs: TableConfigs, startDate, endDate, agentName, agentId) {
		let request = {
			tableConfigs: configs,
			startDate: startDate,
			endDate: endDate,
			agentName: agentName,
			agentId: agentId,
		};

		return this.http.post<any>(api+`/api/retrieveFilteredOrders`, request);
	}

	updateOrderStatus(id: number, status: string) {
		let request = {
			id: id,
			status: status
		}

		return this.http.post<Response>(api+`/api/updateOrderStatus`, request);
	}

	updateInvoiceShop(id: number, data: any) {
		let request = {
			id: id,
			status: data.value.orderState,
			invoice: data.value.invoice,
			notes: data.value.notes,
		}

		return this.http.post<Response>(api+`/api/updateInvoiceShop`, request);
	}

	updateOrderStatusFromAdmin(id: number, status: string, adminStatus?) {

		let request = {
			id: id,
			status: status,
			adminStatus: adminStatus
		}

		return this.http.post<Response>(api+`/api/updateOrderStatusFromAdmin`, request);
	}

	createInvoice(id: number, data: any) {
		let request = {
			id: id,
			data: data
		}

		return this.http.post<Response>(api+`/api/createInvoice`, request);
	}

	deleteOrder(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteOrder`, request);
	}
}
