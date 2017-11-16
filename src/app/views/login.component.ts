import {Component, Input} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {Action, Resource} from '../services/socket/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  @Input() username: string;
  @Input() password: string;
  @Input() loggingIn: boolean;

  constructor(private wsService: WebSocketService, private wsHandler: WsHandlerService,
              private snackBar: MatSnackBar, private router: Router) {
    wsHandler.userSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.ERROR:
            this.openSnackBar(data.message, null, 2000);
            break;

          case Action.LOGIN:
            this.openSnackBar('Logged in', null, 2000);
            router.navigateByUrl('/main');
            break;

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
      this.openSnackBar('Enter both username and password to proceed', null, 2000);
    }
  }

  openSnackBar(message, action, duration: number): void {
    this.snackBar.open(message, action, {
      duration: duration,
      verticalPosition: 'top',
    });
  }
}
