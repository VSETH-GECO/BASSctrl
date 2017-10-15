import {Injectable} from '@angular/core';
import {Track} from './track';
import {PLAYLIST} from './playlist';

@Injectable()
export class PlaylistService {
  getPlaylist(): Track[] {
    return PLAYLIST;
  }
}
