import {Component, Input, OnInit} from '@angular/core';
import {WsPackage} from './ws-package';
import {CookieService} from 'angular2-cookie/core';
import {WebsocketHandler} from './websocket-handler';
import {WebSocketService} from './websocket.service';

@Component({
  selector: 'app-login',
  templateUrl: '/login.component.html',
})
export class LoginComponent implements OnInit {
  @Input() username: string;
  @Input() password: string;
  @Input() loggingIn: boolean;

  constructor(private wsService: WebSocketService) {
    this.wsService.connect('');
  }

  ngOnInit(): void {
    WebsocketHandler.login = this;
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

  abortLogin(): void {
    this.username = null;
    this.password = null;
  }

  public loginWToken(): void {
    let token;
    if (token = new CookieService().get('token')) {
      this.wsService.send(
        new WsPackage('post', 'user/login', {
          token: token
        })
      );
    }
  }

  public setToken(token): void {
    new CookieService().put('token', token);
  }
}
