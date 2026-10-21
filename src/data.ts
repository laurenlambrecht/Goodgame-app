import { C } from './theme';

export type Sport = 'Basketball' | 'Soccer' | 'Volleyball' | 'Pickleball';
export type MetroKey = 'LA' | 'SD' | 'OC' | 'SF' | 'SJ' | 'OAK' | 'CHI' | 'EVN';
export type AreaKey = 'US' | 'SoCal' | 'NorCal' | 'Chicago';
export type RegionKey = Exclude<AreaKey, 'US'>;

export type Game = {
  id: string;
  sport: Sport;
  title: string;
  place: string;
  m: MetroKey;
  lat: number;
  lng: number;
  day: string;
  time: string;
  level: string;
  have: number;
  cap: number;
};

export const SPORT: Record<Sport, [string, string]> = {
  Basketball: [C.o, C.ot],
  Soccer: [C.g, C.gt],
  Volleyball: [C.b, C.bt],
  Pickleball: [C.y, C.yt],
};

export const GAMES: Game[] = [
  { id: 'venice', sport: 'Basketball', title: '5v5 Basketball', place: 'Venice Courts', m: 'LA', lat: 33.985, lng: -118.472, day: 'TODAY', time: '7PM', level: 'Intermediate', have: 8, cap: 10 },
  { id: 'smsoc', sport: 'Soccer', title: 'Pickup Soccer', place: 'Santa Monica', m: 'LA', lat: 34.016, lng: -118.496, day: 'SAT', time: '9AM', level: 'All levels', have: 14, cap: 22 },
  { id: 'panpac', sport: 'Basketball', title: 'Competitive Run ⭐', place: 'Pan Pacific Park', m: 'LA', lat: 34.075, lng: -118.356, day: 'SUN', time: '6PM', level: 'Score 85+', have: 6, cap: 10 },
  { id: 'echo', sport: 'Volleyball', title: 'Volleyball 6s', place: 'Echo Park', m: 'LA', lat: 34.073, lng: -118.26, day: 'FRI', time: '8PM', level: 'Intermediate', have: 9, cap: 12 },
  { id: 'mission', sport: 'Volleyball', title: 'Beach Doubles', place: 'Mission Beach', m: 'SD', lat: 32.771, lng: -117.252, day: 'SAT', time: '10AM', level: 'Advanced', have: 3, cap: 4 },
  { id: 'balboa', sport: 'Soccer', title: '7v7 Soccer', place: 'Balboa Park', m: 'SD', lat: 32.731, lng: -117.146, day: 'SUN', time: '4PM', level: 'All levels', have: 10, cap: 14 },
  { id: 'hb', sport: 'Basketball', title: '3v3 Half Court', place: 'Huntington Beach', m: 'OC', lat: 33.659, lng: -117.999, day: 'THU', time: '6PM', level: 'Intermediate', have: 4, cap: 6 },
  { id: 'irvine', sport: 'Pickleball', title: 'Pickleball Ladder', place: 'Irvine', m: 'OC', lat: 33.684, lng: -117.826, day: 'SAT', time: '8AM', level: 'Beginner', have: 6, cap: 8 },
  { id: 'dolores', sport: 'Soccer', title: 'Pickup Soccer', place: 'Dolores Park', m: 'SF', lat: 37.7596, lng: -122.4269, day: 'SAT', time: '11AM', level: 'All levels', have: 12, cap: 18 },
  { id: 'ggp', sport: 'Basketball', title: '5v5 Basketball', place: 'Golden Gate Park', m: 'SF', lat: 37.769, lng: -122.4862, day: 'WED', time: '7PM', level: 'Advanced', have: 7, cap: 10 },
  { id: 'sj', sport: 'Basketball', title: 'Lunch Run', place: 'Downtown San José', m: 'SJ', lat: 37.3382, lng: -121.8863, day: 'TUE', time: '12PM', level: 'All levels', have: 5, cap: 10 },
  { id: 'oak', sport: 'Pickleball', title: 'Pickleball Open Play', place: 'Lake Merritt', m: 'OAK', lat: 37.8044, lng: -122.2585, day: 'SUN', time: '9AM', level: 'Intermediate', have: 5, cap: 8 },
  { id: 'lincoln', sport: 'Soccer', title: 'Pickup Soccer', place: 'Lincoln Park', m: 'CHI', lat: 41.9214, lng: -87.6513, day: 'SAT', time: '10AM', level: 'All levels', have: 15, cap: 22 },
  { id: 'montrose', sport: 'Volleyball', title: 'Beach Volleyball', place: 'Montrose Beach', m: 'CHI', lat: 41.9636, lng: -87.6386, day: 'SUN', time: '2PM', level: 'Intermediate', have: 8, cap: 12 },
  { id: 'evn', sport: 'Basketball', title: '5v5 Basketball', place: 'Evanston', m: 'EVN', lat: 42.0451, lng: -87.6877, day: 'THU', time: '7PM', level: 'Intermediate', have: 6, cap: 10 },
];

export const METRO: Record<MetroKey, [string, RegionKey]> = {
  LA: ['Los Angeles', 'SoCal'],
  SD: ['San Diego', 'SoCal'],
  OC: ['Orange County', 'SoCal'],
  SF: ['San Francisco', 'NorCal'],
  SJ: ['San José', 'NorCal'],
  OAK: ['Oakland', 'NorCal'],
  CHI: ['Chicago', 'Chicago'],
  EVN: ['Evanston', 'Chicago'],
};

// Bounds are [[south, west], [north, east]].
export const AREA: Record<AreaKey, { name: string; full: string; b: [[number, number], [number, number]] }> = {
  US: { name: 'All US', full: 'United States', b: [[25, -128], [49, -67]] },
  SoCal: { name: 'SoCal', full: 'Southern California', b: [[32.6, -118.7], [34.2, -117.0]] },
  NorCal: { name: 'NorCal', full: 'Northern California', b: [[37.25, -122.55], [37.9, -121.8]] },
  Chicago: { name: 'Chicago', full: 'Chicago', b: [[41.88, -87.75], [42.07, -87.6]] },
};

export const REGIONS: RegionKey[] = ['SoCal', 'NorCal', 'Chicago'];

export type Hist = 'ok' | 'late' | 'miss' | null;
