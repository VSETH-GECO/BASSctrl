import {Injectable} from '@angular/core';
import {WebSocketService} from './socket/websocket.service';
import {WsPackage} from './socket/ws-package';
import {Action, Resource} from './socket/api';

@Injectable()
export class TrackService {
  constructor (private ws: WebSocketService) {

  }

  public vote(track, vote): void {
    this.ws.send(
      new WsPackage(Resource.TRACK, Action.VOTE, {
        id: track.id,
        vote: vote
    }));
  }
}
