import {Component, OnInit} from '@angular/core';
import {Track} from './track';
import {WsPackage} from './ws-package';
import {ServerCtrlService} from './server-ctrl.service';
import {WebsocketHandler} from './websocket-handler';

@Component({
  selector: 'player',
  templateUrl: '/player.component.html',
  styleUrls: ['./app.component.css'],
})
export class PlayerComponent implements OnInit {
  track: Track;
  currentMethod;
  currentMethodIcon = 'play_arrow';
  currentTrackTimPos;
  currentTrackPercent;
  currentTrackThumb;

  constructor(private serverCtrlService: ServerCtrlService) {}

  ngOnInit(): void {
    WebsocketHandler.player = this;
  }

  public setCurrentTrack(track): void {
    this.track = track;

    if (track) {
      const id = track.uri.replace('https://www.youtube.com/watch?v=', '');
      this.currentTrackThumb = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    }
  }

  // FIXME pl0x
  public updateTrackProgress(): void {
    this.currentTrackPercent = this.track.position / this.track.length * 100;

    const pos = new Date(this.track.position);
    const total = new Date(this.track.length);

    const options = {minute: '2-digit', second: '2-digit'};
    const posDateTime = new Intl.DateTimeFormat('en-US', options).format;
    this.currentTrackTimPos = '[' + posDateTime(pos) + '|' + posDateTime(total) + ']';

    this.track.position += 250;
  }

  onPlayerMethod(): void {
    if (this.currentMethod === 'playing') {
      this.serverCtrlService.wsPackages.next(
        new WsPackage('patch', 'player/control', {state: 'pause'})
      );

    } else {
      this.serverCtrlService.wsPackages.next(
        new WsPackage('patch', 'player/control', {state: 'play'})
      );
    }
  }

}
