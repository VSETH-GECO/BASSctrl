import {$WebSocket, WebSocketSendMode} from 'angular2-websocket/angular2-websocket';
import {Injectable} from '@angular/core';

@Injectable()
export class WebsocketService {
  private socket: $WebSocket;

  public connect(url): boolean {
    if (!this.socket) {
      this.socket = new $WebSocket(url);
    }

    return this != null;
  }

  public send(payload): boolean {
    this.socket.send(payload, WebSocketSendMode.Promise).then(
      () => {
        return true;
      },
      () => {
        return false;
    }
    );

    return false;
  }
}
