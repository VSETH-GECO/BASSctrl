import {Component, Input} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {Action, Resource} from '../services/socket/api';
import {SnackbarService} from '../services/snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  @Input() newUserName: string;
  @Input() newUserPassword: string;

  constructor(private ws: WebSocketService, private wsHandler: WsHandlerService, public sb: SnackbarService) {
    this.wsHandler.userSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.REGISTER:
            this.sb.openSnackbar('User added');
            break;

          case Action.ERROR: {
            this.sb.openSnackbar(data.message);
            break;
          }
        }
      }
    });
  }

  registerNewUser(): void {
    if (this.newUserName && this.newUserPassword) {
      this.ws.send(
        new WsPackage(Resource.USER, Action.REGISTER, {
          username: this.newUserName,
          password: this.newUserPassword
        })
      );

      this.newUserName = null;
      this.newUserPassword = null;
    }
  }
}
