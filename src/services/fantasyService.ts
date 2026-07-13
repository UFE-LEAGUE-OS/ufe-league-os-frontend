// fantasyService.ts
import axiosInstance from './apiClient.js';

export interface Competition {
  id: string;
  sport: string;
  name: string;
  season: string;
  status: 'LIVE' | 'OPEN' | 'COMING SOON';
  teamsJoined: number;
  entryFee: number;
  deadline: string;
  prizePool: string;
  color: string;
}

export interface MyTeam {
  name: string;
  competition: string;
  totalPoints: number;
  gameweekPoints: number;
  rank: number;
  budget: number;
  players: Player[];
}

export interface Player {
  name: string;
  club: string;
  pos: string;
  pts: number;
  cost: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  team: string;
  pts: number;
  change: 'up' | 'down' | 'same';
  isMe?: boolean;
}

export interface League {
  id: string;
  name: string;
  type: string;
  members: number;
  maxMembers: number;
  rank: number | null;
  rankLabel: string;
  points: number;
  lastUpdated: string;
  live: boolean;
  isOwn: boolean;
}

export interface PublicLeague {
  id: string;
  name: string;
  sport: string;
  format: string;
  members: number;
  maxMembers: number;
  entry: string;
  prize: string;
}

export const fetchCompetitions = () =>
  axiosInstance.get<Competition[]>('/fantasy/competitions/');

export const fetchMyTeam = () =>
  axiosInstance.get<MyTeam>('/fantasy/my-team/');

export const fetchLeaderboard = () =>
  axiosInstance.get<LeaderboardEntry[]>('/fantasy/leaderboard/');

export const fetchMyLeagues = () =>
  axiosInstance.get<League[]>('/fantasy/my-leagues/');

export const fetchPublicLeagues = () =>
  axiosInstance.get<PublicLeague[]>('/fantasy/public-leagues/');

export const joinLeague = (leagueId: string) =>
  axiosInstance.post('/fantasy/join-league/', { league_id: leagueId });

export const createLeague = (payload: Record<string, unknown>) =>
  axiosInstance.post('/fantasy/create-league/', payload);

export const fetchTeamBuilder = (leagueId?: string) =>
  axiosInstance.get('/fantasy/team-builder/', { params: { league: leagueId } });

export const saveTeam = (payload: Record<string, unknown>) =>
  axiosInstance.post('/fantasy/team-builder/save/', payload);

export const fetchPlayerMarket = (params?: Record<string, unknown>) =>
  axiosInstance.get('/fantasy/player-market/', { params });

export const transferPlayer = (payload: Record<string, unknown>) =>
  axiosInstance.post('/fantasy/transfers/', payload);