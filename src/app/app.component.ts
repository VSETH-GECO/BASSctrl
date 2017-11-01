import {Component} from '@angular/core';
import {WebSocketService} from './socket/websocket.service';
import {WsPackage} from './socket/ws-package';
import {WsHandlerService} from './socket/ws-handler.service';
import {LoginService} from './views/login.service';

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

    this.wsService.send(new WsPackage('post', 'alive', null));

    wsService.wsPackages.subscribe(msg => {
      // DEBUG console.log(msg);

      switch (msg.method) {
        case 'get':
          wsHandler.get(msg);
          break;

        case 'post':
          wsHandler.post(msg);
          break;

        case 'patch':
          wsHandler.patch(msg);
          break;

        case 'delete':
          wsHandler.delete(msg);
          break;
      }
    });

    wsHandler.appSubject.subscribe(data => {
      if (!(typeof data.username === 'undefined')) {
        this.username = data.username;
      }
    });
  }

  logout(): void {
    this.loginService.logout();
  }
}
