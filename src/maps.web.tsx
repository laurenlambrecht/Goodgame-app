// Browser stand-in for react-native-maps (used only by the web build / online demo).
// Draws CARTO light tiles as the basemap and projects markers (Web Mercator) on top;
// the camera calls MapScreen makes (fit, animate) move the view.
import { Component, createContext, ReactNode, useContext } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type LL = { latitude: number; longitude: number };
export type Region = LL & { latitudeDelta: number; longitudeDelta: number };
export type MapPressEvent = { nativeEvent: { action?: string } };
type Padding = { top: number; right: number; bottom: number; left: number };

const DEG = 180 / Math.PI;
const yOf = (lat: number) => Math.log(Math.tan(Math.PI / 4 + lat / DEG / 2));
const latOf = (y: number) => Math.atan(Math.sinh(y)) * DEG;

type View2 = { r: Region; w: number; h: number };
const Ctx = createContext<View2 | null>(null);

type Props = {
  initialRegion: Region;
  style?: any;
  children?: ReactNode;
  onMapReady?: () => void;
  onRegionChangeComplete?: (r: Region) => void;
  onPress?: (e: MapPressEvent) => void;
  [k: string]: any;
};

export default class MapView extends Component<Props, View2> {
  state: View2 = { r: this.props.initialRegion, w: 0, h: 0 };
  private ready = false;

  private go(r: Region) {
    this.setState({ r }, () => this.props.onRegionChangeComplete?.(r));
  }

  animateToRegion(r: Region) {
    const { w, h } = this.state;
    // keep the longitude span; latitudeDelta is only a hint on a Mercator view
    this.go({ ...r, longitudeDelta: w && h ? Math.max(r.longitudeDelta, r.latitudeDelta * (w / h)) : r.longitudeDelta });
  }

  animateCamera(c: { center?: LL }) {
    if (c.center) this.go({ ...this.state.r, ...c.center });
  }

  fitToCoordinates(cs: LL[], o?: { edgePadding?: Padding }) {
    const { w, h } = this.state;
    if (!w || !h || !cs.length) return;
    const p = o?.edgePadding ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const lats = cs.map((c) => c.latitude);
    const lngs = cs.map((c) => c.longitude);
    const s = Math.min(...lats), n = Math.max(...lats), west = Math.min(...lngs), east = Math.max(...lngs);
    const iw = Math.max(40, w - p.left - p.right);
    const ih = Math.max(40, h - p.top - p.bottom);
    // degrees of longitude per pixel that fits both spans inside the padded box
    const dpp = Math.max((east - west) / iw, ((yOf(n) - yOf(s)) * DEG) / ih);
    const cx = (west + east) / 2 - ((p.left - p.right) / 2) * dpp;
    const cy = (yOf(n) + yOf(s)) / 2 + (((p.bottom - p.top) / 2) * dpp) / DEG;
    const lngD = dpp * w;
    this.go({ latitude: latOf(cy), longitude: cx, longitudeDelta: lngD, latitudeDelta: lngD * (h / w) });
  }

  render() {
    const { style, children, onPress } = this.props;
    return (
      <View
        style={[style, { overflow: 'hidden', backgroundColor: '#dfe7e2' }]}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          this.setState({ w, h }, () => {
            if (!this.ready) {
              this.ready = true;
              this.props.onMapReady?.();
            }
          });
        }}
      >
        {this.state.w ? <Tiles {...this.state} /> : null}
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => onPress?.({ nativeEvent: {} })} />
        <Ctx.Provider value={this.state}>{this.state.w ? children : null}</Ctx.Provider>
        <Text style={{ position: 'absolute', right: 6, bottom: 2, fontSize: 9, color: '#7a7a7a' }}>© OpenStreetMap contributors © CARTO</Text>
      </View>
    );
  }
}

// Light basemap tiles (Web Mercator), positioned to match the current region.
function Tiles({ r, w, h }: View2) {
  const ppd = w / r.longitudeDelta; // screen px per degree of longitude
  const z = Math.max(0, Math.min(18, Math.round(Math.log2((ppd * 360) / 256))));
  const n = 2 ** z;
  const scale = (ppd * 360) / (256 * n); // screen px per tile px
  const size = 256 * scale;
  // world pixel (at zoom z, in tile px) of the view center
  const cx = ((r.longitude + 180) / 360) * n * 256;
  const cy = ((1 - yOf(r.latitude) / Math.PI) / 2) * n * 256;
  const left = cx * scale - w / 2;
  const top = cy * scale - h / 2;
  const x0 = Math.floor(left / size), x1 = Math.floor((left + w) / size);
  const y0 = Math.max(0, Math.floor(top / size)), y1 = Math.min(n - 1, Math.floor((top + h) / size));
  const out = [];
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++) {
      const tx = ((x % n) + n) % n;
      out.push(
        <Image
          key={`${z}/${x}/${y}`}
          source={{ uri: `https://basemaps.cartocdn.com/light_all/${z}/${tx}/${y}.png` }}
          style={{ position: 'absolute', left: x * size - left, top: y * size - top, width: size + 0.5, height: size + 0.5 }}
        />,
      );
    }
  return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{out}</View>;
}

export function Marker({
  coordinate,
  anchor = { x: 0.5, y: 0.5 },
  onPress,
  zIndex,
  children,
}: {
  coordinate: LL;
  anchor?: { x: number; y: number };
  onPress?: () => void;
  zIndex?: number;
  children?: ReactNode;
  [k: string]: any;
}) {
  const v = useContext(Ctx);
  if (!v) return null;
  const { r, w, h } = v;
  const ppd = w / r.longitudeDelta;
  const x = w / 2 + (coordinate.longitude - r.longitude) * ppd;
  const y = h / 2 - (yOf(coordinate.latitude) - yOf(r.latitude)) * DEG * ppd;
  if (x < -200 || x > w + 200 || y < -200 || y > h + 200) return null;
  const shift = [{ translateX: `${-anchor.x * 100}%` }, { translateY: `${-anchor.y * 100}%` }] as any;
  return (
    <View style={{ position: 'absolute', left: x, top: y, zIndex: zIndex ?? 1, transform: shift }}>
      {onPress ? <Pressable onPress={onPress}>{children}</Pressable> : children}
    </View>
  );
}
