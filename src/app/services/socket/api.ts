/*export enum Resource {
  APP = 'app',
  USER = 'user',
  TRACK = 'track',
  QUEUE = 'queue',
  PLAYER = 'player',
  FAVORITES = 'favorites'
}*/
export enum Resource {
  APP,
  USER,
  TRACK,
  QUEUE,
  PLAYER,
  FAVORITES
}

export enum Action {
  GET, SET, ADD, DELETE, LOGIN, LOGOUT, INFORM, URI, REGISTER, VOTE, SETADMIN, SUCCESS, ERROR, DATA
}
