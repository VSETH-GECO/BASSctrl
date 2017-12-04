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
    this.dataSource = new PlaylistDataSource(this.queueService);
  }

  ngOnInit(): void {
    this.queueService.getSubmitPending().subscribe(status => this.submitPending = status);
    this.queueService.getQueue().subscribe(queue => this.queue = queue);
  }

  voteTrack(track, vote): void {
    this.trackService.vote(track, vote);
  }

  favorite(track): void {
    this.favoriteService.favorite(track);
  }

  submitRequest(): void {
    if (!this.requestUri) {
      // this.sb.openSnackbar('You have to login', 5000, {name: 'Login', callback: () => {this.router.navigateByUrl('/login'); }});
      this.sb.openSnackbar('Please enter a uri');
    } else {
      this.queueService.submitRequest(this.requestUri);
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
