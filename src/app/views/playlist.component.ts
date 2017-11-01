import {Component, Input, OnInit} from '@angular/core';
import {WsHandlerService} from '../socket/ws-handler.service';
import {WebSocketService} from '../socket/websocket.service';
import {WsPackage} from '../socket/ws-package';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['../app.component.css']
})
export class PlaylistComponent implements OnInit {
  playlist;
  submitPending = false;
  @Input() requestUri: string;

  constructor(private wsService: WebSocketService, wsHandler: WsHandlerService, private snackBar: MatSnackBar, private router: Router) {
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
      if (data.response) {
        if (data.response === 'unauthorized') {
          this.openSnackBar('You need to login.', 'Login', 5000);
        }

        if (data.response === 'success') {
          this.openSnackBar('Success', null, 1500);
          this.submitPending = false;
        }

        if (data.response === 'no matches') {
          this.openSnackBar('No matches', null, 2000);
          this.submitPending = false;
        }
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
      this.openSnackBar('Please enter a uri', null, 2000);
    }
  }

  openSnackBar(message, action, duration: number): void {
    const onAction = this.snackBar.open(message, action, {
      duration: duration,
      verticalPosition: 'top',
    }).onAction();

    onAction.subscribe(() => {
      this.router.navigateByUrl('/login');
    });

    this.submitPending = false;
  }
}
