export type SportName = 'Rugby' | 'Football' | 'Basketball';

export type PublicClub = {
  slug: string;
  name: string;
  shortName: string;
  sport: SportName;
  league: string;
  location: string;
  founded: string;
  logo: string;
  featured?: boolean;
  trophies: number;
  followers: string;
  ranking: number;
  matchesPlayed: number;
  winRate: string;
  description: string;
};

export type PublicTeam = {
  slug: string;
  name: string;
  clubSlug: string;
  clubName: string;
  sport: SportName;
  league: string;
  squadSize: number;
  image: string;
  form: string[];
};

export type PublicPlayer = {
  slug: string;
  name: string;
  clubSlug: string;
  teamSlug: string;
  clubName: string;
  position: string;
  jerseyNumber: number;
  country: string;
  age: number;
  height: string;
  weight: string;
  dominantSide: string;
  apps: number;
  tries: number;
  tackles: number;
  metres: number;
  assists: number;
  cleanBreaks: number;
  playerOfMatch: number;
  rating: number;
  image: string;
  tags: string[];
  bio: string;
};

export type StandingRow = {
  position: number;
  club: string;
  slug: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pf: number;
  pa: number;
  pd: string;
  points: number;
  form: string[];
};

export type CompetitionStanding = {
  id: string;
  name: string;
  sport: SportName;
  season: string;
  logo: string;
  rows: StandingRow[];
};

