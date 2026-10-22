// Browser stand-in for react-native-maps (used only by the web build / online demo).
// Draws a US outline as the basemap and projects markers (Web Mercator) on top;
// the camera calls MapScreen makes (fit, animate) and the user's gestures move the view.
import { Component, createContext, ReactNode, useContext } from 'react';
import { Pressable, View } from 'react-native';
import { US } from './usOutline';

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

const MIN_LNG_SPAN = 0.02; // most zoomed in (a few blocks)
const MAX_LNG_SPAN = 140; // most zoomed out

export default class MapView extends Component<Props, View2> {
  state: View2 = { r: this.props.initialRegion, w: 0, h: 0 };
  private ready = false;
  private el: HTMLElement | null = null;
  private pts = new Map<number, { x: number; y: number }>();
  private dragged = false;
  private settle: ReturnType<typeof setTimeout> | undefined;

  private go(r: Region) {
    this.setState({ r }, () => this.props.onRegionChangeComplete?.(r));
  }

  // Gestures (drag to pan, wheel / pinch / double-click to zoom) move the view live,
  // then report the final region once the gesture settles, like the native map.
  private move(r: Region) {
    this.setState({ r });
    clearTimeout(this.settle);
    this.settle = setTimeout(() => this.props.onRegionChangeComplete?.(this.state.r), 150);
  }

  private pan(dx: number, dy: number, r = this.state.r) {
    const ppd = this.state.w / r.longitudeDelta;
    return { ...r, longitude: r.longitude - dx / ppd, latitude: latOf(yOf(r.latitude) + dy / (DEG * ppd)) };
  }

  private zoom(k: number, px: number, py: number) {
    const { r, w, h } = this.state;
    const lngD = Math.min(MAX_LNG_SPAN, Math.max(MIN_LNG_SPAN, r.longitudeDelta / k));
    const ppd0 = w / r.longitudeDelta, ppd1 = w / lngD;
    const ox = px - w / 2, oy = py - h / 2;
    // keep the point under the cursor / fingers fixed
    const lng = r.longitude + ox / ppd0 - ox / ppd1;
    const y = yOf(r.latitude) - oy / (DEG * ppd0) + oy / (DEG * ppd1);
    this.move({ latitude: latOf(y), longitude: lng, longitudeDelta: lngD, latitudeDelta: lngD * (h / w) });
  }

  private local(e: { clientX: number; clientY: number }) {
    const b = this.el!.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const p = this.local(e);
    this.zoom(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)), p.x, p.y);
  };

  private onDown = (e: PointerEvent) => {
    if (this.pts.size === 0) this.dragged = false;
    this.pts.set(e.pointerId, this.local(e));
  };

  private onMove = (e: PointerEvent) => {
    const prev = this.pts.get(e.pointerId);
    if (!prev) return;
    const p = this.local(e);
    if (this.pts.size >= 2) {
      const [a, b] = [...this.pts.entries()].map(([id, q]) => (id === e.pointerId ? p : q));
      const [a0, b0] = [...this.pts.values()];
      const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y), d1 = Math.hypot(a.x - b.x, a.y - b.y);
      if (d0 > 0) this.zoom(d1 / d0, (a.x + b.x) / 2, (a.y + b.y) / 2);
      this.dragged = true;
    } else {
      const dx = p.x - prev.x, dy = p.y - prev.y;
      if (!this.dragged && Math.hypot(dx, dy) < 4) return; // still a tap
      this.dragged = true;
      this.move(this.pan(dx, dy));
    }
    this.pts.set(e.pointerId, p);
  };

  private onUp = (e: PointerEvent) => {
    this.pts.delete(e.pointerId);
  };

  // a drag shouldn't also count as a tap on the map or a pin
  private onClick = (e: MouseEvent) => {
    if (this.dragged) {
      e.stopPropagation();
      e.preventDefault();
      this.dragged = false;
    }
  };

  private onDbl = (e: MouseEvent) => {
    const p = this.local(e);
    this.zoom(2, p.x, p.y);
  };

  private attach = (node: any) => {
    const el: HTMLElement | null = node && node instanceof HTMLElement ? node : null;
    if (el === this.el) return;
    const opts = { passive: false } as AddEventListenerOptions;
    if (this.el) {
      this.el.removeEventListener('wheel', this.onWheel, opts);
      this.el.removeEventListener('pointerdown', this.onDown, true);
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerup', this.onUp);
      window.removeEventListener('pointercancel', this.onUp);
      this.el.removeEventListener('click', this.onClick, true);
      this.el.removeEventListener('dblclick', this.onDbl);
    }
    this.el = el;
    if (el) {
      el.style.touchAction = 'none';
      el.style.cursor = 'grab';
      el.addEventListener('wheel', this.onWheel, opts);
      el.addEventListener('pointerdown', this.onDown, true);
      window.addEventListener('pointermove', this.onMove);
      window.addEventListener('pointerup', this.onUp);
      window.addEventListener('pointercancel', this.onUp);
      el.addEventListener('click', this.onClick, true);
      el.addEventListener('dblclick', this.onDbl);
    }
  };

  componentWillUnmount() {
    this.attach(null);
    clearTimeout(this.settle);
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
        ref={this.attach}
        style={[style, { overflow: 'hidden', backgroundColor: '#d1e1e9' }]}
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
        {this.state.w ? <Outline {...this.state} /> : null}
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => onPress?.({ nativeEvent: {} })} />
        <Ctx.Provider value={this.state}>{this.state.w ? children : null}</Ctx.Provider>
      </View>
    );
  }
}

// US land and state borders drawn as SVG (no network), projected like the markers.
function Outline({ r, w, h }: View2) {
  const ppd = w / r.longitudeDelta;
  const cy = yOf(r.latitude);
  const pt = (lng: number, lat: number) =>
    `${(w / 2 + (lng - r.longitude) * ppd).toFixed(1)},${(h / 2 - (yOf(lat) - cy) * DEG * ppd).toFixed(1)}`;
  const path = (a: number[], close: boolean) => {
    let d = '';
    for (let i = 0; i < a.length; i += 2) d += (i ? 'L' : 'M') + pt(a[i], a[i + 1]);
    return close ? d + 'Z' : d;
  };
  const land = US.land.map((a) => path(a, true)).join('');
  const borders = US.borders.map((a) => path(a, false)).join('');
  return (
    <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <path d={land} fill="#f4f2ec" stroke="#b9c6c0" strokeWidth={1} strokeLinejoin="round" />
      <path d={borders} fill="none" stroke="#cfd6d1" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  );
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
