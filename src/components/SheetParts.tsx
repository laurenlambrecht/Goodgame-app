import { ReactNode } from 'react';
import { View } from 'react-native';
import { C } from '../theme';
import { Chunky } from './Chunky';
import { Txt } from './Txt';

export function H3({ children }: { children: ReactNode }) {
  return <Txt w={900} size={24} style={{ letterSpacing: -0.5 }}>{children}</Txt>;
}

export function P({ children }: { children: ReactNode }) {
  return <Txt size={15} color={C.body} style={{ lineHeight: 22 }}>{children}</Txt>;
}

export function B({ children }: { children: ReactNode }) {
  return <Txt w={700} size={15} color={C.body}>{children}</Txt>;
}

export function Kv({ rows }: { rows: [string, string][] }) {
  return (
    <View>
      {rows.map(([k, v], i) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderColor: C.line }}>
          <Txt color={C.mute}>{k}</Txt>
          <Txt w={700}>{v}</Txt>
        </View>
      ))}
    </View>
  );
}

export function BigBtn({ label, onPress, bg = C.white, grow = true }: { label: string; onPress: () => void; bg?: string; grow?: boolean }) {
  return (
    <Chunky style={grow ? { flex: 1 } : undefined} depth={4} radius={14} height={52} bg={bg} onPress={onPress} faceStyle={{ paddingHorizontal: 20 }}>
      <Txt w={800} size={16}>{label}</Txt>
    </Chunky>
  );
}

export function BtnRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>{children}</View>;
}
