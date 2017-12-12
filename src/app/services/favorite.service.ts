import {Injectable} from '@angular/core';
import {WebSocketService} from './socket/websocket.service';
import {WsPackage} from './socket/ws-package';
import {Action, Resource} from './socket/api';
import {WsHandlerService} from './socket/ws-handler.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

interface Favorite {
  title: string;
  uri: string;
}

@Injectable()
export class FavoriteService {
  private favorites = new BehaviorSubject<Favorite[]>(null);

  constructor (private ws: WebSocketService, private wsHandler: WsHandlerService) {
    wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        ws.send(new WsPackage(Resource.FAVORITES, Action.GET, null));
      }
    });

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

  public getFavorites(): BehaviorSubject<Favorite[]> {
    if (!this.favorites.getValue()) {
      this.ws.send(new WsPackage(Resource.FAVORITES, Action.GET, null));
    }

    return this.favorites;
  }
}
