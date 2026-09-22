import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TypeChain } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class TypeChainService {

	constructor(private http: HttpClient) { }

	getTypeChainIndexBySystemId(systemId) {
		return this.http.get<TypeChain[]>(api+`/api/typeChain/`+systemId);
	}

	getTypeChain() {
		return this.http.get<TypeChain[]>(api+`/api/typeChain`);
	}

	add(motor){
		return this.http.post<TypeChain[]>(api + `/api/typeChain`, motor);
	}

	update(id, motor){
		return this.http.post<TypeChain[]>(api + `/api/updateTypeChain`, motor);
	}

	delete(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteTypeChain`, request);
	}

}
