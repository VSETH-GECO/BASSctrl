import {Component, OnInit} from '@angular/core';
import {WebSocketService} from './services/socket/websocket.service';
import {WsPackage} from './services/socket/ws-package';
import {WsHandlerService} from './services/socket/ws-handler.service';
import {Action, Resource} from './services/socket/api';
import {MatSnackBar} from '@angular/material';
import {SnackbarService} from './services/snackbar.service';
import {UserService} from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    WebSocketService,
    WsHandlerService,
    UserService,
    SnackbarService
  ]
})
export class AppComponent implements OnInit {
  title = 'BASS control';
  username: string;
  isAdmin: boolean;

  constructor(private ws: WebSocketService, private wsHandler: WsHandlerService,
              private userService: UserService, private snackBar: MatSnackBar,
              private sb: SnackbarService) {

    // ws.connect().subscribe();
    this.ws.send(new WsPackage(Resource.APP, Action.INFORM, null));

    ws.wsPackages.subscribe(msg => {
      let res: Resource;
      res = msg.resource;
      switch (res) {
        case Resource.APP:
          wsHandler.app(msg);
          break;

        case Resource.USER:
          wsHandler.user(msg);
          break;

        case Resource.QUEUE:
          wsHandler.queue(msg);
          break;

        case Resource.TRACK:
          wsHandler.track(msg);
          break;

        case Resource.PLAYER:
          wsHandler.player(msg);
          break;

        case Resource.FAVORITES:
          wsHandler.favorites(msg);
          break;
      }
    });

    wsHandler.appSubject.subscribe(data => {
      if (data.action && data.action === Action.ERROR) {
        this.openSnackBar(data.message, 2000);
      }
    });

    sb.getSubject().subscribe(msg => {
      this.openSnackBar(msg.message, msg.duration, msg.action ? msg.action : null);
    });
  }

  ngOnInit(): void {
    this.userService.getUsername()
      .subscribe(username => this.username = username);

    this.userService.isAdmin()
      .subscribe(isAdmin => this.isAdmin = isAdmin);
  }

  logout(): void {
    this.userService.logout();
  }

  /**
   * This opens a snackbar on the top level view which will always be visible
   *
   * @param {string} message the message to display
   * @param {number} duration how long the message should be visible
   * @param {action?: {name: string; callback: (() => void)}} action action name and a function
   *    that should be called when the user clicks on the action
   */
  private openSnackBar(message: string, duration: number, action?: {name: string, callback: () => void}): void {
    if (action) {
      // Open snackbar and get action notifier
      const a = this.snackBar.open(message, action.name, {
        duration: duration,
        verticalPosition: 'top'
      }).onAction();

      // Execute desired action
      a.subscribe(() => {
        action.callback();
      });

    } else {
      // Open snackbar without action
      this.snackBar.open(message, null, {
        duration: duration,
        verticalPosition: 'top'
      });
    }
  }
}
