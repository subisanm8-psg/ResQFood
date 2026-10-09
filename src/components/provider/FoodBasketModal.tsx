import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Plus,
  Copy,
  Trash2,
  Clock,
  Sparkles,
  UtensilsCrossed,
  MapPin,
  Phone,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FOOD_CATALOGUE, FoodType, FoodUnit, FoodItem } from '../../data/foods';
import { BasketDishRow, validateFoodBasketRows } from '../../lib/basketValidation';
import { LocationPicker } from '../common/LocationPicker';

interface FoodBasketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodBasketModal: React.FC<FoodBasketModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language === 'ta' ? 'ta' : 'en') as 'en' | 'ta';
  const { providers, selectedProviderId, simulatedClock, listMultiDishBasket } = useAppStore();

  const activeProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  // Helper to format ISO to datetime-local string
  const toLocalInput = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return new Date().toISOString().slice(0, 16);
    }
  };

  const toIsoString = (localVal: string) => {
    try {
      return new Date(localVal).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  // Base time for calculations
  const baseDate = new Date(simulatedClock);

  // Initial pickup details
  const [pickupDetails, setPickupDetails] = useState({
    address: activeProvider?.location.address || 'Tamil Nadu',
    lat: activeProvider?.location.lat || 11.0168,
    lng: activeProvider?.location.lng || 76.9558,
    district: activeProvider?.district || 'Coimbatore',
    phone: activeProvider?.phone || '9876543210',
    pickupWindow: 'Ready in 30 minutes',
    specialNotes: '',
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Initial first row from catalogue
  const defaultDish = FOOD_CATALOGUE[0]; // Idli
  const defaultPrep = baseDate.toISOString();
  const defaultUseBefore = new Date(baseDate.getTime() + defaultDish.defaultShelfLifeHours * 3600000).toISOString();

  const [dishRows, setDishRows] = useState<BasketDishRow[]>([
    {
      dishId: defaultDish.id,
      dishName: currentLang === 'ta' ? defaultDish.nameTa : defaultDish.nameEn,
      foodType: defaultDish.foodType,
      quantity: 30,
      unit: defaultDish.defaultUnit,
      preparedTime: defaultPrep,
      useBeforeTime: defaultUseBefore,
    },
  ]);

  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({});

  if (!isOpen) return null;

  // Handle dish selection change
  const handleDishSelect = (index: number, dishId: string) => {
    const item = FOOD_CATALOGUE.find((d) => d.id === dishId);
    if (!item) return;

    const rowPrep = new Date(dishRows[index].preparedTime);
    const calculatedUseBefore = new Date(
      rowPrep.getTime() + item.defaultShelfLifeHours * 3600000
    ).toISOString();

    const updated = [...dishRows];
    updated[index] = {
      ...updated[index],
      dishId: item.id,
      dishName: currentLang === 'ta' ? item.nameTa : item.nameEn,
      foodType: item.foodType,
      unit: item.defaultUnit,
      useBeforeTime: calculatedUseBefore,
    };
    setDishRows(updated);
    // clear error for this row's dishName
    if (rowErrors[index]) {
      const err = { ...rowErrors[index] };
      delete err.dishName;
      setRowErrors({ ...rowErrors, [index]: err });
    }
  };

  const handleUpdateRow = (index: number, field: keyof BasketDishRow, value: any) => {
    const updated = [...dishRows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // If preparedTime changed, re-calc useBeforeTime based on shelf life
    if (field === 'preparedTime') {
      const item = FOOD_CATALOGUE.find((d) => d.id === updated[index].dishId);
      const shelfHours = item?.defaultShelfLifeHours || 4;
      try {
        const prepD = new Date(value);
        if (!isNaN(prepD.getTime())) {
          updated[index].useBeforeTime = new Date(prepD.getTime() + shelfHours * 3600000).toISOString();
        }
      } catch {
        // ignore
      }
    }

    setDishRows(updated);

    if (rowErrors[index]?.[field]) {
      const err = { ...rowErrors[index] };
      delete err[field];
      setRowErrors({ ...rowErrors, [index]: err });
    }
  };

  const handleAddRow = () => {
    const nextItem = FOOD_CATALOGUE[(dishRows.length + 1) % FOOD_CATALOGUE.length];
    const newPrep = baseDate.toISOString();
    const newUse = new Date(baseDate.getTime() + nextItem.defaultShelfLifeHours * 3600000).toISOString();

    setDishRows([
      ...dishRows,
      {
        dishId: nextItem.id,
        dishName: currentLang === 'ta' ? nextItem.nameTa : nextItem.nameEn,
        foodType: nextItem.foodType,
        quantity: 20,
        unit: nextItem.defaultUnit,
        preparedTime: newPrep,
        useBeforeTime: newUse,
      },
    ]);
  };

  const handleDuplicateRow = (index: number) => {
    const rowToDup = dishRows[index];
    const duplicated: BasketDishRow = {
      ...rowToDup,
    };
    const newRows = [...dishRows];
    newRows.splice(index + 1, 0, duplicated);
    setDishRows(newRows);
  };

  const handleRemoveRow = (index: number) => {
    if (dishRows.length <= 1) return;
    const newRows = dishRows.filter((_, i) => i !== index);
    setDishRows(newRows);
    const newErrors = { ...rowErrors };
    delete newErrors[index];
    setRowErrors(newErrors);
  };

  // Calculations for summary bar
  const totalQuantity = dishRows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const soonestUseBefore = dishRows.reduce((soonest, r) => {
    const d = new Date(r.useBeforeTime);
    if (!soonest || d < soonest) return d;
    return soonest;
  }, null as Date | null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateFoodBasketRows(dishRows, simulatedClock);
    if (!validation.isValid) {
      setRowErrors(validation.errors);
      return;
    }

    // Call store action
    listMultiDishBasket(pickupDetails, dishRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-cream border border-brown-border rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-butter-200 border-b border-brown-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-butter-300 text-brown-primary flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5 text-brown-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-brown-primary">
                {t('provider.listExtraFood')}
              </h2>
              <p className="text-xs text-brown-secondary">
                {activeProvider.name} • {activeProvider.district}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brown-secondary hover:text-brown-primary hover:bg-butter-300/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Pickup Details section (Entered ONCE at the top) */}
          <div className="bg-white rounded-2xl p-5 border border-brown-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brown-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brown-caramel" />
                <span>{t('provider.pickupDetails')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="text-xs font-bold text-brown-caramel hover:text-brown-primary underline"
              >
                {showLocationPicker ? 'Hide location editor' : 'Edit pickup location'}
              </button>
            </div>

            {showLocationPicker && (
              <div className="p-3 bg-cream rounded-xl border border-brown-border">
                <LocationPicker
                  initialLat={pickupDetails.lat}
                  initialLng={pickupDetails.lng}
                  initialAddress={pickupDetails.address}
                  initialDistrict={pickupDetails.district}
                  onChange={(loc) => {
                    setPickupDetails((prev) => ({
                      ...prev,
                      lat: loc.lat,
                      lng: loc.lng,
                      address: loc.address,
                      district: loc.district,
                    }));
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  {t('provider.pickupDetails')} Address
                </label>
                <input
                  type="text"
                  value={pickupDetails.address}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  {t('provider.contactPhone')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="tel"
                    value={pickupDetails.phone}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  {t('provider.pickupWindow')}
                </label>
                <select
                  value={pickupDetails.pickupWindow}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, pickupWindow: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                >
                  <option value="Ready now">Ready immediately</option>
                  <option value="Ready in 30 minutes">Ready in 30 minutes</option>
                  <option value="Ready in 1 hour">Ready in 1 hour</option>
                  <option value="Packaged for pickup">Packed and ready at counter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {t('provider.specialNotes')}
              </label>
              <input
                type="text"
                value={pickupDetails.specialNotes}
                onChange={(e) => setPickupDetails({ ...pickupDetails, specialNotes: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                placeholder="e.g. Please bring clean transport containers / Pickup from back door kitchen."
              />
            </div>
          </div>

          {/* Dish Rows Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-brown-primary">
                  {t('provider.dishesInBasket')} ({dishRows.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Select traditional Tamil Nadu dishes or customize below
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-butter-200 hover:bg-butter-300 text-brown-primary font-bold text-xs rounded-xl border border-brown-border transition-all active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4 text-brown-primary" />
                <span>{t('provider.addAnotherDish')}</span>
              </button>
            </div>

            <div className="space-y-3">
              {dishRows.map((row, index) => {
                const err = rowErrors[index] || {};
                return (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-2xl border border-brown-border shadow-card relative hover:border-brown-secondary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-6 h-6 rounded-lg bg-butter-100 text-brown-primary flex items-center justify-center font-bold text-xs">
                        #{index + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(index)}
                          className="p-1.5 text-stone-400 hover:text-brown-primary hover:bg-butter-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                          title={t('provider.duplicateRow')}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px] font-semibold">{t('provider.duplicateRow')}</span>
                        </button>
                        {dishRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('provider.removeRow')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                      {/* Dish Catalogue Dropdown (2 cols) */}
                      <div className="lg:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          {t('provider.dishCatalogue')}
                        </label>
                        <select
                          value={row.dishId}
                          onChange={(e) => handleDishSelect(index, e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-stone-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brown-caramel ${
                            err.dishName ? 'border-red-400 bg-red-50' : 'border-stone-200 text-stone-800'
                          }`}
                        >
                          {FOOD_CATALOGUE.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nameEn} ({item.nameTa}) — {item.category}
                            </option>
                          ))}
                        </select>
                        {err.dishName && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {err.dishName}
                          </p>
                        )}
                      </div>

                      {/* Food Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          {t('provider.foodType')}
                        </label>
                        <select
                          value={row.foodType}
                          onChange={(e) => handleUpdateRow(index, 'foodType', e.target.value as FoodType)}
                          className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                        >
                          <option value="Veg">{t('common.veg')}</option>
                          <option value="Non-Veg">{t('common.nonVeg')}</option>
                          <option value="Egg">{t('common.egg')}</option>
                        </select>
                      </div>

                      {/* Quantity & Unit */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          {t('provider.quantity')}
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleUpdateRow(index, 'quantity', parseInt(e.target.value) || 0)}
                            className={`w-16 px-2 py-1.5 text-xs bg-stone-50 border rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel ${
                              err.quantity ? 'border-red-400 bg-red-50' : 'border-stone-200'
                            }`}
                          />
                          <select
                            value={row.unit}
                            onChange={(e) => handleUpdateRow(index, 'unit', e.target.value as FoodUnit)}
                            className="px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-700"
                          >
                            <option value="portions">{t('common.portions')}</option>
                            <option value="kg">{t('common.kg')}</option>
                          </select>
                        </div>
                        {err.quantity && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {err.quantity}
                          </p>
                        )}
                      </div>

                      {/* Prepared Time */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          {t('provider.preparedTime')}
                        </label>
                        <input
                          type="datetime-local"
                          value={toLocalInput(row.preparedTime)}
                          onChange={(e) => handleUpdateRow(index, 'preparedTime', toIsoString(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                        />
                      </div>

                      {/* Use-Before Time */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          {t('provider.useBeforeTime')}
                        </label>
                        <input
                          type="datetime-local"
                          value={toLocalInput(row.useBeforeTime)}
                          onChange={(e) => handleUpdateRow(index, 'useBeforeTime', toIsoString(e.target.value))}
                          className={`w-full px-2 py-1.5 text-xs bg-stone-50 border rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel ${
                            err.useBeforeTime ? 'border-red-400 bg-red-50' : 'border-stone-200'
                          }`}
                        />
                        {err.useBeforeTime && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {err.useBeforeTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Summary Bar */}
          <div className="bg-butter-100 border border-brown-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] font-semibold text-brown-secondary block">
                  {t('provider.dishesInBasket')}
                </span>
                <span className="text-base font-bold font-display text-brown-primary">
                  {dishRows.length} items
                </span>
              </div>
              <div className="h-7 w-px bg-brown-border" />
              <div>
                <span className="text-[11px] font-semibold text-brown-secondary block">
                  {t('provider.totalQuantity')}
                </span>
                <span className="text-base font-bold font-display text-brown-primary">
                  {totalQuantity} {t('common.portions')}
                </span>
              </div>
              <div className="h-7 w-px bg-brown-border" />
              <div>
                <span className="text-[11px] font-semibold text-brown-secondary block">
                  {t('provider.soonestUseBefore')}
                </span>
                <span className="text-xs font-bold font-mono text-brown-caramel flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {soonestUseBefore ? soonestUseBefore.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-brown-secondary hover:text-brown-primary transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-butter-300 hover:bg-butter-400 text-brown-primary font-bold text-xs rounded-xl shadow-card transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{t('provider.listAllButton')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
