import { Component, OnInit, Input } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { WsPackage } from './ws-package';
import { PLAYLIST } from './playlist';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [WebsocketService]
})
export class AppComponent implements OnInit {
  title = 'BASS control';
  playlist;
  @Input() requestUri: string;

  // Player, should be refactored into it's own component later on
  currentMethod = 'Play';
  currentTrack;

  // This plus onInit should connect the websocket
  constructor(private websocketService: WebsocketService) { }

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
    this.websocketService.send(
      new WsPackage('update', 'queue/votes', {
        id: track.id,
        vote: vote
      }));
  }

  setPlaylist(tracks): void {
    this.playlist = tracks;
  }

  // on init of the app
  ngOnInit(): void {

    // Fetch current track
    this.websocketService.send(
      new WsPackage('retrieve', 'player/current', null));

    // Fetch playlist
    this.websocketService.send(
      new WsPackage('retrieve', 'queue/all', null));

    // simulate getting playlist
    this.setPlaylist(PLAYLIST);
  }

  // Submit section

  submitRequest(): void {
    if (this.requestUri) {
      if (this.websocketService.send(
         new WsPackage('create', 'queue/uri', {uri: this.requestUri})
        )) {
        this.requestUri = null;
      }
    } else {
      alert('Please enter a uri');
    }
  }
}
