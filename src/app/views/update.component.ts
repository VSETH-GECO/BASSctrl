import {Component, OnInit} from '@angular/core';
import {SnackbarService} from '../services/snackbar.service';
import {HttpClient} from '@angular/common/http';
import {WebSocketService} from '../services/socket/websocket.service';
import {Action, Resource} from '../services/socket/api';
import {WsPackage} from '../services/socket/ws-package';

interface JenkinsResponse {
  actions: any;
  artifacts: any;
  building: boolean;
  changeSets: any;
  culprits: any;
  description: any;
  displayName: string;
  duration: number;
  estimatedDuration: number;
  executor: any;
  fullDisplayName: string;
  id: string;
  keepLog: boolean;
  nextBuild: any;
  number: number;
  previousBuild: any;
  queueId: number;
  result: string;
  timestamp: number;
  url: string;
  _class: string;
}

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
})
export class UpdateComponent implements OnInit {
  branch: string;
  devInfo = 'currently no information';
  masterInfo = 'currently no information';
  updateStatus: string;

  constructor (private sb: SnackbarService,
               private http: HttpClient,
               private ws: WebSocketService) {

    ws.wsPackages.subscribe(msg => {
      if (msg.resource === Resource.APP && msg.action === Action.UPDATE) {
        sb.openSnackbar(msg.data.status);
        this.updateStatus = msg.data.status;
      }
    });
  }


  ngOnInit(): void {
    this.http.get<JenkinsResponse>('https://jenkins.stammgruppe.eu/job/BASS/job/dev/lastSuccessfulBuild/api/json')
      .subscribe(data => {
        const date = new Date(data.timestamp);
        this.devInfo = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    });
    this.http.get<JenkinsResponse>('https://jenkins.stammgruppe.eu/job/BASS/job/master/lastSuccessfulBuild/api/json')
      .subscribe(data => {
        const date = new Date(data.timestamp);
        this.masterInfo = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    });
  }

  update(): void {
    if (this.branch) {
      switch (this.branch) {
        case 'dev':
        case 'master':
          this.ws.send(
            new WsPackage(Resource.APP, Action.UPDATE, {branch: this.branch})
          );
          break;

        default:
          this.sb.openSnackbar('No branch selected!');
      }
    }
  }
}
