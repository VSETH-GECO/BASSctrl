import {Injectable} from '@angular/core';
import {WsHandlerService} from './socket/ws-handler.service';
import {WebSocketService} from './socket/websocket.service';
import {SnackbarService} from './snackbar.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Track} from '../util/track';
import {Action, Resource} from './socket/api';
import {Observable} from 'rxjs/Observable';
import {WsPackage} from './socket/ws-package';
import {UserService} from './user.service';

@Injectable()
export class QueueService {
  isReady = false;
  queue = new BehaviorSubject<Track[]>(null);
  submitPending = new BehaviorSubject<boolean>(false);

  constructor(private wsHandler: WsHandlerService, private ws: WebSocketService, private sb: SnackbarService, private user: UserService) {
    wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        this.isReady = true;
      }
    });

    wsHandler.queueSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.DATA:
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
  }

  private updateWithFavorites(): void {
    let tracks = this.queue.getValue();
    const favorites = null;

    if (!favorites || !tracks) {
      return;
    }

    for (const fav of favorites) {
      tracks = this.queue.getValue().filter(tr => tr.uri === fav.uri);
      for (const track of tracks) {
        track.isFavorite = true;
      }
    }

    this.queue.next(tracks);
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
    return this.queue.asObservable();
  }

  public submitRequest(uri: string): void {
    this.ws.send(
      new WsPackage(Resource.QUEUE, Action.URI, {
        uri: uri
      })
    );
  }

  public getSubmitPending(): Observable<boolean> {
    return this.submitPending.asObservable();
  }
}
