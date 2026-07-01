import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { classService } from '../../services/class.service';
import { studentService } from '../../services/student.service';
import { attendanceService } from '../../services/attendance.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import { todayDateString } from '../../utils/formatDate';
import { ATTENDANCE_STATUS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

function TakeAttendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(todayDateString());
  const [records, setRecords] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    classService.getAll().then((r) => setClasses(r.data.data));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      studentService.getAll({ classId: selectedClass, limit: 100 }).then((r) => {
        const items = r.data.data.items;
        setStudents(items);
        const defaultRecords = {};
        items.forEach((s) => { defaultRecords[s.id] = 'PRESENT'; });
        setRecords(defaultRecords);
      });
    }
  }, [selectedClass]);

  const setStatus = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return toast.error('Please select a class');
    if (students.length === 0) return toast.error('No students in this class');

    setSubmitting(true);
    try {
      await attendanceService.markBulk({
        classId: selectedClass,
        date,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      });
      toast.success('Attendance submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    PRESENT: 'bg-green-100 text-green-700 border-green-300',
    ABSENT: 'bg-red-100 text-red-700 border-red-300',
    LATE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    EXCUSED: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Take Attendance' }]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Take Attendance
      </h1>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-5 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          >
            <option value="">-- Select Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section ? `— ${c.section}` : ''}
              </option>
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
      </div>

      {/* Student List */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700
            flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {students.length} students
            </p>
            <div className="flex gap-2">
              {Object.values(ATTENDANCE_STATUS).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const all = {};
                    students.forEach((st) => { all[st.id] = s; });
                    setRecords(all);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium
                    ${statusColors[s]}`}
                >
                  All {s}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {students.map((student, i) => (
              <div key={student.id} className="flex items-center justify-between
                p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100
                    dark:bg-indigo-900/30 flex items-center justify-center
                    text-sm font-bold text-indigo-600">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700
                      dark:text-gray-200">
                      {student.User?.name}
                    </p>
                    <p className="text-xs text-gray-400">{student.studentCode}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {Object.values(ATTENDANCE_STATUS).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(student.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border
                        font-medium transition-all
                        ${records[student.id] === s
                          ? statusColors[s]
                          : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700
                text-white text-sm font-medium rounded-lg disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </div>
      )}

      {selectedClass && students.length === 0 && (
        <p className="text-gray-400 text-sm">No students found in this class</p>
      )}
    </div>
  );
}

export default TakeAttendance;