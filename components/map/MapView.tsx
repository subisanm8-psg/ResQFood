import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { calculateDistanceKm } from '../../lib/distance';
import { findNearestPlace, searchPlaces, Place } from '../../data/tamilnadu';
import { MapPin, Search, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

const TN_BOUNDS: [[number, number], [number, number]] = [
  [7.9, 76.1],
  [13.7, 80.5],
];

interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number, placeName?: string, district?: string) => void;
  selectionMode?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
  heightClass?: string;
}

// Controller for zooming and programmatic panning
const MapControls: React.FC<{
  center: [number, number];
  zoom?: number;
  onFindLocation: () => void;
}> = ({ center, zoom, onFindLocation }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, zoom, map]);

  return (
    <div className="absolute bottom-5 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
      <button
        onClick={onFindLocation}
        title="Find my location"
        className="w-9 h-9 rounded-xl bg-white shadow-card border border-brown-border text-brown-primary hover:bg-butter-50 flex items-center justify-center transition-colors"
      >
        <Navigation className="w-4 h-4" />
      </button>
      <div className="flex flex-col bg-white rounded-xl shadow-card border border-brown-border overflow-hidden">
        <button
          onClick={() => map.zoomIn()}
          title="Zoom In"
          className="w-9 h-9 flex items-center justify-center text-brown-primary hover:bg-butter-50 border-b border-brown-border transition-colors font-bold"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          title="Zoom Out"
          className="w-9 h-9 flex items-center justify-center text-brown-primary hover:bg-butter-50 transition-colors font-bold"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Map click event listener
const MapEvents: React.FC<{
  active?: boolean;
  onSelect?: (lat: number, lng: number) => void;
}> = ({ active, onSelect }) => {
  useMapEvents({
    click(e) {
      if (active && onSelect) {
        onSelect(
          Math.round(e.latlng.lat * 10000) / 10000,
          Math.round(e.latlng.lng * 10000) / 10000
        );
      }
    },
  });
  return null;
};

// Custom SVG Pins matching ResQFood branding
// Brown pin with plate/leaf icon for providers
const createProviderIcon = (isSelected: boolean) => {
  const scale = isSelected ? 'scale(1.15)' : 'scale(1)';
  return L.divIcon({
    className: 'custom-provider-pin',
    html: `
      <div style="transform: ${scale}; transition: transform 0.2s; background: #5A3A22; color: #FFF3C4; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #FFFBEA; box-shadow: 0 6px 14px rgba(90,58,34,0.35); display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF3C4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 2v4"/>
          <path d="M12 18v4"/>
          <path d="M4.93 4.93l2.83 2.83"/>
          <path d="M16.24 16.24l2.83 2.83"/>
        </svg>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

// Yellow pin with people icon for receivers (Red ring when urgency is Critical)
const createReceiverIcon = (isCritical: boolean, isSelected: boolean) => {
  const border = isCritical ? '3px solid #C0492F' : '3px solid #5A3A22';
  const shadow = isCritical ? '0 0 0 3px rgba(192,73,47,0.3), 0 6px 14px rgba(90,58,34,0.25)' : '0 6px 14px rgba(90,58,34,0.2)';
  const scale = isSelected ? 'scale(1.2)' : 'scale(1)';

  return L.divIcon({
    className: 'custom-receiver-pin',
    html: `
      <div style="transform: ${scale}; transition: transform 0.2s; background: #F2C94C; color: #5A3A22; width: 32px; height: 32px; border-radius: 50%; border: ${border}; box-shadow: ${shadow}; display: flex; align-items: center; justify-content: center;">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5A3A22" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// Van icon for delivery partner
const createDeliveryIcon = (companyName: string) => {
  return L.divIcon({
    className: 'custom-vehicle-pin',
    html: `
      <div style="background: #5A3A22; color: #FFF3C4; padding: 4px 10px; border-radius: 9999px; border: 2px solid #F2C94C; box-shadow: 0 6px 14px rgba(90,58,34,0.3); display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; transform: translate(-50%, -50%);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F2C94C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        <span>${companyName.split(' ')[0]}</span>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -15],
  });
};

export const MapView: React.FC<MapViewProps> = ({
  onLocationSelect,
  selectionMode = false,
  selectedLocation,
  heightClass = 'h-full min-h-[420px]',
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language === 'ta' ? 'ta' : 'en') as 'en' | 'ta';

  const {
    providers,
    receivers,
    lots,
    requests,
    matches,
    deliveryPartners,
    selectedProviderId,
    selectedReceiverId,
    setSelectedProviderId,
    setSelectedReceiverId,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [tileError, setTileError] = useState(false);
  const [osrmRoutes, setOsrmRoutes] = useState<Record<string, [number, number][]>>({});

  // Center on Tamil Nadu by default (~10.9, 78.4, zoom 7)
  const defaultCenter: [number, number] = [10.9, 78.4];

  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedLocation) return [selectedLocation.lat, selectedLocation.lng];
    const prov = providers.find((p) => p.id === selectedProviderId);
    if (prov) return [prov.location.lat, prov.location.lng];
    const rec = receivers.find((r) => r.id === selectedReceiverId);
    if (rec) return [rec.location.lat, rec.location.lng];
    return defaultCenter;
  }, [selectedLocation, selectedProviderId, selectedReceiverId, providers, receivers]);

  // Handle Search Input
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      setSearchResults(searchPlaces(q, currentLang).slice(0, 6));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = (place: Place) => {
    setSearchResults([]);
    setSearchQuery(currentLang === 'ta' ? place.nameTa : place.nameEn);
    if (onLocationSelect) {
      onLocationSelect(place.lat, place.lng, currentLang === 'ta' ? place.nameTa : place.nameEn, place.districtEn);
    }
  };

  // Find My Location
  const handleFindMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lng = Math.round(pos.coords.longitude * 10000) / 10000;
          const nearest = findNearestPlace(lat, lng);
          if (onLocationSelect) {
            onLocationSelect(
              lat,
              lng,
              currentLang === 'ta' ? nearest.nameTa : nearest.nameEn,
              nearest.districtEn
            );
          }
        },
        () => {
          // Fallback to Coimbatore center
          if (onLocationSelect) {
            onLocationSelect(11.0168, 76.9675, 'Coimbatore', 'Coimbatore');
          }
        }
      );
    }
  };

  // Active in-transit deliveries
  const activeDeliveries = useMemo(() => {
    return matches.filter((m) => m.status === 'In Transit');
  }, [matches]);

  // Fetch OSRM Road Path for in-transit deliveries
  useEffect(() => {
    activeDeliveries.forEach(async (delivery) => {
      const lot = lots.find((l) => l.id === delivery.lotId);
      const req = requests.find((r) => r.id === delivery.requestId);
      const prov = lot ? providers.find((p) => p.id === lot.providerId) : undefined;
      const rec = req ? receivers.find((r) => r.id === req.receiverId) : undefined;

      if (prov && rec && !osrmRoutes[delivery.id]) {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${prov.location.lng},${prov.location.lat};${rec.location.lng},${rec.location.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes[0]?.geometry?.coordinates) {
            const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]]
            );
            setOsrmRoutes((prev) => ({ ...prev, [delivery.id]: coords }));
          }
        } catch {
          // Fallback to straight line handled gracefully
        }
      }
    });
  }, [activeDeliveries, lots, requests, providers, receivers, osrmRoutes]);

  const nearestPlaceInfo = useMemo(() => {
    if (selectedLocation) {
      return findNearestPlace(selectedLocation.lat, selectedLocation.lng);
    }
    return null;
  }, [selectedLocation]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-brown-border shadow-card bg-cream-page`}>
      {/* Search Box at Top Left */}
      <div className="absolute top-4 left-4 z-[1000] max-w-xs sm:max-w-sm w-full pointer-events-auto">
        <div className="relative">
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-brown-border shadow-card px-3 py-2">
            <Search className="w-4 h-4 text-brown-caramel flex-shrink-0 mr-2" />
            <input
              type="text"
              placeholder={t('map.searchLocation')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full text-xs font-medium text-brown-primary bg-transparent focus:outline-none placeholder:text-brown-300"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-brown-border shadow-elevation py-1 divide-y divide-brown-100 z-50">
              {searchResults.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectSearchResult(place)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-butter-50 flex items-center justify-between text-brown-primary transition-colors"
                >
                  <span className="font-semibold">
                    {currentLang === 'ta' ? place.nameTa : place.nameEn}
                  </span>
                  <span className="text-[10px] text-brown-secondary bg-butter-100 px-2 py-0.5 rounded-full">
                    {currentLang === 'ta' ? place.districtTa : place.districtEn}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nearest place label */}
        {nearestPlaceInfo && (
          <div className="mt-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-brown-border shadow-subtle text-[11px] text-brown-primary flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brown-caramel flex-shrink-0" />
            <span className="text-brown-secondary">{t('map.nearestPlace')}</span>
            <strong className="font-bold">
              {currentLang === 'ta' ? nearestPlaceInfo.nameTa : nearestPlaceInfo.nameEn} (
              {currentLang === 'ta' ? nearestPlaceInfo.districtTa : nearestPlaceInfo.districtEn})
            </strong>
          </div>
        )}
      </div>

      {/* Map Legend at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-brown-border shadow-card text-[11px] pointer-events-auto flex flex-col gap-1.5">
        <div className="font-bold text-brown-primary uppercase tracking-wider text-[10px]">
          {t('map.legendTitle')}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brown-primary border border-butter-100"></span>
          <span className="text-brown-primary font-medium">{t('map.providersPin')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-butter-300 border border-brown-primary"></span>
          <span className="text-brown-primary font-medium">{t('map.receiversPin')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-status-red border border-white"></span>
          <span className="text-status-red font-semibold">{t('map.criticalUrgency')}</span>
        </div>
        <div className="flex items-center gap-2 pt-0.5 border-t border-brown-100">
          <span className="w-2.5 h-2.5 rounded-full bg-brown-primary border border-butter-300"></span>
          <span className="text-brown-primary font-medium">{t('map.courierPin')}</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={7}
        maxBounds={TN_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={6}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      >
        <MapControls center={mapCenter} onFindLocation={handleFindMyLocation} />
        <MapEvents active={selectionMode} onSelect={onLocationSelect} />

        {/* Section 5: CARTO Voyager Tiles with fallback to Positron */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            tileError
              ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
          eventHandlers={{
            tileerror: () => setTileError(true),
          }}
          maxZoom={19}
        />

        {/* Selected location marker during picker mode */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={L.divIcon({
              className: 'custom-picker-pin',
              html: `
                <div style="background: #5A3A22; color: #FFF3C4; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #F2C94C; box-shadow: 0 0 0 4px rgba(242,201,76,0.3); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 10px; height: 10px; background: #FFF3C4; border-radius: 50%;"></div>
                </div>`,
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            })}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                const nearest = findNearestPlace(pos.lat, pos.lng);
                if (onLocationSelect) {
                  onLocationSelect(
                    Math.round(pos.lat * 10000) / 10000,
                    Math.round(pos.lng * 10000) / 10000,
                    currentLang === 'ta' ? nearest.nameTa : nearest.nameEn,
                    nearest.districtEn
                  );
                }
              },
            }}
          />
        )}

        {/* 1. Provider Markers */}
        {providers.map((provider) => {
          const isSelected = provider.id === selectedProviderId;
          const providerLots = lots.filter(
            (l) => l.providerId === provider.id && l.quantityRemaining > 0 && l.status === 'Available'
          );
          const totalSurplus = providerLots.reduce((sum, l) => sum + l.quantityRemaining, 0);

          return (
            <Marker
              key={provider.id}
              position={[provider.location.lat, provider.location.lng]}
              icon={createProviderIcon(isSelected)}
              eventHandlers={{
                click: () => setSelectedProviderId(provider.id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 border-b border-brown-border pb-1">
                    <h4 className="font-bold text-xs text-brown-primary">{provider.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-butter-100 text-brown-primary font-semibold">
                      {provider.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-brown-secondary">{provider.address}</p>
                  <div className="text-[11px] pt-1 flex justify-between font-medium">
                    <span className="text-brown-secondary">{t('common.extraFood')}:</span>
                    <strong className="text-brown-primary">
                      {totalSurplus} {t('common.portions')} ({providerLots.length} {t('provider.dishesInBasket')})
                    </strong>
                  </div>
                  <button
                    onClick={() => setSelectedProviderId(provider.id)}
                    className="w-full mt-2 py-1.5 px-3 bg-brown-primary text-butter-100 text-xs font-semibold rounded-xl hover:bg-brown-secondary transition-colors"
                  >
                    {t('common.confirm')}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Receiver Markers */}
        {receivers.map((receiver) => {
          const isSelected = receiver.id === selectedReceiverId;
          const openRequests = requests.filter(
            (r) =>
              r.receiverId === receiver.id &&
              (r.status === 'Waiting' || r.status === 'Partially Fulfilled')
          );
          const isCritical = openRequests.some((r) => r.urgency === 'Critical');
          const totalNeeded = openRequests.reduce(
            (sum, r) => sum + (r.quantityNeeded - (r.quantityReceived || 0)),
            0
          );

          return (
            <Marker
              key={receiver.id}
              position={[receiver.location.lat, receiver.location.lng]}
              icon={createReceiverIcon(isCritical, isSelected)}
              eventHandlers={{
                click: () => setSelectedReceiverId(receiver.id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 border-b border-brown-border pb-1">
                    <h4 className="font-bold text-xs text-brown-primary">{receiver.name}</h4>
                    {isCritical && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-red text-white font-bold">
                        {t('common.urgent')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brown-secondary">{receiver.organizationType} &bull; {receiver.headcount} people</p>
                  <p className="text-[11px] text-brown-secondary">{receiver.address}</p>
                  <div className="text-[11px] pt-1 flex justify-between font-medium">
                    <span className="text-brown-secondary">{t('receiver.quantityNeeded')}:</span>
                    <strong className="text-brown-primary">{totalNeeded} {t('common.portions')}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedReceiverId(receiver.id)}
                    className="w-full mt-2 py-1.5 px-3 bg-brown-primary text-butter-100 text-xs font-semibold rounded-xl hover:bg-brown-secondary transition-colors"
                  >
                    {t('common.confirm')}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Delivery Partner Moving Vehicle and Animated OSRM Road Route */}
        {activeDeliveries.map((delivery) => {
          const lot = lots.find((l) => l.id === delivery.lotId);
          const req = requests.find((r) => r.id === delivery.requestId);
          const provider = lot ? providers.find((p) => p.id === lot.providerId) : undefined;
          const receiver = req ? receivers.find((r) => r.id === req.receiverId) : undefined;
          const partner = deliveryPartners.find((p) => p.id === delivery.deliveryPartnerId);

          if (!provider || !receiver || !delivery.currentCoordinates) return null;

          // Road route coordinates from OSRM or fallback straight line
          const fullRoute = osrmRoutes[delivery.id] || [
            [provider.location.lat, provider.location.lng],
            [receiver.location.lat, receiver.location.lng],
          ];

          return (
            <React.Fragment key={delivery.id}>
              {/* Soft brown road route line */}
              <Polyline
                positions={fullRoute}
                color="#7B5233"
                weight={4}
                opacity={0.65}
              />

              {/* Animated dashed segment for the active courier path */}
              <Polyline
                positions={[
                  [delivery.currentCoordinates.lat, delivery.currentCoordinates.lng],
                  [receiver.location.lat, receiver.location.lng],
                ]}
                color="#B8793A"
                weight={4}
                className="animated-route-line"
              />

              {/* Moving delivery van marker */}
              <Marker
                position={[delivery.currentCoordinates.lat, delivery.currentCoordinates.lng]}
                icon={createDeliveryIcon(partner?.companyName || 'ResQFood Courier')}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-1 min-w-[190px]">
                    <div className="font-bold text-xs text-brown-primary">
                      {partner?.companyName} ({partner?.vehicleType})
                    </div>
                    <div className="text-[11px] text-brown-secondary">
                      {partner?.driverName} &bull; {partner?.plateNumber}
                    </div>
                    <div className="text-[11px] font-semibold text-brown-caramel">
                      Progress: {delivery.currentRouteProgress || 10}%
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
