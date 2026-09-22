import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, TableConfigs, TableData, Response } from '../_models';
import { environment } from '../../environments/environment';
import 'rxjs-compat/add/operator/map';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient) { }

	getAll() {
		return this.http.get<User[]>('${config.apiUrl}/users');
	}

	getById(id: number) {
		return this.http.get('${config.apiUrl}/users/${id}');
	}

	register(user: User) {
		return this.http.post('${config.apiUrl}/users/register', user);
	}

	update(user: User) {
		return this.http.put('${config.apiUrl}/users/${user.id}', user);
	}

	delete(id: number) {
		return this.http.delete('${config.apiUrl}/users/${id}');
	}

	getAgents(configs: TableConfigs){
		let request = {
			tableConfigs: configs
		};

		return this.http.post<TableData>(api+`/api/getAgents`, request);
	}

	retrieveAgents() {
		return this.http.get<any>(api+`/api/retrieveAgents`);
	}

	getAgentsMatrix(configs: TableConfigs) {
		let request = {
			tableConfigs: configs
		};

		return this.http.post<TableData>(api+`/api/getAgentsMatrix`, request);
	}

	getUsers(configs: TableConfigs){
		let request = {
			tableConfigs: configs
		};

		return this.http.post<TableData>(api+`/api/getUsers`, request);
	}

	retrieveAssignees() {
		return this.http.get<Object[]>(api+`/api/retrieveAssignees`);
	}

	getShopsDiscount() {
		return this.http.get<Object[]>(api+`/api/getShopsDiscount`);
	}

	addAgents(data: any){
		return this.http.post<Response>(api+`/api/addAgent`, data);
	}

	addAgentMatrix(data: any){
		return this.http.post<Response>(api+`/api/addAgentMatrix`, data);
	}

	updateAgentMatrix(id: number, data: any) {
		let request = {
			id: id,
			discount: data.discount,
			agent_fee: data.agent_fee,
		}

		return this.http.post<Response>(api+`/api/updateAgentMatrix`, request);
	}

	addUsers(data: any){
		return this.http.post<Response>(api+`/api/addUser`, data);
	}

	updateAgents(id: number, data: any){
		let request = {
			id: id,
			name: data.name,
			email: data.email,
			phone_number: data.phone_number,
			zone_covered: data.zone_covered,
			unpaidCommision: data.unpaidCommision
			// commision: data.commision,
		}

		return this.http.post<Response>(api+`/api/updateAgent`, request);
	}

	deleteAgentMatrix(id: number) {
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteAgentMatrix`, request);
	}

	updateUser(id, motor) {
		return this.http.post<Response>(api+`/api/updateUser`, motor);
	}

	deleteAgents(id: number) {
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteAgent`, request);
	}

	deleteAdmins(id: number) {
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteAdmin`, request);
	}

	getShops(configs: TableConfigs){
		let request = {
			tableConfigs: configs
		};

		return this.http.post<TableData>(api+`/api/getShops`, request);
	}

	addShop(data: any){
		return this.http.post<Response>(api+`/api/addShop`, data);
	}

	updateShop(id: number, data: any){
		let request = {
			id : id,
			name : data.name,
			email : data.email,
			iva : data.iva,
			phone_number : data.phone_number,
			discount_id : data.shop_discount,
			assignee : data.assignee,
			address : data.address,
			shipping : data.shipping,
			description : data.description
		}

		return this.http.post<Response>(api+`/api/updateShop`, request);
	}

	deleteShop(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteShop`, request);
	}

	changeStatusOfShop(id: number, checked){
		let request = {
			id: id,
			status: checked
		}

		return this.http.post<Response>(api+`/api/changeStatusOfShop`, request);
	}

	forgotPassword(data) {
		return this.http.post<any>(api+`/api/reset`, data);
	}

	generateNew(token: string) {
		let request = {
			token: token
		}
		return this.http.post<any>(api+`/api/generate`, request);
	}

	retrieveMatrices() {
		return this.http.get<any>(api+`/api/retrieveMatrices`);
	}

	getAdmin() {
		return this.http.get<any>(api+`/api/getAdmin`);
	}
}
