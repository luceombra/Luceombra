import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TypeTelecomand } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class TypeTelecomandService {

	constructor(private http: HttpClient) { }

	getTypeTelecomandIndexBySystemId(systemId) {
		return this.http.get<TypeTelecomand[]>(api+`/api/typeTelecomand/`+systemId);
	}

	getSystemLines(id) {
		return this.http.get<TypeTelecomand>(api+`/api/getTelecomandLines/`+id);
	}


	getTypeTelecomand() {
		return this.http.get<TypeTelecomand[]>(api+`/api/typeTelecomand`);
	}

	add(motor){
		return this.http.post<TypeTelecomand[]>(api + `/api/typeTelecomand`, motor);
	}

	update(id, motor){
		return this.http.post<TypeTelecomand[]>(api + `/api/updateTelecomand`, motor);
	}

	delete(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteTelecomand`, request);
	}
}
