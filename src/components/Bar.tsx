import { View } from 'react-native';
import { C } from '../theme';

export function Bar({ pct, track = C.barTrack, fill = C.g }: { pct: number; track?: string; fill?: string }) {
  return (
    <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: fill }} />
    </View>
  );
}
