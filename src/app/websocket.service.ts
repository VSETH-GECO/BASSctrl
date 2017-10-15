import {$WebSocket, WebSocketSendMode} from 'angular2-websocket/angular2-websocket';
import {Injectable} from '@angular/core';

const socket = new $WebSocket('ws://localhost:8080');
let connected = false;

@Injectable()
export class WebsocketService {

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
  }
}

socket.onOpen(
  () => {
    connected = true;
  }
);

socket.onMessage(
  (msg: MessageEvent) => {
    console.log('onMessage', msg.data);
  },
  {autoApply: false}
);

