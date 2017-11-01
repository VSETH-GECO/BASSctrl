import {Injectable} from '@angular/core';
import {LoginService} from '../views/login.service';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class WsHandlerService {
  public appSubject = new Subject<any>();
  public loginSubject = new Subject<any>();
  public playerSubject = new Subject<any>();
  public playlistSubject = new Subject<any>();

  constructor(private loginService: LoginService) {}

  public get(msg): void {}

  public post(msg): void {

    switch (msg.type) {
      case 'ack':
        this.playlistSubject.next({requestUri: null, submitPending: false});
        break;

      case 'queue/all':
        this.playlistSubject.next({playlist: msg.data});
        break;

      case 'player/current':
        this.playerSubject.next({track: msg.data});
        break;

      case 'app/welcome':
        this.loginService.loginWToken();
        this.playerSubject.next({isReady: true});
        this.playlistSubject.next({isReady: true});
        break;

      case 'user/token':
        this.loginService.setToken(msg.data.token);
        this.appSubject.next({username: msg.data.username});
        this.loginSubject.next();
        break;

      case 'user/logout':
        this.loginService.removeToken();
        this.appSubject.next({username: null});
        break;

      case 'player/control':
        this.playerSubject.next({state: msg.data.state});
        break;

      case 'user/unauthorized':
        if (msg.data.type === 'queue/uri') {
          this.playlistSubject.next({submitPending: false});
          // TODO Snackbar and somewhere else pl0x
          alert(msg.data.message);
        }
        break;

      case 'err':
        if (msg.data.message === 'No matches found') {
          this.playlistSubject.next({submitPending: null});
        }
    }
  }

  public patch(msg): void {}

  public delete(msg): void {}
}
