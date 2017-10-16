import { Component, OnInit, Input } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { WsPackage } from './ws-package';
import { PLAYLIST } from './playlist';
import {ServerCtrlService} from './server-ctrl.service';

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
  currentMethod = 'Pause';
  currentTrack;

  // This plus onInit should connect the websocket
  constructor(private serverCtrlService: ServerCtrlService) {
    serverCtrlService.wsPackages.subscribe(msg => {
      console.log(msg);
      if (msg.type === 'queue/all') {
        this.setPlaylist(msg.data);
      }
      if (msg.type === 'player/current') {
        this.setCurrentTrack(msg.data);
      }
    });
  }

  onPlayerMethod(): void {
    if (this.currentMethod === 'Play') {
      this.currentMethod = 'Pause';
    } else {
      this.currentMethod = 'Play';
    }
  }

  public setCurrentTrack(track): void {
    this.currentTrack = track;
  }
  // End of Player section

  // Playlist section
  voteTrack(track, vote): void {
    this.serverCtrlService.wsPackages.next(
      new WsPackage('update', 'queue/track/vote', {
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
    this.reload();

    // simulate getting playlist
    this.setPlaylist(PLAYLIST);

    console.log('hi');
  }

  reload(): void {
    // Fetch current track
    this.serverCtrlService.wsPackages.next(
      new WsPackage('retrieve', 'player/current', null));

    // Fetch playlist
    this.serverCtrlService.wsPackages.next(
      new WsPackage('retrieve', 'queue/all', null));
  }

  // Submit section

  submitRequest(): void {
    if (this.requestUri) {
      if (this.serverCtrlService.wsPackages.next(
         new WsPackage('create', 'queue/uri', {
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
