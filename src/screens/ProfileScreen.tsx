import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chunky } from '../components/Chunky';
import { GameRow } from '../components/GameRow';
import { Eyebrow, Txt } from '../components/Txt';
import { AREA, Hist, METRO } from '../data';
import { useApp } from '../store';
import { C } from '../theme';

const tint = (h: Hist) => (h === 'ok' ? C.g : h === 'late' ? C.o : h === 'miss' ? C.miss : C.dark);

function SmallBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Chunky depth={3} radius={10} height={36} onPress={onPress} faceStyle={{ paddingHorizontal: 14 }}>
      <Txt w={800} size={14}>{label}</Txt>
    </Chunky>
  );
}

function SecHd({ title, right }: { title: string; right?: string }) {
  return (
    <View style={{ paddingTop: 26, paddingHorizontal: 22, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Txt w={800} size={19}>{title}</Txt>
      {right ? <Txt mono size={12} color={C.mute}>{right}</Txt> : null}
    </View>
  );
}

export function ProfileScreen() {
  const { s, act } = useApp();
  const insets = useSafeAreaInsets();
  const ok = s.hist.filter((h) => h === 'ok').length;
  const late = s.hist.filter((h) => h === 'late').length;
  const mine = s.games.filter((g) => s.joined.has(g.id));
  const card = { marginHorizontal: 22, backgroundColor: C.white, borderWidth: 2, borderColor: C.ink, borderRadius: 20, padding: 16 } as const;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: 12, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.g, borderWidth: 2, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Txt w={800} size={22}>A</Txt>
          </View>
          <View>
            <Txt w={900} size={22}>Asher</Txt>
            <Txt size={14} color={C.mute}>@asher · {METRO[s.metro][0]}</Txt>
          </View>
        </View>
        <SmallBtn label="Edit" onPress={() => act.toast('Settings coming soon')} />
      </View>

      <View style={{ marginTop: 20, marginHorizontal: 22, backgroundColor: C.ink, borderRadius: 24, padding: 20, gap: 8 }}>
        <Eyebrow color={C.tabMute}>Reliability score</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <Txt w={900} size={96} color={C.score} style={{ lineHeight: 92, letterSpacing: -4.8 }}>{s.displayScore}</Txt>
          <Txt mono w={600} size={13} color={C.score} style={{ paddingBottom: 10 }}>{s.checked ? '+4' : '+2'} this week</Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
          {s.hist.map((h, i) => (
            <View key={i} style={{ flex: 1, height: 28, borderRadius: 5, backgroundColor: tint(h) }} />
          ))}
        </View>
        <Txt size={13} color={C.tabMute}>Last 10 · {ok} on time, {late} late · 0 no-shows</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingTop: 16, paddingHorizontal: 22 }}>
        {[
          [String(s.gamesPlayed), 'Games'],
          [`${Math.round((ok / (ok + late)) * 100)}%`, 'On time'],
          ['0', 'Strikes'],
        ].map(([v, l]) => (
          <View key={l} style={{ flex: 1, backgroundColor: C.white, borderWidth: 2, borderColor: C.ink, borderRadius: 16, padding: 12, gap: 2 }}>
            <Txt w={900} size={24} style={{ letterSpacing: -0.5 }}>{v}</Txt>
            <Txt mono w={600} size={10} color={C.mute} style={{ letterSpacing: 0.8, textTransform: 'uppercase' }}>{l}</Txt>
          </View>
        ))}
      </View>

      <SecHd title="Status" />
      <View style={[card, { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: C.gt }]}>
        <Txt size={24}>⭐</Txt>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt w={700}>Competitive runs unlocked</Txt>
          <Txt size={13} color={C.body}>Clean record. Keep showing up to stay in priority access.</Txt>
        </View>
      </View>

      <SecHd title="Home region" />
      <View style={[card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt w={700}>{AREA[METRO[s.metro][1]].full}</Txt>
          <Txt size={13} color={C.mute}>{METRO[s.metro][0]} · your score travels with you</Txt>
        </View>
        <SmallBtn label="Switch" onPress={act.openRegion} />
      </View>

      <SecHd title="Upcoming" right={`${mine.length} GAMES`} />
      <View style={{ gap: 12, paddingHorizontal: 22 }}>
        {mine.map((g) => (
          <GameRow key={g.id} g={g} subtitle={`${g.place} · $5 held`} right={<SmallBtn label="Map" onPress={() => act.showGame(g.id)} />} />
        ))}
      </View>
    </ScrollView>
  );
}
