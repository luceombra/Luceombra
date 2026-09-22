import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableConfigs, DataTableResponse, Response, System } from 'app/_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;
export interface TableData {
	headers: object;
	original: DataTableResponse;
}

@Injectable({
	providedIn: 'root'
})
export class SystemService {

	constructor(private http: HttpClient) { }

	getAll() {
		return this.http.get<System[]>(api+`/api/systems`);
	}

	getSystems(configs: TableConfigs){
		let request = {
			tableConfigs: configs
		};

		return this.http.post<TableData>(api+`/api/getSystems`, request);
	}

	getSystemIdexById(id) {
		return this.http.get<System>(api+`/api/system/`+id);
	}

	getSystemLines(id) {
		return this.http.get<System>(api+`/api/getSystemLines/`+id);
	}

	update(id, motor){
		return this.http.post<System[]>(api + `/api/updateSystem`, motor);
	}

	add(system){
		return this.http.post<System[]>(api + `/api/createSystem`, system);
	}

	deleteSystem(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteSystem`, request);
	}
}
