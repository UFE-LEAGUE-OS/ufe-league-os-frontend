// fantasyService.ts
import axiosInstance from './apiClient.js';


export interface FantasyGameweekSummary {
  id: number;
  fantasy_competition: number;
  fantasy_competition_name: string;
  name: string;
  number: number;
  matches: number[];
  matches_count: number;
  start_at: string;
  lock_at: string;
  end_at: string;
  status: string;
  is_locked: boolean;
  can_submit_lineup: boolean;
}

export interface FantasyCompetitionOverview {
  id: number;
  name: string;
  slug: string;
  sport: string;
  sport_label: string;
  season: string;
  status: string;
  status_label: string;
  budget: string;
  squad_size: number;
  lineup_size: number;
  max_players_per_club: number;
  rules_summary: string;
  teams_count: number;
  players_count: number;
  leagues_count: number;
  linked_competition: {
    id: number;
    name: string;
    slug: string;
    season: string;
  };
  active_gameweek: FantasyGameweekSummary | null;
}

export interface FantasyLeagueSummary {
  id: number;
  fantasy_competition: number;
  fantasy_competition_name: string;
  name: string;
  league_type: 'PUBLIC' | 'PRIVATE';
  join_code: string;
  created_by: number;
  created_by_email: string;
  is_active: boolean;
  members_count: number;
  created_at: string;
}

export interface FantasyFeaturedPlayer {
  id: number;
  display_name: string;
  club_name: string;
  position: string;
  position_label: string;
  final_price: string;
  current_form: string;
  is_available: boolean;
  availability_note: string;
  fantasy_competition: number;
  fantasy_competition_name: string;
}

export interface FantasyTeamRank {
  id: number;
  name: string;
  owner_name: string;
  fantasy_competition: number;
  fantasy_competition_name: string;
  total_points: string;
  current_rank: number | null;
  active_squad_count: number;
}

export interface FantasyOverviewSummary {
  competitions_count: number;
  public_leagues_count: number;
  players_count: number;
  teams_count: number;
}

export interface FantasyOverview {
  competitions: FantasyCompetitionOverview[];
  public_leagues: FantasyLeagueSummary[];
  featured_players: FantasyFeaturedPlayer[];
  leaderboard: FantasyTeamRank[];
  my_teams: FantasyTeamRank[];
  summary: FantasyOverviewSummary;
}

export const fetchFantasyOverview = () =>
  axiosInstance.get<FantasyOverview>('/fantasy/overview/');

export interface FantasyCompetitionApi {
  id: number;
  name: string;
  slug: string;
  linked_competition: number;
  linked_competition_label: string;
  sport: string;
  season: string;
  status: string;
  budget: string;
  squad_size: number;
  lineup_size: number;
  max_players_per_club: number;
  captain_multiplier: string;
  min_player_price: string;
  max_player_price: string;
  default_player_price: string;
  rules_summary: string;
  teams_count: number;
  gameweeks_count: number;
  created_at: string;
  updated_at: string;
}

export interface FantasyCompetitionListResponse {
  count: number;
  results: FantasyCompetitionApi[];
}

export interface FantasyCompetitionFilters {
  sport?: string;
  status?: string;
}

export const fetchFantasyCompetitions = (
  params?: FantasyCompetitionFilters,
) =>
  axiosInstance.get<FantasyCompetitionListResponse>(
    '/fantasy/competitions/',
    { params },
  );

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