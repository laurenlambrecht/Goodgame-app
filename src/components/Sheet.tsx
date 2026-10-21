import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';

const H = Dimensions.get('window').height;

// Bottom sheet: keeps the last content on screen while it slides away.
export function Sheet({ content, onClose }: { content: ReactNode | null; onClose: () => void }) {
  const open = content != null;
  const [shown, setShown] = useState<ReactNode | null>(content);
  const a = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) setShown(content);
    Animated.timing(a, {
      toValue: open ? 1 : 0,
      duration: open ? 320 : 220,
      easing: open ? Easing.bezier(0.3, 1.15, 0.5, 1) : Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) setShown(null);
    });
  }, [open, content, a]);

  if (!open && shown == null) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 2000 }]} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(23,24,26,0.4)', opacity: a }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '85%',
          backgroundColor: C.paper,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTopWidth: 2,
          borderColor: C.ink,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [H, 0] }) }],
        }}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 22, paddingBottom: Math.max(36, insets.bottom + 12), gap: 14 }}
        >
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#cfcdc6', alignSelf: 'center' }} />
          {shown}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
