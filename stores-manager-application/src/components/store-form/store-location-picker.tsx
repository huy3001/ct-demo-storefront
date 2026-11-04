import { useEffect, useMemo, useState } from 'react';
import L, { type LatLngExpression } from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import FlatButton from '@commercetools-uikit/flat-button';
import { ContentNotification } from '@commercetools-uikit/notifications';
import SearchTextInput from '@commercetools-uikit/search-text-input';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
// @ts-expect-error CSS is loaded by the application bundler.
import 'leaflet/dist/leaflet.css';

const WORLD_CENTER: LatLngExpression = [20, 0];
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// A CSS-only pin avoids Leaflet's default marker images, which bundlers cannot resolve
const pinIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#00b39e;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);transform:rotate(-45deg)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

type TSearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type TStoreLocationPickerProps = {
  latitude: string;
  longitude: string;
  isReadOnly?: boolean;
  onChange: (latitude: number, longitude: number) => void;
};

const toPosition = (latitude: string, longitude: string) => {
  if (latitude.trim() === '' || longitude.trim() === '') return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? ([lat, lng] as [number, number])
    : null;
};

const ClickHandler = ({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click: (event) => onSelect(event.latlng.lat, event.latlng.lng),
  });
  return null;
};

// Re-centers the map when the position changes outside of a map interaction
const MapSync = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  const lat = position?.[0];
  const lng = position?.[1];
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    if (!map.getBounds().contains([lat, lng])) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 13));
    }
  }, [map, lat, lng]);
  return null;
};

const StoreLocationPicker = (props: TStoreLocationPickerProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<TSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const position = toPosition(props.latitude, props.longitude);
  const { onChange } = props;

  const markerHandlers = useMemo(
    () => ({
      dragend: (event: L.LeafletEvent) => {
        const { lat, lng } = (event.target as L.Marker).getLatLng();
        onChange(lat, lng);
      },
    }),
    [onChange]
  );

  const runSearch = async (query: string) => {
    setSearch(query);
    setResults([]);
    setSearchError(null);
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `${NOMINATIM_URL}?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error(response.statusText);
      const found = (await response.json()) as TSearchResult[];
      setResults(found);
      if (found.length === 0) setSearchError('No address found.');
    } catch {
      setSearchError(
        'Unable to search addresses. Enter the coordinates manually.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Spacings.Stack scale="m">
      {!props.isReadOnly && (
        <Spacings.Stack scale="s">
          <Text.Detail tone="secondary">
            Search an address, click the map or drag the pin to set the store
            coordinates
          </Text.Detail>
          <SearchTextInput
            value={search}
            placeholder="Search address"
            isDisabled={isSearching}
            onSubmit={runSearch}
            onReset={() => {
              setSearch('');
              setResults([]);
              setSearchError(null);
            }}
          />
          {searchError && (
            <ContentNotification type="warning">
              <Text.Body>{searchError}</Text.Body>
            </ContentNotification>
          )}
          {results.map((result) => (
            <FlatButton
              key={result.place_id}
              label={result.display_name}
              onClick={() => {
                onChange(Number(result.lat), Number(result.lon));
                setSearch(result.display_name);
                setResults([]);
              }}
            />
          ))}
        </Spacings.Stack>
      )}
      <div
        data-testid="store-location-map"
        style={{ height: 360, borderRadius: 6, overflow: 'hidden' }}
      >
        <MapContainer
          center={position ?? WORLD_CENTER}
          zoom={position ? 15 : 2}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          {/* The Merchant Center page sends no referrer, which OSM tile servers reject (403) */}
          <TileLayer
            referrerPolicy="origin"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!props.isReadOnly && <ClickHandler onSelect={onChange} />}
          <MapSync position={position} />
          {position && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable={!props.isReadOnly}
              eventHandlers={markerHandlers}
            />
          )}
        </MapContainer>
      </div>
    </Spacings.Stack>
  );
};
StoreLocationPicker.displayName = 'StoreLocationPicker';

export default StoreLocationPicker;
