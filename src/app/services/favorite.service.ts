import {Injectable} from '@angular/core';
import {WebSocketService} from './socket/websocket.service';
import {WsPackage} from './socket/ws-package';
import {Action, Resource} from './socket/api';
import {WsHandlerService} from './socket/ws-handler.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class FavoriteService {
  favorites = new BehaviorSubject(null);

  constructor (private ws: WebSocketService, private wsHandler: WsHandlerService) {
    wsHandler.favoritesSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.DATA:
            this.favorites.next(data.favorites);
            break;
        }
      }
    });
  }

  public favorite(track): void {
    if (track.isFavorite) {
      this.ws.send(
        new WsPackage(Resource.FAVORITES, Action.DELETE, {
          uri: track.uri
        }));
    } else {
      this.ws.send(
        new WsPackage(Resource.FAVORITES, Action.ADD, {
          title: track.title,
          uri: track.uri
        }));
    }
  }
}
