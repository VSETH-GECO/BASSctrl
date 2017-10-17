export class WebsocketHandler {
  public static get(app, msg): void {

  }


  public static post(app, msg): void {
    switch (msg.type) {
      case 'queue/all':
        app.setPlaylist(msg.data);
        break;

      case 'player/current':
        app.setCurrentTrack(msg.data);
        break;

      case 'app/welcome':
        app.reload();
        break;

      case 'player/control':
        app.currentMethod = msg.data;
        break;
    }
  }


  public static patch(app, msg): void {

  }


  public static delete(app, msg): void {

  }
}
