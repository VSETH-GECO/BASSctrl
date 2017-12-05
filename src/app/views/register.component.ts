import {Component, Input} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {Action, Resource} from '../services/socket/api';
import {SnackbarService} from '../services/snackbar.service';
import {UserService} from '../services/user.service';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';

export interface User {
  userID: number;
  name: string;
  password: string;
  isAdmin: boolean;
  isEdited: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  @Input() newUserName: string;
  @Input() newUserPassword: string;
  displayedColumns = ['name', 'admin', 'actions'];
  dataSource;

  constructor(private ws: WebSocketService, private wsHandler: WsHandlerService,
              public sb: SnackbarService, private userService: UserService) {
    this.dataSource = new UserListDataSource(this.userService);

    this.wsHandler.userSubject.subscribe(data => {
      if (data.action) {
        switch (data.action) {
          case Action.ADD:
            this.sb.openSnackbar('User added');
            break;

          case Action.ERROR: {
            this.sb.openSnackbar(data.message);
            break;
          }
        }
      }
    });
  }

  registerNewUser(): void {
    if (this.newUserName && this.newUserPassword) {
      this.ws.send(
        new WsPackage(Resource.USER, Action.ADD, {
          username: this.newUserName,
          password: this.newUserPassword
        })
      );

      this.newUserName = null;
      this.newUserPassword = null;
    }
  }

  deleteUser(user: User): void {
    this.ws.send(new WsPackage(Resource.USER, Action.DELETE, {userID: user.userID}));
  }

  setAdmin(user: User): void {
    this.ws.send(new WsPackage(Resource.USER, Action.UPDATE, {userID: user.userID, admin: !user.isAdmin}));
  }

  editUsername(user: User): void {
    this.ws.send(new WsPackage(Resource.USER, Action.UPDATE, {userID: user.userID, name: user.name}));
  }

  editPassword(user: User): void {
    this.ws.send(new WsPackage(Resource.USER, Action.UPDATE, {userID: user.userID, password: user.password}));
    user.password = null;
  }
}

export class UserListDataSource extends DataSource<any> {
  constructor(private userService: UserService) {
    super();
  }

  connect(): Observable<User[]> {
    return this.userService.getUserList();
  }

  disconnect() {}
}
