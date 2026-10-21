import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { Chunky } from './Chunky';
import { Txt } from './Txt';

export type Tab = 'maps' | 'play' | 'profile';
const TABS: [Tab, string, 'd' | 'p' | 'c'][] = [
  ['maps', 'Maps', 'd'],
  ['play', 'Play', 'p'],
  ['profile', 'Profile', 'c'],
];

function Icon({ kind, color }: { kind: 'd' | 'p' | 'c'; color: string }) {
  const base = { width: 20, height: 20, borderWidth: 2, borderColor: color };
  if (kind === 'd') return <View style={[base, { borderRadius: 5, transform: [{ rotate: '45deg' }, { scale: 0.8 }] }]} />;
  if (kind === 'c') return <View style={[base, { borderRadius: 10 }]} />;
  return <View style={[base, { borderRadius: 10, backgroundColor: color, transform: [{ scale: 0.6 }] }]} />;
}

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: Math.max(16, insets.bottom - 8),
        height: 70,
        backgroundColor: C.ink,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingBottom: 5,
        zIndex: 20,
      }}
    >
      {TABS.map(([k, label, ic]) => {
        const on = tab === k;
        return on ? (
          <Chunky key={k} style={{ flex: 1 }} depth={5} radius={16} height={50} bg={C.g} shadow={C.gd} border={false} onPress={() => onTab(k)}>
            <Icon kind={ic} color={C.ink} />
            <Txt w={900} size={15} style={{ letterSpacing: 0.3 }}>{label}</Txt>
          </Chunky>
        ) : (
          <Pressable key={k} onPress={() => onTab(k)} style={{ flex: 1, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 5 }}>
            <Icon kind={ic} color={C.tabMute} />
            <Txt w={600} size={12} color={C.tabMute}>{label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
