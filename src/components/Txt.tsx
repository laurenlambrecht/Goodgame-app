import { Text, TextProps, TextStyle } from 'react-native';
import { C, font, Weight } from '../theme';

type Props = TextProps & { w?: Weight; mono?: boolean; size?: number; color?: string };

export function Txt({ w = 400, mono = false, size = 15, color = C.ink, style, ...rest }: Props) {
  const base: TextStyle = { fontFamily: font(w, mono), fontSize: size, color };
  return <Text {...rest} style={[base, style]} />;
}

// Small uppercase monospace label used across the design ("eyebrow").
export function Eyebrow({ color = C.ink, style, ...rest }: Omit<Props, 'w' | 'mono' | 'size'>) {
  return (
    <Txt w={600} mono size={11} color={color} style={[{ letterSpacing: 1.1, textTransform: 'uppercase' }, style]} {...rest} />
  );
}
