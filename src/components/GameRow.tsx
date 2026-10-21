import { ReactNode, useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Game, SPORT } from '../data';
import { C } from '../theme';
import { Txt } from './Txt';

export function GameRow({ g, subtitle, right }: { g: Game; subtitle: string; right: ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [a]);
  return (
    <Animated.View
      style={{
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: C.white,
        borderWidth: 2,
        borderColor: C.ink,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      <View style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: SPORT[g.sport][1] }}>
        <Txt w={800} size={g.day.length > 3 ? 11 : 15}>{g.day}</Txt>
        <Txt w={600} size={11}>{g.time}</Txt>
      </View>
      <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
        <Txt w={700} size={16} numberOfLines={1}>{g.title}</Txt>
        <Txt size={13} color={C.mute} numberOfLines={1}>{subtitle}</Txt>
      </View>
      {right}
    </Animated.View>
  );
}
