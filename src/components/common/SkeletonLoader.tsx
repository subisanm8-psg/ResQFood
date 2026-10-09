import React from 'react';

export const SkeletonLoader: React.FC<{ rows?: number; height?: string }> = ({
  rows = 3,
  height = 'h-12',
}) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`w-full bg-stone-200/70 rounded-xl ${height}`}
        />
      ))}
    </div>
  );
};
