"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Icon safi isiyosumbua
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

// Formula ya kukokotoa umbali (Math AI) ikiwa OSRM imegoma
function calculateDistanceMath(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius ya Dunia (KM)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Decode OSRM Polyline string into coordinates array
function decodePolyline(encoded: string) {
  let index = 0, lat = 0, lng = 0, coordinates = [];
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    coordinates.push([lat / 1e5, lng / 1e5] as [number, number]);
  }
  return coordinates;
}

function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 }); // Max Zoom 17 ili iingie ndani kabisa
    }
  }, [positions, map]);
  return null;
}

interface RouteMapProps {
  points: any[];
  onRouteCalculated: (distanceKm: number) => void;
}

export default function RouteMap({ points, onRouteCalculated }: RouteMapProps) {
  const validPoints = points.filter(p => p.latitude && p.longitude);
  const positions: [number, number][] = validPoints.map(p => [Number(p.latitude), Number(p.longitude)]);
  const center: [number, number] = positions.length > 0 ? positions[0] : [-6.7924, 39.2083]; 

  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);

  useEffect(() => {
    let totalDist = 0;

    const generateRoute = async () => {
      if (positions.length < 2) {
        setRoutePolyline([]);
        onRouteCalculated(0);
        return;
      }

      try {
        const coordsStr = positions.map(p => `${p[1]},${p[0]}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/trip/v1/driving/${coordsStr}?roundtrip=false&source=first&destination=last&overview=full`;
        
        // Timeout fupi, isipojibu chap tu-fall back!
        const res = await axios.get(osrmUrl, { timeout: 3000 });
        
        if (res.data?.trips?.[0]) {
          const trip = res.data.trips[0];
          setRoutePolyline(decodePolyline(trip.geometry));
          onRouteCalculated(trip.distance / 1000); 
          return;
        }
      } catch (err) {
        console.log("OSRM Imegoma. Natumia Mathematical AI...", err);
      }

      // Kama OSRM imegoma, chora Line ya kawaida na calculate umbali kihisabati
      setRoutePolyline(positions);
      for (let i = 0; i < positions.length - 1; i++) {
        totalDist += calculateDistanceMath(positions[i][0], positions[i][1], positions[i+1][0], positions[i+1][1]);
      }
      onRouteCalculated(totalDist);
    };

    generateRoute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validPoints.length]); 

  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 10 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {validPoints.map((point, idx) => (
        <Marker key={point.id || idx} position={[Number(point.latitude), Number(point.longitude)]} icon={customIcon}>
          <Popup><div className="text-center font-bold text-xs">{point.name || point.owner_name}</div></Popup>
        </Marker>
      ))}

      {routePolyline.length > 1 && (
        <Polyline positions={routePolyline} color="#10b981" weight={4} dashArray="8 8" opacity={0.9} />
      )}
      <MapBounds positions={positions} />
    </MapContainer>
  );
}