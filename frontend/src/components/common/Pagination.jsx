import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-600
          disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700
          text-gray-600 dark:text-gray-300"
      >
        <MdChevronLeft size={20} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
            ${p === page
              ? 'bg-indigo-600 text-white'
              : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-600
          disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700
          text-gray-600 dark:text-gray-300"
      >
        <MdChevronRight size={20} />
      </button>
    </div>
  );
}

export default Pagination;