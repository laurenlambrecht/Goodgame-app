import { ReactNode, useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { C } from '../theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  depth?: number;
  radius?: number;
  bg?: string;
  shadow?: string;
  border?: boolean;
  /** Renders permanently pushed down (the design's `.done` state). */
  locked?: boolean;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  height?: number;
};

// The design's signature "chunky" button: a solid offset shadow the face sinks into when pressed.
export function Chunky({
  children,
  onPress,
  depth = 4,
  radius = 12,
  bg = C.white,
  shadow = C.ink,
  border = true,
  locked = false,
  style,
  faceStyle,
  height,
}: Props) {
  const [down, setDown] = useState(false);
  const pressed = down || locked;
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      disabled={locked}
      style={[{ paddingBottom: depth }, style]}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: depth,
          borderRadius: radius,
          backgroundColor: pressed ? 'transparent' : shadow,
        }}
      />
      <View
        style={[
          {
            height,
            borderRadius: radius,
            backgroundColor: bg,
            borderWidth: border ? 2 : 0,
            borderColor: C.ink,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            transform: [{ translateY: pressed ? depth : 0 }],
          },
          faceStyle,
        ]}
      >
        {children}
      </View>
    </Pressable>
  );
}
