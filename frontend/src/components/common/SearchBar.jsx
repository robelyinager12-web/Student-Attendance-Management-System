import { MdSearch } from 'react-icons/md';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <MdSearch
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2
          text-gray-400 dark:text-gray-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200
          dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
          dark:text-gray-200 text-sm focus:outline-none focus:ring-2
          focus:ring-indigo-500"
      />
    </div>
  );
}

export default SearchBar;