import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class SnackbarService {
  private subject = new Subject<any>();

  public openSnackbar(message: string, duration?: number, action?: {name: string, callback: () => void}): void {
    if (!duration) {
      duration = 2000;
    }

    if (action) {
      this.subject.next({message: message, duration: duration, action: action});
    } else {
      this.subject.next({message: message, duration: duration});
    }
  }

  public getSubject(): Subject<any> {
    return this.subject;
  }
}
