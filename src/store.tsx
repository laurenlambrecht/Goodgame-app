import { createContext, useContext } from 'react';
import { Game, Hist, MetroKey } from './data';
import { Tab } from './components/TabBar';

export type AppState = {
  tab: Tab;
  games: Game[];
  score: number;
  displayScore: number;
  checked: boolean;
  joined: Set<string>;
  metro: MetroKey;
  filter: string;
  hist: Hist[];
  gamesPlayed: number;
};

export type Actions = {
  setTab: (t: Tab) => void;
  setFilter: (f: string) => void;
  checkIn: () => void;
  openDetails: () => void;
  openJoin: (id: string) => void;
  openLeave: (id: string) => void;
  openRegion: () => void;
  showGame: (id: string) => void;
  toast: (msg: string) => void;
};

export const Ctx = createContext<{ s: AppState; act: Actions; bump: number } | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
