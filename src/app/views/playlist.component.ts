import {Component, Input, OnInit} from '@angular/core';
import {WsHandlerService} from '../socket/ws-handler.service';
import {WebSocketService} from '../socket/websocket.service';
import {WsPackage} from '../socket/ws-package';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['../app.component.css']
})
export class PlaylistComponent implements OnInit {
  playlist;
  submitPending = false;
  @Input() requestUri: string;

  constructor(private wsService: WebSocketService, wsHandler: WsHandlerService) {
    wsHandler.playlistSubject.subscribe(data => {
      if (!(typeof data.playlist === 'undefined')) {
        this.playlist = data.playlist;
      }
      if (!(typeof data.submitPending === 'undefined')) {
        this.submitPending = data.submitPending;
      }
      if (!(typeof data.requestUri === 'undefined')) {
        this.requestUri = data.requestUri;
      }
      if (data.isReady) {
        this.wsService.send(new WsPackage('get', 'queue/all', null));
      }

    });
  }

  ngOnInit(): void {
    this.wsService.send(new WsPackage('get', 'queue/all', null));
  }

  voteTrack(track, vote): void {
    this.wsService.send(
      new WsPackage('patch', 'track/vote', {
        id: track.id,
        vote: vote
      }));
  }

  submitRequest(): void {
    if (this.requestUri) {
      this.wsService.send(
        new WsPackage('post', 'queue/uri', {
          uri: this.requestUri
        })
      );
      this.submitPending = true;
    } else {
      // TODO Snackbar
      alert('Please enter a uri');
    }
  }
}
