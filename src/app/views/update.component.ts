import {Component, OnInit} from '@angular/core';
import {SnackbarService} from '../services/snackbar.service';
import {HttpClient} from '@angular/common/http';
import {WebSocketService} from '../services/socket/websocket.service';
import {Action, Resource} from '../services/socket/api';
import {WsPackage} from '../services/socket/ws-package';
import {WsHandlerService} from '../services/socket/ws-handler.service';

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

class Branch {
  name: string;
  info: string;
}

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['../app.component.css']
})
export class UpdateComponent implements OnInit {
  mode = 'indeterminate';
  branch: string;
  branches: Branch[];
  loading: number;
  updateStatus: string;
  progress: number;
  baseURL = 'https://jenkins.stammgruppe.eu/';

  constructor (private sb: SnackbarService,
               private ws: WebSocketService,
               private wsHandler: WsHandlerService,
               private http: HttpClient) {

    wsHandler.appSubject.subscribe(data => {
      if (data.status) {
        this.updateStatus = data.status;
        this.mode = 'determinate';
      } else if (data.progress) {
        this.progress = data.progress;
      }
    });
  }


  ngOnInit(): void {
    this.loading = 1;
    this.branches = [];
    this.http.get<any>(this.baseURL + 'job/BASS/api/json')
      .subscribe(data => {
        this.loading = data.jobs.length;
        for (const job of data.jobs) {

          const branch = new Branch();
          branch.name = job.name;
          this.http.get<JenkinsResponse>('https://jenkins.stammgruppe.eu/job/BASS/job/' + job.name + '/lastSuccessfulBuild/api/json')
            .subscribe(data1 => {
              const date = new Date(data1.timestamp);
              branch.info = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            });

          this.branches.push(branch);
          this.loading--;
        }
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
