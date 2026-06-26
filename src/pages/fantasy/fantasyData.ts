/* ═══════════════════════════════════════
   Fantasy static data — all sports
═══════════════════════════════════════ */

export type Sport = 'rugby' | 'football' | 'basketball';
export type Format = 'classic' | 'draft' | 'h2h';
export type Position = string;

export interface FantasyPlayer {
  id: string;
  name: string;
  club: string;
  position: Position;
  cost: number;
  totalPts: number;
  form: number;
  selected: number;
}

export interface SportConfig {
  id: Sport;
  label: string;
  emoji: string;
  color: string;
  budget: number;
  squadSize: number;
  positions: Position[];
  minPerPosition: Record<Position, number>;
  maxPerPosition: Record<Position, number>;
  formats: { id: Format; label: string; desc: string }[];
}

/* ── Sport configs ── */
export const SPORT_CONFIGS: Record<Sport, SportConfig> = {
  rugby: {
    id: 'rugby',
    label: 'Rugby',
    emoji: '🏉',
    color: '#8135FA',
    budget: 100,
    squadSize: 15,
    positions: ['PR', 'HK', 'LK', 'FL', 'NO8', 'SH', 'FH', 'CTR', 'WG', 'FB'],
    minPerPosition: { PR: 2, HK: 2, LK: 2, FL: 2, NO8: 1, SH: 2, FH: 1, CTR: 2, WG: 2, FB: 1 },
    maxPerPosition: { PR: 4, HK: 2, LK: 4, FL: 4, NO8: 2, SH: 2, FH: 2, CTR: 4, WG: 4, FB: 2 },
    formats: [
      { id: 'classic', label: 'Classic',       desc: 'Pick 15 players, score points weekly based on real performance.' },
      { id: 'draft',   label: 'Draft',         desc: 'Draft players with your league. No two managers share a player.' },
      { id: 'h2h',     label: 'Head-to-Head',  desc: 'Face a different manager each week. Most points wins.' },
    ],
  },
  football: {
    id: 'football',
    label: 'Football',
    emoji: '⚽',
    color: '#2563eb',
    budget: 100,
    squadSize: 15,
    positions: ['GK', 'DEF', 'MID', 'FWD'],
    minPerPosition: { GK: 2, DEF: 5, MID: 5, FWD: 3 },
    maxPerPosition: { GK: 2, DEF: 5, MID: 5, FWD: 3 },
    formats: [
      { id: 'classic', label: 'Classic',      desc: 'Pick 15 players, score points weekly based on real performance.' },
      { id: 'h2h',     label: 'Head-to-Head', desc: 'Face a different manager each week. Most points wins.' },
    ],
  },
  basketball: {
    id: 'basketball',
    label: 'Basketball',
    emoji: '🏀',
    color: '#f97316',
    budget: 80,
    squadSize: 10,
    positions: ['PG', 'SG', 'SF', 'PF', 'C'],
    minPerPosition: { PG: 2, SG: 2, SF: 2, PF: 2, C: 2 },
    maxPerPosition: { PG: 2, SG: 2, SF: 2, PF: 2, C: 2 },
    formats: [
      { id: 'classic', label: 'Classic', desc: 'Pick 10 players, score points weekly based on real performance.' },
      { id: 'draft',   label: 'Draft',   desc: 'Draft players with your league. No two managers share a player.' },
    ],
  },
};

