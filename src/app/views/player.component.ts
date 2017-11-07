import {Component, OnInit} from '@angular/core';
import {WsPackage} from '../socket/ws-package';
import {WebSocketService} from '../socket/websocket.service';
import {WsHandlerService} from '../socket/ws-handler.service';
import {Observable} from 'rxjs/Observable';
import {Track} from '../util/track';

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
    wsHandler.playerSubject.subscribe(data => {
      if (!(typeof data.track === 'undefined')) {
        this.setTrack(data.track);
      }
      if (data.state) {
        this.setState(data.state);
      }
      if (data.isReady) {
        this.wsService.send(new WsPackage('get', 'player/current', null));
        this.wsService.send(new WsPackage('get', 'player/state', null));
      }
    });
  }

  ngOnInit(): void {
    this.wsService.send(new WsPackage('get', 'player/current', null));
  }

  private setState(state): void {
    switch (state) {
      case 'stopped':
        this.setTrack(null);
        this.methodIcon = 'play_arrow';
        break;

      case 'paused':
        this.track.position = Date.now() - this.track.startAt;

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
        new WsPackage('patch', 'player/control', {state: 'pause'})
      );

    } else {
      this.wsService.wsPackages.next(
        new WsPackage('patch', 'player/control', {state: 'play'})
      );
    }
  }

  voteTrack(vote): void {
    this.wsService.send(
      new WsPackage('patch', 'track/vote', {
        id: this.track.id,
        vote: vote
      }));
  }
}
