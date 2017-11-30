import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {Track} from '../util/track';
import {QueueService} from '../services/queue.service';
import {SnackbarService} from '../services/snackbar.service';
import {TrackService} from '../services/track.service';
import {FavoriteService} from '../services/favorite.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './queue.component.html',
  styleUrls: ['../app.component.css']
})
export class QueueComponent implements OnInit {
  queue;
  favorites;
  submitPending;
  @Input() requestUri: string;
  displayedColumns = ['title', 'user', 'votes', 'actions'];
  dataSource;

  constructor(private queueService: QueueService, private trackService: TrackService, private sb: SnackbarService, private router: Router,
              private favoriteService: FavoriteService) {
  }

  ngOnInit(): void {
    this.dataSource = new PlaylistDataSource(this.queueService);

    this.queueService.getSubmitPending().subscribe(status => this.submitPending = status);
  }

  voteTrack(track, vote): void {
    this.trackService.vote(track, vote);
  }

  favorite(track): void {
    this.favoriteService.favorite(track);
  }

  submitRequest(uri?: string): void {
    console.log(uri);
    if (!this.requestUri) {
      // this.sb.openSnackbar('You have to login', 5000, {name: 'Login', callback: () => {this.router.navigateByUrl('/login'); }});
      this.sb.openSnackbar('Please enter a uri');
    } else {
      this.queue.submitRequest(this.requestUri);
    }
  }

  openFavorites(): void {
    this.router.navigateByUrl('/favorites');
  }
}

export class PlaylistDataSource extends DataSource<any> {
  constructor(private queueService: QueueService) {
    super();
  }

  connect(): Observable<Track[]> {
    return this.queueService.getQueue();
  }

  disconnect() {}
}
