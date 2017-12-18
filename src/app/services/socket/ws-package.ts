import {Action, Resource} from './api';

export class WsPackage {
  resource: Resource;
  action: Action;
  data: any;

  constructor(resource: Resource, action: Action, data: any) {
    this.resource = resource;
    this.action = action;
    this.data = data;
  }
}
