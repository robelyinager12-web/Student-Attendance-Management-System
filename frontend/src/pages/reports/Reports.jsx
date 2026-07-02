import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { classService } from '../../services/class.service';
import { departmentService } from '../../services/department.service';
import { studentService } from '../../services/student.service';
import api from '../../services/api';
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
  const [classId, setClassId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    classService.getAll().then((r) => setClasses(r.data.data)).catch(() => {});
    departmentService.getAll().then((r) => setDepartments(r.data.data)).catch(() => {});
    studentService.getAll({ limit: 100 }).then((r) => setStudents(r.data.data.items)).catch(() => {});
  }, []);

  async function generateReport() {
    setLoading(true);
    setResults(null);

    try {
      let params = { format };

      if (type === 'daily') {
        params.date = date;
        if (classId) params.classId = classId;
      }

      if (type === 'weekly') {
        if (!from || !to) {
          toast.error('Please select From and To dates');
          setLoading(false);
          return;
        }
        params.from = from;
        params.to = to;
        if (classId) params.classId = classId;
      }

      if (type === 'monthly') {
        params.month = month;
        params.year = year;
        if (classId) params.classId = classId;
      }

      if (type === 'class') {
        if (!classId) {
          toast.error('Please select a class');
          setLoading(false);
          return;
        }
        params.classId = classId;
        if (from) params.from = from;
        if (to) params.to = to;
      }

      if (type === 'department') {
        if (!departmentId) {
          toast.error('Please select a department');
          setLoading(false);
          return;
        }
        params.departmentId = departmentId;
        if (from) params.from = from;
        if (to) params.to = to;
      }

      if (type === 'student') {
        if (!studentId) {
          toast.error('Please select a student');
          setLoading(false);
          return;
        }
        params.studentId = studentId;
        if (from) params.from = from;
        if (to) params.to = to;
      }

      // For file downloads (pdf, excel, csv)
      if (format !== 'json') {
        const token = localStorage.getItem('accessToken');
        const queryString = new URLSearchParams(params).toString();
        const url = `http://localhost:5000/api/reports/${type}?${queryString}`;

        // Fetch with auth token and trigger download
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const err = await response.json();
          toast.error(err.message || 'Failed to generate report');
          setLoading(false);
          return;
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${type}-report.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success(`${type} report downloaded as ${format.toUpperCase()}`);

      } else {
        // JSON — show results in the page
        const res = await api.get(`/reports/${type}`, { params });
        const data = res.data.data;
        setResults(data);
        toast.success(`Report generated — ${data.length} records found`);
      }

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Reports' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Reports
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-6">

        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-2">
            Report Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {reportTypes.map((r) => (
              <button
                key={r.key}
                onClick={() => { setType(r.key); setResults(null); }}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium
                  border transition-colors
                  ${type === r.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters based on report type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Daily — date picker */}
          {type === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                  focus:ring-indigo-500" />
            </div>
          )}

          {/* Monthly */}
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

          {/* From / To for weekly, class, department, student */}
          {['weekly', 'class', 'department', 'student'].includes(type) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">From Date</label>
                <input type="date" value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">To Date</label>
                <input type="date" value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-500" />
              </div>
            </>
          )}

          {/* Class selector */}
          {['daily', 'weekly', 'monthly', 'class'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">
                Class {type === 'class' && <span className="text-red-500">*</span>}
              </label>
              <select value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                  focus:ring-indigo-500">
                <option value="">
                  {type === 'class' ? '-- Select Class --' : 'All Classes'}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Department selector */}
          {type === 'department' && (
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                  focus:ring-indigo-500">
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Student selector */}
          {type === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">
                Student <span className="text-red-500">*</span>
              </label>
              <select value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                  focus:ring-indigo-500">
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.User?.name} ({s.studentCode})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-2">Export Format</label>
          <div className="flex gap-2 flex-wrap">
            {['json', 'pdf', 'excel', 'csv'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`py-2 px-5 rounded-lg text-sm font-medium border
                  uppercase transition-colors
                  ${format === f
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            JSON shows results below. PDF, Excel, CSV will download the file.
          </p>
        </div>

        {/* Generate button */}
        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white
            font-semibold rounded-lg disabled:opacity-60 transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* JSON Results Table */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700
            flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-700
              dark:text-gray-200">
              Results ({results.length} records)
            </h2>
          </div>

          {results.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              No attendance records found for the selected filters
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Date', 'Student', 'Student ID', 'Class', 'Course', 'Status', 'Remark'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs
                        font-semibold text-gray-500 dark:text-gray-400
                        uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {results.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.date}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.Student?.User?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.Student?.studentCode ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.Class ? `${row.Class.name} ${row.Class.section ?? ''}`.trim() : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.Course?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium
                          ${row.status === 'PRESENT' ? 'bg-green-100 text-green-700'
                          : row.status === 'ABSENT' ? 'bg-red-100 text-red-700'
                          : row.status === 'LATE' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.remark ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;