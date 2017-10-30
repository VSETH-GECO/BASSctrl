import {ServerCtrlService} from './server-ctrl.service';
import {WebsocketService} from './websocket.service';
import {Component} from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  providers: [
    WebsocketService,
    ServerCtrlService
  ]
})
export class OverviewComponent {

}
