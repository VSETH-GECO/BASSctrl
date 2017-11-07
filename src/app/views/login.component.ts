import {Component, Input} from '@angular/core';
import {WsPackage} from '../socket/ws-package';
import {WebSocketService} from '../socket/websocket.service';
import {WsHandlerService} from '../socket/ws-handler.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';

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
    wsHandler.loginSubject.subscribe(data => {
      if (data.response) {
        switch (data.response) {
          case 'success':
            this.openSnackBar('Logged in', null, 2000);
            router.navigateByUrl('/main');
            break;

          case 'invalid token':
            this.openSnackBar('Invalid token', null, 2000);
            break;
        }
      }
    });
  }

  login(): void {
    if (this.username && this.password) {

      this.wsService.send(
        new WsPackage('post', 'user/login', {
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
