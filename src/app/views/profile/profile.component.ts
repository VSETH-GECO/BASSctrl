import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {WebSocketService} from '../../services/socket/websocket.service';
import {WsPackage} from '../../services/socket/ws-package';
import {Action, Resource} from '../../services/socket/api';
import {SnackbarService} from '../../services/snackbar.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  name: string;
  userID: number;
  isAdmin: boolean;

  pw: string;
  pwConf: string;

  constructor(private us: UserService, private ws: WebSocketService,
              private sb: SnackbarService) { }

  ngOnInit() {
    this.us.getUserID().subscribe(id => this.userID = id);
    this.us.getUsername().subscribe(name => this.name = name);
    this.us.isAdmin().subscribe(isAdmin => this.isAdmin = isAdmin);
  }

  changePassword(): void {
    if (this.pw === this.pwConf) {
      this.ws.send(new WsPackage(Resource.USER, Action.UPDATE, {password: this.pw}));
    } else {
      this.sb.openSnackbar('Passwords do not match');
    }
  }
}
