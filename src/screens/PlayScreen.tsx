import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bar } from '../components/Bar';
import { Chunky } from '../components/Chunky';
import { GameRow } from '../components/GameRow';
import { JoinButton } from '../components/JoinButton';
import { Eyebrow, Txt } from '../components/Txt';
import { METRO } from '../data';
import { useApp } from '../store';
import { C } from '../theme';

function ScoreChip() {
  const { s, act, bump } = useApp();
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!bump) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.25, duration: 200, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [bump, scale]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Chunky depth={3} radius={999} onPress={() => act.setTab('profile')} faceStyle={{ gap: 6, paddingVertical: 4, paddingLeft: 4, paddingRight: 12 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.g, alignItems: 'center', justifyContent: 'center' }}>
          <Txt w={800} size={12}>A</Txt>
        </View>
        <Txt mono w={700} size={14}>{s.displayScore}</Txt>
      </Chunky>
    </Animated.View>
  );
}

function NextCard() {
  const { s, act } = useApp();
  const g = s.games.find((x) => x.id === 'venice')!;
  return (
    <View style={{ marginTop: 20, marginHorizontal: 22, backgroundColor: C.ink, borderRadius: 24, padding: 20, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow color={C.eyebrowG}>Your next run · Tonight</Eyebrow>
        <Eyebrow color="#a9a8a2">{s.checked ? '$5 refunded' : '$5 held'}</Eyebrow>
      </View>
      <View style={{ gap: 4 }}>
        <Txt w={800} size={26} color={C.paper} style={{ letterSpacing: -0.5 }}>{g.title}</Txt>
        <Txt size={15} color="#c9c8c2">{g.place} · 7:00 PM · {g.level}</Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Bar pct={(g.have / g.cap) * 100} />
        <Txt mono w={600} size={13} color={C.paper}>{g.have}/{g.cap}</Txt>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {s.checked ? (
          <Chunky style={{ flex: 1 }} height={48} depth={5} radius={12} bg={C.dark} shadow="#000" border={false} locked>
            <Txt w={800} size={16} color={C.g}>Checked in ✓</Txt>
            <Txt mono w={600} size={13} color={C.g}>+2</Txt>
          </Chunky>
        ) : (
          <Chunky style={{ flex: 1 }} height={48} depth={5} radius={12} bg={C.g} shadow={C.gd} border={false} onPress={act.checkIn}>
            <Txt w={800} size={16}>Check in ✓</Txt>
          </Chunky>
        )}
        <Chunky height={48} depth={5} radius={12} bg={C.dark} shadow="#000" border={false} onPress={act.openDetails} faceStyle={{ paddingHorizontal: 18 }}>
          <Txt w={800} size={15} color={C.paper}>Details</Txt>
        </Chunky>
      </View>
    </View>
  );
}

export function PlayScreen() {
  const { s, act } = useApp();
  const insets = useSafeAreaInsets();
  const area = METRO[s.metro][1];
  const inArea = s.games.filter((g) => METRO[g.m][1] === area);
  const sports = ['All', ...new Set(inArea.map((g) => g.sport))];
  const filter = sports.includes(s.filter) ? s.filter : 'All';
  const list = inArea.filter((g) => g.id !== 'venice' && (filter === 'All' || g.sport === filter));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: 8, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Txt size={14} color={C.mute}>Good evening, Asher · {s.metro}</Txt>
          <Txt w={900} size={30} style={{ letterSpacing: -0.9 }}>Go play outside.</Txt>
        </View>
        <ScoreChip />
      </View>

      <NextCard />

      <View style={{ paddingTop: 26, paddingHorizontal: 22, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Txt w={800} size={19}>Runs near you</Txt>
        <Pressable onPress={() => act.setTab('maps')} style={{ borderBottomWidth: 2, borderColor: C.g }}>
          <Txt w={700} size={14}>See map</Txt>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 22, paddingBottom: 14 }}>
        {sports.map((sp) => {
          const on = filter === sp;
          return (
            <Pressable
              key={sp}
              onPress={() => act.setFilter(sp)}
              style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, borderWidth: 2, borderColor: C.ink, backgroundColor: on ? C.ink : C.white, justifyContent: 'center' }}
            >
              <Txt w={700} size={13} color={on ? C.white : C.ink}>{sp}</Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ gap: 12, paddingHorizontal: 22 }}>
        {list.length ? (
          list.map((g) => (
            <GameRow
              key={g.id + filter + s.metro}
              g={g}
              subtitle={`${g.place} · ${g.have}/${g.cap}`}
              right={<JoinButton g={g} joined={s.joined.has(g.id)} onJoin={act.openJoin} onLeave={act.openLeave} />}
            />
          ))
        ) : (
          <Txt color={C.mute}>No runs for that filter yet.</Txt>
        )}
      </View>
    </ScrollView>
  );
}
