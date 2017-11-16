import {Component} from '@angular/core';
import {WebSocketService} from './services/socket/websocket.service';
import {WsPackage} from './services/socket/ws-package';
import {WsHandlerService} from './services/socket/ws-handler.service';
import {LoginService} from './services/login.service';
import {Action, Resource} from './services/socket/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    WebSocketService,
    WsHandlerService,
    LoginService
  ]
})
export class AppComponent {
  title = 'BASS control';
  username: string;

  constructor(private wsService: WebSocketService, private wsHandler: WsHandlerService, private loginService: LoginService) {

    this.wsService.send(new WsPackage(Resource.APP, Action.INFORM, null));

    wsService.wsPackages.subscribe(msg => {
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

    wsHandler.userSubject.subscribe(data => {
      if (data.action) {
        if (data.action === Action.LOGIN) {
          this.username = data.username;
        }
        if (data.action === Action.LOGOUT) {
          this.username = null;
        }
      }
    });
  }

  logout(): void {
    this.loginService.logout();
  }
}
