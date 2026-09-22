import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SystemColor } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class SystemColorService {

	constructor(private http: HttpClient) { }

	getColors(id: number) {
		return this.http.get<SystemColor[]>(api+`/api/system_colors/${id}`);
	}

	getSystemColorIdexById(id) {
		return this.http.get<SystemColor>(api+`/api/system_color/`+id);
	}

	getAllColors() {
		return this.http.get<SystemColor[]>(api+`/api/allSystemColors`);
	}

	add(motor){
		return this.http.post<SystemColor[]>(api + `/api/system_color`, motor);
	}

	update(id, motor){
		return this.http.post<SystemColor[]>(api + `/api/updateSystemColor`, motor);
	}

	delete(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteSystemColor`, request);
	}

}
