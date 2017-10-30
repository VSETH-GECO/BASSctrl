import {Observable} from 'rxjs/Observable';
import {PlayerComponent} from './player.component';
import {AppComponent} from './app.component';
import {LoginComponent} from './login.component';
import {CookieService} from "angular2-cookie/core";

export class WebsocketHandler {
  public static player: PlayerComponent;
  public static login: LoginComponent;
  public static app: AppComponent;

  public static get(msg): void {

  }


  public static post(msg): void {
    switch (msg.type) {
      case 'ack':
        WebsocketHandler.app.requestUri = null;
        WebsocketHandler.app.submitPending = false;
        break;

      case 'queue/all':
        WebsocketHandler.app.setPlaylist(msg.data);
        break;

      case 'player/current':
        WebsocketHandler.player.setCurrentTrack(msg.data);
        break;

      case 'app/welcome':
        WebsocketHandler.login.loginWToken();
        WebsocketHandler.app.reload();
        WebsocketHandler.app.loggingIn = false;
        break;

      case 'user/token':
        WebsocketHandler.login.setToken(msg.data.token);
        WebsocketHandler.app.setUsername(msg.data.username);
        WebsocketHandler.app.loggingIn = false;
        WebsocketHandler.app.reload();
        break;

      case 'user/logout':
        WebsocketHandler.app.username = null;
        new CookieService().remove('token');
        break;

      case 'player/control':
        WebsocketHandler.player.currentMethod = msg.data.state;

        switch (msg.data.state) {
          case 'playing':
            WebsocketHandler.player.currentMethodIcon = 'pause';
            Observable.interval(250)
              .takeWhile(() => WebsocketHandler.player.currentMethod === 'playing')
              .subscribe(() => WebsocketHandler.player.updateTrackProgress());
            break;
          case 'paused':
            WebsocketHandler.player.currentMethodIcon = 'play_arrow';
            break;

          case 'stopped':
            WebsocketHandler.player.track = null;
            break;
        }
        break;

      case 'user/unauthorized':
        if (msg.data.type === 'queue/uri') {
          WebsocketHandler.app.submitPending = false;
          alert(msg.data.message);
        }
    }
  }


  public static patch(msg): void {

  }


  public static delete(msg): void {

  }
}
