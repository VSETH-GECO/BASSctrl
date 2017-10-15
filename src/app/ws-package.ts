/*export class WsPackage {

  constructor(
    public method: string,
    public type: string,
    public data: object
  ) { }
}*/

export class WsPackage {
  method: string;
  type: string;
  data: object;

  constructor(method: string, type: string, data: object) {
    this.method = method;
    this.type = type;
    this.data = data;
  }
}
