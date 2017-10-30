import {Component} from '@angular/core';
import {WebSocketService} from './websocket.service';
import {ServerCtrlService} from './server-ctrl.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    WebSocketService,
    ServerCtrlService
  ]
})
export class AppComponent{
  title = 'BASS control';
}
