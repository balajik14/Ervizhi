/**
 * MapComponent.web.tsx
 * --------------------
 * Web-only map using Leaflet directly.
 * Exposes MapView, Marker, PROVIDER_DEFAULT matching react-native-maps API.
 * Markers use `color` and `size` props for styling on web.
 */

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  createContext,
  useContext,
} from 'react';

// ─── Inject Leaflet CSS once ────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

// ─── Types ─────────────────────────────────────────────────────────
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export const PROVIDER_DEFAULT = null;

// ─── Internal context to pass markers up to MapView ───────────────
type MarkerInfo = {
  id: string;
  coordinate: Coordinate;
  onPress?: () => void;
  color?: string;
  size?: number;
  borderColor?: string;
  label?: string;
  zIndex?: number;
};

const MarkerRegistryContext = createContext<{
  register: (info: MarkerInfo) => void;
  unregister: (id: string) => void;
} | null>(null);

// ─── Marker (web) ─────────────────────────────────────────────────
let _markerSeq = 0;
export const Marker = React.memo(function Marker({
  coordinate,
  onPress,
  color = '#4CAF50',
  size = 12,
  borderColor = 'rgba(255,255,255,0.9)',
  label,
  anchor,
  zIndex = 1,
  children,
}: {
  coordinate: Coordinate;
  onPress?: () => void;
  color?: string;
  size?: number;
  borderColor?: string;
  label?: string;
  anchor?: { x: number; y: number };
  zIndex?: number;
  children?: React.ReactNode;
}) {
  const registry = useContext(MarkerRegistryContext);
  const idRef = useRef<string>(`m-${++_markerSeq}`);

  useEffect(() => {
    if (!registry) return;
    registry.register({
      id: idRef.current,
      coordinate,
      onPress,
      color,
      size,
      borderColor,
      label,
      zIndex,
    });
    return () => registry.unregister(idRef.current);
  }, [coordinate.latitude, coordinate.longitude, color, size, borderColor, label, onPress, zIndex]);

  return null; // rendered by MapView via Leaflet
});

// ─── MapView (web) ────────────────────────────────────────────────
const MapViewImpl = forwardRef(function MapView(
  {
    style,
    initialRegion,
    children,
    minZoomLevel = 6,
    maxZoomLevel = 14,
  }: {
    style?: any;
    initialRegion?: Region;
    children?: React.ReactNode;
    minZoomLevel?: number;
    maxZoomLevel?: number;
    provider?: any;
    mapType?: string;
    urlTemplate?: string;
    showsUserLocation?: boolean;
    showsCompass?: boolean;
    showsScale?: boolean;
    rotateEnabled?: boolean;
  },
  ref: any
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<Map<string, any>>(new Map());
  const LRef = useRef<any>(null);

  // Expose animateToRegion
  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      mapRef.current?.flyTo(
        [region.latitude, region.longitude],
        deltaToZoom(region.latitudeDelta),
        { duration: duration / 1000 }
      );
    },
  }));

  // Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      if (mapRef.current) return;
      LRef.current = L;

      const center: [number, number] = initialRegion
        ? [initialRegion.latitude, initialRegion.longitude]
        : [11.05, 78.6];
      const zoom = initialRegion ? deltaToZoom(initialRegion.latitudeDelta) : 7;

      const map = L.map(containerRef.current!, {
        center,
        zoom,
        minZoom: minZoomLevel,
        maxZoom: maxZoomLevel,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: maxZoomLevel,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Marker registry — child <Marker> components call this
  const markerPendingRef = useRef<MarkerInfo[]>([]);

  const register = (info: MarkerInfo) => {
    if (!mapRef.current || !LRef.current) {
      // Map not ready yet, queue it
      markerPendingRef.current.push(info);
      return;
    }
    addLeafletMarker(LRef.current, mapRef.current, info);
  };

  const unregister = (id: string) => {
    const m = leafletMarkersRef.current.get(id);
    if (m) {
      m.remove();
      leafletMarkersRef.current.delete(id);
    }
  };

  function addLeafletMarker(L: any, map: any, info: MarkerInfo) {
    // Remove existing marker with same id
    const existing = leafletMarkersRef.current.get(info.id);
    if (existing) {
      existing.remove();
      leafletMarkersRef.current.delete(info.id);
    }

    const color = info.color || '#4CAF50';
    const dotSize = info.size || 12;
    const border = info.borderColor || 'rgba(255,255,255,0.9)';
    const borderW = dotSize > 14 ? 2.5 : 2;
    const shadow = dotSize > 14
      ? '0 2px 8px rgba(0,0,0,0.5), 0 0 12px ' + color + '80'
      : '0 2px 6px rgba(0,0,0,0.35)';
    const zIdx = info.zIndex || 1;

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:${dotSize}px;height:${dotSize}px;
        background:${color};
        border:${borderW}px solid ${border};
        border-radius:50%;
        box-shadow:${shadow};
        cursor:pointer;
        transition:all 0.25s ease;
        z-index:${zIdx};
      " title="${info.label || ''}"></div>`,
      iconSize: [dotSize, dotSize],
      iconAnchor: [dotSize / 2, dotSize / 2],
    });

    const marker = L.marker(
      [info.coordinate.latitude, info.coordinate.longitude],
      { icon, zIndexOffset: zIdx * 10 }
    ).addTo(map);

    if (info.onPress) {
      marker.on('click', info.onPress);
    }
    if (info.label) {
      marker.bindTooltip(info.label, {
        permanent: false,
        className: 'ervizhi-tooltip',
        direction: 'top',
        offset: [0, -(dotSize / 2 + 4)],
      });
    }
    leafletMarkersRef.current.set(info.id, marker);
  }

  // Flush pending markers once map is ready
  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const pending = [...markerPendingRef.current];
    markerPendingRef.current = [];
    pending.forEach((info) => addLeafletMarker(LRef.current, mapRef.current, info));
  });

  // Compute container style
  const flatStyle: any = Array.isArray(style)
    ? Object.assign({}, ...style.map((s: any) => s || {}))
    : (style || {});

  const divStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: 400,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  return (
    <MarkerRegistryContext.Provider value={{ register, unregister }}>
      <div style={{ width: '100%', height: '100%', minHeight: 400, position: 'relative' }}>
        <div ref={containerRef} style={divStyle} />
      </div>
      {children}
    </MarkerRegistryContext.Provider>
  );
});

export const MapView = MapViewImpl;

// ─── Helpers ──────────────────────────────────────────────────────
function deltaToZoom(latitudeDelta: number): number {
  if (latitudeDelta >= 10) return 6;
  if (latitudeDelta >= 5)  return 7;
  if (latitudeDelta >= 2)  return 8;
  if (latitudeDelta >= 1)  return 9;
  if (latitudeDelta >= 0.5) return 10;
  if (latitudeDelta >= 0.2) return 11;
  return 12;
}
