import {Component, Input, OnInit} from '@angular/core';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsPackage} from '../services/socket/ws-package';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Track} from '../util/track';
import {Action, Resource} from '../services/socket/api';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['../app.component.css']
})
export class PlaylistComponent implements OnInit {
  playlist;
  favorites;
  playlistUpdate = new Subject<any>();
  submitPending = false;
  @Input() requestUri: string;
  displayedColumns = ['title', 'user', 'votes', 'actions'];
  dataSource = new PlaylistDataSource(this);

  constructor(private wsService: WebSocketService, wsHandler: WsHandlerService, private snackBar: MatSnackBar, private router: Router) {
    wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        this.update();
      }
    });

    wsHandler.queueSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.DATA:
            this.playlist = data.queue.length === 0 ? null : data.queue;
            this.playlistUpdate.next(data.queue);
            this.updateFavorites();
            break;

          case Action.SUCCESS:
            this.requestUri = null;
            this.submitPending = false;
            break;

          case Action.ERROR:
            this.submitPending = false;
        }
      }
    });

    wsHandler.favoritesSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.DATA:
            this.favorites = data.favorites;
            this.updateFavorites();
            break;
        }
      }
    });
  }

  ngOnInit(): void {
    this.update();
  }
  update(): void {
    this.wsService.send(new WsPackage(Resource.FAVORITES, Action.GET, null));
    this.wsService.send(new WsPackage(Resource.QUEUE, Action.GET, null));
  }

  voteTrack(track, vote): void {
    this.wsService.send(
      new WsPackage(Resource.TRACK, Action.VOTE, {
        id: track.id,
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

  updateFavorites(): void {
    if (!this.favorites || !this.playlist) {
      return;
    }

    let track: Track;
    for (const fav of this.favorites) {
      track = this.playlist.find(tr => tr.uri === fav.uri);
      if (track) {
        track.isFavorite = true;
      }
    }
  }

  submitRequest(uri?: string): void {
    if (uri) {
      this.requestUri = uri;
    }

    if (this.requestUri) {
      this.wsService.send(
        new WsPackage(Resource.QUEUE, Action.URI, {
          uri: this.requestUri
        })
      );
      this.submitPending = true;
    } else {
      this.openSnackBar('Please enter a uri', null, 2000);
    }
  }

  openFavorites(): void {
    this.router.navigateByUrl('/favorites');
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