export const publicClubs: PublicClub[] = [
  {
    slug: 'kobs',
    name: 'KCB Kobs',
    shortName: 'KOBS',
    sport: 'Rugby',
    league: 'Nile Special Rugby Premiership',
    location: 'Kampala, Uganda',
    founded: '1963',
    logo: '/assets/clubs/kobs.jpg',
    featured: true,
    trophies: 25,
    followers: '24.5K',
    ranking: 1,
    matchesPlayed: 1963,
    winRate: '62%',
    description:
      'KCB Kobs is one of Uganda’s most successful rugby clubs, known for physical forward play, expansive backline rugby, and a passionate fanbase.',
  },
  {
    slug: 'platinum-heathens',
    name: 'Platinum Heathens',
    shortName: 'Heathens',
    sport: 'Rugby',
    league: 'Nile Special Rugby Premiership',
    location: 'Kampala, Uganda',
    founded: '2004',
    logo: '/assets/clubs/platinum-heathens.jpg',
    featured: true,
    trophies: 18,
    followers: '18.9K',
    ranking: 2,
    matchesPlayed: 1220,
    winRate: '59%',
    description:
      'Platinum Heathens are a major Ugandan rugby force with a strong winning tradition and one of the country’s most competitive squads.',
  },
  {
    slug: 'black-pirates',
    name: 'Black Pirates',
    shortName: 'Pirates',
    sport: 'Rugby',
    league: 'Nile Special Rugby Premiership',
    location: 'Kampala, Uganda',
    founded: '1996',
    logo: '/assets/clubs/black-pirates.png',
    featured: true,
    trophies: 14,
    followers: '16.1K',
    ranking: 3,
    matchesPlayed: 1012,
    winRate: '55%',
    description:
      'Black Pirates are a fast, aggressive rugby side with a strong youth pipeline and a loyal supporter base.',
  },
  {
    slug: 'impis-rfc',
    name: 'Impis RFC',
    shortName: 'Impis',
    sport: 'Rugby',
    league: 'Nile Special Rugby Premiership',
    location: 'Wakiso, Uganda',
    founded: '1980',
    logo: '/assets/clubs/impis-rfc.jpg',
    featured: true,
    trophies: 9,
    followers: '12.7K',
    ranking: 8,
    matchesPlayed: 808,
    winRate: '42%',
    description:
      'Impis RFC are a competitive rugby club known for resilience, energy, and developing young rugby talent.',
  },
  {
    slug: 'kcca-fc',
    name: 'KCCA FC',
    shortName: 'KCCA',
    sport: 'Football',
    league: 'StarTimes Uganda Premier League',
    location: 'Kampala, Uganda',
    founded: '1963',
    logo: '/assets/clubs/kcca-fc.png',
    featured: true,
    trophies: 13,
    followers: '24.5K',
    ranking: 1,
    matchesPlayed: 1800,
    winRate: '61%',
    description:
      'KCCA FC is one of Uganda’s leading football clubs, with a strong domestic record and a large Kampala fanbase.',
  },
  {
    slug: 'sc-villa',
    name: 'SC Villa',
    shortName: 'Villa',
    sport: 'Football',
    league: 'StarTimes Uganda Premier League',
    location: 'Kampala, Uganda',
    founded: '1975',
    logo: '/assets/clubs/sc-villa.png',
    featured: true,
    trophies: 16,
    followers: '20.1K',
    ranking: 2,
    matchesPlayed: 1710,
    winRate: '58%',
    description:
      'SC Villa is a historic Ugandan football club with a rich domestic legacy and passionate supporter culture.',
  },
  {
    slug: 'vipers-sc',
    name: 'Vipers SC',
    shortName: 'Vipers',
    sport: 'Football',
    league: 'StarTimes Uganda Premier League',
    location: 'Wakiso, Uganda',
    founded: '1969',
    logo: '/assets/clubs/vipers-sc.png',
    trophies: 10,
    followers: '17.8K',
    ranking: 3,
    matchesPlayed: 1360,
    winRate: '57%',
    description:
      'Vipers SC are a modern Ugandan football powerhouse with strong academy development and title ambitions.',
  },
  {
    slug: 'city-oilers',
    name: 'City Oilers',
    shortName: 'Oilers',
    sport: 'Basketball',
    league: 'National Basketball League',
    location: 'Kampala, Uganda',
    founded: '2011',
    logo: '/assets/clubs/city-oilers.png',
    featured: true,
    trophies: 11,
    followers: '15.4K',
    ranking: 1,
    matchesPlayed: 740,
    winRate: '74%',
    description:
      'City Oilers are Uganda’s dominant basketball club, known for consistency, continental ambition, and elite roster depth.',
  },
  {
    slug: 'namuwongo-blazers',
    name: 'Namuwongo Blazers',
    shortName: 'Blazers',
    sport: 'Basketball',
    league: 'National Basketball League',
    location: 'Kampala, Uganda',
    founded: '2012',
    logo: '/assets/clubs/namuwongo-blazers.png',
    featured: true,
    trophies: 5,
    followers: '7.3K',
    ranking: 2,
    matchesPlayed: 502,
    winRate: '63%',
    description:
      'Namuwongo Blazers are a leading basketball club with strong support and a competitive modern playing identity.',
  },
];

export const publicTeams: PublicTeam[] = [
  { slug: 'kobs-first-xv', name: 'KCB Kobs First XV', clubSlug: 'kobs', clubName: 'KCB Kobs', sport: 'Rugby', league: 'Nile Special Rugby Premiership', squadSize: 28, image: '/assets/clubs/kobs.jpg', form: ['W', 'W', 'W', 'L', 'W'] },
  { slug: 'kobs-ladies', name: 'KCB Kobs Ladies', clubSlug: 'kobs', clubName: 'KCB Kobs', sport: 'Rugby', league: 'Nile Special Rugby Premiership', squadSize: 24, image: '/assets/clubs/kobs.jpg', form: ['W', 'L', 'W', 'W', 'L'] },
  { slug: 'sc-villa-senior-team', name: 'SC Villa Senior Team', clubSlug: 'sc-villa', clubName: 'SC Villa', sport: 'Football', league: 'StarTimes Uganda Premier League', squadSize: 26, image: '/assets/clubs/sc-villa.png', form: ['W', 'W', 'D', 'L', 'W'] },
  { slug: 'kcca-fc-senior-team', name: 'KCCA FC Senior Team', clubSlug: 'kcca-fc', clubName: 'KCCA FC', sport: 'Football', league: 'StarTimes Uganda Premier League', squadSize: 27, image: '/assets/clubs/kcca-fc.png', form: ['W', 'W', 'W', 'W', 'L'] },
  { slug: 'city-oilers-senior-team', name: 'City Oilers', clubSlug: 'city-oilers', clubName: 'City Oilers', sport: 'Basketball', league: 'National Basketball League', squadSize: 15, image: '/assets/clubs/city-oilers.png', form: ['W', 'L', 'W', 'W', 'L'] },
  { slug: 'namuwongo-blazers-senior-team', name: 'Namuwongo Blazers', clubSlug: 'namuwongo-blazers', clubName: 'Namuwongo Blazers', sport: 'Basketball', league: 'National Basketball League', squadSize: 14, image: '/assets/clubs/namuwongo-blazers.png', form: ['W', 'W', 'L', 'W', 'W'] },
  { slug: 'impis-rfc-first-xv', name: 'Impis RFC', clubSlug: 'impis-rfc', clubName: 'Impis RFC', sport: 'Rugby', league: 'Nile Special Rugby Premiership', squadSize: 25, image: '/assets/clubs/impis-rfc.jpg', form: ['L', 'W', 'W', 'W', 'W'] },
];

