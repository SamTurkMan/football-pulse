export interface Team {
  id: string;
  name: string;
  logo: string | null;
  score: number;
}

export interface Match {
  id: string;
  status: string;
  time: string;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  date?: string;
  startsIn?: string;
}