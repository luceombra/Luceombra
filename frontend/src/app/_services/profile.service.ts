import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User, Configurations } from 'app/_models';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class ProfileService {

	constructor(private http: HttpClient) { }

	getShopData() {
		return this.http.get<any>(api + `/api/getShopData`);
	}

	getUserData() {
		return this.http.get<User>(api + `/api/getCurrentUser`);
	}

	getConfigurationData(){
		return this.http.get<Configurations>(api + `/api/getConfigurations`);
	}

	updateProfile(data: any) {
		return this.http.post<any>(api + `/api/updateProfile`, data);
	}

	updatePass(data: any) {
		let obj = {
			oldPassword: data.oldPassword,
			newPassword: data.newPassword
		};

		return this.http.post<any>(api + `/api/updatePass`, obj);
	}
}
