import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';

function AttendanceCalendar({ records }) {
  const grouped = records.reduce((acc, record) => {
    acc[record.date] = record.status;
    return acc;
  }, {});

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border
      border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-700
        dark:text-gray-200 mb-4">
        Attendance Calendar — {monthName}
      </h3>

      <div className="grid grid-cols-7 gap-1 text-center text-xs
        text-gray-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="font-semibold">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = grouped[dateStr];

          return (
            <div
              key={i}
              title={status || ''}
              className={`w-full aspect-square flex items-center justify-center
                rounded-lg text-xs font-medium transition-colors
                ${status
                  ? ATTENDANCE_STATUS_COLORS[status]
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400'
                }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        {Object.entries(ATTENDANCE_STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={`text-xs px-2 py-1 rounded-full ${cls}`}>
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}

export default AttendanceCalendar;