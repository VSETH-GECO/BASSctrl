import {Injectable} from '@angular/core';
import {WsPackage} from './ws-package';
import {Subject} from 'rxjs/Subject';
import {Action, Resource} from './api';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {SnackbarService} from '../snackbar.service';

@Injectable()
export class WebSocketService {
  // private MAX_RETRIES = 5;
  // private retryNo = 0;
  private socket: Subject<MessageEvent>;
  private SERVER_URL = 'ws://' + window.location.hostname + ':8455';
  public wsPackages: Subject<WsPackage>;

  constructor (private sb: SnackbarService) {}

  public connect(url?: string): Subject<MessageEvent> {
    if (!url) {
      url = this.SERVER_URL;
    }

    if (!this.socket) {
      this.socket = this.create(url);
      // DEBUG console.log('Connected to:', url);
    }

    return this.socket;
  }

  private create(url): Subject<MessageEvent> {
    const socket = new WebSocket(url);

    const observable = Observable.create(
      (obs: Observer<MessageEvent>) => {
        socket.onmessage = obs.next.bind(obs);
        socket.onerror = obs.error.bind(obs);
        socket.onclose = obs.complete.bind(obs);

        return socket.close.bind(socket);
      });

    const observer = {
      next: (data: Object) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(data));
        }
      }
    };

    return Subject.create(observer, observable);
  }

  public send(wsPackage: WsPackage): void {
    if (!this.wsPackages) {
      this.wsPackages = <Subject<WsPackage>>this.connect(this.SERVER_URL)
        .map((response: MessageEvent): WsPackage => {
          const pack = JSON.parse(response.data);
          return {
            resource: Resource[<string>pack.resource.toUpperCase()],
            action: Action[<string>pack.action.toUpperCase()],
            data: pack.data
          };
        });
    }

    /* Very bad debugging stuff, don't use unless necessary!
    try {
      throw new Error();
    } catch (e) {
      console.log(e);
    } */

    this.wsPackages.next(wsPackage);
  }

  public getObservable(): Observable<WsPackage> {
    if (!this.wsPackages) {
      this.wsPackages = <Subject<WsPackage>>this.connect(this.SERVER_URL)
        .map((response: MessageEvent): WsPackage => {
          const pack = JSON.parse(response.data);
          return {
            resource: Resource[<string>pack.resource.toUpperCase()],
            action: Action[<string>pack.action.toUpperCase()],
            data: pack.data
          };
        });
    }

    return this.wsPackages.asObservable();
  }

  public handleError(error?) {
    this.sb.openSnackbar('Websocket connection failed. Please reload the page.', 5000);

    /*
    if (this.retryNo === this.MAX_RETRIES) {
      this.sb.openSnackbar('Websocket error. Reload page when the problem is fixed.');
      return;
    }

    let secsLeft = 5;
    Observable.interval(1000)
      .takeWhile(() => secsLeft > 0)
      .subscribe(() => {
        // this.sb.openSnackbar('Connection to server closed. Reconnecting in ' + secsLeft + '...', 1000);
        console.log('Reconnecting in', secsLeft);
        secsLeft--;
        if (secsLeft === 0) {
          this.retryNo++;
          this.socket = null;
          this.connect();
        }
      }); */
  }
}
