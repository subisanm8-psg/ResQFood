import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Search, Navigation } from 'lucide-react';
import { TN_DISTRICTS, TN_PLACES, findNearestPlace, Place } from '../../data/tamilnadu';

interface LocationPickerProps {
  initialLat: number;
  initialLng: number;
  initialAddress: string;
  initialDistrict?: string;
  onChange: (loc: { lat: number; lng: number; address: string; district: string; placeName: string }) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat,
  initialLng,
  initialAddress,
  initialDistrict,
  onChange,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language === 'ta' ? 'ta' : 'en') as 'en' | 'ta';

  const [selectedDistrictId, setSelectedDistrictId] = useState(
    TN_DISTRICTS.find((d) => d.nameEn.toLowerCase() === initialDistrict?.toLowerCase())?.id || 'coimbatore'
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [nominatimResults, setNominatimResults] = useState<{ displayName: string; lat: number; lng: number }[]>([]);
  const [isSearchingNominatim, setIsSearchingNominatim] = useState(false);
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);

  const debounceTimer = useRef<any>(null);

  // Filter towns/villages by district
  const districtPlaces = TN_PLACES.filter((p) => p.districtId === selectedDistrictId);

  // Nearest place calculation
  const nearest = findNearestPlace(currentLat, currentLng);

  // Handle District Change
  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const district = TN_DISTRICTS.find((d) => d.id === distId);
    if (district) {
      setCurrentLat(district.lat);
      setCurrentLng(district.lng);
      const placeName = currentLang === 'ta' ? district.nameTa : district.nameEn;
      const addr = `${district.nameEn}, Tamil Nadu`;
      setCurrentAddress(addr);
      onChange({
        lat: district.lat,
        lng: district.lng,
        address: addr,
        district: district.nameEn,
        placeName,
      });
    }
  };

  // Handle Town/Village Select
  const handlePlaceSelect = (placeId: string) => {
    setSelectedPlaceId(placeId);
    const place = TN_PLACES.find((p) => p.id === placeId);
    if (place) {
      setCurrentLat(place.lat);
      setCurrentLng(place.lng);
      const placeName = currentLang === 'ta' ? place.nameTa : place.nameEn;
      const addr = `${place.nameEn}, ${place.districtEn}, Tamil Nadu`;
      setCurrentAddress(addr);
      onChange({
        lat: place.lat,
        lng: place.lng,
        address: addr,
        district: place.districtEn,
        placeName,
      });
    }
  };

  // Nominatim Search with Debounce (Section 6)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setNominatimResults([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsSearchingNominatim(true);
      try {
        // Tamil Nadu bounding box: viewbox=76.1,13.7,80.5,7.9
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=in&viewbox=76.1,13.7,80.5,7.9&bounded=1&limit=5`;
        const res = await fetch(url, { headers: { 'Accept-Language': currentLang === 'ta' ? 'ta' : 'en' } });
        const data = await res.json();
        if (Array.isArray(data)) {
          setNominatimResults(
            data.map((item: any) => ({
              displayName: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }))
          );
        }
      } catch {
        // Fallback silently if offline or blocked
        setNominatimResults([]);
      } finally {
        setIsSearchingNominatim(false);
      }
    }, 450);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, currentLang]);

  // Use My Current Location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lng = Math.round(pos.coords.longitude * 10000) / 10000;
          const near = findNearestPlace(lat, lng);
          setCurrentLat(lat);
          setCurrentLng(lng);
          const addr = `Near ${near.nameEn}, ${near.districtEn}`;
          setCurrentAddress(addr);
          onChange({
            lat,
            lng,
            address: addr,
            district: near.districtEn,
            placeName: currentLang === 'ta' ? near.nameTa : near.nameEn,
          });
        },
        () => {
          // Fallback to Coimbatore default
          handleDistrictChange('coimbatore');
        }
      );
    }
  };

  return (
    <div className="space-y-3 bg-butter-50/70 p-4 rounded-2xl border border-brown-border">
      {/* Header & Quick Location Button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-brown-primary flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-brown-caramel" />
          <span>Location Selection</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-brown-border text-brown-primary text-xs font-semibold hover:bg-butter-100 transition-colors shadow-subtle"
        >
          <Navigation className="w-3.5 h-3.5 text-brown-caramel" />
          <span>{t('map.findMyLocation')}</span>
        </button>
      </div>

      {/* District & Town/Village Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-brown-secondary mb-1">
            {t('auth.districtLabel')}
          </label>
          <select
            value={selectedDistrictId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-brown-border rounded-xl text-xs font-medium text-brown-primary focus:outline-none focus:ring-2 focus:ring-butter-300"
          >
            {TN_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {currentLang === 'ta' ? d.nameTa : d.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-brown-secondary mb-1">
            Town or Village
          </label>
          <select
            value={selectedPlaceId}
            onChange={(e) => handlePlaceSelect(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-brown-border rounded-xl text-xs font-medium text-brown-primary focus:outline-none focus:ring-2 focus:ring-butter-300"
          >
            <option value="">Select town / village...</option>
            {districtPlaces.map((p) => (
              <option key={p.id} value={p.id}>
                {currentLang === 'ta' ? p.nameTa : p.nameEn} ({p.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input for unlisted villages or specific streets */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-xl border border-brown-border px-3 py-2">
          <Search className="w-3.5 h-3.5 text-brown-300 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search village or street via Tamil Nadu map search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-brown-primary bg-transparent focus:outline-none placeholder:text-brown-300 font-medium"
          />
        </div>

        {nominatimResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-brown-border shadow-elevation py-1 z-50 divide-y divide-brown-100 max-h-48 overflow-y-auto">
            {nominatimResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentLat(item.lat);
                  setCurrentLng(item.lng);
                  setCurrentAddress(item.displayName);
                  const near = findNearestPlace(item.lat, item.lng);
                  onChange({
                    lat: item.lat,
                    lng: item.lng,
                    address: item.displayName,
                    district: near.districtEn,
                    placeName: currentLang === 'ta' ? near.nameTa : near.nameEn,
                  });
                  setNominatimResults([]);
                  setSearchQuery('');
                }}
                className="w-full text-left px-3 py-2 text-[11px] text-brown-primary hover:bg-butter-50 transition-colors"
              >
                {item.displayName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Readable Address & Coordinates Display */}
      <div className="p-2.5 bg-white rounded-xl border border-brown-border text-xs flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 font-bold text-brown-primary">
          <MapPin className="w-3.5 h-3.5 text-brown-caramel flex-shrink-0" />
          <span>
            {currentLang === 'ta' ? nearest.nameTa : nearest.nameEn} ({currentLang === 'ta' ? nearest.districtTa : nearest.districtEn})
          </span>
        </div>
        <div className="text-[11px] text-brown-secondary font-medium truncate">
          {currentAddress || `${nearest.nameEn}, Tamil Nadu`}
        </div>
        <div className="text-[10px] text-brown-400 font-mono">
          Coordinates: {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
