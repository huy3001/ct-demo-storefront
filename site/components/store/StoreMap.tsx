'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { StoreLocation } from '@/lib/ct/store';

const WORLD_CENTER: [number, number] = [20, 0];

const storePinIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#00b39e;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);transform:rotate(-45deg)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function MapViewport({ stores }: { stores: StoreLocation[] }) {
  const map = useMap();
  const positions = useMemo(
    () => stores.flatMap((store) => store.position ? [[store.position.lat, store.position.lng] as [number, number]] : []),
    [stores],
  );

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(WORLD_CENTER, 2);
      return;
    }

    if (positions.length === 1) {
      map.flyTo(positions[0], 15);
      return;
    }

    map.fitBounds(positions, { padding: [32, 32], maxZoom: 15 });
  }, [map, positions]);

  return null;
}

export default function StoreMap({ stores }: { stores: StoreLocation[] }) {
  const mappableStores = stores.filter((store) => Boolean(store.position));

  return (
    <div
      className="h-100 overflow-hidden rounded-sm border border-border bg-white lg:h-145"
      aria-label="Store locations map"
    >
      <MapContainer
        center={WORLD_CENTER}
        zoom={2}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer
          referrerPolicy="origin"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport stores={mappableStores} />
        {mappableStores.map((store) => (
          <Marker
            key={store.id}
            position={[store.position!.lat, store.position!.lng]}
            icon={storePinIcon}
          >
            <Popup>
              <div className="flex flex-col items-center text-center">
                <strong>{store.name}</strong>
                <span>{store.address}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
