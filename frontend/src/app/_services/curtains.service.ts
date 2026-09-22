import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableConfigs, DataTableResponse, Response, Curtains } from 'app/_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

export interface TableData {
	headers: object;
	original: DataTableResponse;
}

@Injectable({
	providedIn: 'root'
})

export class CurtainsService {

	constructor(private http: HttpClient) { }

	getCurtains(id: number) {
		return this.http.get<Curtains[]>(api+`/api/system_curtains/${id}`);
	}

	getMarkup() {
		return this.http.get<any>(api+`/api/markup`);
	}

	getCurtainIdexById(id: number) {
		return this.http.get<Curtains>(api+`/api/system_curtain/${id}`);
	}

	getCurtainIdexByIdWithData(id: number) {
		return this.http.get<Curtains>(api+`/api/system_curtain_data/${id}`);
	}

	getAllCurtains(configs: TableConfigs){
		let request = {
			tableConfigs: configs
		};

		return this.http.post<TableData>(api+`/api/getCurtains`, request);
	}

	getMatrixFiltered(filterValue, systemId) {
		let request = {
			filterValue: filterValue,
			systemId: systemId,
		};

		return this.http.post<any>(api+`/api/getMatrixFiltered`, request);
	}

	getSystemIdexById(id) {
		return this.http.get<Curtains>(api+`/api/curtain/`+id);
	}

	getSystemLines(id) {
		return this.http.get<Curtains>(api+`/api/getCurtainLines/`+id);
	}

	update(id, motor) {
		return this.http.post<Curtains[]>(api + `/api/updateCurtain`, motor);
	}

	uploadOrMarkup(id, xlsxData, markup, system, curtainId) {
        let request = {
            id: id,
            xlsxData: xlsxData,
            markup: markup,
            system: system,
            curtainId: curtainId,
        };

        return this.http.post<any>(api + `/api/curtain/uploadOrMarkup`, request);
    }

	add(system) {
		return this.http.post<Curtains[]>(api + `/api/createCurtain`, system);
	}

	deleteSystem(id: number){
		let request = {
			id: id
		}

		return this.http.post<Response>(api+`/api/deleteCurtain`, request);
	}
}
