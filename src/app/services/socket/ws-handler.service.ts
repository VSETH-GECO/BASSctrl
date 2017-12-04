import {Injectable} from '@angular/core';
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

  constructor() {}

  public app(msg: WsPackage): void {
    switch (msg.action) {
      case Action.SUCCESS:
        if (msg.data) {
          if (msg.data.apiVersion !== WsHandlerService.API_VERSION) {
            const error = 'Incompatible API versions. Theirs: ' + msg.data.apiVersion + ' | Ours: ' + WsHandlerService.API_VERSION;
            this.appSubject.next({error: error});
            throw new Error(error);
          } else {
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
          this.userSubject.next({action: Action.LOGIN, userID: msg.data.id,
            username: msg.data.username, token: msg.data.token, admin: msg.data.admin});
        }
        break;

      case Action.LOGOUT:
        this.userSubject.next({action: Action.LOGOUT});
        break;

      case Action.REGISTER:
        this.userSubject.next({action: Action.REGISTER});
        break;

      case Action.ERROR:
        this.userSubject.next({action: Action.ERROR, message: msg.data.message});
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
        this.playerSubject.next({action: Action.DATA, state: msg.data.state, track: msg.data.track});
        break;

      default:
        console.log('Unknown package:', msg);
    }
  }

  public favorites(msg: WsPackage): void {
    switch (msg.action) {
      case Action.SUCCESS:
        this.favoritesSubject.next({action: Action.SUCCESS, data: msg.data});
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
}
