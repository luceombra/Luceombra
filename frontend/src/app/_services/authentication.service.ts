import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, Product } from '../_models';
import { environment } from '../../environments/environment';
const api = environment.API_URL;

@Injectable({
	providedIn: 'root'
})
export class AuthenticationService {

	private currentUserSubject: BehaviorSubject<User>;
	public currentUser: Observable<User>;

	constructor(private http: HttpClient) {
		this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
		this.currentUser = this.currentUserSubject.asObservable();
	}

	public get currentUserValue(): User {
		return this.currentUserSubject.value;
	}

	public set setCurrentUser(user: User) {
		this.currentUserSubject.next(user);
	}

	login(email: string, password: string) {
		return this.http.post<any>(`${api}/api/login`, { email, password })
		.pipe(map(user => {
			// login successful if there's a jwt token in the response
			if (user && user.token) {
				// store user details and jwt token in local storage to keep user logged in between page refreshes
				localStorage.setItem('currentUser', JSON.stringify(user));

				if(!localStorage.hasOwnProperty('product-' + user.id)){
					let product = new Product();
					localStorage.setItem('product-' + user.id, JSON.stringify(product));
				}

				this.currentUserSubject.next(user);
			}

			return user;
		}));
	}

	updatePassword(password: string) {
		return this.http.post<any>(`${api}/api/updatePassword`, { password })
		.pipe(map(user => {
			// login successful if there's a jwt token in the response
			if (user && user.token) {
				// store user details and jwt token in local storage to keep user logged in between page refreshes
				localStorage.setItem('currentUser', JSON.stringify(user));

				if(!localStorage.hasOwnProperty('product-' + user.id)){
					let product = new Product();
					localStorage.setItem('product-' + user.id, JSON.stringify(product));
				}

				this.currentUserSubject.next(user);
			}

			return user;
		}));
	}

	logout() {
		// remove user from local storage to log user out
		localStorage.removeItem('currentUser');
		this.currentUserSubject.next(null);
	}
}
