import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {WsPackage} from './ws-package';
import {Action, Resource} from './api';
import {WebSocketService} from './websocket.service';
import {SnackbarService} from '../snackbar.service';

@Injectable()
export class WsHandlerService {
  static API_VERSION = 'v2';
  private SERVER_URL = 'ws://' + window.location.hostname + ':8455';
  private conErrorDisplayed: boolean;

  public appSubject = new Subject<any>();
  public userSubject = new Subject<any>();
  public trackSubject = new Subject<any>();
  public queueSubject = new Subject<any>();
  public playerSubject = new Subject<any>();
  public favoritesSubject = new Subject<any>();

  constructor(private ws: WebSocketService, private sb: SnackbarService) {
    ws.onopen = (ev: Event) => {
      console.log('Connected to BASS');
    };

    ws.onmessage = (ev: MessageEvent) => {
      const pack = JSON.parse(ev.data);
      const wsPackage = new WsPackage(
            Resource[<string>pack.resource.toUpperCase()],
            Action[<string>pack.action.toUpperCase()],
            pack.data);

      switch (wsPackage.resource) {
          case Resource.APP:
            this.app(wsPackage);
            break;

          case Resource.USER:
            this.user(wsPackage);
            break;

          case Resource.QUEUE:
            this.queue(wsPackage);
            break;

          case Resource.TRACK:
            this.track(wsPackage);
            break;

          case Resource.PLAYER:
            this.player(wsPackage);
            break;

          case Resource.FAVORITES:
            this.favorites(wsPackage);
            break;
        }
    };

    ws.onerror = (ev: Event) => {
      if (!this.conErrorDisplayed) {
        sb.openSnackbar('Connection to server failed. Trying to reconnect...', 5000);
      }
      this.conErrorDisplayed = true;
    };

    ws.connectTo(this.SERVER_URL);
  }

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

      case Action.UPDATE:
        this.appSubject.next({action: msg.action, status: msg.data.status});
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

      case Action.ADD:
        this.userSubject.next({action: Action.ADD});
        break;

      case Action.ERROR:
        this.userSubject.next({action: Action.ERROR, message: msg.data.message});
        break;

      case Action.INFORM:
        this.userSubject.next({action: Action.DATA, data: msg.data});
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
