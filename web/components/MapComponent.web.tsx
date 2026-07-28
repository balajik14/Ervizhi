/**
 * MapComponent.web.tsx
 * --------------------
 * Web-only map using Leaflet directly.
 * Exposes MapView, Marker, PROVIDER_DEFAULT matching react-native-maps API.
 * Markers use a custom `color` prop for the dot color on web.
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
  
  const style = document.createElement('style');
  style.innerHTML = `
    .ervizhi-tooltip {
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: white !important;
      font-weight: 700 !important;
      font-size: 11px !important;
      text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black !important;
    }
    .leaflet-tooltip-left::before, .leaflet-tooltip-right::before, .leaflet-tooltip-top::before, .leaflet-tooltip-bottom::before {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
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
  label?: string;
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
  label,
  anchor,
  children,
}: {
  coordinate: Coordinate;
  onPress?: () => void;
  color?: string;
  label?: string;
  anchor?: { x: number; y: number };
  children?: React.ReactNode;
}) {
  const registry = useContext(MarkerRegistryContext);
  const idRef = useRef<string>(`m-${++_markerSeq}`);

  useEffect(() => {
    if (!registry) return;
    registry.register({ id: idRef.current, coordinate, onPress, color, label });
    return () => registry.unregister(idRef.current);
  }, [coordinate.latitude, coordinate.longitude, color, label, onPress]);

  return null; // rendered by MapView via Leaflet
});

// ─── MapView (web) ────────────────────────────────────────────────
const MapViewImpl = forwardRef(function MapView(
  {
    style,
    initialRegion,
    children,
    minZoomLevel = 6,
    maxZoomLevel = 18,
    mapType = 'satellite',
    onPress,
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
    onPress?: (e: { nativeEvent: { coordinate: Coordinate } }) => void;
  },
  ref: any
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletMarkersRef = useRef<Map<string, any>>(new Map());
  const LRef = useRef<any>(null);
  const onPressRef = useRef(onPress);

  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

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
        maxBounds: [[8.07, 76.2], [13.6, 80.4]],
        maxBoundsViscosity: 1.0,
      });

      if (mapType === 'satellite') {
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: maxZoomLevel }).addTo(map);
        const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: maxZoomLevel }).addTo(map);
        tileLayerRef.current = [satelliteLayer, labelsLayer];
      } else {
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: maxZoomLevel }).addTo(map);
        tileLayerRef.current = osmLayer;
      }

      map.on('click', (e: any) => {
        if (onPressRef.current) {
          onPressRef.current({
            nativeEvent: {
              coordinate: {
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
              },
            },
          });
        }
      });

      mapRef.current = map;

      // Handle resize to fix Leaflet grey map loading error in flex containers
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(containerRef.current!);
      (mapRef.current as any)._resizeObserver = resizeObserver;
    });

    return () => {
      if (mapRef.current) {
        if ((mapRef.current as any)._resizeObserver && containerRef.current) {
          (mapRef.current as any)._resizeObserver.disconnect();
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update TileLayer when mapType changes dynamically
  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const L = LRef.current;
    if (tileLayerRef.current) {
      if (Array.isArray(tileLayerRef.current)) {
        tileLayerRef.current.forEach((layer: any) => mapRef.current.removeLayer(layer));
      } else {
        mapRef.current.removeLayer(tileLayerRef.current);
      }
    }
    
    if (mapType === 'satellite') {
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: maxZoomLevel }).addTo(mapRef.current);
      const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: maxZoomLevel }).addTo(mapRef.current);
      tileLayerRef.current = [satelliteLayer, labelsLayer];
    } else {
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: maxZoomLevel }).addTo(mapRef.current);
      tileLayerRef.current = tileLayer;
    }
  }, [mapType]);

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
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:12px;height:12px;
        background:${color};
        border:2px solid rgba(255,255,255,0.9);
        border-radius:50%;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        cursor:pointer;
        transition:transform 0.15s;
      " title="${info.label || ''}"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const marker = L.marker([info.coordinate.latitude, info.coordinate.longitude], { icon }).addTo(map);
    if (info.onPress) {
      marker.on('click', info.onPress);
    }
    if (info.label) {
      marker.bindTooltip(info.label, { permanent: true, className: 'ervizhi-tooltip', direction: 'right', offset: [8, 0] });
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
