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
export class InvoicesService {

    constructor(private http: HttpClient) { }

    getInvoices(configs: TableConfigs) {
        let request = {
            tableConfigs: configs
        };

        return this.http.post<TableData>(api+`/api/getInvoices`, request);
    }

    getAdminInvoices(configs: TableConfigs) {
        let request = {
            tableConfigs: configs
        };

        return this.http.post<TableData>(api+`/api/getAdminInvoices`, request);
    }

    deleteInvoice(id: number) {
        let request = {
            id: id
        }

        return this.http.post<Response>(api+`/api/deleteInvoice`, request);
    }
}
