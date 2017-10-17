import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';

const SERVER_URL = 'ws://localhost:8080';

export interface WSPackage {
  method: string;
  type: string;
  data: object;
}

@Injectable()
export class ServerCtrlService {
  public wsPackages: Subject<WSPackage>;

  constructor(wsService: WebsocketService) {
    this.wsPackages = <Subject<WSPackage>>wsService.connect(SERVER_URL)
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
