import {Injectable} from '@angular/core';
import {WebSocketService} from './socket/websocket.service';
import {WsPackage} from './socket/ws-package';
import {Action, Resource} from './socket/api';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Track} from '../util/track';
import {Observable} from 'rxjs/Observable';
import {WsHandlerService} from './socket/ws-handler.service';
import {UserService} from './user.service';
import {FavoriteService} from './favorite.service';

@Injectable()
export class PlayerService {
  private track = new BehaviorSubject<Track>(null);
  private state = new BehaviorSubject<string>('stopped');

  constructor (private ws: WebSocketService, private wsHandler: WsHandlerService,
               private user: UserService, private favorites: FavoriteService) {
    this.wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        ws.send(new WsPackage(Resource.PLAYER, Action.GET, null));
      }
    });

    wsHandler.playerSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.DATA:
            this.track.next(data.track);
            this.state.next(data.state);

            this.updateWithVotes();
            this.updateWithFavorites();
            break;
        }
      }
    });
  }

  private updateWithVotes(): void {
    const track = this.track.getValue();
    const userID = this.user.getUserID().getValue();

    if (userID && track) {
      for (const voter of track.voters) {
        if (voter[userID]) {
          track.userVote = voter[userID];
        }
      }
    }

    // Push updated queue
    this.track.next(track);
  }

  private updateWithFavorites(): void {
    const track = this.track.getValue();
    const favorites = this.favorites.getFavorites().getValue();

    if (favorites && track && favorites.find(tr => tr.uri === track.uri)) {
      track.isFavorite = true;
    }

    this.track.next(track);
  }

  public vote(track, vote): void {
    this.ws.send(
      new WsPackage(Resource.TRACK, Action.VOTE, {
        id: track.id,
        vote: vote
      }));
  }

  public getTrack(): Observable<Track> {
    return this.track.asObservable();
  }

  public getState(): Observable<string> {
    return this.state.asObservable();
  }
}
