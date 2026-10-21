// Colors from the GoodGame design (oklch values converted to sRGB hex).
export const C = {
  ink: '#17181a',
  paper: '#f7f6f2',
  mute: '#6b6a66',
  line: '#e3e1da',
  bg: '#e9e7e1',
  g: '#56d57b',
  gd: '#007834',
  gt: '#d1f2d7',
  o: '#ff9b50',
  ot: '#ffe0c9',
  b: '#78c7fd',
  bt: '#d1ecff',
  y: '#f1d35d',
  yt: '#f9efc9',
  danger: '#ffcfca',
  miss: '#e85854',
  eyebrowG: '#6ed889',
  score: '#65e287',
  dark: '#2a2b2f',
  barTrack: '#34353a',
  tabMute: '#9a9993',
  body: '#55544f',
  white: '#ffffff',
};

export type Weight = 400 | 500 | 600 | 700 | 800 | 900;

const ARCHIVO: Record<Weight, string> = {
  400: 'Archivo_400Regular',
  500: 'Archivo_500Medium',
  600: 'Archivo_600SemiBold',
  700: 'Archivo_700Bold',
  800: 'Archivo_800ExtraBold',
  900: 'Archivo_900Black',
};
const MONO: Record<Weight, string> = {
  400: 'JetBrainsMono_400Regular',
  500: 'JetBrainsMono_400Regular',
  600: 'JetBrainsMono_600SemiBold',
  700: 'JetBrainsMono_700Bold',
  800: 'JetBrainsMono_700Bold',
  900: 'JetBrainsMono_700Bold',
};

export const font = (w: Weight = 400, mono = false) => (mono ? MONO[w] : ARCHIVO[w]);
