import { Ref, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, ScrollView, TextInput, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chunky } from '../components/Chunky';
import { JoinButton } from '../components/JoinButton';
import { Eyebrow, Txt } from '../components/Txt';
import { AREA, AreaKey, Game, METRO, MetroKey, REGIONS, RegionKey, SPORT } from '../data';
import { useApp } from '../store';
import { C, font } from '../theme';

export type MapHandle = { showGame: (id: string) => void };

const W = Dimensions.get('window').width;
// Matches the design's "zoom < 7" switch between region pills and individual pins.
const PILL_LNG_DELTA = 4.3;
const ME = { latitude: 34.0, longitude: -118.44 };
const US = AREA.US.b;
const INITIAL: Region = {
  latitude: (US[0][0] + US[1][0]) / 2,
  longitude: (US[0][1] + US[1][1]) / 2,
  latitudeDelta: US[1][0] - US[0][0],
  longitudeDelta: US[1][1] - US[0][1],
};

type LL = { latitude: number; longitude: number };

export function MapScreen({ ref }: { ref?: Ref<MapHandle> }) {
  const { s, act } = useApp();
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const lastMarkerTap = useRef(0);
  const [region, setRegion] = useState<Region>(INITIAL);
  const [q, setQ] = useState('');
  const [area, setArea] = useState<AreaKey | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [me, setMe] = useState(false);

  const fitArea = (k: AreaKey, animated = true) => {
    const [[s0, w0], [n0, e0]] = AREA[k].b;
    map.current?.fitToCoordinates(
      [
        { latitude: s0, longitude: w0 },
        { latitude: n0, longitude: e0 },
      ],
      { edgePadding: { top: insets.top + 130, right: 20, bottom: 130, left: 20 }, animated },
    );
  };
  const flyArea = (k: AreaKey) => {
    setArea(k);
    setSel(null);
    fitArea(k);
  };
  const flyTo = (ll: LL, delta: number) => map.current?.animateToRegion({ ...ll, latitudeDelta: delta, longitudeDelta: delta }, 1100);

  useImperativeHandle(ref, () => ({
    showGame: (id: string) => {
      const g = s.games.find((x) => x.id === id);
      if (!g) return;
      setSel(id);
      setArea(METRO[g.m][1]);
      setTimeout(() => flyTo({ latitude: g.lat, longitude: g.lng }, 0.08), 120);
    },
  }));

  const visible = useMemo(() => {
    const t = q.toLowerCase().trim();
    return s.games.filter((g) => !t || [g.title, g.place, g.sport, METRO[g.m][0]].join(' ').toLowerCase().includes(t));
  }, [q, s.games]);

  const zoomedOut = region.longitudeDelta > PILL_LNG_DELTA;
  const ppd = W / region.longitudeDelta; // screen points per degree of longitude

  // Pin positions: when a metro's pins would overlap, fan them out in a small ring (like the design).
  const layout = useMemo(() => {
    const pos: Record<string, LL> = {};
    const labels: { k: MetroKey; at: LL }[] = [];
    if (zoomedOut) return { pos, labels };
    (Object.keys(METRO) as MetroKey[]).forEach((k) => {
      const gs = visible.filter((g) => g.m === k);
      if (!gs.length) return;
      const cos = Math.cos((gs[0].lat * Math.PI) / 180);
      const px = gs.map((g) => ({ x: g.lng * ppd, y: (-g.lat * ppd) / cos }));
      const cx = px.reduce((a, p) => a + p.x, 0) / px.length;
      const cy = px.reduce((a, p) => a + p.y, 0) / px.length;
      const tight = px.some((p, i) => px.some((o, j) => j > i && Math.hypot(p.x - o.x, p.y - o.y) < 44));
      gs.forEach((g, i) => {
        if (tight && gs.length > 1) {
          const t = (i / gs.length) * 2 * Math.PI - Math.PI / 2;
          const x = cx + 30 * Math.cos(t);
          const y = cy + 30 * Math.sin(t);
          pos[g.id] = { latitude: (-y * cos) / ppd, longitude: x / ppd };
        } else pos[g.id] = { latitude: g.lat, longitude: g.lng };
      });
      const top = Math.max(...gs.map((g) => pos[g.id].latitude));
      labels.push({ k, at: { latitude: top + (26 * cos) / ppd, longitude: cx / ppd } });
    });
    return { pos, labels };
  }, [visible, zoomedOut, ppd]);

  const pills = useMemo(
    () =>
      REGIONS.map((a) => {
        const gs = visible.filter((g) => METRO[g.m][1] === a);
        if (!gs.length) return null;
        return {
          a,
          n: gs.length,
          at: { latitude: gs.reduce((x, g) => x + g.lat, 0) / gs.length, longitude: gs.reduce((x, g) => x + g.lng, 0) / gs.length },
        };
      }).filter(Boolean) as { a: RegionKey; n: number; at: LL }[],
    [visible],
  );

  const onMapPress = (e: MapPressEvent) => {
    if (e.nativeEvent.action === 'marker-press' || Date.now() - lastMarkerTap.current < 400) return;
    setSel(null);
  };

  const selGame = sel ? s.games.find((g) => g.id === sel) ?? null : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#d1e1e9' }}>
      <MapView
        ref={map}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        initialRegion={INITIAL}
        mapType="mutedStandard"
        showsPointsOfInterests={false}
        showsCompass={false}
        pitchEnabled={false}
        rotateEnabled={false}
        onMapReady={() => fitArea('US', false)}
        onRegionChangeComplete={setRegion}
        onPress={onMapPress}
      >
        {zoomedOut
          ? pills.map(({ a, n, at }) => (
              <Marker
                key={'pill-' + a}
                coordinate={at}
                anchor={a === 'NorCal' ? { x: 0.3, y: 1.15 } : a === 'SoCal' ? { x: 0.3, y: -0.15 } : { x: 0.5, y: 0.5 }}
                onPress={() => {
                  lastMarkerTap.current = Date.now();
                  flyArea(a);
                }}
              >
                <View style={{ backgroundColor: C.ink, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', shadowColor: C.g, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }}>
                  <Txt w={800} size={14} color={C.white}>{AREA[a].name}</Txt>
                  <Txt mono w={600} size={11} color={C.g}>{n} RUNS</Txt>
                </View>
              </Marker>
            ))
          : [
              ...layout.labels.map(({ k, at }) => (
                <Marker key={'lbl-' + k} coordinate={at} anchor={{ x: 0.5, y: 1 }} tappable={false}>
                  <View style={{ backgroundColor: 'rgba(247,246,242,0.85)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 }}>
                    <Txt mono w={700} size={11} color={C.mute} style={{ letterSpacing: 1.1, textTransform: 'uppercase' }}>{METRO[k][0]}</Txt>
                  </View>
                </Marker>
              )),
              ...visible.map((g) => {
                const isSel = sel === g.id;
                const mine = s.joined.has(g.id);
                return (
                  <Marker
                    key={`pin-${g.id}-${isSel}-${mine}`}
                    coordinate={layout.pos[g.id] ?? { latitude: g.lat, longitude: g.lng }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    zIndex={isSel ? 10 : 1}
                    onPress={() => {
                      lastMarkerTap.current = Date.now();
                      setSel(g.id);
                      map.current?.animateCamera({ center: { latitude: g.lat, longitude: g.lng } }, { duration: 400 });
                    }}
                  >
                    <View style={{ padding: 6 }}>
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          borderWidth: 2,
                          borderColor: mine ? C.g : C.ink,
                          backgroundColor: isSel ? C.ink : SPORT[g.sport][0],
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: [{ scale: isSel ? 1.2 : 1 }],
                          shadowColor: C.ink,
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 1,
                          shadowRadius: 0,
                        }}
                      >
                        <Txt mono w={700} size={13} color={isSel ? C.g : C.ink}>{g.cap - g.have}</Txt>
                      </View>
                    </View>
                  </Marker>
                );
              }),
            ]}
        {me ? (
          <Marker coordinate={ME} anchor={{ x: 0.5, y: 0.5 }} tappable={false}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(47,107,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#2f6bff', borderWidth: 3, borderColor: C.white }} />
            </View>
          </Marker>
        ) : null}
      </MapView>

      <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 6, left: 14, right: 14, gap: 10 }}>
        <View style={{ paddingBottom: 4 }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: 4, bottom: 0, backgroundColor: C.ink, borderRadius: 16 }} />
          <View style={{ height: 50, backgroundColor: C.white, borderWidth: 2, borderColor: C.ink, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 }}>
            <View style={{ width: 14, height: 14, borderWidth: 2, borderColor: '#8a8984', borderRadius: 7 }} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search sport, park, or city"
              placeholderTextColor="#8a8984"
              returnKeyType="search"
              clearButtonMode="while-editing"
              style={{ flex: 1, fontFamily: font(500), fontSize: 15, color: C.ink }}
            />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
          {(Object.keys(AREA) as AreaKey[]).map((k) => {
            const on = area === k;
            return (
              <Chunky key={k} depth={3} radius={999} height={34} bg={on ? C.ink : C.white} onPress={() => flyArea(k)} faceStyle={{ paddingHorizontal: 13 }}>
                <Txt w={800} size={13} color={on ? C.white : C.ink}>{AREA[k].name}</Txt>
              </Chunky>
            );
          })}
        </ScrollView>
      </View>

      <Chunky
        style={{ position: 'absolute', right: 16, bottom: 116 + Math.max(0, insets.bottom - 34) }}
        depth={4}
        radius={14}
        height={48}
        faceStyle={{ width: 48 }}
        onPress={() => {
          setMe(true);
          setArea('SoCal');
          flyTo(ME, 0.15);
        }}
      >
        <Txt size={20}>◎</Txt>
      </Chunky>

      <MapCard g={selGame} bottom={110 + Math.max(0, insets.bottom - 34)} onClose={() => setSel(null)} />
    </View>
  );
}