/* ── Player pools ── */
export const PLAYERS: Record<Sport, FantasyPlayer[]> = {
  rugby: [
    { id: 'r1',  name: 'M. Wokorach',   club: 'Pirates RFC',  position: 'FH',  cost: 12.5, totalPts: 182, form: 8.2, selected: 68 },
    { id: 'r2',  name: 'H. Buyungo',    club: 'Heathens RFC', position: 'WG',  cost: 10.0, totalPts: 162, form: 7.5, selected: 55 },
    { id: 'r3',  name: 'P. Ogwang',     club: 'KOBS',         position: 'CTR', cost: 9.5,  totalPts: 148, form: 6.8, selected: 49 },
    { id: 'r4',  name: 'D. Ssemanda',   club: 'Pirates RFC',  position: 'WG',  cost: 8.0,  totalPts: 134, form: 6.1, selected: 42 },
    { id: 'r5',  name: 'J. Odong',      club: 'Heathens RFC', position: 'PR',  cost: 8.5,  totalPts: 121, form: 5.9, selected: 38 },
    { id: 'r6',  name: 'C. Asiimwe',    club: 'KOBS',         position: 'FH',  cost: 11.0, totalPts: 165, form: 7.8, selected: 60 },
    { id: 'r7',  name: 'B. Otim',       club: 'Jinja Hippos', position: 'PR',  cost: 7.5,  totalPts: 98,  form: 5.2, selected: 28 },
    { id: 'r8',  name: 'S. Mugisha',    club: 'Heathens RFC', position: 'CTR', cost: 8.5,  totalPts: 121, form: 6.0, selected: 35 },
    { id: 'r9',  name: 'R. Okello',     club: 'Pirates RFC',  position: 'HK',  cost: 8.0,  totalPts: 110, form: 5.7, selected: 31 },
    { id: 'r10', name: 'T. Aliguma',    club: 'KOBS',         position: 'SH',  cost: 9.0,  totalPts: 138, form: 6.5, selected: 44 },
    { id: 'r11', name: 'K. Buwembo',    club: 'Jinja Hippos', position: 'LK',  cost: 7.0,  totalPts: 95,  form: 5.0, selected: 24 },
    { id: 'r12', name: 'F. Byaruhanga', club: 'Pirates RFC',  position: 'FL',  cost: 7.5,  totalPts: 102, form: 5.3, selected: 29 },
    { id: 'r13', name: 'O. Onek',       club: 'Heathens RFC', position: 'NO8', cost: 10.5, totalPts: 155, form: 7.2, selected: 52 },
    { id: 'r14', name: 'P. Odeke',      club: 'Pirates RFC',  position: 'WG',  cost: 9.0,  totalPts: 142, form: 6.8, selected: 46 },
    { id: 'r15', name: 'I. Ssali',      club: 'KOBS',         position: 'FB',  cost: 8.5,  totalPts: 128, form: 6.2, selected: 39 },
    { id: 'r16', name: 'N. Olwenyi',    club: 'Jinja Hippos', position: 'HK',  cost: 7.5,  totalPts: 105, form: 5.4, selected: 30 },
    { id: 'r17', name: 'G. Ojok',       club: 'Pirates RFC',  position: 'LK',  cost: 7.0,  totalPts: 91,  form: 4.8, selected: 22 },
    { id: 'r18', name: 'A. Mutebi',     club: 'Heathens RFC', position: 'FL',  cost: 7.5,  totalPts: 108, form: 5.6, selected: 33 },
  ],
  football: [
    { id: 'f1',  name: 'D. Opio',       club: 'Vipers SC',    position: 'GK',  cost: 7.0,  totalPts: 138, form: 6.5, selected: 45 },
    { id: 'f2',  name: 'M. Wasswa',     club: 'KCCA FC',      position: 'GK',  cost: 6.5,  totalPts: 118, form: 5.8, selected: 35 },
    { id: 'f3',  name: 'J. Kateregga',  club: 'SC Villa',     position: 'DEF', cost: 6.5,  totalPts: 108, form: 5.2, selected: 32 },
    { id: 'f4',  name: 'P. Mwanje',     club: 'Vipers SC',    position: 'DEF', cost: 7.0,  totalPts: 122, form: 5.9, selected: 38 },
    { id: 'f5',  name: 'T. Ssali',      club: 'KCCA FC',      position: 'DEF', cost: 6.0,  totalPts: 98,  form: 4.8, selected: 27 },
    { id: 'f6',  name: 'B. Mugume',     club: 'Express FC',   position: 'DEF', cost: 5.5,  totalPts: 88,  form: 4.3, selected: 22 },
    { id: 'f7',  name: 'R. Ssekisambu', club: 'URA FC',       position: 'DEF', cost: 5.5,  totalPts: 91,  form: 4.5, selected: 24 },
    { id: 'f8',  name: 'E. Kizza',      club: 'Vipers SC',    position: 'MID', cost: 9.5,  totalPts: 168, form: 8.0, selected: 62 },
    { id: 'f9',  name: 'S. Lwanga',     club: 'KCCA FC',      position: 'MID', cost: 9.0,  totalPts: 155, form: 7.5, selected: 57 },
    { id: 'f10', name: 'T. Kayiira',    club: 'SC Villa',     position: 'MID', cost: 8.5,  totalPts: 142, form: 7.0, selected: 50 },
    { id: 'f11', name: 'J. Ssemakula',  club: 'URA FC',       position: 'MID', cost: 7.5,  totalPts: 118, form: 5.8, selected: 36 },
    { id: 'f12', name: 'D. Nsubuga',    club: 'Express FC',   position: 'MID', cost: 7.0,  totalPts: 108, form: 5.2, selected: 30 },
    { id: 'f13', name: 'A. Kakooza',    club: 'Vipers SC',    position: 'FWD', cost: 12.0, totalPts: 198, form: 9.2, selected: 74 },
    { id: 'f14', name: 'P. Waiswa',     club: 'KCCA FC',      position: 'FWD', cost: 10.5, totalPts: 172, form: 8.1, selected: 65 },
    { id: 'f15', name: 'M. Nsereko',    club: 'SC Villa',     position: 'FWD', cost: 9.0,  totalPts: 148, form: 7.1, selected: 52 },
    { id: 'f16', name: 'B. Kizito',     club: 'URA FC',       position: 'FWD', cost: 7.5,  totalPts: 112, form: 5.5, selected: 33 },
    { id: 'f17', name: 'C. Mugerwa',    club: 'BUL FC',       position: 'FWD', cost: 7.0,  totalPts: 102, form: 5.0, selected: 28 },
    { id: 'f18', name: 'S. Kizito',     club: 'Express FC',   position: 'MID', cost: 6.5,  totalPts: 95,  form: 4.7, selected: 25 },
  ],
  basketball: [
    { id: 'b1',  name: 'J. Banza',    club: 'Nam Blazers',  position: 'PG', cost: 14.0, totalPts: 205, form: 9.5, selected: 78 },
    { id: 'b2',  name: 'T. Lual',     club: 'City Oilers',  position: 'C',  cost: 13.0, totalPts: 188, form: 8.8, selected: 70 },
    { id: 'b3',  name: 'F. Bbale',    club: 'Nam Blazers',  position: 'SG', cost: 12.0, totalPts: 175, form: 8.2, selected: 63 },
    { id: 'b4',  name: 'P. Cheng',    club: 'KIU Titans',   position: 'SF', cost: 10.5, totalPts: 158, form: 7.5, selected: 55 },
    { id: 'b5',  name: 'I. Lumanyika',club: 'City Oilers',  position: 'PF', cost: 10.0, totalPts: 148, form: 7.0, selected: 50 },
    { id: 'b6',  name: 'T. Drileba',  club: 'KIU Titans',   position: 'PG', cost: 9.5,  totalPts: 138, form: 6.5, selected: 44 },
    { id: 'b7',  name: 'J. Enabu',    club: 'JKL Dolphins', position: 'C',  cost: 9.0,  totalPts: 130, form: 6.1, selected: 40 },
    { id: 'b8',  name: 'B. Okumu',    club: 'UCU Canons',   position: 'SG', cost: 8.5,  totalPts: 122, form: 5.8, selected: 35 },
    { id: 'b9',  name: 'A. Kakooza', club: 'Nam Blazers',   position: 'PF', cost: 8.0,  totalPts: 115, form: 5.5, selected: 32 },
    { id: 'b10', name: 'S. Kiviiri',  club: 'City Oilers',  position: 'SF', cost: 8.0,  totalPts: 112, form: 5.3, selected: 30 },
    { id: 'b11', name: 'R. Obbo',     club: 'JKL Dolphins', position: 'PG', cost: 7.5,  totalPts: 105, form: 5.0, selected: 27 },
    { id: 'b12', name: 'D. Olara',    club: 'UCU Canons',   position: 'C',  cost: 7.0,  totalPts: 98,  form: 4.7, selected: 23 },
  ],
};

