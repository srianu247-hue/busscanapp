/**
 * LiveMapCard.tsx
 *
 * Renders a real-time Leaflet map showing the bus/passenger location
 * during an active trip. Updates the marker as new GPS coordinates arrive.
 *
 * Uses CDN Leaflet injected into the document (no npm package needed).
 */

import { FC, useEffect, useRef } from 'react';
import { Map, Satellite } from 'lucide-react';
import { GPSCoordinates } from '../utils/gps';

interface LiveMapCardProps {
    /** Latest live GPS coordinate to center the map on */
    liveLocation: GPSCoordinates | null;
    /** Entry location, shown as a fixed green marker */
    entryLocation: GPSCoordinates | null;
    /** Whether the map panel should be visible */
    show: boolean;
}

// Extend window type for Leaflet globals injected via CDN
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        L?: any;
    }
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet/dist/leaflet.js';

/** Inject Leaflet CSS + JS from CDN once and return a promise when ready */
function injectLeaflet(): Promise<void> {
    return new Promise((resolve) => {
        if (window.L) return resolve();

        // CSS
        if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = LEAFLET_CSS;
            document.head.appendChild(link);
        }

        // JS
        if (!document.querySelector(`script[src="${LEAFLET_JS}"]`)) {
            const script = document.createElement('script');
            script.src = LEAFLET_JS;
            script.onload = () => resolve();
            script.onerror = () => resolve(); // fail gracefully
            document.head.appendChild(script);
        } else {
            // Script tag already present but might still be loading
            const check = setInterval(() => {
                if (window.L) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        }
    });
}

const LiveMapCard: FC<LiveMapCardProps> = ({ liveLocation, entryLocation, show }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const liveMarkerRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entryMarkerRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const polylineRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coordsRef = useRef<any[]>([]);

    // Initialize Leaflet map once when card becomes visible
    useEffect(() => {
        if (!show || !mapContainerRef.current) return;

        let isMounted = true;

        injectLeaflet().then(() => {
            if (!isMounted || !mapContainerRef.current || !window.L) return;
            if (mapInstanceRef.current) return; // already initialized

            const L = window.L;

            // Default center: Chennai
            const defaultCenter = entryLocation
                ? [entryLocation.lat, entryLocation.lng]
                : [13.0827, 80.2707];

            const mapEl = mapContainerRef.current;
            const map = L.map(mapEl, { zoomControl: true }).setView(defaultCenter, 14);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            }).addTo(map);

            // Entry marker (green pin)
            if (entryLocation) {
                const entryIcon = L.divIcon({
                    html: `<div style="
                        background:#16a34a;color:white;border-radius:50%;
                        width:28px;height:28px;display:flex;align-items:center;
                        justify-content:center;font-size:14px;font-weight:bold;
                        box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white">
                        🚏
                    </div>`,
                    className: '',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });
                entryMarkerRef.current = L.marker(
                    [entryLocation.lat, entryLocation.lng],
                    { icon: entryIcon }
                ).addTo(map).bindPopup('<b>Entry Point</b>');
                coordsRef.current.push([entryLocation.lat, entryLocation.lng]);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [show, entryLocation]);

    // Update live marker whenever GPS coordinates change
    useEffect(() => {
        if (!show || !liveLocation || !mapInstanceRef.current || !window.L) return;

        const L = window.L;
        const map = mapInstanceRef.current;
        const latLng = [liveLocation.lat, liveLocation.lng];

        coordsRef.current.push(latLng);

        if (liveMarkerRef.current) {
            liveMarkerRef.current.setLatLng(latLng);
        } else {
            const busIcon = L.divIcon({
                html: `<div style="
                    background:#2563eb;color:white;border-radius:50%;
                    width:36px;height:36px;display:flex;align-items:center;
                    justify-content:center;font-size:18px;
                    box-shadow:0 2px 8px rgba(37,99,235,0.6);border:2px solid white;
                    animation:pulse 1.5s infinite">
                    🚌
                </div>`,
                className: '',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });
            liveMarkerRef.current = L.marker(latLng, { icon: busIcon })
                .addTo(map)
                .bindPopup('<b>Live Position</b>');
        }

        // Draw/update the trail polyline
        if (polylineRef.current) {
            polylineRef.current.setLatLngs(coordsRef.current);
        } else if (coordsRef.current.length > 1) {
            polylineRef.current = L.polyline(coordsRef.current, {
                color: '#2563eb',
                weight: 3,
                opacity: 0.7,
                dashArray: '6 4'
            }).addTo(map);
        }

        map.panTo(latLng, { animate: true });
    }, [liveLocation, show]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                liveMarkerRef.current = null;
                entryMarkerRef.current = null;
                polylineRef.current = null;
                coordsRef.current = [];
            }
        };
    }, []);

    if (!show) return null;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Map className="w-6 h-6 text-blue-600" />
                Live GPS Map
                {liveLocation && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <Satellite className="w-3 h-3 animate-pulse" />
                        LIVE
                    </span>
                )}
            </h2>

            {/* Map container */}
            <div
                ref={mapContainerRef}
                id="live-gps-map"
                style={{ height: '340px', borderRadius: '12px', overflow: 'hidden' }}
                className="border border-gray-100 shadow-inner"
            />

            {/* Coordinate display */}
            {liveLocation && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-500 font-medium">Latitude</p>
                        <p className="font-mono font-semibold text-blue-900">
                            {liveLocation.lat.toFixed(6)}°
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-500 font-medium">Longitude</p>
                        <p className="font-mono font-semibold text-blue-900">
                            {liveLocation.lng.toFixed(6)}°
                        </p>
                    </div>
                    {liveLocation.accuracy !== undefined && (
                        <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 font-medium">Accuracy</p>
                            <p className="font-mono font-semibold text-gray-700">
                                ±{liveLocation.accuracy.toFixed(1)} m
                            </p>
                        </div>
                    )}
                </div>
            )}

            {!liveLocation && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-400 justify-center py-4">
                    <Satellite className="w-4 h-4 animate-pulse" />
                    Waiting for GPS signal...
                </div>
            )}
        </div>
    );
};

export default LiveMapCard;
