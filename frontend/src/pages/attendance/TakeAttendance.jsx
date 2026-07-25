import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import { todayDateString } from '../../utils/formatDate';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_COLORS } from '../../utils/constants';
import api from '../../services/api';
import {
  MdCheckCircle, MdCancel, MdSchedule,
  MdOutlineRule, MdSave, MdRefresh,
  MdPeople, MdBook, MdWarning,
} from 'react-icons/md';

const statusIcons = {
  PRESENT: <MdCheckCircle size={14} />,
  ABSENT: <MdCancel size={14} />,
  LATE: <MdSchedule size={14} />,
  EXCUSED: <MdOutlineRule size={14} />,
};

const statusBtnColors = {
  PRESENT: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  ABSENT: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
  LATE: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  EXCUSED: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
};

const inactiveBtn = 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-gray-300';

const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;

function TakeAttendance() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  // Step 1 — Course selection
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Step 2 — Drill down (admin only or if no assignment context)
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(todayDateString());
  const [topic, setTopic] = useState('');

  // Step 3 — Students & attendance
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionExists, setSessionExists] = useState(false);
  const [existingRecords, setExistingRecords] = useState({});
  const [step, setStep] = useState(1);
  const [searchStudent, setSearchStudent] = useState('');

  // Load courses on mount
  useEffect(() => {
    if (isTeacher) {
      courseAssignmentService.getMyCourses()
        .then((r) => setAssignedCourses(r.data.data))
        .catch(() => toast.error('Failed to load your courses'));
    } else {
      api.get('/courses').then((r) => setAllCourses(r.data.data)).catch(() => {});
      api.get('/departments').then((r) => setDepartments(r.data.data)).catch(() => {});
    }
  }, [isTeacher]);

  // When teacher selects an assignment, pre-fill batch/section
  useEffect(() => {
    if (!selectedAssignment) return;
    setSelectedCourse(selectedAssignment.courseId);
    setSelectedBatch(selectedAssignment.batchId || '');
    setSelectedSection(selectedAssignment.sectionId || '');
  }, [selectedAssignment]);

  // Load batches when dept changes (admin flow)
  useEffect(() => {
    if (!selectedDept) return;
    api.get(`/batches?departmentId=${selectedDept}`)
      .then((r) => setBatches(r.data.data)).catch(() => {});
  }, [selectedDept]);

  // Load sections when batch changes (admin flow)
  useEffect(() => {
    if (!selectedBatch) return;
    const params = selectedDept
      ? `batchId=${selectedBatch}&departmentId=${selectedDept}`
      : `batchId=${selectedBatch}`;
    api.get(`/sections?${params}`)
      .then((r) => setSections(r.data.data)).catch(() => {});
  }, [selectedBatch, selectedDept]);

  // Check existing session whenever course/section/date changes
  useEffect(() => {
    if (!selectedCourse || !date) return;
    api.get('/attendance/session/check', {
      params: {
        courseId: selectedCourse,
        sectionId: selectedSection || undefined,
        date,
      },
    }).then((r) => {
      const data = r.data.data;
      setSessionExists(data.sessionExists);
      if (data.records?.length > 0) {
        const existing = {};
        data.records.forEach((rec) => {
          existing[rec.studentId] = rec.status;
        });
        setExistingRecords(existing);
      } else {
        setExistingRecords({});
      }
    }).catch(() => {});
  }, [selectedCourse, selectedSection, date]);

  const loadStudents = useCallback(async () => {
    if (!selectedCourse) {
      return toast.error('Please select a course first');
    }

    setLoadingStudents(true);
    setStudents([]);
    setRecords({});

    try {
      const params = { courseId: selectedCourse };
      if (selectedSection) params.sectionId = selectedSection;
      if (selectedBatch) params.batchId = selectedBatch;

      const res = await api.get('/attendance/section', { params });
      const studentList = res.data.data;

      if (studentList.length === 0) {
        toast.warning('No students found for this course/section. Make sure students are enrolled.');
        setLoadingStudents(false);
        return;
      }

      setStudents(studentList);

      // Default all to PRESENT, override with existing records
      const defaultRecords = {};
      studentList.forEach((s) => {
        defaultRecords[s.id] = existingRecords[s.id] || 'PRESENT';
      });
      setRecords(defaultRecords);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedCourse, selectedSection, selectedBatch, existingRecords]);

  const setStatus = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const setAllStatus = (status) => {
    const all = {};
    students.forEach((s) => { all[s.id] = status; });
    setRecords(all);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) return toast.error('Please select a course');
    if (students.length === 0) return toast.error('No students loaded');

    setSubmitting(true);
    try {
      await attendanceService.markBulk({
        courseId: selectedCourse,
        sectionId: selectedSection || undefined,
        batchId: selectedBatch || undefined,
        date,
        topic: topic || undefined,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      });

      toast.success(`Attendance saved for ${students.length} students`);
      setSessionExists(true);

      // Update existing records state
      const newExisting = {};
      Object.entries(records).forEach(([id, status]) => {
        newExisting[id] = status;
      });
      setExistingRecords(newExisting);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // Summary
  const summary = Object.values(records).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Filtered students for search
  const filteredStudents = students.filter((s) => {
    if (!searchStudent) return true;
    const name = s.User?.name?.toLowerCase() || '';
    const code = s.studentCode?.toLowerCase() || '';
    return name.includes(searchStudent.toLowerCase()) ||
      code.includes(searchStudent.toLowerCase());
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Take Attendance' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Take Attendance
      </h1>

      {/* ── Step 1: Course Selection ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          Step 1 — Select Course & Class
        </h2>

        {/* TEACHER FLOW — show assigned courses as cards */}
        {isTeacher && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-2">
                Your Assigned Courses
              </label>
              {assignedCourses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50
                  rounded-xl">
                  <MdBook size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No courses assigned to you yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Contact your administrator to get courses assigned.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignedCourses.map((assignment) => (
                    <button
                      key={assignment.id}
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setSelectedCourse(assignment.courseId);
                        setSelectedBatch(assignment.batchId || '');
                        setSelectedSection(assignment.sectionId || '');
                      }}
                      className={`text-left p-4 rounded-xl border-2 transition-all
                        ${selectedAssignment?.id === assignment.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white text-sm">
                            {assignment.Course?.code} — {assignment.Course?.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {assignment.Batch?.name &&
                              `${assignment.Batch.name}`}
                            {assignment.Section?.name &&
                              ` · ${assignment.Section.name}`}
                            {assignment.Semester?.name &&
                              ` · ${assignment.Semester.name}`}
                          </p>
                        </div>
                        {selectedAssignment?.id === assignment.id && (
                          <MdCheckCircle size={20} className="text-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-indigo-500 mt-2">
                        {assignment.Course?.creditHour} credit hours
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Allow teacher to override section if assignment has no section */}
            {selectedAssignment && !selectedAssignment.sectionId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2
                border-t border-gray-100 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-semibold text-gray-500
                    dark:text-gray-400 uppercase tracking-wider mb-1">
                    Section (if applicable)
                  </label>
                  <select value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className={inputClass}>
                    <option value="">All Sections</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN FLOW — full drill-down dropdowns */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Course *
              </label>
              <select value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className={inputClass}>
                <option value="">Select Course</option>
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <select value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className={inputClass}>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Batch
              </label>
              <select value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className={inputClass}
                disabled={!selectedDept}>
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Section
              </label>
              <select value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className={inputClass}
                disabled={!selectedBatch}>
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date & Topic — shared for both roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4
          pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <label className="block text-xs font-semibold text-gray-500
              dark:text-gray-400 uppercase tracking-wider mb-1">
              Attendance Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500
              dark:text-gray-400 uppercase tracking-wider mb-1">
              Topic / Lecture (optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Introduction to Arrays"
              className={inputClass}
            />
          </div>
        </div>

        {/* Session status indicator */}
        {selectedCourse && (
          <div className={`flex items-center gap-2 text-sm px-4 py-2
            rounded-lg ${sessionExists
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
            {sessionExists ? (
              <>
                <MdWarning size={18} />
                Attendance already recorded for this date.
                Loading will show existing records you can edit.
              </>
            ) : (
              <>
                <MdCheckCircle size={18} />
                No attendance recorded for this date yet.
              </>
            )}
          </div>
        )}

        <button
          onClick={loadStudents}
          disabled={!selectedCourse || loadingStudents}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white
            font-semibold rounded-lg disabled:opacity-60 transition-colors
            flex items-center justify-center gap-2"
        >
          {loadingStudents ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent
                rounded-full animate-spin" />
              Loading students...
            </>
          ) : (
            <>
              <MdPeople size={20} />
              {sessionExists ? 'Load & Edit Attendance' : 'Load Students'}
            </>
          )}
        </button>
      </div>

      {/* ── Step 2: Mark Attendance ── */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                  Step 2 — Mark Attendance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {students.length} students · {date}
                  {topic && ` · ${topic}`}
                </p>
              </div>

              {/* Summary badges */}
              <div className="flex gap-2 flex-wrap">
                {Object.values(ATTENDANCE_STATUS).map((s) => (
                  <span key={s} className={`flex items-center gap-1 text-xs
                    px-2.5 py-1 rounded-full font-medium border
                    ${statusBtnColors[s]}`}>
                    {statusIcons[s]} {summary[s] || 0}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Mark all:</span>
              {Object.values(ATTENDANCE_STATUS).map((s) => (
                <button
                  key={s}
                  onClick={() => setAllStatus(s)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5
                    rounded-full border font-medium transition-all
                    ${statusBtnColors[s]}`}
                >
                  {statusIcons[s]} All {s}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Search student by name or ID..."
              className={inputClass}
            />
          </div>

          {/* Student list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700
            max-h-[55vh] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No students match your search
              </p>
            ) : (
              filteredStudents.map((student, i) => {
                const currentStatus = records[student.id] || 'PRESENT';
                const wasExisting = !!existingRecords[student.id];

                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4
                      hover:bg-gray-50 dark:hover:bg-gray-700/30
                      ${wasExisting ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100
                        dark:bg-indigo-900/30 flex items-center justify-center
                        text-xs font-bold text-indigo-600 shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700
                          dark:text-gray-200 truncate">
                          {student.User?.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-400">
                            {student.studentCode}
                          </p>
                          {wasExisting && (
                            <span className="text-xs text-blue-500">
                              (edited)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status buttons */}
                    <div className="flex gap-1.5 flex-wrap justify-end shrink-0 ml-3">
                      {Object.values(ATTENDANCE_STATUS).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(student.id, s)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5
                            rounded-full border font-medium transition-all
                            ${currentStatus === s
                              ? statusBtnColors[s]
                              : inactiveBtn
                            }`}
                        >
                          {statusIcons[s]}
                          <span className="hidden sm:inline">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 dark:border-gray-700
            flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-green-600">
                {summary.PRESENT || 0} Present
              </span>
              {' · '}
              <span className="font-medium text-red-500">
                {summary.ABSENT || 0} Absent
              </span>
              {' · '}
              <span className="font-medium text-yellow-500">
                {summary.LATE || 0} Late
              </span>
              {' · '}
              <span className="font-medium text-blue-500">
                {summary.EXCUSED || 0} Excused
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStudents([]);
                  setRecords({});
                  setStep(1);
                  setSearchStudent('');
                }}
                className="flex items-center gap-2 px-4 py-2.5 border
                  border-gray-200 dark:border-gray-600 text-gray-600
                  dark:text-gray-300 text-sm font-medium rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MdRefresh size={18} /> Reset
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600
                  hover:bg-indigo-700 text-white text-sm font-medium
                  rounded-lg disabled:opacity-60 transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white
                      border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MdSave size={18} />
                    {sessionExists ? 'Update Attendance' : 'Save Attendance'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {students.length === 0 && step === 1 && selectedCourse && !loadingStudents && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-12 text-center">
          <MdPeople size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Click "Load Students" to begin
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Students will be loaded based on your course and section selection
          </p>
        </div>
      )}
    </div>
  );
}

export default TakeAttendance;