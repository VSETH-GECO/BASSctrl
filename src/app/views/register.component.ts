import {Component, Input} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {MatSnackBar} from '@angular/material';
import {Action, Resource} from '../services/socket/api';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  @Input() newUserName: string;
  @Input() newUserPassword: string;

  constructor(private wsService: WebSocketService, private wsHandler: WsHandlerService, public snackBar: MatSnackBar) {
    this.wsHandler.userSubject.subscribe(data => {
      if (data.action) {

        switch (data.action) {
          case Action.REGISTER:
            this.openSnackBar('User added');
            break;

          case Action.ERROR: {
            this.openSnackBar(data.message);
            break;
          }
        }
      }
    });
  }

  registerNewUser(): void {
    if (this.newUserName && this.newUserPassword) {
      this.wsService.send(
        new WsPackage(Resource.USER, Action.REGISTER, {
          username: this.newUserName,
          password: this.newUserPassword
        })
      );

      this.newUserName = null;
      this.newUserPassword = null;
    }
  }

  openSnackBar(message) {
    this.snackBar.open(message, null, {
      duration: 2000,
      verticalPosition: 'top',
    });
  }
}