const playerImage = '/assets/players/player-avatar.png';

export const publicPlayers: PublicPlayer[] = [
  { slug: 'ian-munyani', name: 'Ian Munyani', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: 'Centre', jerseyNumber: 14, country: 'Uganda', age: 27, height: '1.82 m', weight: '92 kg', dominantSide: 'Right', apps: 12, tries: 4, tackles: 68, metres: 412, assists: 3, cleanBreaks: 9, playerOfMatch: 2, rating: 7.8, image: playerImage, tags: ['Powerful Runner', 'Strong Defender', 'Team Leader'], bio: 'A dynamic and physical centre known for powerful running, defensive reads, and composure under pressure. Ian brings experience and leadership to the KCB Kobs backline.' },
  { slug: 'patrick-ochan', name: 'Patrick Ochan', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: 'Scrum-half', jerseyNumber: 9, country: 'Uganda', age: 25, height: '1.74 m', weight: '82 kg', dominantSide: 'Right', apps: 11, tries: 0, tackles: 54, metres: 210, assists: 8, cleanBreaks: 5, playerOfMatch: 1, rating: 7.1, image: playerImage, tags: ['Game Manager', 'Fast Service'], bio: 'A sharp scrum-half who controls tempo, links forwards and backs, and keeps the Kobs attack moving.' },
  { slug: 'james-musoke', name: 'James Musoke', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: 'Prop', jerseyNumber: 13, country: 'Uganda', age: 29, height: '1.86 m', weight: '106 kg', dominantSide: 'Right', apps: 10, tries: 1, tackles: 73, metres: 118, assists: 1, cleanBreaks: 2, playerOfMatch: 1, rating: 7.4, image: playerImage, tags: ['Set Piece', 'Ball Carrier'], bio: 'A reliable front-row presence who anchors the scrum and gives Kobs strong gain-line carries.' },
  { slug: 'pius-ogena', name: 'Pius Ogena', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: '8th Man', jerseyNumber: 8, country: 'Uganda', age: 28, height: '1.88 m', weight: '98 kg', dominantSide: 'Right', apps: 12, tries: 2, tackles: 77, metres: 265, assists: 2, cleanBreaks: 7, playerOfMatch: 1, rating: 7.5, image: playerImage, tags: ['Breakdown', 'Carrier'], bio: 'A high-work-rate back row player who contributes strongly in defence, carrying, and breakdown contests.' },
  { slug: 'brian-odongo', name: 'Brian Odongo', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: 'Hooker', jerseyNumber: 11, country: 'Kenya', age: 26, height: '1.80 m', weight: '96 kg', dominantSide: 'Right', apps: 12, tries: 1, tackles: 61, metres: 182, assists: 2, cleanBreaks: 4, playerOfMatch: 1, rating: 7.2, image: playerImage, tags: ['Lineout', 'Mobile Forward'], bio: 'A mobile hooker with strong set-piece discipline and useful open-field work rate.' },
  { slug: 'david-kyalo', name: 'David Kyalo', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: 'Fly-half', jerseyNumber: 10, country: 'Kenya', age: 24, height: '1.78 m', weight: '80 kg', dominantSide: 'Right', apps: 10, tries: 3, tackles: 38, metres: 301, assists: 7, cleanBreaks: 8, playerOfMatch: 2, rating: 7.6, image: playerImage, tags: ['Playmaker', 'Kicker'], bio: 'A composed fly-half who reads space well, distributes accurately, and keeps defenders guessing.' },
  { slug: 'asuman-mugerwa', name: 'Asuman Mugerwa', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: 'Flanker', jerseyNumber: 7, country: 'Uganda', age: 26, height: '1.84 m', weight: '94 kg', dominantSide: 'Right', apps: 12, tries: 0, tackles: 81, metres: 168, assists: 1, cleanBreaks: 3, playerOfMatch: 1, rating: 7.3, image: playerImage, tags: ['Tackler', 'Breakdown'], bio: 'A relentless flanker who covers ground quickly and gives Kobs strong defensive energy.' },
  { slug: 'solomon-okello', name: 'Solomon Okello', clubSlug: 'kobs', teamSlug: 'kobs-first-xv', clubName: 'KCB Kobs', position: 'Blindside', jerseyNumber: 6, country: 'Uganda', age: 27, height: '1.86 m', weight: '97 kg', dominantSide: 'Right', apps: 11, tries: 0, tackles: 70, metres: 140, assists: 1, cleanBreaks: 2, playerOfMatch: 0, rating: 7.0, image: playerImage, tags: ['Work Rate', 'Defender'], bio: 'A disciplined blindside flanker who brings physicality and stability to the loose forwards.' },
];

