import {ServerCtrlService} from './server-ctrl.service';
import {WebSocketService} from './websocket.service';
import {Component, Input, OnInit} from '@angular/core';
import {CookieService} from "angular2-cookie/core";
import {WsPackage} from "./ws-package";
import {WebsocketHandler} from "./websocket-handler";

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    WebSocketService,
    ServerCtrlService
  ]
})
export class MainViewComponent implements OnInit {
  playlist;
  @Input() requestUri: string;

  submitPending = false;

  username;

  constructor(private wsService: ServerCtrlService) {
    wsService.wsPackages.subscribe(msg => {
      console.log(msg);

      switch (msg.method) {
        case 'get':
          WebsocketHandler.get(msg);
          break;

        case 'post':
          WebsocketHandler.post(msg);
          break;

        case 'patch':
          WebsocketHandler.patch(msg);
          break;

        case 'delete':
          WebsocketHandler.delete(msg);
          break;
      }
    });
  }

  ngOnInit(): void {
    WebsocketHandler.app = this;
  }

  // Playlist section
  voteTrack(track, vote): void {
    this.wsService.wsPackages.next(
      new WsPackage('patch', 'track/vote', {
        id: track.id,
        vote: vote
      }));
  }

  public setPlaylist(tracks): void {
    this.playlist = tracks;
  }

  reload(): void {
    // Fetch current track
    this.wsService.wsPackages.next(
      new WsPackage('get', 'player/current', null));

    // Fetch playlist
    this.wsService.wsPackages.next(
      new WsPackage('get', 'queue/all', null));

    // Fetch player state
    this.wsService.wsPackages.next(
      new WsPackage('get', 'player/state', null));
  }

  // Submit section

  submitRequest(): void {
    if (this.requestUri) {
      this.wsService.send(
        new WsPackage('post', 'queue/uri', {
          uri: this.requestUri
        })
      );
      this.submitPending = true;
    } else {
      alert('Please enter a uri');
    }
  }

  setUsername(username): void {
    this.username = username;
  }

  logout(): void {
    let token;
    if (token = new CookieService().get('token')) {
      this.wsService.send(
        new WsPackage('delete', 'user/logout', {
          token: token
        })
      );
    }
  }
}
