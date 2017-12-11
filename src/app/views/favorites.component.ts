import {Component, OnInit} from '@angular/core';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {Router} from '@angular/router';
import {WsPackage} from '../services/socket/ws-package';
import {MatSnackBar} from '@angular/material';
import {Action, Resource} from '../services/socket/api';
import {Track} from '../util/track';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['../app.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites;
  lastRemoved: Track;

  constructor(private ws: WebSocketService, private wsHandler: WsHandlerService, private router: Router, private snackBar: MatSnackBar) {
    wsHandler.appSubject.subscribe(data => {
      if (data.isReady) {
        ws.send(new WsPackage(Resource.FAVORITES, Action.GET, null));
      }
    });

    wsHandler.favoritesSubject.subscribe(data => {
      if (typeof data.favorites !== 'undefined') {
        this.favorites = data.favorites ? data.favorites : null;
      }

      if (data.action === Action.SUCCESS && data.data.action === 'delete') {
        this.openSnackBar('Track deleted', 'Undo', 10000);
      }
    });
  }

  ngOnInit(): void {
    this.ws.send(new WsPackage(Resource.FAVORITES, Action.GET, null));
  }

  submitRequest(uri: string): void {
    this.ws.send(
      new WsPackage(Resource.QUEUE, Action.ADD, {
        uri: uri
      })
    );
  }

  removeFavorite(track): void {
    this.lastRemoved = track;
    this.ws.send(
      new WsPackage(Resource.FAVORITES, Action.DELETE, {
        uri: track.uri
      }));
  }

  openSnackBar(message, action, duration: number): void {
    const onAction = this.snackBar.open(message, action, {
      duration: duration
    }).onAction();

    onAction.subscribe(() => {
      this.ws.send(
        new WsPackage(Resource.FAVORITES, Action.ADD, {
          uri: this.lastRemoved.uri,
          title: this.lastRemoved.title
        }));
    });
  }
}
