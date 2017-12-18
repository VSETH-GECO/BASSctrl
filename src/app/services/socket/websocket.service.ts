import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

/**
 * Websocket service
 *
 * Essentialy a websocket but actually useful not like the standard
 * implementation.
 *
 * Adapted from David Doran's version:
 * https://github.com/daviddoran/typescript-reconnecting-websocket/blob/master/reconnecting-websocket.ts
 */
@Injectable()
export class WebSocketService {
  public reconnectInterval = 1000;
  public timeoutInterval = 2000;
  public readyState: number;

  private forcedClose = false;
  private timedOut = false;
  private ws: WebSocket;
  private url: string;

  public onopen: (ev: Event) => void = function (event: Event) {};
  public onerror: (ev: Event) => void = function (event: Event) {};
  public onclose: (ev: CloseEvent) => void = function (event: CloseEvent) {};
  public onmessage: (ev: MessageEvent) => void = function (event: MessageEvent) {};
  public onconnecting: () => void = function () {};

  /**
   * Sets a url for the websocket and then tries to connect it to that url.
   *
   * @param {string} url to connect to
   */
  public connectTo(url: string) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.connect(false);
  }

  private connect(reconnectAttempt: boolean) {
    this.ws = new WebSocket(this.url);

    this.onconnecting();

    const localWs = this.ws;
    const timeout = setTimeout(() => {
      this.timedOut = true;
      localWs.close();
      this.timedOut = false;
    }, this.timeoutInterval);

    this.ws.onopen = (event: Event) => {
      clearTimeout(timeout);
      this.readyState = WebSocket.OPEN;
      reconnectAttempt = false;
      this.onopen(event);
    };

    this.ws.onclose = (event: CloseEvent) => {
      clearTimeout(timeout);
      this.ws = null;
      if (this.forcedClose) {
        this.readyState = WebSocket.CLOSED;
        this.onclose(event);
      } else {
        this.readyState = WebSocket.CONNECTING;
        this.onconnecting();
        if (!reconnectAttempt && !this.timedOut) {
          this.onclose(event);
        }
        setTimeout(() => {
          this.connect(true);
        }, this.reconnectInterval);
      }
    };
    this.ws.onmessage = (event) => {
      this.onmessage(event);
    };
    this.ws.onerror = (event) => {
      this.onerror(event);
    };
  }

  /**
   * Send something over the websocket connection.
   * The object will be converted to a json string.
   *
   * @param data to send
   */
  public send(data: any) {
    if (this.ws) {
        return this.ws.send(JSON.stringify(data));
    } else {
        throw new Error('INVALID_STATE_ERR : Pausing to reconnect websocket');
    }
  }

  /**
   * Closes the websocket.
   *
   * @returns {boolean} true if the websocket was forcefully closed
   */
  public close(): boolean {
    if (this.ws) {
      this.forcedClose = true;
      this.ws.close();
      return true;
    }
    return false;
  }

  /**
   * Closes and then re-opens the websocket.
   *
   * @returns {boolean} true if the websocket was forcefully closed
   */
  public refresh(): boolean {
    if (this.ws) {
      this.ws.close();
      return true;
    }
    return false;
  }
}
