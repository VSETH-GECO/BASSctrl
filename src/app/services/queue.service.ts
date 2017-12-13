import {Injectable} from '@angular/core';
import {WsHandlerService} from './socket/ws-handler.service';
import {WebSocketService} from './socket/websocket.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Track} from '../util/track';
import {Action, Resource} from './socket/api';
import {Observable} from 'rxjs/Observable';
import {WsPackage} from './socket/ws-package';
import {UserService} from './user.service';
import {FavoriteService} from './favorite.service';

@Injectable()
export class QueueService {
  isReady = false;
  queue = new BehaviorSubject<Track[]>(null);
  submitPending = new BehaviorSubject<boolean>(false);

  constructor(private wsHandler: WsHandlerService, private ws: WebSocketService,
              private user: UserService, private favorites: FavoriteService) {

    wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        this.isReady = true;
        ws.send(new WsPackage(Resource.QUEUE, Action.GET, null));
      }
    });

    wsHandler.queueSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.DATA:
            // This will cause the site to request the queue on every load if it was empty the last time but that is acceptable
            this.queue.next(data.queue.length === 0 ? null : data.queue);
            this.updateWithFavorites();
            this.updateWithVotes();
            break;

          case Action.SUCCESS:
            // this.requestUri = null;
            this.submitPending.next(false);
            break;

          case Action.ERROR:
            this.submitPending.next(false);
        }
      }
    });


    this.wsHandler.favoritesSubject.subscribe(() => {
      this.updateWithFavorites();
    });
  }

  private updateWithFavorites(): void {
    const allTracks = this.queue.getValue();
    const favorites = this.favorites.getFavorites().getValue();

    if (!favorites || !allTracks) {
      return;
    }

    for (const fav of favorites) {
      const tracks = this.queue.getValue().filter(tr => tr.uri === fav.uri);
      for (const track of tracks) {
        track.isFavorite = true;
      }
    }

    // Push updated queue
    this.queue.next(allTracks);
  }

  private updateWithVotes(): void {
    const tracks = this.queue.getValue();
    const userID = this.user.getUserID().getValue();

    if (userID && tracks) {
      for (const track of tracks) {
        for (const voter of track.voters) {
          if (voter[userID]) {
            track.userVote = voter[userID];
          }
        }
      }
    }

    // Push updated queue
    this.queue.next(tracks);
  }

  public getQueue(): Observable<Track[]> {
    if (!this.queue.getValue()) {
      this.ws.send(new WsPackage(Resource.QUEUE, Action.GET, null));
    }

    return this.queue.asObservable();
  }

  public submitRequest(uri: string): void {
    this.submitPending.next(true);
    this.ws.send(
      new WsPackage(Resource.QUEUE, Action.ADD, {
        uri: uri
      })
    );
  }

  public getSubmitPending(): Observable<boolean> {
    return this.submitPending.asObservable();
  }
}
