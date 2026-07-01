import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../services/attendance.service';
import { classService } from '../../services/class.service';
import Table from '../../components/common/Table';
import Breadcrumb from '../../components/common/Breadcrumb';
import { formatDate, todayDateString } from '../../utils/formatDate';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';

function AttendanceHistory() {
  const [classes, setClasses] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(todayDateString());

  useEffect(() => {
    classService.getAll().then((r) => setClasses(r.data.data));
  }, []);

  async function fetchAttendance() {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await attendanceService.getByClass(classId, date);
      setRecords(res.data.data);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'student', label: 'Student', render: (r) => r.Student?.User?.name ?? '—' },
    { key: 'code', label: 'Student ID', render: (r) => r.Student?.studentCode ?? '—' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'time', label: 'Time', render: (r) => r.time ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium
          ${ATTENDANCE_STATUS_COLORS[r.status]}`}>
          {r.status}
        </span>
      ),
    },
    { key: 'remark', label: 'Remark', render: (r) => r.remark ?? '—' },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Attendance History' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Attendance History
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-5 flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          >
            <option value="">-- Select Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} {c.section}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={fetchAttendance}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-medium rounded-lg"
        >
          Search
        </button>
      </div>

      <Table columns={columns} data={records} loading={loading} />
    </div>
  );
}

export default AttendanceHistory;