import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../services/attendance.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import { todayDateString } from '../../utils/formatDate';
import { ATTENDANCE_STATUS } from '../../utils/constants';
import api from '../../services/api';
import {
  MdCheckCircle, MdCancel, MdSchedule,
  MdOutlineRule, MdSave,
} from 'react-icons/md';

const statusColors = {
  PRESENT: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
  ABSENT: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
  LATE: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400',
  EXCUSED: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
};

const statusIcons = {
  PRESENT: <MdCheckCircle size={14} />,
  ABSENT: <MdCancel size={14} />,
  LATE: <MdSchedule size={14} />,
  EXCUSED: <MdOutlineRule size={14} />,
};

function TakeAttendance() {
  // Drill-down state
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedAY, setSelectedAY] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(todayDateString());

  // Attendance state
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [existingRecords, setExistingRecords] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;

  // Load departments
  useEffect(() => {
    api.get('/departments').then((r) => setDepartments(r.data.data)).catch(() => {});
  }, []);

  // Load batches when dept changes
  useEffect(() => {
    if (!selectedDept) return;
    setBatches([]); setSelectedBatch('');
    setAcademicYears([]); setSelectedAY('');
    setSemesters([]); setSelectedSem('');
    setSections([]); setSelectedSection('');
    api.get(`/batches?departmentId=${selectedDept}&status=ACTIVE`)
      .then((r) => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  // Load academic years when batch changes
  useEffect(() => {
    if (!selectedBatch) return;
    setAcademicYears([]); setSelectedAY('');
    setSemesters([]); setSelectedSem('');
    setSections([]); setSelectedSection('');
    api.get(`/academic-years?batchId=${selectedBatch}`)
      .then((r) => setAcademicYears(r.data.data)).catch(() => {});
  }, [selectedBatch]);

  // Load semesters when AY changes
  useEffect(() => {
    if (!selectedAY) return;
    setSemesters([]); setSelectedSem('');
    setSections([]); setSelectedSection('');
    api.get(`/semesters?academicYearId=${selectedAY}`)
      .then((r) => setSemesters(r.data.data)).catch(() => {});
  }, [selectedAY]);

  // Load sections when semester changes
  useEffect(() => {
    if (!selectedSem) return;
    setSections([]); setSelectedSection('');
    api.get(`/sections?semesterId=${selectedSem}&departmentId=${selectedDept}`)
      .then((r) => setSections(r.data.data)).catch(() => {});
  }, [selectedSem]);

  // Load courses when dept changes
  useEffect(() => {
    if (!selectedDept) return;
    api.get(`/courses?departmentId=${selectedDept}`)
      .then((r) => setCourses(r.data.data)).catch(() => {});
  }, [selectedDept]);

  // Load students when section is selected
  useEffect(() => {
    if (!selectedSection) return;
    setLoading(true);
    setStudents([]);
    setRecords({});
    setSubmitted(false);

    api.get(`/students?sectionId=${selectedSection}&limit=200`)
      .then((r) => {
        const items = r.data.data.items || [];
        setStudents(items);
        // Default all to PRESENT
        const defaultRecords = {};
        items.forEach((s) => { defaultRecords[s.id] = 'PRESENT'; });
        setRecords(defaultRecords);
        setStep(2);
      })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, [selectedSection]);

  // Check existing attendance when date or course changes
  useEffect(() => {
    if (!selectedSection || !date) return;
    const params = { sectionId: selectedSection, date };
    if (selectedCourse) params.courseId = selectedCourse;

    api.get('/attendance/section', { params }).then((r) => {
      const existing = {};
      r.data.data.forEach((rec) => {
        existing[rec.studentId] = rec.status;
      });
      setExistingRecords(existing);

      // Update records with existing data
      if (Object.keys(existing).length > 0) {
        setRecords((prev) => ({ ...prev, ...existing }));
        setSubmitted(true);
      } else {
        setSubmitted(false);
      }
    }).catch(() => {});
  }, [selectedSection, date, selectedCourse]);

  const setStatus = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const setAllStatus = (status) => {
    const all = {};
    students.forEach((s) => { all[s.id] = status; });
    setRecords(all);
  };

  const handleSubmit = async () => {
    if (!selectedSection) return toast.error('Please select a section');
    if (students.length === 0) return toast.error('No students in this section');

    setSubmitting(true);
    try {
      await attendanceService.markBulk({
        sectionId: selectedSection,
        courseId: selectedCourse || undefined,
        date,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      });

      toast.success('Attendance submitted successfully');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // Summary counts
  const summary = Object.values(records).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const isFilterComplete = selectedDept && selectedBatch && selectedAY && selectedSem && selectedSection;

  return (
    <div className="space-y-5 max-w-5xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Take Attendance' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Take Attendance
      </h1>

      {/* Step 1 — Drill-down filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          Step 1 — Select Class
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Department */}
          <div>
            <label className="block text-xs font-medium text-gray-500
              dark:text-gray-400 mb-1 uppercase tracking-wider">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={inputClass}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-xs font-medium text-gray-500
              dark:text-gray-400 mb-1 uppercase tracking-wider">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className={inputClass}
              disabled={!selectedDept}
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-medium text-gray-500
              dark:text-gray-400 mb-1 uppercase tracking-wider">
              Academic Year
            </label>
            <select
              value={selectedAY}
              onChange={(e) => setSelectedAY(e.target.value)}
              className={inputClass}
              disabled={!selectedBatch}
            >
              <option value="">Select Year</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>{ay.name}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs font-medium text-gray-500
              dark:text-gray-400 mb-1 uppercase tracking-wider">
              Semester
            </label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className={inputClass}
              disabled={!selectedAY}
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-medium text-gray-500
              dark:text-gray-400 mb-1 uppercase tracking-wider">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={inputClass}
              disabled={!selectedSem}
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-xs font-medium text-gray-500
              dark:text-gray-400 mb-1 uppercase tracking-wider">
              Course (Optional)
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={inputClass}
              disabled={!selectedDept}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-gray-500
              dark:text-gray-400 mb-1 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              style={{ width: 'auto' }}
            />
          </div>

          {isFilterComplete && (
            <div className="mt-5">
              {submitted ? (
                <span className="flex items-center gap-2 text-sm
                  text-green-600 font-medium">
                  <MdCheckCircle size={18} />
                  Attendance already taken for this date
                </span>
              ) : (
                <span className="text-sm text-gray-400">
                  No attendance recorded for this date yet
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500
            border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-500">Loading students...</span>
        </div>
      )}

      {/* Step 2 — Student List */}
      {!loading && students.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                  Step 2 — Mark Attendance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {students.length} students in this section
                </p>
              </div>

              {/* Summary badges */}
              <div className="flex gap-2 flex-wrap">
                {Object.values(ATTENDANCE_STATUS).map((s) => (
                  <span key={s} className={`text-xs px-2 py-1 rounded-full
                    font-medium border ${statusColors[s]}`}>
                    {statusIcons[s]} {summary[s] || 0} {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Mark all buttons */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-400 self-center">
                Mark all as:
              </span>
              {Object.values(ATTENDANCE_STATUS).map((s) => (
                <button
                  key={s}
                  onClick={() => setAllStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border
                    font-medium transition-all ${statusColors[s]}`}
                >
                  All {s}
                </button>
              ))}
            </div>
          </div>

          {/* Student rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700
            max-h-[60vh] overflow-y-auto">
            {students.map((student, i) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4
                  hover:bg-gray-50 dark:hover:bg-gray-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100
                    dark:bg-indigo-900/30 flex items-center justify-center
                    text-sm font-bold text-indigo-600 shrink-0">
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

                {/* Status buttons */}
                <div className="flex gap-2 flex-wrap justify-end">
                  {Object.values(ATTENDANCE_STATUS).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(student.id, s)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5
                        rounded-full border font-medium transition-all
                        ${records[student.id] === s
                          ? statusColors[s]
                          : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      {statusIcons[s]} {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700
            flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {submitted
                ? 'Resubmitting will update existing records'
                : 'This will create new attendance records'
              }
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600
                hover:bg-indigo-700 text-white text-sm font-medium
                rounded-lg disabled:opacity-60 transition-colors"
            >
              <MdSave size={18} />
              {submitting
                ? 'Submitting...'
                : submitted
                ? 'Update Attendance'
                : 'Submit Attendance'
              }
            </button>
          </div>
        </div>
      )}

      {/* No students found */}
      {!loading && selectedSection && students.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No students found</p>
          <p className="text-gray-400 text-sm">
            This section has no students assigned yet.
            Go to <strong>Students → Import Excel</strong> to add students.
          </p>
        </div>
      )}
    </div>
  );
}

export default TakeAttendance;