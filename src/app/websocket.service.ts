import {Injectable} from '@angular/core';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class WebsocketService {
  constructor() { }

  private subject: Rx.Subject<MessageEvent>;

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log('Connected to:', url);
    }

    return this.subject;
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
/*
  public send(payload): boolean {
    // console.log('to send:', JSON.stringify(payload));

    let reply = false;
    socket.send(JSON.stringify(payload)).subscribe(
      (msg) => {
        console.log('next', msg.data);
        reply = true;
      },
      (msg) => {
        if (connected) {
          console.log('error', msg);
        }
        reply = false;
      },
      () => {
        reply = true;
      }
    );

    return reply;
  }*/
}

/*
socket.onMessage(
  (msg: MessageEvent) => {
    console.log('onMessage', msg.data);

    const jo = JSON.parse(msg.data);
    const wsPackage = new WsPackage(jo.method, jo.type, jo.data);

    switch (wsPackage.method) {
      case 'update':
        switch (wsPackage.type) {
          case 'queue/all':
            AppComponent.setPlaylist(JSON.parse(jo.data));
            break;
        }
        break;
    }
  },
  {autoApply: false}
);

*/
