import { Component } from '@angular/core';
import {Track} from './track';

const track: Track = {id: 1, title: 'Schostakovich 5', submitter: null};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
}
