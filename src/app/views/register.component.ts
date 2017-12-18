import {Component, Inject, Input, OnInit} from '@angular/core';
import {WsPackage} from '../services/socket/ws-package';
import {WebSocketService} from '../services/socket/websocket.service';
import {WsHandlerService} from '../services/socket/ws-handler.service';
import {Action, Resource} from '../services/socket/api';
import {SnackbarService} from '../services/snackbar.service';
import {UserService} from '../services/user.service';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

export interface User {
  userID: number;
  name: string;
  password: string;
  isAdmin: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  @Input() newUserName: string;
  @Input() newUserPassword: string;
  displayedColumns = ['name', 'admin', 'actions'];
  dataSource;

  constructor(private ws: WebSocketService, private wsHandler: WsHandlerService,
              private sb: SnackbarService, private userService: UserService,
              private dialog: MatDialog) {
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

  ngOnInit(): void {
    this.userService.isAdmin().subscribe(isAdmin => this.displayedColumns = isAdmin ? ['name', 'admin', 'actions'] : ['name', 'admin']);
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

  openDeleteUserDialog(user: User): void {
    this.dialog.open(DeleteConfirmationDialogComponent, {data: {name: user.name}}).afterClosed().subscribe(result => {
      if (result && result.del) {
        this.deleteUser(user);
      }
    });
  }

  openEditDialog(user: User): void {
    this.dialog.open(UserEditorDialogComponent, {width: '400px', data: {user: user}}).afterClosed().subscribe(result => {
      if (result && result.status === 'saved') {

        // Send new user info with or without the new password
        if (result.user.password) {
          this.ws.send(new WsPackage(Resource.USER, Action.UPDATE, {
            userID: result.user.userID,
            name:   result.user.name,
            admin:  result.user.isAdmin,
            password: result.user.password
          }));
        } else {
          this.ws.send(new WsPackage(Resource.USER, Action.UPDATE, {
            userID: result.user.userID,
            name:   result.user.name,
            admin:  result.user.isAdmin
          }));
        }
        this.sb.openSnackbar('User data updated');
      }
    });
  }
}

@Component({
  selector: 'app-user-editor-dialog',
  templateUrl: './user-editor-dialog.html'
})
export class UserEditorDialogComponent {
  user: User;
  name: string;

  constructor(public dialogRef: MatDialogRef<UserEditorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.user = {name: data.user.name, userID: data.user.userID, isAdmin: data.user.isAdmin, password: null};
    this.name = data.user.name;
  }

  onCancel(): void {
    this.dialogRef.close({status: 'canceled'});
  }

  onSave(): void {
    this.dialogRef.close({status: 'saved', user: this.user});
  }
}

@Component({
  selector: 'app-delete-conf-dialog',
  templateUrl: './delete-conf-dialog.html'
})
export class DeleteConfirmationDialogComponent {
  name: string;

  constructor(public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.name = data.name;
  }

  onAbort(): void {
    this.dialogRef.close({del: false});
  }

  onConfirm(): void {
    this.dialogRef.close({del: true});
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
