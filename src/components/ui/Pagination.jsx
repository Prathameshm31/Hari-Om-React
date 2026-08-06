import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1 && totalElements === 0) return null;
  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <span className="pagination-info">
        Page {page + 1} of {Math.max(totalPages, 1)} · {totalElements} records
      </span>
      <div className="pagination-buttons">
        <button className="page-btn" disabled={page === 0} onClick={() => onPageChange(page - 1)} aria-label="Previous">
          <ChevronLeft size={16} />
        </button>
        {start > 0 && <span className="page-ellipsis">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        ))}
        {end < totalPages - 1 && <span className="page-ellipsis">…</span>}
        <button
          className="page-btn"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
