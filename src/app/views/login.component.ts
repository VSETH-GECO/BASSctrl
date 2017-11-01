import {Component, Input} from '@angular/core';
import {WsPackage} from '../socket/ws-package';
import {WebSocketService} from '../socket/websocket.service';
import {WsHandlerService} from '../socket/ws-handler.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  @Input() username: string;
  @Input() password: string;
  @Input() loggingIn: boolean;

  constructor(private wsService: WebSocketService, private wsHandler: WsHandlerService, private router: Router) {
    wsHandler.loginSubject.subscribe(() => {
      router.navigateByUrl('/main');
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
      alert('Enter both username and password to proceed');
    }
  }
}
