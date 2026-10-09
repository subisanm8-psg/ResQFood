import React from 'react';
import { Clock } from 'lucide-react';

interface CountdownChipProps {
  targetIso: string;
  currentIso: string;
  prefix?: string;
}

export const CountdownChip: React.FC<CountdownChipProps> = ({
  targetIso,
  currentIso,
  prefix = 'Expires in',
}) => {
  const targetTime = new Date(targetIso).getTime();
  const currentTime = new Date(currentIso).getTime();
  const diffMs = targetTime - currentTime;

  if (diffMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
        <Clock className="w-3.5 h-3.5" />
        Expired
      </span>
    );
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  let colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200'; // > 2 hours: green
  if (diffMinutes <= 45) {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300 font-bold animate-pulse'; // <= 45 mins: red
  } else if (diffMinutes <= 120) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200'; // <= 2 hours: amber
  }

  const timeString =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span>
        {prefix} {timeString}
      </span>
    </span>
  );
};
