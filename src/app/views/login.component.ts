import {Component, Input} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {MatSnackBar} from '@angular/material';
import {Action, Resource} from '../services/socket/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: ['.mat-form-field {width: 300px; max-width: 400px}']
})
export class LoginComponent {
  @Input() username: string;
  @Input() password: string;
  @Input() loggingIn: boolean;

  constructor(private wsService: WebSocketService, private wsHandler: WsHandlerService,
              private snackBar: MatSnackBar) {
    wsHandler.userSubject.subscribe(data => {
      if (data.action) {
        if (data.action === Action.ERROR) {
          snackBar.open(data.message);
        }
      }
    });
  }

  login(): void {
    if (this.username && this.password) {

      this.wsService.send(
        new WsPackage(Resource.USER, Action.LOGIN, {
          username: this.username,
          password: this.password
        })
      );
    } else {
      this.snackBar.open('Enter both username and password to proceed');
    }
  }
}
