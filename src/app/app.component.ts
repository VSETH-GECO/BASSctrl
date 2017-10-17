import { Component, OnInit, Input } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { WsPackage } from './ws-package';
import {ServerCtrlService} from './server-ctrl.service';
import {WebsocketHandler} from './websocket-handler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    WebsocketService,
    ServerCtrlService
  ]
})
export class AppComponent implements OnInit {
  title = 'BASS control';
  playlist;
  @Input() requestUri: string;

  // Player, should be refactored into it's own component later on
  currentMethod = 'Play';
  currentTrack;


  constructor(private serverCtrlService: ServerCtrlService) {
    serverCtrlService.wsPackages.subscribe(msg => {
      console.log(msg);

      switch (msg.method) {
        case 'get':
          WebsocketHandler.get(this, msg);
          break;

        case 'post':
          WebsocketHandler.post(this, msg);
          break;

        case 'patch':
          WebsocketHandler.patch(this, msg);
          break;

        case 'delete':
          WebsocketHandler.delete(this, msg);
          break;
      }
    });
  }

  onPlayerMethod(): void {
    if (this.currentMethod === 'Play') {
      this.serverCtrlService.wsPackages.next(
        new WsPackage('post', 'player/control/pause', null)
      );

    } else {
      this.serverCtrlService.wsPackages.next(
        new WsPackage('post', 'player/control/play', null)
      );
    }
  }

  public setCurrentTrack(track): void {
    this.currentTrack = track;
  }
  // End of Player section

  // Playlist section
  voteTrack(track, vote): void {
    this.serverCtrlService.wsPackages.next(
      new WsPackage('patch', 'track/vote', {
        id: track.id,
        vote: vote,
        userID: 'placeholder'
      }));
  }

  public setPlaylist(tracks): void {
    this.playlist = tracks;
  }

  // on init of the app
  ngOnInit(): void {
  }

  reload(): void {
    // Fetch current track
    this.serverCtrlService.wsPackages.next(
      new WsPackage('get', 'player/current', null));

    // Fetch playlist
    this.serverCtrlService.wsPackages.next(
      new WsPackage('get', 'queue/all', null));
  }

  // Submit section

  submitRequest(): void {
    if (this.requestUri) {
      if (this.serverCtrlService.wsPackages.next(
         new WsPackage('post', 'queue/uri', {
           uri: this.requestUri,
           userID: 'placeholder'
         })
        )) {
        this.requestUri = null;
      }
    } else {
      alert('Please enter a uri');
    }
  }
}
