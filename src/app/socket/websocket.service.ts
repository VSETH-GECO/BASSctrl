import {Injectable} from '@angular/core';
import * as Rx from 'rxjs/Rx';
import {WsPackage} from './ws-package';
import {Subject} from 'rxjs/Subject';

export interface WSPackage {
  method: string;
  type: string;
  data: object;
}

@Injectable()
export class WebSocketService {
  constructor() {}

  private socket: Rx.Subject<MessageEvent>;
  private SERVER_URL = 'wss://api.' + window.location.hostname.replace('dev.', '');
  public wsPackages: Subject<WSPackage>;

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.socket) {
      this.socket = this.create(url);
      console.log('Connected to:', url);
    }

    return this.socket;
  }

  private create(url): Rx.Subject<MessageEvent> {
    const socket = new WebSocket(url);

    const observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
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

    return Rx.Subject.create(observer, observable);
  }

  public send(wsPackage: WsPackage): void {
    if (!this.wsPackages) {
      this.wsPackages = <Subject<WSPackage>>this.connect(this.SERVER_URL)
        .map((response: MessageEvent): WSPackage => {
          const pack = JSON.parse(response.data);
          return {
            method: pack.method,
            type: pack.type,
            data: pack.data
          };
        });
    }

    // DEBUG console.log('msg to send:', wsPackage);
    this.wsPackages.next(wsPackage);
  }
}
