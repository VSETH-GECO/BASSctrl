import {Component, OnInit} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {PlayerService} from '../services/player.service';
import {Observable} from 'rxjs/Observable';
import {Track} from '../util/track';
import {Action, Resource} from '../services/socket/api';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/takeWhile';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['../app.component.css'],
})
export class PlayerComponent implements OnInit {
  userID;
  track: Track;
  state: string;
  methodIcon: string;
  favorites;

  constructor(private wsService: WebSocketService,
              private playerService: PlayerService) {
  }

  ngOnInit(): void {
    this.playerService.getTrack().subscribe(track => this.setTrack(track));
    this.playerService.getState().subscribe(state => this.setState(state));
  }

  private updateFavorite(): void {
    if (this.favorites && this.track && this.favorites.find(tr => tr.uri === this.track.uri)) {
      this.track.isFavorite = true;
    }
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

  private setTrack(track: Track): void {
    this.track = track;

    if (track) {
      this.track.startAt = Date.now() - this.track.position;

      if (track.uri.startsWith('https://www.youtube.com')) {
        const id = track.uri.replace('https://www.youtube.com/watch?v=', '');
        this.track.thumbnail = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
      } else {
        this.track.thumbnail = 'assets/track.svg';
      }
    }
  }

  public updateTrackProgress(): void {
    const pos = Date.now() - this.track.startAt;

    this.track.percent =  pos / this.track.length * 100;

    const options = {minute: '2-digit', second: '2-digit'};
    const posDateTime = new Intl.DateTimeFormat('en-US', options).format;
    this.track.posString = '[' + posDateTime(new Date(pos)) + '|' + posDateTime(new Date(this.track.length)) + ']';
  }

  updateVotes(): void {
    if (this.userID && this.track) {
      for (const voter of this.track.voters) {
        if (voter[this.userID]) {
          this.track.userVote = voter[this.userID];
        }
      }
    }
  }

  onPlayerMethod(): void {
    if (this.state === 'playing') {
      this.wsService.send(
        new WsPackage(Resource.PLAYER, Action.SET, {state: 'pause'})
      );

    } else {
      this.wsService.send(
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
