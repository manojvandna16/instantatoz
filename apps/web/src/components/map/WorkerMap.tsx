'use client';

import { useEffect, useRef } from 'react';
import type { NearbyWorker } from '@/app/actions/geo';

interface WorkerMapProps {
  customerLat: number;
  customerLng: number;
  workers: NearbyWorker[];
  onWorkerSelect: (worker: NearbyWorker) => void;
}

export default function WorkerMap({
  customerLat,
  customerLng,
  workers,
  onWorkerSelect,
}: WorkerMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    if (typeof window === 'undefined') return;
    if (!mapContainerRef.current) return;

    let map: any;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Avoid double-init
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      map = L.map(mapContainerRef.current!).setView([customerLat, customerLng], 14);
      mapRef.current = map;

      // OpenStreetMap tile layer (free, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Customer location marker (blue)
      const customerIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 2px 8px rgba(37,99,235,0.5);"></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([customerLat, customerLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup('<b>You are here</b>');

      // 5km radius circle
      L.circle([customerLat, customerLng], {
        radius: 5000,
        color: '#2563EB',
        fillColor: '#2563EB',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '6 4',
      }).addTo(map);

      // Worker markers (green)
      for (const worker of workers) {
        const avg = worker.stats.averageRating;
        const stars = avg > 0 ? `⭐ ${avg.toFixed(1)}` : 'New';
        const skill = worker.skills[0] || 'Worker';

        const workerIcon = L.divIcon({
          html: `
            <div style="
              background:#16a34a;
              color:white;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              width:36px;height:36px;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 3px 10px rgba(22,163,74,0.5);
              border:2px solid white;
              cursor:pointer;
            ">
              <span style="transform:rotate(45deg);font-size:18px;">👷</span>
            </div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -40],
        });

        L.marker([worker.lat, worker.lng], { icon: workerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:140px;padding:4px 0">
              <b style="font-size:14px;">${worker.name}</b><br/>
              <span style="color:#6b7280;font-size:12px;">${skill}</span><br/>
              <span style="font-size:12px;">${stars}</span><br/>
              <span style="color:#2563EB;font-size:12px;">📍 ${worker.distanceKm} km away</span>
            </div>
          `)
          .on('click', () => {
            onWorkerSelect(worker);
          });
      }
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [customerLat, customerLng, workers, onWorkerSelect]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ height: '420px', zIndex: 0 }}
    />
  );
}
