import {Component, Input} from '@angular/core';
import {WsHandlerService} from '../socket/ws-handler.service';
import {WebSocketService} from '../socket/websocket.service';
import {WsPackage} from '../socket/ws-package';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Track} from '../util/track';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['../app.component.css']
})
export class PlaylistComponent {
  playlist;
  playlistUpdate = new Subject<any>();
  submitPending = false;
  @Input() requestUri: string;
  displayedColumns = ['title', 'user', 'votes', 'actions'];
  dataSource = new PlaylistDataSource(this);

  constructor(private wsService: WebSocketService, wsHandler: WsHandlerService, private snackBar: MatSnackBar, private router: Router) {
    wsHandler.playlistSubject.subscribe(data => {
      if (!(typeof data.playlist === 'undefined')) {
        this.playlist = data.playlist.length === 0 ? null : data.playlist;
        this.playlistUpdate.next(data.playlist);
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
          this.submitPending = false;
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

  update(): void {
    this.wsService.send(new WsPackage('get', 'queue/all', null));
  }

  voteTrack(track, vote): void {
    this.wsService.send(
      new WsPackage('patch', 'track/vote', {
        id: track.id,
        vote: vote
      }));
  }

  favorite(track): void {
    this.wsService.send(
      new WsPackage('patch', 'track/vote', {
        id: track.id
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
  }
}

export class PlaylistDataSource extends DataSource<any> {
  constructor(private plComp: PlaylistComponent) {
    super();
  }

  connect(): Observable<Track[]> {
    this.plComp.update();
    return this.plComp.playlistUpdate;
  }

  disconnect() {}
}
