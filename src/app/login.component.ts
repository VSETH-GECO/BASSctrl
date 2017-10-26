import {Component, Input} from '@angular/core';
import {ServerCtrlService} from './server-ctrl.service';
import {WsPackage} from './ws-package';

@Component({
  selector: 'login',
  templateUrl: '/login.component.html',
})
export class LoginComponent {
  @Input() username: string;
  @Input() password: string;

  constructor(private serverCtrlService: ServerCtrlService) {}

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
}
