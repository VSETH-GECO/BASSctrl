import {WebSocketService} from './socket/websocket.service';
import {Injectable} from '@angular/core';
import {WsHandlerService} from './socket/ws-handler.service';
import {Action, Resource} from './socket/api';
import {SnackbarService} from './snackbar.service';
import {WsPackage} from './socket/ws-package';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {LocalStorageService} from 'ngx-webstorage';
import {User} from '../views/register.component';
import {Router} from '@angular/router';

@Injectable()
export class UserService {
  private isReady = false;
  private userList = new BehaviorSubject<User[]>(null);
  private username = new BehaviorSubject<string>(null);
  private userID = new BehaviorSubject<number>(null);
  private admin = new BehaviorSubject<boolean>(null);

  constructor(private wsHandler: WsHandlerService, private ws: WebSocketService,
              private sb: SnackbarService, private storage: LocalStorageService,
              private router: Router) {
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
            if (data.admin) {this.ws.send(new WsPackage(Resource.USER, Action.GET, null)); }

            this.username.next(data.username);
            this.userID.next(data.userID);
            this.admin.next(data.admin);
            this.setToken(data.token);
            sb.openSnackbar('Logged in');
            if (router.isActive('/login', false)) {
              router.navigateByUrl('/main');
            }
            break;

          case Action.LOGOUT:
            this.username.next(null);
            this.userID.next(null);
            this.admin.next(false);
            this.removeToken();
            sb.openSnackbar('Logged out');
            router.navigateByUrl('/main');
            break;

          case Action.DATA:
            this.userList.next(data.data);
            break;

          case Action.SUCCESS:
            if (this.admin.getValue()) {
              this.ws.send(new WsPackage(Resource.USER, Action.GET, null));
            }
            sb.openSnackbar(data.data.message);
            break;
        }
      }
    });
  }

  /**
   * Will try to login the user if there is a token
   * stored locally
   */
  public loginWToken(): void {
    if (this.checkToken()) {
      this.ws.send(
        new WsPackage(Resource.USER, Action.LOGIN, {
          token: JSON.parse(this.storage.retrieve('token')).token
        })
      );
    }
  }

  /**
   * Sets the locale storage 'token' to the provided token.
   * @param token The string that will be set as token
   */
  private setToken(token): void {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    this.storage.store('token', JSON.stringify({token: token, expires: date}));
  }

  /**
   * Removes the locally stored 'token'.
   */
  private removeToken(): void {
    this.storage.clear('token');
  }

  private checkToken(): boolean {
    let token = this.storage.retrieve('token');

    if (token) {
      token = JSON.parse(token);
      return new Date(token.expires) > new Date();
    }

    return false;
  }

  /**
   * Will log out the user by sending the appropriate
   * request. Will NOT unset username or stored token!
   */
  public logout(): void {
    if (this.checkToken()) {
      this.ws.send(
        new WsPackage(Resource.USER, Action.LOGOUT, {
          token: JSON.parse(this.storage.retrieve('token')).token
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

  public getUserList(): Observable<User[]> {
    if (!this.userList.getValue() && this.isReady) {
      this.ws.send(new WsPackage(Resource.USER, Action.GET, null));
    }
    return this.userList.asObservable();
  }
}
