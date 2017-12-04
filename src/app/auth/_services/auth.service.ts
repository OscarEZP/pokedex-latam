import {Injectable} from '@angular/core';
import {User} from '../_models/user.model';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {StatusError} from '../_models/statusError.model';
import {StorageService} from '../../shared/_services/storage.service';
import {environment} from '../../../../environments/environment';

@Injectable()
export class AuthService {

    private isLoggedIn: boolean;
    private redirectUrl: string;
    private loginUrl: string;
    public data: { username: string, password: string };


    constructor(private http: Http, private storageService: StorageService) {
        this.isLoggedIn = this.getIsLoggedIn();
        this.redirectUrl = '/operations';
        this.loginUrl = '/login';
        this.reset();
    }

    logIn(username: string, password: string): Promise<User> {

        let user: User = new User();
        user.userName = username;
        user.password = password;

        return this.http
            .post(environment.apiUrl + environment.paths.login, JSON.stringify(user))
            .toPromise()
            .then(value => {
                user = value.json();
                return Promise.resolve(user);
            }).catch(reason => {
                const error: StatusError = reason.json();
                return Promise.reject(error.message);
            });

    }

    logOut() {
        this.isLoggedIn = false;
        this.storageService.removeCurrentUser();
    }

    getIsLoggedIn() {
        return this.storageService.hasCurrentUser();
    }

    getRedirectUrl(): string {
        return this.redirectUrl;
    }

    getLoginUrl(): string {
        return this.loginUrl;
    }

    getData() {
        return this.data;
    }

    reset() {
        this.data = {username: '', password: ''};
    }

}