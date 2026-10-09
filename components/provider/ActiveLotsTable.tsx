import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Trash2, Layers, Edit3, XCircle, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FoodLot } from '../../types';
import { CountdownChip } from '../common/CountdownChip';
import { LogWasteModal } from './LogWasteModal';
import { EmptyState } from '../common/EmptyState';

export const ActiveLotsTable: React.FC = () => {
  const { t } = useTranslation();
  const {
    lots,
    matches,
    requests,
    receivers,
    selectedProviderId,
    simulatedClock,
    withdrawLot,
    updateLot,
  } = useAppStore();

  const [selectedLotForWaste, setSelectedLotForWaste] = useState<FoodLot | null>(null);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  const providerLots = lots.filter((l) => l.providerId === selectedProviderId);

  const getMatchedReceiverName = (lotId: string) => {
    const match = matches.find((m) => m.lotId === lotId && m.status !== 'Declined');
    if (!match) return null;
    const req = requests.find((r) => r.id === match.requestId);
    const rec = req ? receivers.find((r) => r.id === req.receiverId) : undefined;
    return rec ? rec.name : 'Matched Receiver';
  };

  const handleStartEdit = (lot: FoodLot) => {
    setEditingLotId(lot.id);
    setEditQuantity(lot.quantityRemaining);
  };

  const handleSaveEdit = (lotId: string) => {
    if (editQuantity > 0) {
      updateLot(lotId, { quantityRemaining: editQuantity });
    }
    setEditingLotId(null);
  };

  const getStatusBadge = (status: FoodLot['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Available
          </span>
        );
      case 'Partially Matched':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Partially Matched
          </span>
        );
      case 'Fully Matched':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Fully Matched
          </span>
        );
      case 'Expired':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            Expired
          </span>
        );
      case 'Wasted':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Wasted
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brown-border shadow-card overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-brown-border flex items-center justify-between bg-cream/50">
        <div>
          <h3 className="font-display font-bold text-sm text-brown-primary">
            {t('provider.activeLotsTitle')}
          </h3>
          <p className="text-xs text-stone-500">
            Automated food inventory monitored by ResQFood matching engine
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-butter-200 text-brown-primary border border-brown-border">
          {providerLots.length} Total Lots
        </span>
      </div>

      {providerLots.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Package}
            title="No surplus food lots listed yet"
            description="List fresh surplus cooked meals, bakery items, or produce to let the matching engine find nearby receivers."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-butter-50/50 border-b border-brown-border text-brown-secondary uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Remaining / Total</th>
                <th className="py-3 px-3">{t('common.useBefore')}</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Matched Receiver</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {providerLots.map((lot) => {
                const matchedReceiver = getMatchedReceiverName(lot.id);
                const isWastable = lot.quantityRemaining > 0 && lot.status !== 'Expired';
                const isEditing = editingLotId === lot.id;

                return (
                  <tr key={lot.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{lot.itemName}</div>
                      <div className="text-[11px] text-stone-500">{lot.category}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          lot.foodType === 'Veg'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {lot.foodType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max={lot.quantityTotal}
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                            className="w-14 px-1.5 py-0.5 text-xs border border-brown-caramel rounded font-bold"
                          />
                          <button
                            onClick={() => handleSaveEdit(lot.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingLotId(null)}
                            className="p-1 text-stone-400 hover:bg-stone-50 rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-stone-900">{lot.quantityRemaining}</span>
                          <span className="text-stone-400 text-[11px]">
                            {' '}
                            / {lot.quantityTotal} {lot.unit}
                          </span>
                          {lot.quantityWasted > 0 && (
                            <div className="text-[10px] text-rose-600">
                              ({lot.quantityWasted} wasted)
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <CountdownChip
                        targetIso={lot.expiryAt}
                        currentIso={simulatedClock}
                        prefix=""
                      />
                    </td>
                    <td className="py-3.5 px-3">{getStatusBadge(lot.status)}</td>
                    <td className="py-3.5 px-3">
                      {matchedReceiver ? (
                        <span className="text-xs font-semibold text-brown-primary flex items-center gap-1">
                          <Layers className="w-3 h-3 text-brown-caramel" />
                          {matchedReceiver}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Pending assignment</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isWastable && (
                          <button
                            onClick={() => setSelectedLotForWaste(lot)}
                            className="px-2 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors inline-flex items-center gap-1"
                            title={t('provider.logWaste')}
                          >
                            <Trash2 className="w-3 h-3 text-amber-700" />
                            <span className="hidden sm:inline">{t('provider.logWaste')}</span>
                          </button>
                        )}

                        {lot.status === 'Available' && !isEditing && (
                          <>
                            <button
                              onClick={() => handleStartEdit(lot)}
                              className="p-1 text-stone-500 hover:text-brown-primary hover:bg-butter-100 rounded-lg transition-colors"
                              title={t('provider.editLot')}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => withdrawLot(lot.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('provider.withdrawLot')}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Waste Modal */}
      <LogWasteModal
        lot={selectedLotForWaste}
        isOpen={!!selectedLotForWaste}
        onClose={() => setSelectedLotForWaste(null)}
      />
    </div>
  );
};
