import {Injectable} from '@angular/core';
import {LoginService} from '../login.service';
import {Subject} from 'rxjs/Subject';
import {WsPackage} from './ws-package';
import {Action} from './api';

@Injectable()
export class WsHandlerService {
  static API_VERSION = 'v1';

  public appSubject = new Subject<any>();
  public userSubject = new Subject<any>();
  public trackSubject = new Subject<any>();
  public queueSubject = new Subject<any>();
  public playerSubject = new Subject<any>();
  public favoritesSubject = new Subject<any>();

  constructor(private loginService: LoginService) {}

  public app(msg: WsPackage): void {
    switch (msg.action) {
      case Action.SUCCESS:
        if (msg.data) {
          if (msg.data.apiVersion !== WsHandlerService.API_VERSION) {
            const error = 'Incompatible API versions. Theirs: ' + msg.data.apiVersion + ' | Ours: ' + WsHandlerService.API_VERSION;
            this.appSubject.next({error: error});
            throw new Error(error);
          } else {
            this.loginService.loginWToken();
            this.appSubject.next({isReady: true});
          }
        }
        break;

      default:
        console.log('Unknown package:', msg);
    }
  }

  public user(msg: WsPackage): void {
    switch (msg.action) {
      case Action.DATA:
        if (msg.data) {
          this.userSubject.next({action: Action.LOGIN, username: msg.data.username});
          this.loginService.setToken(msg.data.token);
        }
        break;

      case Action.LOGOUT:
        this.userSubject.next({action: Action.LOGOUT});
        break;

      case Action.REGISTER:
        this.userSubject.next({action: Action.REGISTER});
        break;

      case Action.ERROR:
        // TODO handle error
        this.appSubject.next({action: Action.ERROR, message: msg.data.message});
        break;

      default:
        console.log('Unknown package:', msg);
    }
  }

  public track(msg: WsPackage): void {
    switch (msg.action) {
      case Action.SUCCESS:
        // Does nothing, the updated queue will inform users. Still there for completeness
        this.trackSubject.next({action: Action.SUCCESS});
        break;

      default:
        console.log('Unknown package:', msg);
    }
  }

  public queue(msg: WsPackage): void {
    switch (msg.action) {
      case Action.SUCCESS:
        this.queueSubject.next({action: Action.SUCCESS});
        break;

      case Action.ERROR:
        this.queueSubject.next({action: Action.ERROR});
        this.appSubject.next({action: Action.ERROR, message: msg.data.message});
        break;

      case Action.DATA:
        this.queueSubject.next({action: Action.DATA, queue: msg.data});
        break;

      default:
        console.log('Unknown package:', msg);
    }
  }

  public player(msg: WsPackage): void {
    switch (msg.action) {
      case Action.DATA:
        this.playerSubject.next({type: 'data', state: msg.data.state, track: msg.data.track});
        break;

      default:
        console.log('Unknown package:', msg);
    }
  }

  public favorites(msg: WsPackage): void {
    switch (msg.action) {
      case Action.SUCCESS:
        this.favoritesSubject.next({action: Action.SUCCESS});
        break;

      case Action.ERROR:
        this.appSubject.next({action: Action.ERROR, message: msg.data.message});
        break;

      case Action.DATA:
        this.favoritesSubject.next({action: Action.DATA, favorites: msg.data});
        break;

      default:
        console.log('Unknown package:', msg);
    }
  }

  /*
  public post(msg): void {

    switch (msg.type) {
      case 'ack':
        this.playlistSubject.next({response: 'success'});
        break;

      case 'queue/all':
        this.playlistSubject.next({playlist: msg.data});
        break;

      case 'player/current':
        this.playerSubject.next({track: msg.data});
        break;

      case 'app/welcome':
        this.loginService.loginWToken();
        this.playerSubject.next({isReady: true});
        this.playlistSubject.next({isReady: true});
        break;

      case 'user/token':
        this.loginService.setToken(msg.data.token);
        this.appSubject.next({username: msg.data.username});
        this.loginSubject.next({response: 'logged in'});
        break;

      case 'user/logout':
        this.loginService.removeToken();
        this.appSubject.next({username: null});
        this.loginSubject.next({response: 'logged out'});
        break;

      case 'player/control':
        this.playerSubject.next({state: msg.data.state});
        break;

      case 'user/register':
        this.registerSubject.next({response: 'success'});
        break;

      case 'user/favorite':
        this.playlistSubject.next({favorites: msg.data});
        this.favoritesSubject.next({favorites: msg.data});
        break;

      case 'user/unauthorized':
        switch (msg.data.type) {
          case 'queue/uri':
            this.playlistSubject.next({response: 'unauthorized'});
            break;

          case 'user/register':
            this.registerSubject.next({response: 'unauthorized'});
            break;
        }
        break;

      case 'err':
        if (msg.data.message === 'No matches found') {
          this.playlistSubject.next({response: 'no matches'});
        } else if (msg.data.message === 'Wrong password.') {
          this.loginSubject.next({response: 'wrong password'});
        } else if (msg.data.message === 'Account not found.') {
          this.loginSubject.next({response: 'account not found'});
        } else {
          this.loginSubject.next({response: 'invalid token'});
        }
    }
  } */
}
