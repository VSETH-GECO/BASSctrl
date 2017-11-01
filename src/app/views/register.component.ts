import {Component, Input} from '@angular/core';
import {WsPackage} from '../socket/ws-package';
import {WebSocketService} from '../socket/websocket.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  @Input() newUserName: string;
  @Input() newUserPassword: string;

  constructor(private wsService: WebSocketService) {}

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
}
