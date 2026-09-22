import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurtainColor } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class CurtainColorService {

	constructor(private http: HttpClient) { }

	getColors(id: number) {
		return this.http.get<CurtainColor[]>(api+`/api/curtain_colors/${id}`);
	}

	getCurtainColorIdexById(id: number) {
		return this.http.get<CurtainColor>(api+`/api/curtain_color/${id}`);
	}

	getAllColors() {
		return this.http.get<CurtainColor[]>(api+`/api/allCurtainColors`);
	}

	add(motor){
		return this.http.post<CurtainColor[]>(api + `/api/curtain_color`, motor);
	}

	update(id, motor){
		return this.http.post<CurtainColor[]>(api + `/api/updateCurtainColor`, motor);
	}

	delete(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteCurtainColor`, request);
	}
}