function MapCard({ g, bottom, onClose }: { g: Game | null; bottom: number; onClose: () => void }) {
  const { s, act } = useApp();
  const [shown, setShown] = useState<Game | null>(g);
  const a = useRef(new Animated.Value(g ? 1 : 0)).current;
  useEffect(() => {
    if (g) setShown(g);
    Animated.timing(a, { toValue: g ? 1 : 0, duration: 250, easing: Easing.bezier(0.3, 1.3, 0.5, 1), useNativeDriver: true }).start();
  }, [g, a]);
  const cur = g ?? shown;
  if (!cur) return null;
  const live = s.games.find((x) => x.id === cur.id) ?? cur;
  return (
    <Animated.View
      pointerEvents={g ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom,
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
      }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, top: 5, bottom: -5, backgroundColor: C.ink, borderRadius: 20 }} />
      <View style={{ backgroundColor: C.white, borderWidth: 2, borderColor: C.ink, borderRadius: 20, padding: 16, gap: 10 }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', top: 10, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0eee8', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <Txt w={700} size={16}>×</Txt>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingRight: 30 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: SPORT[live.sport][0], borderWidth: 2, borderColor: C.ink }} />
          <Eyebrow color={C.mute} numberOfLines={1} style={{ flexShrink: 1 }}>
            {live.sport} · {live.day} {live.time} · {METRO[live.m][0]}
          </Eyebrow>
        </View>
        <View style={{ gap: 2 }}>
          <Txt w={800} size={20}>{live.title}</Txt>
          <Txt size={14} color={C.mute}>{live.place} · {live.level}</Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#ecebe5', overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${(live.have / live.cap) * 100}%`, backgroundColor: C.g }} />
          </View>
          <Txt mono w={600} size={13}>{live.cap - live.have} spots left</Txt>
          <JoinButton g={live} joined={s.joined.has(live.id)} onJoin={act.openJoin} onLeave={act.openLeave} />
        </View>
      </View>
    </Animated.View>
  );
}
