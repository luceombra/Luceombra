import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TypeMotor } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class TypeMotorService {

	constructor(private http: HttpClient) { }

	getTypeMotorIndexBySystemId(systemId) {
		return this.http.get<TypeMotor[]>(api+`/api/typeMotor/`+systemId);
	}

	getTypeMotor() {
		return this.http.get<[]>(api+`/api/typeMotor`);
	}

	add(motor){
		return this.http.post<TypeMotor[]>(api + `/api/typeMotor`, motor);
	}

	update(id, motor){
		return this.http.post<TypeMotor[]>(api + `/api/updateTypeMotor`, motor);
	}

	delete(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteTypeMotor`, request);
	}

}