export const competitionStandings: CompetitionStanding[] = [
  {
    id: 'nile-special-rugby',
    name: 'Nile Special Rugby Premiership',
    sport: 'Rugby',
    season: '2025/26',
    logo: '/assets/competitions/nile-rugby.jpg',
    rows: [
      { position: 1, club: 'KCB Kobs', slug: 'kobs', played: 12, won: 10, drawn: 1, lost: 1, pf: 384, pa: 156, pd: '+228', points: 47, form: ['W', 'W', 'W', 'W', 'D'] },
      { position: 2, club: 'Platinum Heathens', slug: 'platinum-heathens', played: 12, won: 9, drawn: 1, lost: 2, pf: 312, pa: 178, pd: '+134', points: 43, form: ['W', 'W', 'W', 'L', 'W'] },
      { position: 3, club: 'Black Pirates', slug: 'black-pirates', played: 12, won: 8, drawn: 0, lost: 4, pf: 290, pa: 210, pd: '+80', points: 38, form: ['W', 'L', 'W', 'W', 'W'] },
      { position: 4, club: 'Hippos Rugby', slug: 'hippos-rugby', played: 12, won: 7, drawn: 1, lost: 4, pf: 276, pa: 202, pd: '+74', points: 35, form: ['W', 'W', 'L', 'W', 'D'] },
      { position: 5, club: 'Mongers Rugby Club', slug: 'mongers-rugby-club', played: 12, won: 6, drawn: 1, lost: 5, pf: 245, pa: 233, pd: '+12', points: 29, form: ['L', 'W', 'W', 'L', 'W'] },
      { position: 6, club: 'Walukuba Barbarians', slug: 'walukuba-barbarians', played: 12, won: 4, drawn: 1, lost: 7, pf: 210, pa: 301, pd: '-91', points: 21, form: ['L', 'W', 'W', 'L', 'W'] },
      { position: 7, club: 'Rhinos Rugby', slug: 'rhinos-rugby', played: 12, won: 3, drawn: 1, lost: 8, pf: 178, pa: 276, pd: '-98', points: 16, form: ['L', 'W', 'L', 'L', 'W'] },
      { position: 8, club: 'Impis Rugby Club', slug: 'impis-rfc', played: 12, won: 3, drawn: 0, lost: 9, pf: 162, pa: 288, pd: '-126', points: 14, form: ['L', 'L', 'W', 'W', 'L'] },
      { position: 9, club: 'Warriors RFC', slug: 'warriors-rfc', played: 12, won: 2, drawn: 1, lost: 9, pf: 154, pa: 301, pd: '-147', points: 11, form: ['L', 'L', 'W', 'L', 'L'] },
      { position: 10, club: 'Eagles Rugby Club', slug: 'eagles-rugby-club', played: 12, won: 1, drawn: 0, lost: 11, pf: 129, pa: 391, pd: '-262', points: 5, form: ['L', 'L', 'L', 'L', 'L'] },
    ],
  },
  {
    id: 'enterprise-cup',
    name: 'Enterprise Cup',
    sport: 'Rugby',
    season: '2025/26',
    logo: '/assets/competitions/nile-rugby.jpg',
    rows: [
      { position: 1, club: 'Black Pirates', slug: 'black-pirates', played: 5, won: 5, drawn: 0, lost: 0, pf: 142, pa: 61, pd: '+81', points: 20, form: ['W', 'W', 'W', 'W', 'W'] },
      { position: 2, club: 'KCB Kobs', slug: 'kobs', played: 5, won: 4, drawn: 0, lost: 1, pf: 131, pa: 72, pd: '+59', points: 16, form: ['W', 'W', 'L', 'W', 'W'] },
      { position: 3, club: 'Platinum Heathens', slug: 'platinum-heathens', played: 5, won: 3, drawn: 0, lost: 2, pf: 118, pa: 86, pd: '+32', points: 12, form: ['W', 'L', 'W', 'W', 'L'] },
      { position: 4, club: 'Impis Rugby Club', slug: 'impis-rfc', played: 5, won: 2, drawn: 0, lost: 3, pf: 78, pa: 96, pd: '-18', points: 8, form: ['L', 'W', 'L', 'W', 'L'] },
    ],
  },
  {
    id: 'uganda-premier-league',
    name: 'StarTimes Uganda Premier League',
    sport: 'Football',
    season: '2025/26',
    logo: '/assets/competitions/star-times-upl.png',
    rows: [
      { position: 1, club: 'KCCA FC', slug: 'kcca-fc', played: 18, won: 12, drawn: 4, lost: 2, pf: 34, pa: 13, pd: '+21', points: 40, form: ['W', 'W', 'D', 'W', 'W'] },
      { position: 2, club: 'SC Villa', slug: 'sc-villa', played: 18, won: 11, drawn: 4, lost: 3, pf: 31, pa: 15, pd: '+16', points: 37, form: ['W', 'L', 'W', 'W', 'D'] },
      { position: 3, club: 'Vipers SC', slug: 'vipers-sc', played: 18, won: 10, drawn: 5, lost: 3, pf: 29, pa: 16, pd: '+13', points: 35, form: ['D', 'W', 'W', 'L', 'W'] },
      { position: 4, club: 'Express FC', slug: 'express-fc', played: 18, won: 9, drawn: 5, lost: 4, pf: 25, pa: 18, pd: '+7', points: 32, form: ['W', 'D', 'L', 'W', 'D'] },
      { position: 5, club: 'Kitara FC', slug: 'kitara-fc', played: 18, won: 8, drawn: 6, lost: 4, pf: 24, pa: 19, pd: '+5', points: 30, form: ['L', 'W', 'D', 'W', 'W'] },
      { position: 6, club: 'URA FC', slug: 'ura-fc', played: 18, won: 7, drawn: 5, lost: 6, pf: 22, pa: 20, pd: '+2', points: 26, form: ['D', 'L', 'W', 'W', 'L'] },
      { position: 7, club: 'BUL FC', slug: 'bul-fc', played: 18, won: 6, drawn: 6, lost: 6, pf: 20, pa: 21, pd: '-1', points: 24, form: ['W', 'D', 'L', 'L', 'W'] },
      { position: 8, club: 'Bright Stars', slug: 'bright-stars', played: 18, won: 4, drawn: 5, lost: 9, pf: 16, pa: 27, pd: '-11', points: 17, form: ['L', 'D', 'L', 'W', 'L'] },
    ],
  },
  {
    id: 'national-basketball',
    name: 'National Basketball League',
    sport: 'Basketball',
    season: '2025/26',
    logo: '/assets/competitions/national-basketball.png',
    rows: [
      { position: 1, club: 'City Oilers', slug: 'city-oilers', played: 14, won: 13, drawn: 0, lost: 1, pf: 1102, pa: 835, pd: '+267', points: 27, form: ['W', 'W', 'W', 'W', 'L'] },
      { position: 2, club: 'Namuwongo Blazers', slug: 'namuwongo-blazers', played: 14, won: 12, drawn: 0, lost: 2, pf: 1068, pa: 890, pd: '+178', points: 26, form: ['W', 'W', 'L', 'W', 'W'] },
      { position: 3, club: 'KIU Titans', slug: 'kiu-titans', played: 14, won: 10, drawn: 0, lost: 4, pf: 998, pa: 910, pd: '+88', points: 24, form: ['L', 'W', 'W', 'L', 'W'] },
      { position: 4, club: 'UCU Canons', slug: 'ucu-canons', played: 14, won: 9, drawn: 0, lost: 5, pf: 965, pa: 931, pd: '+34', points: 23, form: ['W', 'L', 'W', 'W', 'L'] },
      { position: 5, club: 'Power Basketball', slug: 'power-basketball', played: 14, won: 7, drawn: 0, lost: 7, pf: 910, pa: 935, pd: '-25', points: 21, form: ['L', 'W', 'L', 'W', 'L'] },
      { position: 6, club: 'Ndejje Angels', slug: 'ndejje-angels', played: 14, won: 5, drawn: 0, lost: 9, pf: 846, pa: 950, pd: '-104', points: 19, form: ['L', 'L', 'W', 'L', 'W'] },
    ],
  },
  {
    id: 'budo-league',
    name: 'Budo League',
    sport: 'Football',
    season: '2025/26',
    logo: '/assets/competitions/buddo-league.svg',
    rows: [
      { position: 1, club: 'Midnight Express', slug: 'midnight-express', played: 9, won: 7, drawn: 1, lost: 1, pf: 24, pa: 10, pd: '+14', points: 22, form: ['W', 'W', 'D', 'W', 'W'] },
      { position: 2, club: 'Dujay FC', slug: 'dujay-fc', played: 9, won: 6, drawn: 1, lost: 2, pf: 21, pa: 14, pd: '+7', points: 19, form: ['W', 'L', 'W', 'W', 'D'] },
      { position: 3, club: 'Tooro Titans', slug: 'tooro-titans', played: 9, won: 5, drawn: 2, lost: 2, pf: 18, pa: 13, pd: '+5', points: 17, form: ['D', 'W', 'L', 'W', 'W'] },
      { position: 4, club: 'Fort Hoops', slug: 'fort-hoops', played: 9, won: 3, drawn: 1, lost: 5, pf: 13, pa: 19, pd: '-6', points: 10, form: ['L', 'W', 'L', 'D', 'L'] },
    ],
  },
];

export function getClubBySlug(slug?: string) {
  return publicClubs.find((club) => club.slug === slug);
}

export function getTeamBySlug(slug?: string) {
  return publicTeams.find((team) => team.slug === slug);
}

export function getPlayerBySlug(slug?: string) {
  return publicPlayers.find((player) => player.slug === slug);
}

export function getPlayersByTeamSlug(teamSlug?: string) {
  return publicPlayers.filter((player) => player.teamSlug === teamSlug);
}