/* ── Public leagues ── */
export interface PublicLeague {
  id: string;
  name: string;
  sport: Sport;
  format: Format;
  teams: number;
  maxTeams: number;
  entryFee: number;
  prizePool: string;
  isPrivate: boolean;
}

export const PUBLIC_LEAGUES: PublicLeague[] = [
  { id: 'pl1', name: 'Nile Special Rugby Fantasy',  sport: 'rugby',      format: 'classic', teams: 1842, maxTeams: 5000, entryFee: 0,     prizePool: 'UGX 500,000',   isPrivate: false },
  { id: 'pl2', name: 'UPL Fantasy League',           sport: 'football',   format: 'classic', teams: 3524, maxTeams: 5000, entryFee: 5000,  prizePool: 'UGX 1,000,000', isPrivate: false },
  { id: 'pl3', name: 'NBL Fantasy Challenge',        sport: 'basketball', format: 'classic', teams: 876,  maxTeams: 2000, entryFee: 5000,  prizePool: 'UGX 300,000',   isPrivate: false },
  { id: 'pl4', name: 'Rugby Draft Masters',          sport: 'rugby',      format: 'draft',   teams: 248,  maxTeams: 500,  entryFee: 10000, prizePool: 'UGX 200,000',   isPrivate: false },
  { id: 'pl5', name: 'UPL Head-to-Head',             sport: 'football',   format: 'h2h',     teams: 512,  maxTeams: 1000, entryFee: 5000,  prizePool: 'UGX 250,000',   isPrivate: false },
  { id: 'pl6', name: 'SMACK League Fantasy',         sport: 'rugby',      format: 'classic', teams: 412,  maxTeams: 1000, entryFee: 15000, prizePool: 'UGX 2,000,000', isPrivate: false },
];
