import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class WebSocketService {
  public reconnectInterval = 1000;
  public timeoutInterval = 2000;
  public readyState: number;
  private forcedClose = false;
  private timedOut = false;
  private protocols: string[] = [];

  // The underlying WebSocket
  private ws: WebSocket;
  private url: string;

  public onopen: (ev: Event) => void = function (event: Event) {};
  public onclose: (ev: CloseEvent) => void = function (event: CloseEvent) {};
  public onconnecting: () => void = function () {};
  public onmessage: (ev: MessageEvent) => void = function (event: MessageEvent) {};
  public onerror: (ev: Event) => void = function (event: Event) {};

  constructor() {}

  /*
  constructor(url?: string, protocols?: string[] = []) {
    if (url && protocols) {
      this.url = url;
      this.protocols = protocols;
      this.readyState = WebSocket.CONNECTING;
      this.connect(false);
    }
  } */

  public connectTo(url: string) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.connect(false);
  }

  public connect(reconnectAttempt: boolean) {
        this.ws = new WebSocket(this.url, this.protocols);

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

  public send(data: any) {
    if (this.ws) {
        return this.ws.send(JSON.stringify(data));
    } else {
        throw new Error('INVALID_STATE_ERR : Pausing to reconnect websocket');
    }
  }

    /**
     * Returns boolean, whether websocket was FORCEFULLY closed.
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
     * Additional public API method to refresh the connection if still open (close, re-open).
     * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
     *
     * Returns boolean, whether websocket was closed.
     */
    public refresh(): boolean {
        if (this.ws) {
            this.ws.close();
            return true;
        }
        return false;
    }
}
