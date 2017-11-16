import {Component, OnInit} from '@angular/core';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {Router} from '@angular/router';
import {WsPackage} from '../services/socket/ws-package';
import {MatSnackBar} from '@angular/material';
import {Action, Resource} from '../services/socket/api';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['../app.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites;

  constructor(private ws: WebSocketService, private wsHandler: WsHandlerService, private router: Router, private snackBar: MatSnackBar) {
    wsHandler.favoritesSubject.subscribe(data => {
      if (typeof data.favorites !== 'undefined') {
        this.favorites = data.favorites ? data.favorites : null;
      }

      if (typeof data.isReady !== 'undefined') {
        ws.send(new WsPackage(Resource.FAVORITES, Action.GET, null));
      }
    });
  }

  ngOnInit(): void {
    this.ws.send(new WsPackage(Resource.FAVORITES, Action.GET, null));
  }

  submitRequest(uri: string): void {
    this.ws.send(
      new WsPackage(Resource.QUEUE, Action.URI, {
        uri: uri
      })
    );
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
