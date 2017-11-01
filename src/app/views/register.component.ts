import {Component, Input} from '@angular/core';
import {WsPackage} from '../socket/ws-package';
import {WebSocketService} from '../socket/websocket.service';
import {WsHandlerService} from '../socket/ws-handler.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  @Input() newUserName: string;
  @Input() newUserPassword: string;

  constructor(private wsService: WebSocketService, private wsHandler: WsHandlerService, public snackBar: MatSnackBar) {
    this.wsHandler.registerSubject.subscribe(data => {
        if (data.register !== 'undefined') {
          this.openSnackBar();
        }
      });
  }

  registerNewUser(): void {
    if (this.newUserName && this.newUserPassword) {
      this.wsService.send(
        new WsPackage('post', 'user/register', {
          username: this.newUserName,
          password: this.newUserPassword
        })
      );

      this.newUserName = null;
      this.newUserPassword = null;
    }
  }

  openSnackBar() {
    this.snackBar.open('User added', null, {
      duration: 1000,
      verticalPosition: 'top',
    });
  }
}
