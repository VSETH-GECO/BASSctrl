import {WebSocketService} from './socket/websocket.service';
import {Injectable} from '@angular/core';
import {WsHandlerService} from './socket/ws-handler.service';
import {Action, Resource} from './socket/api';
import {CookieService} from 'angular2-cookie/core';
import {SnackbarService} from './snackbar.service';
import {WsPackage} from './socket/ws-package';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class UserService {
  private isReady = false;
  private username = new BehaviorSubject<string>(null);
  private userID = new BehaviorSubject<number>(null);
  private admin = new BehaviorSubject<boolean>(null);

  constructor(private wsHandler: WsHandlerService, private ws: WebSocketService, private sb: SnackbarService) {
    wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        this.loginWToken();
        this.isReady = true;
      }
    });

    wsHandler.userSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.ERROR:
            sb.openSnackbar(data.message);
            break;

          case Action.LOGIN:
            this.username.next(data.username);
            this.userID.next(data.userID);
            this.admin.next(data.admin);
            this.setToken(data.token);
            sb.openSnackbar('Logged in');
            break;

          case Action.LOGOUT:
            this.username.next(null);
            this.userID.next(null);
            this.admin.next(false);
            this.removeToken();
            break;
        }
      }
    });
  }

  /**
   * Will try to login the user if there is a cookie
   * named 'token'.
   */
  private loginWToken(): void {
    let token;
    if (token = new CookieService().get('token')) {
      this.ws.send(
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
  private setToken(token): void {
    new CookieService().put('token', token);
  }

  /**
   * Removes the cookie 'token'.
   */
  private removeToken(): void {
    new CookieService().remove('token');
  }

  /**
   * Will log out the user by sending the appropriate
   * request. Will NOT unset username or token cookie!
   */
  public logout(): void {
    let token;
    if (token = new CookieService().get('token')) {
      this.ws.send(
        new WsPackage(Resource.USER, Action.LOGOUT, {
          token: token
        })
      );
    }
  }

  /**
   * The username is null if the connection is not logged in, the username otherwise
   * @returns {Observable<string>} of the username that will get updated if there is any change
   */
  public getUsername(): Observable<string> {
    return this.username.asObservable();
  }

  /**
   * The user id is null if the connection is not logged in, the username otherwise
   * @returns {Observable<number>} of the userID that will get updated if there is any change
   */
  public getUserID(): BehaviorSubject<number> {
    return this.userID;
  }

  public isAdmin(): Observable<boolean> {
    return this.admin.asObservable();
  }
}
