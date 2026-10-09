import React, { useState } from 'react';
import { X, MapPin, AlertCircle, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FoodType, FoodCategory, UnitType } from '../../types';

interface ListSurplusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableMapPick: (cb: (lat: number, lng: number) => void) => void;
}

export const ListSurplusModal: React.FC<ListSurplusModalProps> = ({
  isOpen,
  onClose,
  onEnableMapPick,
}) => {
  const { providers, selectedProviderId, listSurplusLot, simulatedClock } = useAppStore();

  const currentProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  const [providerId, setProviderId] = useState(currentProvider.id);
  const [itemName, setItemName] = useState('');
  const [foodType, setFoodType] = useState<FoodType>('Veg');
  const [category, setCategory] = useState<FoodCategory>('Cooked meal');
  const [quantity, setQuantity] = useState<number>(30);
  const [unit, setUnit] = useState<UnitType>('portions');
  const [expiryHoursFromNow, setExpiryHoursFromNow] = useState<number>(3.5);
  const [locationLat, setLocationLat] = useState(currentProvider.location.lat);
  const [locationLng, setLocationLng] = useState(currentProvider.location.lng);
  const [address, setAddress] = useState(currentProvider.location.address);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationLat(Math.round(pos.coords.latitude * 10000) / 10000);
          setLocationLng(Math.round(pos.coords.longitude * 10000) / 10000);
          setAddress(`GPS: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        },
        () => {
          // Fallback to default city coordinates per spec
          setLocationLat(37.7749);
          setLocationLng(-122.4194);
          setAddress('Default City Center, Market St');
        }
      );
    } else {
      setLocationLat(37.7749);
      setLocationLng(-122.4194);
      setAddress('Default City Center, Market St');
    }
  };

  const handlePickOnMap = () => {
    onEnableMapPick((lat, lng) => {
      setLocationLat(lat);
      setLocationLng(lng);
      setAddress(`Pinned Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!itemName.trim()) {
      newErrors.itemName = 'Food item name is required.';
    }
    if (quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0.';
    }
    if (expiryHoursFromNow <= 0.1) {
      newErrors.expiry = 'Expiry time must be in the future.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const current = new Date(simulatedClock);
    const expiryDate = new Date(current.getTime() + expiryHoursFromNow * 3600 * 1000);

    listSurplusLot({
      providerId,
      itemName: itemName.trim(),
      foodType,
      category,
      quantityTotal: quantity,
      quantityRemaining: quantity,
      unit,
      preparedAt: current.toISOString(),
      expiryAt: expiryDate.toISOString(),
    });

    onClose();
    setItemName('');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="text-base font-bold text-stone-900">List Surplus Food</h3>
            <p className="text-xs text-stone-500">Provide details for immediate automated smart matching</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Provider Select */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Provider Establishment
            </label>
            <select
              value={providerId}
              onChange={(e) => {
                setProviderId(e.target.value);
                const prov = providers.find((p) => p.id === e.target.value);
                if (prov) {
                  setLocationLat(prov.location.lat);
                  setLocationLng(prov.location.lng);
                  setAddress(prov.location.address);
                }
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Food Item Description <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Steamed Rice Bowls with Lentil Curry"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                if (errors.itemName) setErrors({ ...errors, itemName: '' });
              }}
              className={`w-full px-3 py-2 rounded-xl border ${
                errors.itemName ? 'border-rose-300 bg-rose-50/50' : 'border-stone-200 bg-stone-50'
              } font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/20`}
            />
            {errors.itemName && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.itemName}
              </p>
            )}
          </div>

          {/* Food Type & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Food Type</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as FoodType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none"
              >
                <option value="Cooked meal">Cooked meal</option>
                <option value="Bakery">Bakery</option>
                <option value="Produce">Produce</option>
                <option value="Packaged">Packaged</option>
                <option value="Dairy">Dairy</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Quantity <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 0));
                  if (errors.quantity) setErrors({ ...errors, quantity: '' });
                }}
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.quantity ? 'border-rose-300 bg-rose-50/50' : 'border-stone-200 bg-stone-50'
                } font-medium text-stone-800 focus:outline-none`}
              />
              {errors.quantity && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none"
              >
                <option value="portions">portions</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          {/* Expiry Time Horizon */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-stone-700">
                Safe Consumption Expiry Window
              </label>
              <span className="font-bold text-primary font-mono text-xs">
                +{expiryHoursFromNow} hours from now
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="12"
              step="0.5"
              value={expiryHoursFromNow}
              onChange={(e) => setExpiryHoursFromNow(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>30 mins (Urgent)</span>
              <span>6 hours</span>
              <span>12 hours</span>
            </div>
          </div>

          {/* Location Setting */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Pickup Location
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-[10px] font-semibold text-stone-700 transition-colors"
                >
                  My Location
                </button>
                <button
                  type="button"
                  onClick={handlePickOnMap}
                  className="px-2 py-1 bg-primary-100 border border-primary-200 text-primary-900 rounded-lg text-[10px] font-semibold transition-colors"
                >
                  Pick on Map
                </button>
              </div>
            </div>
            <p className="text-[11px] text-stone-600 font-medium truncate">{address}</p>
            <div className="text-[10px] text-stone-400 font-mono">
              Coordinates: {locationLat.toFixed(4)}, {locationLng.toFixed(4)}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-xl font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-800 text-white rounded-xl font-semibold shadow-card transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              List Surplus Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
