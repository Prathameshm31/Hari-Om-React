import React from 'react';

export const Skeleton = ({ width = '100%', height = 16, circle = false, style = {} }) => (
  <div
    className="skeleton"
    style={{
      width,
      height,
      borderRadius: circle ? '50%' : 8,
      ...style,
    }}
  />
);

export const TableSkeleton = ({ rows = 6, columns = 6 }) => (
  <div className="table-skeleton" aria-hidden="true">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="table-skeleton-row">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} height={14} width="70%" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = ({ cards = 4 }) => (
  <div className="stats-grid">
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="stat-card">
        <div style={{ flex: 1 }}>
          <Skeleton height={12} width="60%" style={{ marginBottom: 12 }} />
          <Skeleton height={26} width="45%" />
        </div>
        <Skeleton circle height={48} width={48} />
      </div>
    ))}
  </div>
);
