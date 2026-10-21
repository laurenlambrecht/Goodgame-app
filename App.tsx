import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import { JetBrainsMono_400Regular, JetBrainsMono_600SemiBold, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Sheet } from './src/components/Sheet';
import { B, BigBtn, BtnRow, H3, Kv, P } from './src/components/SheetParts';
import { Tab, TabBar } from './src/components/TabBar';
import { Toast } from './src/components/Toast';
import { Eyebrow, Txt } from './src/components/Txt';
import { AREA, GAMES, Hist, METRO, MetroKey, REGIONS } from './src/data';
import { MapHandle, MapScreen } from './src/screens/MapScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Actions, AppState, Ctx } from './src/store';
import { C } from './src/theme';

const INITIAL_HIST: Hist[] = ['ok', 'ok', 'ok', 'late', 'ok', 'ok', 'ok', 'ok', 'ok', null];

function Screen({ on, children }: { on: boolean; children: ReactNode }) {
  const a = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: on ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [on, a]);
  return (
    <Animated.View
      pointerEvents={on ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  const [tab, setTabState] = useState<Tab>('play');
  const [games, setGames] = useState(GAMES);
  const [score, setScore] = useState(92);
  const [displayScore, setDisplayScore] = useState(92);
  const [checked, setChecked] = useState(false);
  const [joined, setJoined] = useState(() => new Set(['venice']));
  const [metro, setMetro] = useState<MetroKey>('LA');
  const [filter, setFilter] = useState('All');
  const [hist, setHist] = useState(INITIAL_HIST);
  const [gamesPlayed, setGamesPlayed] = useState(38);
  const [sheet, setSheet] = useState<ReactNode | null>(null);
  const [toastMsg, setToastMsg] = useState({ msg: '', nonce: 0 });
  const [bump, setBump] = useState(0);
  const mapRef = useRef<MapHandle>(null);

  const s: AppState = { tab, games, score, displayScore, checked, joined, metro, filter, hist, gamesPlayed };
  const close = () => setSheet(null);
  const toast = (msg: string) => setToastMsg((t) => ({ msg, nonce: t.nonce + 1 }));
  const byId = (id: string) => games.find((g) => g.id === id)!;
  const bumpHave = (id: string, d: number) => setGames((gs) => gs.map((g) => (g.id === id ? { ...g, have: g.have + d } : g)));

  const countTo = (to: number) => {
    const from = score;
    const t0 = Date.now();
    setScore(to);
    setBump((b) => b + 1);
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / 700);
      setDisplayScore(Math.round(from + (to - from) * k));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const act: Actions = {
    setTab: setTabState,
    setFilter,
    toast,
    checkIn: () => {
      setChecked(true);
      setHist((h) => ['ok', ...h.slice(0, 9)]);
      setGamesPlayed((n) => n + 1);
      countTo(score + 2);
      toast('Checked in. $5 refunded · +2 pts');
    },
    showGame: (id) => {
      setTabState('maps');
      mapRef.current?.showGame(id);
    },
    openDetails: () => {
      const g = byId('venice');
      const ini = ['L', 'A', 'M', 'J', 'K', 'R', 'T', 'D'];
      const tints = [C.gt, C.ot, C.bt, C.yt];
      setSheet(
        <>
          <Eyebrow color={C.gd}>Tonight · 7:00 PM</Eyebrow>
          <H3>{g.title}</H3>
          <Kv rows={[['Where', `${g.place}, LA`], ['Level', g.level], ['Deposit', `$5 · ${checked ? 'refunded' : 'held'}`], ['Roster', `${g.have}/${g.cap}`]]} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {ini.map((c, i) => (
              <View key={i} style={[styles.avatar, { backgroundColor: tints[i % 4] }]}>
                <Txt w={800} size={13}>{c}</Txt>
              </View>
            ))}
            {[0, 1].map((i) => (
              <View key={'o' + i} style={[styles.avatar, { borderStyle: 'dashed' }]}>
                <Txt w={800} size={13} color={C.mute}>+</Txt>
              </View>
            ))}
          </View>
          <P>Show up on time for +2. A no-show forfeits the $5 and drops your score by 3.</P>
          <BtnRow>
            <BigBtn label="Get directions" bg={C.g} onPress={() => { close(); act.showGame('venice'); }} />
            <BigBtn label="Close" grow={false} onPress={close} />
          </BtnRow>
        </>,
      );
    },
    openJoin: (id) => {
      const g = byId(id);
      setSheet(
        <>
          <Eyebrow color={C.gd}>{g.day} · {g.time} · {g.place}</Eyebrow>
          <H3>Join {g.title}?</H3>
          <P>
            We hold a <B>$5 deposit</B> and refund it when you check in. Showing up earns <B>+2</B>, and flaking costs <B>−3</B>.
          </P>
          <Kv rows={[['Spots left', String(g.cap - g.have)], ['Level', g.level]]} />
          <BtnRow>
            <BigBtn
              label="Hold $5 & join"
              bg={C.g}
              onPress={() => {
                setJoined((j) => new Set(j).add(id));
                bumpHave(id, 1);
                close();
                toast(`You're in. $5 held for ${g.place}`);
              }}
            />
            <BigBtn label="Not now" grow={false} onPress={close} />
          </BtnRow>
        </>,
      );
    },
    openLeave: (id) => {
      const g = byId(id);
      if (id === 'venice' && checked) return toast('Already checked in');
      const soon = id === 'venice';
      setSheet(
        <>
          <H3>Leave {g.title}?</H3>
          {soon ? (
            <P>This game starts in under 24 hours, so leaving now <B>forfeits your $5</B> and counts as a strike.</P>
          ) : (
            <P>More than 24 hours out, so your $5 is refunded in full.</P>
          )}
          <BtnRow>
            <BigBtn
              label="Leave game"
              bg={C.danger}
              onPress={() => {
                setJoined((j) => {
                  const n = new Set(j);
                  n.delete(id);
                  return n;
                });
                bumpHave(id, -1);
                close();
                toast(soon ? 'Left game · $5 forfeited' : 'Left game · $5 refunded');
              }}
            />
            <BigBtn label="Stay in" grow={false} onPress={close} />
          </BtnRow>
        </>,
      );
    },
    openRegion: () => {
      setSheet(
        <>
          <H3>Switch region</H3>
          <P>Same score, same reputation, new city. You're not starting over.</P>
          {REGIONS.map((ar) => (
            <View key={ar} style={{ gap: 8 }}>
              <Eyebrow color={C.mute}>{AREA[ar].full}</Eyebrow>
              {(Object.entries(METRO) as [MetroKey, [string, string]][])
                .filter(([, m]) => m[1] === ar)
                .map(([k, m]) => (
                  <Pressable
                    key={k}
                    onPress={() => {
                      setMetro(k);
                      setFilter('All');
                      close();
                      toast(`Moved to ${m[0]} · score ${score} kept`);
                    }}
                    style={[styles.mrow, metro === k && { backgroundColor: C.g }]}
                  >
                    <Txt w={700}>{m[0]}</Txt>
                    <Txt mono size={12}>{games.filter((g) => g.m === k).length} runs</Txt>
                  </Pressable>
                ))}
            </View>
          ))}
        </>,
      );
    },
  };

  const ctx = useMemo(() => ({ s, act, bump }), [tab, games, score, displayScore, checked, joined, metro, filter, hist, gamesPlayed, bump]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.paper }} />;

  return (
    <SafeAreaProvider>
      <Ctx.Provider value={ctx}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: C.paper }}>
          <Screen on={tab === 'maps'}>
            <MapScreen ref={mapRef} />
          </Screen>
          <Screen on={tab === 'play'}>
            <PlayScreen />
          </Screen>
          <Screen on={tab === 'profile'}>
            <ProfileScreen />
          </Screen>
          <TabBar tab={tab} onTab={setTabState} />
          <Sheet content={sheet} onClose={close} />
          <Toast msg={toastMsg.msg} nonce={toastMsg.nonce} />
        </View>
      </Ctx.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  mrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: 14,
    backgroundColor: C.white,
  },
});
