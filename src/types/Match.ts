export interface Team {
  id: string;
  name: string;
  logo: string;
  score: number;
}

export interface Match {
  id: string;
  status: string;
  time: string;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
}