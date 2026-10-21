import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { Txt } from './Txt';

export function Toast({ msg, nonce }: { msg: string; nonce: number }) {
  const a = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!nonce) return;
    a.setValue(0);
    Animated.sequence([
      Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }),
      Animated.delay(1900),
      Animated.timing(a, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [nonce, a]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, alignItems: 'center', zIndex: 2100 }}>
      <Animated.View
        style={{
          backgroundColor: C.ink,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 14,
          shadowColor: C.g,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-insets.top - 90, 0] }) }],
        }}
      >
        <Txt w={700} size={14} color={C.white}>{msg}</Txt>
      </Animated.View>
    </View>
  );
}
