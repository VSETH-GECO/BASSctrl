import {Injectable} from '@angular/core';
import {WsPackage} from './socket/ws-package';
import {CookieService} from 'angular2-cookie/core';
import {WebSocketService} from './socket/websocket.service';
import {Action, Resource} from './socket/api';

@Injectable()
export class LoginService {

  constructor(private wsService: WebSocketService) {}

  /**
   * Will try to login the user if there is a cookie
   * named 'token'.
   */
  public loginWToken(): void {
    let token;
    if (token = new CookieService().get('token')) {
      this.wsService.send(
        new WsPackage(Resource.USER, Action.LOGIN, {
          token: token
        })
      );
    }
  }

  /**
   * Sets the cookie 'token' to the provided token.
   * @param token The string that will be set as token
   */
  public setToken(token): void {
    new CookieService().put('token', token);
  }

  /**
   * Removes the cookie 'token'.
   */
  public removeToken(): void {
    new CookieService().remove('token');
  }

  /**
   * Will log out the user by sending the appropriate
   * request. Will NOT unset username or token cookie!
   */
  public logout(): void {
    let token;
    if (token = new CookieService().get('token')) {
      this.wsService.send(
        new WsPackage(Resource.USER, Action.LOGOUT, {
          token: token
        })
      );
    }
  }
}
