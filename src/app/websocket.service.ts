import {Injectable} from '@angular/core';
import * as Rx from 'rxjs/Rx';
import {WsPackage} from "./ws-package";
import {Subject} from "rxjs/Subject";
import {WSPackage} from "./server-ctrl.service";

@Injectable()
export class WebSocketService {
  constructor() { }

  private socket: Rx.Subject<MessageEvent>;
  private packages:
  private SERVER_URL: string;

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.socket) {
      this.socket = this.create(url);
      console.log('Connected to:', url);
    }

    return this.socket;
  }

  private create(url): Rx.Subject<MessageEvent> {
    let socket = new WebSocket(url);

    let observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
        socket.onmessage = obs.next.bind(obs);
        socket.onerror = obs.error.bind(obs);
        socket.onclose = obs.complete.bind(obs);

        return socket.close.bind(socket);
      })

    let observer = {
      next: (data: Object) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(data));
        }
      }
    };

    return Rx.Subject.create(observer, observable);
  }

  public send(wsPackage: WsPackage): void {
    <Subject<WSPackage>>this.connect(this.SERVER_URL)
      .map((response: MessageEvent): WSPackage => {
        console.log(response.data);
        const pack = JSON.parse(response.data);
        return {
          method: pack.method,
          type: pack.type,
          data: pack.data
        };
      });
  }
}
