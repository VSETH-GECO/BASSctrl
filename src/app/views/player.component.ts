import {Component, OnInit} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {Observable} from 'rxjs/Observable';
import {Track} from '../util/track';
import {Action, Resource} from '../services/socket/api';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['../app.component.css'],
})
export class PlayerComponent implements OnInit {
  track: Track;
  state: string;
  methodIcon: string;

  constructor(private wsService: WebSocketService, private wsHandler: WsHandlerService) {
    wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        this.wsService.send(new WsPackage(Resource.PLAYER, Action.GET, null));
      }
    });

    wsHandler.playerSubject.subscribe(data => {
      if (data.type && data.type === 'data') {
        this.setState(data.state);
        this.setTrack(data.track);
      }
    });



    wsHandler.favoritesSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.DATA:
            if (this.track && data.favorites.find(tr => tr.uri === this.track.uri)) {
              this.track.isFavorite = true;
            }
            break;
        }
      }
    });
  }

  ngOnInit(): void {
    this.wsService.send(new WsPackage(Resource.PLAYER, Action.GET, null));
  }

  private setState(state): void {
    switch (state) {
      case 'stopped':
        this.setTrack(null);
        this.methodIcon = 'play_arrow';
        break;

      case 'paused':
        this.track.position = Date.now() - this.track.startAt;
        this.updateTrackProgress();

        this.methodIcon = 'play_arrow';
        break;

      case 'playing':
        this.methodIcon = 'pause';

        if (this.state !== 'playing') {
          // if track is not yet set we create a dummy track to satisfy ui until we get it.
          if (!this.track) {
            this.track = new Track();
            this.track.position = 0;
            this.track.length = 100000;
          }

          this.track.startAt = Date.now() - this.track.position;
          Observable.interval(100)
            .takeWhile(() => this.state === 'playing')
            .subscribe(() => this.updateTrackProgress());
        }
        break;
    }

    this.state = state;
  }

  private setTrack(track): void {
    this.track = track;

    if (track) {
      const id = track.uri.replace('https://www.youtube.com/watch?v=', '');
      this.track.thumbnail = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
      this.track.startAt = Date.now() - this.track.position;
    }
  }

  public updateTrackProgress(): void {
    const pos = Date.now() - this.track.startAt;

    this.track.percent =  pos / this.track.length * 100;

    const options = {minute: '2-digit', second: '2-digit'};
    const posDateTime = new Intl.DateTimeFormat('en-US', options).format;
    this.track.posString = '[' + posDateTime(new Date(pos)) + '|' + posDateTime(new Date(this.track.length)) + ']';
  }

  onPlayerMethod(): void {
    if (this.state === 'playing') {
      this.wsService.wsPackages.next(
        new WsPackage(Resource.PLAYER, Action.SET, {state: 'pause'})
      );

    } else {
      this.wsService.wsPackages.next(
        new WsPackage(Resource.PLAYER, Action.SET, {state: 'play'})
      );
    }
  }

  voteTrack(vote): void {
    this.wsService.send(
      new WsPackage(Resource.TRACK, Action.VOTE, {
        id: this.track.id,
        vote: vote
      }));
  }

  favorite(track): void {
    if (track.isFavorite) {
      this.wsService.send(
        new WsPackage(Resource.FAVORITES, Action.DELETE, {
          uri: track.uri
        }));
    } else {
      this.wsService.send(
        new WsPackage(Resource.FAVORITES, Action.ADD, {
          title: track.title,
          uri: track.uri
        }));
    }

    track.isFavorite = !track.isFavorite;
  }
}
