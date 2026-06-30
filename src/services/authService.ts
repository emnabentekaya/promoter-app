import axios from 'axios';
import type { AccessToken } from '../models/accessToken';
import type { UserDetails } from '../models/userDetails';
import { appStorageService, AppStorageService } from './appStorageService';
import {environment} from "../enviroments/enviroment.ts";


// const environment = {
//   production: false,
//   oauthClient: '2',
//   oauthSecret: 'UjnznqhvjkHEvekdfXl9JUjsAG8n37Jl0zdPT8Ct',
//   oauthUrl: 'http://bigdatis.app.server/oauth/token',
//   apiUrl: 'http://bigdatis.app.server/api',
// };
// const environment = {
//   production: false,
//   oauthClient: '2',
//   oauthSecret: 'UjnznqhvjkHEvekdfXl9JUjsAG8n37Jl0zdPT8Ct',
//   oauthUrl: 'http://127.0.0.1:8000/oauth/token',
//   apiUrl: 'http://127.0.0.1:8000/api',
// };
/*const environment ={
  apiUrl:'http://127.0.0.1:8000/api',
  production:false,
};*/
export class AuthService {
  private apiUrls = {
    user: environment.apiUrl + '/user',
    revoke: environment.apiUrl + '/token/revoke',
    push: environment.apiUrl + '/token/push',
    login: environment.apiUrl + '/login',
    logout: environment.apiUrl + '/logout'
  };
  private oauthUrls = {
    token: environment.oauthUrl + '/token'
  };

  constructor(private appStorage: AppStorageService) {}

  public async login(username: string, password: string): Promise<boolean | null> {
    this.appStorage.remove('access_token');

    try {
      const accessToken = await axios.post<AccessToken>(this.oauthUrls.token, {
        grant_type: 'password',
        client_id: environment.oauthClient,
        client_secret: environment.oauthSecret,
        username,
        password,
        scope: '',
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      /*const accessToken = await axios.post<AccessToken>(this.apiUrls.login, {
        email: username,
        password,
      });*/

      const token = accessToken.data;
      //this.appStorage.setString('access_token', token.access_token);

      //const token = res.data.token;
      this.appStorage.setString('access_token', token.access_token);

      const user = await this.getUserDetails();
      if (!(user as any).isExclusiveUser) {
        console.error('User not allowed to access exclusive app');
        this.appStorage.remove('access_token');
        return false;
      }

      return true;
    } catch (error: any) {
      if (!environment.production) {
        console.warn('Failed to log in');
        console.warn(error);
      }

      if (error.response?.data?.error === 'invalid_grant') {
        return false;
      }

      return null;
    }
  }

  public logout() {
  //public revoke(){
    try {
      axios.get(this.apiUrls.revoke, { headers: this.getAuthHeaders() });
      //axios.get(this.apiUrls.logout, { headers: this.getAuthHeaders() });
    } catch (error: any) {
      if (!environment.production) {
        console.warn('Failed revoke user token');
        console.warn(error);
      }
    } finally {
      this.appStorage.remove('access_token');
    }
  }

  public async getUserDetails(): Promise<UserDetails> {
    try {
      const { data } = await axios.get<UserDetails>(this.apiUrls.user, {
        headers: this.getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      if (!environment.production) {
        console.warn('Failed get user details');
        console.warn(error);
      }
      throw error;
    }
  }

  public getAuthHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': this.getAuthorizationHeader(),
    };
  }

  public getAuthorizationHeader() {
    return 'Bearer ' + this.appStorage.getString('access_token');
  }
}

export const authService = new AuthService(appStorageService);