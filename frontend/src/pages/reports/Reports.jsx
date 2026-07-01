import { useState } from 'react';
import { toast } from 'react-toastify';
import { reportService } from '../../services/report.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import { todayDateString } from '../../utils/formatDate';

const reportTypes = [
  { key: 'daily', label: 'Daily Report' },
  { key: 'weekly', label: 'Weekly Report' },
  { key: 'monthly', label: 'Monthly Report' },
  { key: 'student', label: 'Student Report' },
  { key: 'class', label: 'Class Report' },
  { key: 'department', label: 'Department Report' },
];

function Reports() {
  const [type, setType] = useState('daily');
  const [format, setFormat] = useState('json');
  const [date, setDate] = useState(todayDateString());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      let params = { format };
      if (type === 'daily') params.date = date;
      if (type === 'weekly') { params.from = from; params.to = to; }
      if (type === 'monthly') { params.month = month; params.year = year; }
      if (['weekly', 'class', 'department', 'student'].includes(type)) {
        params.from = from;
        params.to = to;
      }

      if (format !== 'json') {
        window.open(
          `${import.meta.env.VITE_API_URL}/reports/${type}?${new URLSearchParams(params)}`,
          '_blank'
        );
      } else {
        const res = await reportService[type](params);
        toast.success(`${type} report loaded — ${res.data.data.length} records`);
      }
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-5">

        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-2">Report Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {reportTypes.map((r) => (
              <button
                key={r.key}
                onClick={() => setType(r.key)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border
                  transition-colors ${type === r.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {type === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                  focus:ring-indigo-500" />
            </div>
          )}

          {type === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">Month</label>
                <input type="number" min="1" max="12" value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">Year</label>
                <input type="number" value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-500" />
              </div>
            </>
          )}

          {['weekly', 'class', 'department', 'student'].includes(type) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-500" />
              </div>
            </>
          )}
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-2">Export Format</label>
          <div className="flex gap-2">
            {['json', 'pdf', 'excel', 'csv'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`py-2 px-4 rounded-lg text-sm font-medium border
                  transition-colors uppercase ${format === f
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white
            font-semibold rounded-lg disabled:opacity-60 transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  );
}

export default Reports;