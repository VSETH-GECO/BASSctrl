import {Observable} from 'rxjs/Observable';

export class WebsocketHandler {
  public static get(app, msg): void {

  }


  public static post(app, msg): void {
    switch (msg.type) {
      case 'ack':
        app.requestUri = null;
        app.submitPending = false;
        break;

      case 'queue/all':
        app.setPlaylist(msg.data);
        break;

      case 'player/current':
        app.setCurrentTrack(msg.data);
        break;

      case 'app/welcome':
        app.loginWToken();
        app.reload();
        break;

      case 'user/token':
        app.setToken(msg.data.token);
        app.setUsername(msg.data.username);
        break;

      case 'player/control':
        app.currentMethod = msg.data.state;

        switch (msg.data.state) {
          case 'playing':
            app.currentMethodIcon = 'pause';
            Observable.interval(250)
              .takeWhile(() => app.currentMethod === 'playing')
              .subscribe(() => app.updateTrackProgress());
            break;
          case 'paused':
            app.currentMethodIcon = 'play_arrow';
            break;
        }
        break;

      case 'user/unauthorized':
        if (msg.data.type === 'queue/uri') {
          app.submitPending = false;
          alert(msg.data.message);
        }
    }
  }


  public static patch(app, msg): void {

  }


  public static delete(app, msg): void {

  }
}
