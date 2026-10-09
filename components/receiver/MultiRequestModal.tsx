import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Plus,
  Trash2,
  Clock,
  HeartHandshake,
  AlertCircle,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FoodCategory, UrgencyLevel } from '../../types';

interface MultiRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RequestDraftRow {
  foodPreference: 'Veg' | 'Non-Veg' | 'Any';
  broadPreferences: FoodCategory[];
  quantityNeeded: number;
  neededBy: string; // ISO
  urgency: UrgencyLevel;
}

const CATEGORY_OPTIONS: { id: FoodCategory; labelEn: string; labelTa: string }[] = [
  { id: 'Cooked meal', labelEn: 'Cooked meals / Tiffin', labelTa: 'சமைத்த உணவு' },
  { id: 'Produce', labelEn: 'Fresh Produce / Veg', labelTa: 'காய்கறிகள்' },
  { id: 'Bakery', labelEn: 'Bakery / Bread', labelTa: 'ரொட்டி' },
  { id: 'Packaged', labelEn: 'Packaged / Dairy', labelTa: 'பால் & தொகுக்கப்பட்டவை' },
  { id: 'Traditional', labelEn: 'Traditional Millet Meals', labelTa: 'பாரம்பரிய சிறுதானியம்' },
];

export const MultiRequestModal: React.FC<MultiRequestModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language === 'ta' ? 'ta' : 'en') as 'en' | 'ta';
  const { receivers, selectedReceiverId, simulatedClock, createMultiFoodRequests, addToast } = useAppStore();

  const activeReceiver = receivers.find((r) => r.id === selectedReceiverId) || receivers[0];

  const baseDate = new Date(simulatedClock);
  const defaultNeededBy = new Date(baseDate.getTime() + 3 * 3600000).toISOString();

  // Helper for datetime-local
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

  const [requestRows, setRequestRows] = useState<RequestDraftRow[]>([
    {
      foodPreference: 'Veg',
      broadPreferences: ['Cooked meal'],
      quantityNeeded: activeReceiver?.headcount || 40,
      neededBy: defaultNeededBy,
      urgency: 'Medium',
    },
  ]);

  if (!isOpen) return null;

  const handleAddRequest = () => {
    const newNeeded = new Date(baseDate.getTime() + 4 * 3600000).toISOString();
    setRequestRows([
      ...requestRows,
      {
        foodPreference: 'Veg',
        broadPreferences: ['Cooked meal'],
        quantityNeeded: 30,
        neededBy: newNeeded,
        urgency: 'Medium',
      },
    ]);
  };

  const handleRemoveRequest = (index: number) => {
    if (requestRows.length <= 1) return;
    setRequestRows(requestRows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof RequestDraftRow, value: any) => {
    const updated = [...requestRows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setRequestRows(updated);
  };

  const handleToggleCategory = (index: number, cat: FoodCategory) => {
    const updated = [...requestRows];
    const existing = updated[index].broadPreferences;
    if (existing.includes(cat)) {
      if (existing.length > 1) {
        updated[index].broadPreferences = existing.filter((c) => c !== cat);
      }
    } else {
      updated[index].broadPreferences = [...existing, cat];
    }
    setRequestRows(updated);
  };

  const totalQuantity = requestRows.reduce((sum, r) => sum + (Number(r.quantityNeeded) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedRequests = requestRows.map((r) => ({
      receiverId: activeReceiver.id,
      foodPreference: r.foodPreference,
      broadPreferences: r.broadPreferences,
      quantityNeeded: Math.max(1, Number(r.quantityNeeded) || 1),
      neededBy: r.neededBy,
      urgency: r.urgency,
    }));

    createMultiFoodRequests(formattedRequests);
    addToast('success', 'toasts.requestsPublished', `${formattedRequests.length} food requests published.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-cream border border-brown-border rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-butter-200 border-b border-brown-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-butter-300 text-brown-primary flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5 text-brown-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-brown-primary">
                {t('receiver.askForFood')}
              </h2>
              <p className="text-xs text-brown-secondary">
                {activeReceiver.name} • {activeReceiver.district} ({activeReceiver.headcount} people)
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-brown-primary">
                {t('receiver.activeRequestsTitle')} ({requestRows.length})
              </h3>
              <p className="text-xs text-stone-500">
                You can add multiple dish preferences or requirements at once
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddRequest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-butter-200 hover:bg-butter-300 text-brown-primary font-bold text-xs rounded-xl border border-brown-border transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4 text-brown-primary" />
              <span>{t('receiver.addAnotherRequest')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {requestRows.map((row, index) => (
              <div
                key={index}
                className="p-5 bg-white rounded-2xl border border-brown-border shadow-card space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brown-primary">
                    Request #{index + 1}
                  </span>
                  {requestRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRequest(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Dietary Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('receiver.dietaryPreference')}
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
                      {(['Veg', 'Non-Veg', 'Any'] as const).map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => handleUpdateRow(index, 'foodPreference', pref)}
                          className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                            row.foodPreference === pref
                              ? 'bg-butter-300 text-brown-primary shadow-sm'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {pref === 'Veg'
                            ? t('common.veg')
                            : pref === 'Non-Veg'
                            ? t('common.nonVeg')
                            : t('common.any')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Needed */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('receiver.quantityNeeded')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={row.quantityNeeded}
                      onChange={(e) =>
                        handleUpdateRow(index, 'quantityNeeded', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel font-medium"
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {t('receiver.urgencyLevel')}
                    </label>
                    <select
                      value={row.urgency}
                      onChange={(e) =>
                        handleUpdateRow(index, 'urgency', e.target.value as UrgencyLevel)
                      }
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                    >
                      <option value="Low">Low (Next meal / tomorrow)</option>
                      <option value="Medium">Medium (Within 3 hours)</option>
                      <option value="High">High (Within 1-2 hours)</option>
                      <option value="Critical">Critical (Needed immediately)</option>
                    </select>
                  </div>
                </div>

                {/* Needed By Deadline */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t('receiver.neededByDeadline')}
                  </label>
                  <input
                    type="datetime-local"
                    value={toLocalInput(row.neededBy)}
                    onChange={(e) => handleUpdateRow(index, 'neededBy', toIsoString(e.target.value))}
                    className="w-full sm:w-72 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-brown-caramel"
                  />
                </div>

                {/* Broad Food Categories */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    {t('receiver.acceptableCategories')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isSelected = row.broadPreferences.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleToggleCategory(index, cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-butter-200 text-brown-primary border-brown-border shadow-xs'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {currentLang === 'ta' ? cat.labelTa : cat.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Bar */}
          <div className="bg-butter-100 border border-brown-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] font-semibold text-brown-secondary block">
                  Requests
                </span>
                <span className="text-base font-bold font-display text-brown-primary">
                  {requestRows.length} total
                </span>
              </div>
              <div className="h-7 w-px bg-brown-border" />
              <div>
                <span className="text-[11px] font-semibold text-brown-secondary block">
                  Total portions
                </span>
                <span className="text-base font-bold font-display text-brown-primary">
                  {totalQuantity} {t('common.portions')}
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
                <span>{t('receiver.publishRequests')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
