import {Component, Input, OnInit} from '@angular/core';
import {ServerCtrlService} from './server-ctrl.service';
import {WsPackage} from './ws-package';
import {CookieService} from "angular2-cookie/core";
import {WebsocketHandler} from "./websocket-handler";

@Component({
  selector: 'login',
  templateUrl: '/login.component.html',
})
export class LoginComponent implements OnInit {
  @Input() username: string;
  @Input() password: string;

  constructor(private serverCtrlService: ServerCtrlService) {}

  ngOnInit(): void {
    console.log('test');
    WebsocketHandler.login = this;
  }

  login(): void {
    if (this.username && this.password) {

      this.serverCtrlService.wsPackages.next(
        new WsPackage('post', 'user/login', {
          username: this.username,
          password: this.password
        })
      );
    } else {
      alert('Enter both username and password to proceed');
    }
  }

  public loginWToken(): void {
    let token;
    if (token = new CookieService().get('token')) {
      this.serverCtrlService.wsPackages.next(
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
