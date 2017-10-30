import {Component, Input, OnInit} from '@angular/core';
import {ServerCtrlService} from './server-ctrl.service';
import {WsPackage} from './ws-package';
import {WebsocketHandler} from './websocket-handler';

@Component({
  selector: 'app-register',
  templateUrl: '/register.component.html',
})
export class RegisterComponent implements OnInit {
  @Input() newUserName: string;
  @Input() newUserPassword: string;

  constructor(private wsService: ServerCtrlService) {}

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

  ngOnInit(): void {
    WebsocketHandler.reg = this;
  }

}
