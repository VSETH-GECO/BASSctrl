import { Component, OnInit } from '@angular/core';
import {Track} from './track';
import {WebsocketService} from './websocket.service';

const track: Track = {id: 1, title: 'Schostakovich 5', submitter: null};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [WebsocketService]
})
export class AppComponent implements OnInit {
  title = 'BASS control';

  // Player, should be refactored into it's own component later on
  currentMethod = 'Play';
  currentTrack = track;

  onPlayerMethod(): void {
    if (this.currentMethod === 'Play') {

      this.currentMethod = 'Pause';
    } else {
      this.currentMethod = 'Play';
    }
  }


  // This plus onInit should connect the websocket
  constructor(private websocketService: WebsocketService) { }
  connectToWebsocket(): void {
    this.websocketService.connect('ws://localhost:8080');
  }

  // on init of the app
  ngOnInit(): void {
    this.connectToWebsocket();
  }
}
