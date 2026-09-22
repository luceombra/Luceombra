import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TypeMotion } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class TypeMotionService {

	constructor(private http: HttpClient) { }

	getTypeMotionIndexBySystemId(systemId) {
		return this.http.get<TypeMotion[]>(api+`/api/typeMotion/`+systemId);
	}

}
