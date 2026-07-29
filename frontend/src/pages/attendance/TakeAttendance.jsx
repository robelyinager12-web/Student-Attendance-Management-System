import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance.service';
import { courseAssignmentService } from '../../services/courseAssignment.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import api from '../../services/api';
import {
  MdCheckCircle, MdCancel, MdSchedule, MdOutlineRule,
  MdSave, MdRefresh, MdPeople, MdBook, MdWarning,
  MdSearch, MdKeyboardArrowDown, MdClass,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2.5 rounded-xl border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2
  focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;

const STATUS_CONFIG = {
  PRESENT: { label: 'Present', color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700', icon: '✓' },
  ABSENT:  { label: 'Absent',  color: 'bg-red-500',     light: 'bg-red-50     text-red-700     border-red-300     dark:bg-red-900/30     dark:text-red-400     dark:border-red-700',     icon: '✗' },
  LATE:    { label: 'Late',    color: 'bg-amber-500',   light: 'bg-amber-50   text-amber-700   border-amber-300   dark:bg-amber-900/30   dark:text-amber-400   dark:border-amber-700',   icon: '⏱' },
  EXCUSED: { label: 'Excused', color: 'bg-blue-500',    light: 'bg-blue-50    text-blue-700    border-blue-300    dark:bg-blue-900/30    dark:text-blue-400    dark:border-blue-700',    icon: '≈' },
};

export default function TakeAttendance() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin   = user?.role === 'ADMIN';

  // Step 1 — Filter selections
  const [academicYears,  setAcademicYears]  = useState([]);
  const [semesters,      setSemesters]      = useState([]);
  const [departments,    setDepartments]    = useState([]);
  const [programs,       setPrograms]       = useState([]);
  const [batches,        setBatches]        = useState([]);
  const [sections,       setSections]       = useState([]);
  const [courses,        setCourses]        = useState([]);
  const [assignedCourses,setAssignedCourses]= useState([]);

  const [sel, setSel] = useState({
    academicYearId: '', semesterId: '', departmentId: '',
    programId: '', batchId: '', year: '',
    sectionId: '', courseId: '',
  });
  const [date,  setDate]  = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');

  // Step 2 — Students & attendance
  const [students,       setStudents]       = useState([]);
  const [records,        setRecords]        = useState({});
  const [remarks,        setRemarks]        = useState({});
  const [existingRecs,   setExistingRecs]   = useState({});
  const [sessionExists,  setSessionExists]  = useState(false);
  const [loadingStudents,setLoadingStudents]= useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [step,           setStep]           = useState(1);
  const [searchStudent,  setSearchStudent]  = useState('');

  const setSf = (key, val) => setSel(p => ({ ...p, [key]: val }));

  // Load initial dropdowns
  useEffect(() => {
    api.get('/academic-years').then(r => setAcademicYears(r.data.data)).catch(() => {});
    if (isTeacher) {
      courseAssignmentService.getMyCourses().then(r => setAssignedCourses(r.data.data)).catch(() => {});
    } else {
      api.get('/departments').then(r => setDepartments(r.data.data)).catch(() => {});
    }
  }, [isTeacher]);

  useEffect(() => {
    if (!sel.academicYearId) return;
    api.get(`/semesters?academicYearId=${sel.academicYearId}`).then(r => setSemesters(r.data.data)).catch(() => {});
  }, [sel.academicYearId]);

  useEffect(() => {
    if (!sel.departmentId) { setPrograms([]); setBatches([]); return; }
    api.get(`/programs?departmentId=${sel.departmentId}`).then(r => setPrograms(r.data.data)).catch(() => {});
    api.get(`/batches?departmentId=${sel.departmentId}`).then(r => setBatches(r.data.data)).catch(() => {});
    api.get(`/courses?departmentId=${sel.departmentId}`).then(r => setCourses(r.data.data)).catch(() => {});
  }, [sel.departmentId]);

  useEffect(() => {
    if (!sel.batchId || !sel.semesterId) { setSections([]); return; }
    api.get(`/sections?batchId=${sel.batchId}&semesterId=${sel.semesterId}`)
      .then(r => setSections(r.data.data)).catch(() => {});
  }, [sel.batchId, sel.semesterId]);

  // Check existing session
  useEffect(() => {
    if (!sel.courseId || !date) return;
    api.get('/attendance/session/check', {
      params: { courseId: sel.courseId, sectionId: sel.sectionId || undefined, date },
    }).then(r => {
      const data = r.data.data;
      setSessionExists(data.sessionExists);
      if (data.records?.length > 0) {
        const ex = {}; const exr = {};
        data.records.forEach(rec => { ex[rec.studentId] = rec.status; exr[rec.studentId] = rec.remark || ''; });
        setExistingRecs(ex);
      } else { setExistingRecs({}); }
    }).catch(() => {});
  }, [sel.courseId, sel.sectionId, date]);

  const loadStudents = async () => {
    if (!sel.courseId) return toast.error('Please select a course');
    setLoadingStudents(true); setStudents([]); setRecords({}); setRemarks({});
    try {
      const params = { courseId: sel.courseId };
      if (sel.sectionId)  params.sectionId  = sel.sectionId;
      if (sel.batchId)    params.batchId    = sel.batchId;
      const res = await api.get('/attendance/section', { params });
      const list = res.data.data;
      if (list.length === 0) { toast.warning('No students found for this selection'); return; }
      setStudents(list);
      const def = {}; const defR = {};
      list.forEach(s => {
        def[s.id]  = existingRecs[s.id]  || 'PRESENT';
        defR[s.id] = '';
      });
      setRecords(def); setRemarks(defR); setStep(2);
    } catch (err) { toast.error('Failed to load students'); }
    finally { setLoadingStudents(false); }
  };

  const setAllStatus = (status) => {
    const all = {};
    students.forEach(s => { all[s.id] = status; });
    setRecords(all);
  };

  const handleSubmit = async () => {
    if (students.length === 0) return toast.error('No students loaded');
    setSubmitting(true);
    try {
      await attendanceService.markBulk({
        courseId:  sel.courseId  || undefined,
        sectionId: sel.sectionId || undefined,
        batchId:   sel.batchId   || undefined,
        semesterId:sel.semesterId || undefined,
        date, topic: topic || undefined,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId, status, remark: remarks[studentId] || '',
        })),
      });
      toast.success(`✅ Attendance saved for ${students.length} students`);
      setSessionExists(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save attendance'); }
    finally { setSubmitting(false); }
  };

  const summary = Object.values(records).reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const filteredStudents = students.filter(s =>
    !searchStudent ||
    s.User?.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.studentCode?.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const selectedCourseObj = isTeacher
    ? assignedCourses.find(a => a.courseId === sel.courseId)
    : null;

  return (
    <div className="space-y-5 max-w-6xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Take Attendance' }]} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdCheckCircle className="text-emerald-600" size={28} /> Take Attendance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {date} {sessionExists && <span className="text-amber-600 font-semibold">· Attendance already recorded for this session</span>}
          </p>
        </div>
        {step === 2 && (
          <button onClick={() => { setStudents([]); setStep(1); setSearchStudent(''); }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600
              text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
            <MdRefresh size={18} /> Change Class
          </button>
        )}
      </div>

      {/* ══ STEP 1 — Select Class ══ */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
          bg-gradient-to-r from-indigo-600 to-blue-600">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
            Step 1 — Select Class
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Teacher — show assigned course cards */}
          {isTeacher && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Your Assigned Courses
              </label>
              {assignedCourses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <MdBook size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No courses assigned yet. Contact your administrator.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {assignedCourses.map((a, i) => {
                    const gradients = [
                      'from-indigo-500 to-indigo-600','from-blue-500 to-blue-600',
                      'from-purple-500 to-purple-600','from-teal-500 to-teal-600',
                      'from-cyan-500 to-cyan-600','from-rose-500 to-rose-600',
                    ];
                    const isSelected = sel.courseId === a.courseId;
                    return (
                      <button key={a.id}
                        onClick={() => {
                          setSel(p => ({
                            ...p, courseId: a.courseId,
                            batchId: a.batchId || '',
                            sectionId: a.sectionId || '',
                            semesterId: a.semesterId || '',
                          }));
                        }}
                        className={`text-left rounded-2xl overflow-hidden border-2 transition-all duration-200
                          ${isSelected ? 'border-indigo-500 shadow-lg scale-[1.02]' : 'border-transparent hover:border-indigo-300'}`}>
                        <div className={`p-4 bg-gradient-to-br ${gradients[i % gradients.length]} text-white`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                              {a.Course?.code?.substring(0, 2)}
                            </div>
                            {isSelected && <MdCheckCircle size={20} className="text-white" />}
                          </div>
                          <p className="font-bold text-sm leading-tight">{a.Course?.name}</p>
                          <p className="text-white/70 text-xs mt-0.5">{a.Course?.code} · {a.Course?.creditHour} cr</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-4 py-2 flex gap-1 flex-wrap">
                          {a.Batch?.name && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{a.Batch.name}</span>}
                          {a.Section?.name && <span className="text-xs bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full font-medium">{a.Section.name}</span>}
                          {a.Semester?.name && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{a.Semester.name}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Admin — full drill-down */}
          {isAdmin && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Academic Year *', key: 'academicYearId', options: academicYears, labelKey: 'name' },
                { label: 'Semester *',      key: 'semesterId',     options: semesters,     labelKey: 'name', disabled: !sel.academicYearId },
                { label: 'Department *',    key: 'departmentId',   options: departments,   labelKey: 'name' },
                { label: 'Program',         key: 'programId',      options: programs,      labelKey: 'name', disabled: !sel.departmentId },
                { label: 'Batch *',         key: 'batchId',        options: batches,       labelKey: 'name', disabled: !sel.departmentId },
                { label: 'Year Level',      key: 'year',
                  options: [1,2,3,4].map(y => ({ id: String(y), name: `Year ${['I','II','III','IV'][y-1]}` })),
                  labelKey: 'name' },
                { label: 'Section *',       key: 'sectionId',      options: sections,      labelKey: 'name', disabled: !sel.batchId },
                { label: 'Course *',        key: 'courseId',       options: courses,       labelKey: 'name', codeKey: 'code', disabled: !sel.departmentId },
              ].map(({ label, key, options, labelKey, codeKey, disabled }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</label>
                  <select value={sel[key]} onChange={e => setSf(key, e.target.value)} className={inputClass} disabled={disabled}>
                    <option value="">Select {label.replace(' *','')}</option>
                    {options.map(o => (
                      <option key={o.id} value={o.id}>
                        {codeKey ? `${o[codeKey]} — ${o[labelKey]}` : o[labelKey]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Date, Topic, Room row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Attendance Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lecture Topic</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Introduction to Arrays" className={inputClass} />
            </div>
            {selectedCourseObj?.Section?.room && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Room</label>
                <input readOnly value={selectedCourseObj.Section.room} className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
              </div>
            )}
          </div>

          {/* Session status badge */}
          {sel.courseId && (
            <div className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium
              ${sessionExists
                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              }`}>
              {sessionExists ? <MdWarning size={18} /> : <MdCheckCircle size={18} />}
              {sessionExists
                ? 'Attendance already recorded for this date. Loading will show existing records for editing.'
                : 'No attendance recorded yet for this date.'}
            </div>
          )}

          {/* Load students button */}
          <button onClick={loadStudents}
            disabled={!sel.courseId || loadingStudents}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600
              hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl
              disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md">
            {loadingStudents
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading Students...</>
              : <><MdPeople size={20} /> {sessionExists ? 'Load & Edit Attendance' : 'Load Students'}</>
            }
          </button>
        </div>
      </div>

      {/* ══ STEP 2 — Mark Attendance ══ */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

          {/* Step 2 header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
            bg-gradient-to-r from-emerald-600 to-teal-600">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                Step 2 — Mark Attendance
                <span className="text-white/70 font-normal normal-case tracking-normal">
                  · {students.length} students · {date}
                  {topic && ` · ${topic}`}
                </span>
              </h2>
              {/* Summary badges */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1
                    rounded-full font-bold bg-white/20 text-white">
                    <span className={`w-2 h-2 rounded-full ${c.color}`} />
                    {summary[s] || 0} {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700
            bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Mark all:</span>
            {Object.entries(STATUS_CONFIG).map(([s, c]) => (
              <button key={s} onClick={() => setAllStatus(s)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-bold transition-all ${c.light}`}>
                <span>{c.icon}</span> All {c.label}
              </button>
            ))}
            <div className="ml-auto relative">
              <MdSearch size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                placeholder="Search student..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44" />
            </div>
          </div>

          {/* Student table */}
          <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Photo</th>
                  {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                    <th key={s} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: s === 'PRESENT' ? '#10b981' : s === 'ABSENT' ? '#ef4444' : s === 'LATE' ? '#f59e0b' : '#3b82f6' }}>
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredStudents.map((student, i) => {
                  const current = records[student.id] || 'PRESENT';
                  const wasExisting = !!existingRecs[student.id];
                  return (
                    <tr key={student.id}
                      className={`transition-colors
                        ${wasExisting ? 'bg-blue-50/40 dark:bg-blue-900/10' : i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                        hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20`}>
                      <td className="px-4 py-3 text-xs text-gray-400 font-semibold">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-indigo-600
                          bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">
                          {student.studentCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white text-sm whitespace-nowrap">
                            {student.User?.name}
                          </p>
                          {wasExisting && <span className="text-xs text-blue-500">(previously recorded)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600
                          flex items-center justify-center text-white text-xs font-bold">
                          {student.User?.name?.charAt(0)}
                        </div>
                      </td>
                      {/* Radio buttons for each status */}
                      {Object.keys(STATUS_CONFIG).map(s => (
                        <td key={s} className="px-3 py-3 text-center">
                          <button onClick={() => setRecords(p => ({ ...p, [student.id]: s }))}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all
                              ${current === s
                                ? s === 'PRESENT' ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : s === 'ABSENT' ? 'bg-red-500 border-red-500 text-white'
                                  : s === 'LATE'   ? 'bg-amber-500 border-amber-500 text-white'
                                  : 'bg-blue-500 border-blue-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                              }`}>
                            {current === s && (
                              <span className="text-xs font-bold">
                                {STATUS_CONFIG[s].icon}
                              </span>
                            )}
                          </button>
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <input type="text" value={remarks[student.id] || ''}
                          onChange={e => setRemarks(p => ({ ...p, [student.id]: e.target.value }))}
                          placeholder="Optional..."
                          className="w-28 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-600
                            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700
            flex items-center justify-between flex-wrap gap-3 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex gap-4 text-sm flex-wrap">
              <span className="font-bold text-emerald-600">{summary.PRESENT || 0} Present</span>
              <span className="font-bold text-red-500">{summary.ABSENT || 0} Absent</span>
              <span className="font-bold text-amber-500">{summary.LATE || 0} Late</span>
              <span className="font-bold text-blue-500">{summary.EXCUSED || 0} Excused</span>
              <span className="text-gray-400 text-xs self-center">
                · Rate: {students.length > 0 ? (((summary.PRESENT || 0) / students.length) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStudents([]); setStep(1); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600
                  text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MdRefresh size={18} /> Reset
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600
                  hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl
                  disabled:opacity-60 shadow-md transition-all">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><MdSave size={18} /> {sessionExists ? 'Update Attendance' : 'Save Attendance'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {step === 1 && !loadingStudents && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-4xl mx-auto mb-4">📋</div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">Ready to Take Attendance</p>
          <p className="text-gray-400 text-sm mt-2">
            {isTeacher ? 'Select a course above then click Load Students' : 'Complete all filters above then click Load Students'}
          </p>
        </div>
      )}
    </div>
  );
}