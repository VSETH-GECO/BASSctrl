export class Track {
  id: number;
  uri: string;
  userID: string;
  userName: string;
  title: string;
  votes: number;
  voters: any;
  length: number;
  position: number;

  thumbnail: string;
  percent: number;
  posString: string;
  startAt: number;
  isFavorite: boolean;
  userVote: number;
}
