import { Link } from 'react-router-dom';
import { MdChevronRight } from 'react-icons/md';

function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500
      dark:text-gray-400 mb-4">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <MdChevronRight size={16} />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-indigo-600 dark:hover:text-indigo-400
                transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;