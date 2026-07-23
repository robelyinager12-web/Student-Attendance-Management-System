import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { importService } from '../../services/import.service';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  MdUpload, MdDownload, MdCheckCircle,
  MdError, MdWarning, MdClose,
} from 'react-icons/md';
import api from '../../services/api';

function ImportStudents() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  // Selected values
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedAY, setSelectedAY] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;

  // Load departments on mount
  useEffect(() => {
    departmentService.getAll()
      .then((r) => setDepartments(r.data.data))
      .catch(() => toast.error('Failed to load departments'));
  }, []);

  // Load batches when department changes
  useEffect(() => {
    if (!selectedDept) {
      setBatches([]);
      setSelectedBatch('');
      return;
    }
    api.get(`/batches?departmentId=${selectedDept}`)
      .then((r) => setBatches(r.data.data))
      .catch(() => toast.error('Failed to load batches'));

    api.get(`/courses?departmentId=${selectedDept}`)
      .then((r) => setCourses(r.data.data))
      .catch(() => {});
  }, [selectedDept]);

  // Load academic years when batch changes
  useEffect(() => {
    if (!selectedBatch) {
      setAcademicYears([]);
      setSelectedAY('');
      return;
    }
    api.get(`/academic-years?batchId=${selectedBatch}`)
      .then((r) => setAcademicYears(r.data.data))
      .catch(() => toast.error('Failed to load academic years'));
  }, [selectedBatch]);

  // Load semesters when academic year changes
  useEffect(() => {
    if (!selectedAY) {
      setSemesters([]);
      setSelectedSem('');
      return;
    }
    api.get(`/semesters?academicYearId=${selectedAY}`)
      .then((r) => setSemesters(r.data.data))
      .catch(() => toast.error('Failed to load semesters'));
  }, [selectedAY]);

  // Load sections when semester changes
  useEffect(() => {
    if (!selectedSem || !selectedDept) {
      setSections([]);
      setSelectedSection('');
      return;
    }
    api.get(`/sections?semesterId=${selectedSem}&departmentId=${selectedDept}`)
      .then((r) => setSections(r.data.data))
      .catch(() => toast.error('Failed to load sections'));
  }, [selectedSem, selectedDept]);

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setPreview(null);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handlePreview = async () => {
    if (!file) return toast.error('Please select a file first');
    setPreviewing(true);
    try {
      const res = await importService.previewFile(file);
      setPreview(res.data.data);
      if (res.data.data.isValid) {
        toast.success(`File is valid — ${res.data.data.totalRows} students ready to import`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to preview file');
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!file) return toast.error('Please select a file first');
    if (!preview?.isValid) {
      return toast.error('Fix validation errors before importing');
    }

    setImporting(true);
    setResult(null);
    try {
      const res = await importService.importStudents(file, {
        departmentId: selectedDept || undefined,
        batchId: selectedBatch || undefined,
        academicYearId: selectedAY || undefined,
        semesterId: selectedSem || undefined,
        sectionId: selectedSection || undefined,
        courseId: selectedCourse || undefined,
      });
      setResult(res.data.data);
      if (res.data.data.imported > 0) {
        toast.success(`Successfully imported ${res.data.data.imported} students!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await importService.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch (err) {
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Students', href: '/students' },
        { label: 'Import Students' },
      ]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Import Students
        </h1>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 border border-indigo-600
            text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
            text-sm font-medium rounded-lg transition-colors"
        >
          <MdDownload size={18} /> Download Template
        </button>
      </div>

      {/* Step 1 — Upload File */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-indigo-600
          uppercase tracking-wider">
          Step 1 — Upload Excel or CSV File
        </h2>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center
            cursor-pointer transition-colors
            ${dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
        >
          <MdUpload size={40} className="mx-auto text-gray-400 mb-3" />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <MdCheckCircle size={20} className="text-green-500" />
              <span className="text-indigo-600 font-medium">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                }}
                className="text-red-500 hover:text-red-600"
              >
                <MdClose size={18} />
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Drag and drop your Excel or CSV file here
              </p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">
                Supported: .xlsx, .xls, .csv — Max 10MB
              </p>
            </>
          )}
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
        </div>

        {file && !preview && (
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="w-full py-2.5 border-2 border-indigo-600
              text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
              font-medium rounded-lg disabled:opacity-60 transition-colors"
          >
            {previewing ? 'Analyzing file...' : '🔍 Preview File Before Importing'}
          </button>
        )}
      </div>

      {/* File Preview Results */}
      {preview && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600
            uppercase tracking-wider">
            File Preview
          </h2>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Total Rows:</span>
              <span className="font-bold text-gray-800 dark:text-white text-lg">
                {preview.totalRows}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold
              ${preview.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {preview.isValid
                ? <><MdCheckCircle size={20} /> File is valid</>
                : <><MdError size={20} /> {preview.validationErrors.length} errors found</>
              }
            </div>
          </div>

          {/* Validation errors */}
          {preview.validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                Validation Errors:
              </p>
              {preview.validationErrors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400">
                  • {e}
                </p>
              ))}
            </div>
          )}

          {/* Sample table */}
          {preview.sampleRows?.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-xs text-gray-400 mb-2">
                Sample data (first 5 rows):
              </p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    {preview.columns.map((col) => (
                      <th key={col} className="border border-gray-200
                        dark:border-gray-600 px-3 py-2 text-left
                        text-gray-600 dark:text-gray-300 font-semibold
                        whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.map((row, i) => (
                    <tr key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      {preview.columns.map((col) => (
                        <td key={col} className="border border-gray-200
                          dark:border-gray-600 px-3 py-2 text-gray-700
                          dark:text-gray-300 whitespace-nowrap">
                          {row[col] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Assign to structure */}
      {preview?.isValid && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-indigo-600
              uppercase tracking-wider">
              Step 2 — Assign Students To
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Select where to assign these {preview.totalRows} students.
              All fields are optional — leave empty to assign later.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedBatch('');
                  setSelectedAY('');
                  setSelectedSem('');
                  setSelectedSection('');
                  setSelectedCourse('');
                }}
                className={inputClass}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  setSelectedAY('');
                  setSelectedSem('');
                  setSelectedSection('');
                }}
                className={inputClass}
                disabled={!selectedDept || batches.length === 0}
              >
                <option value="">
                  {!selectedDept
                    ? 'Select department first'
                    : batches.length === 0
                    ? 'No batches found'
                    : 'Select batch'
                  }
                </option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <select
                value={selectedAY}
                onChange={(e) => {
                  setSelectedAY(e.target.value);
                  setSelectedSem('');
                  setSelectedSection('');
                }}
                className={inputClass}
                disabled={!selectedBatch || academicYears.length === 0}
              >
                <option value="">
                  {!selectedBatch
                    ? 'Select batch first'
                    : academicYears.length === 0
                    ? 'No academic years found'
                    : 'Select academic year'
                  }
                </option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Semester
              </label>
              <select
                value={selectedSem}
                onChange={(e) => {
                  setSelectedSem(e.target.value);
                  setSelectedSection('');
                }}
                className={inputClass}
                disabled={!selectedAY || semesters.length === 0}
              >
                <option value="">
                  {!selectedAY
                    ? 'Select academic year first'
                    : semesters.length === 0
                    ? 'No semesters found'
                    : 'Select semester'
                  }
                </option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className={inputClass}
                disabled={!selectedSem || sections.length === 0}
              >
                <option value="">
                  {!selectedSem
                    ? 'Select semester first'
                    : sections.length === 0
                    ? 'No sections found for this semester'
                    : 'Select section'
                  }
                </option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                dark:text-gray-400 uppercase tracking-wider mb-1">
                Course (Optional)
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className={inputClass}
                disabled={!selectedDept || courses.length === 0}
              >
                <option value="">
                  {!selectedDept
                    ? 'Select department first'
                    : courses.length === 0
                    ? 'No courses found'
                    : 'Select course (optional)'
                  }
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignment summary */}
          {selectedDept && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-700
                dark:text-indigo-400 mb-2">
                Import Summary
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600
                dark:text-gray-300">
                <div><span className="font-medium">Students:</span> {preview.totalRows}</div>
                <div><span className="font-medium">Department:</span> {departments.find((d) => d.id === selectedDept)?.name || '—'}</div>
                <div><span className="font-medium">Batch:</span> {batches.find((b) => b.id === selectedBatch)?.name || '—'}</div>
                <div><span className="font-medium">Year:</span> {academicYears.find((ay) => ay.id === selectedAY)?.name || '—'}</div>
                <div><span className="font-medium">Semester:</span> {semesters.find((s) => s.id === selectedSem)?.name || '—'}</div>
                <div><span className="font-medium">Section:</span> {sections.find((s) => s.id === selectedSection)?.name || '—'}</div>
                {selectedCourse && (
                  <div><span className="font-medium">Course:</span> {courses.find((c) => c.id === selectedCourse)?.name || '—'}</div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white
              font-semibold rounded-lg disabled:opacity-60 transition-colors
              text-base"
          >
            {importing
              ? 'Importing students...'
              : `Import ${preview.totalRows} Students`
            }
          </button>
        </div>
      )}

      {/* Import Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600
            uppercase tracking-wider">
            Import Results
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50
              dark:bg-gray-700/50 rounded-xl">
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {result.total}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Rows</p>
            </div>
            <div className="text-center p-4 bg-green-50
              dark:bg-green-900/20 rounded-xl">
              <p className="text-3xl font-bold text-green-600">
                {result.imported}
              </p>
              <p className="text-xs text-gray-400 mt-1">Imported</p>
            </div>
            <div className="text-center p-4 bg-red-50
              dark:bg-red-900/20 rounded-xl">
              <p className="text-3xl font-bold text-red-600">
                {result.skipped}
              </p>
              <p className="text-xs text-gray-400 mt-1">Skipped</p>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-700
                dark:text-yellow-400 mb-2 flex items-center gap-2">
                <MdWarning size={18} /> Skipped rows:
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-yellow-600
                    dark:text-yellow-400">• {e}</p>
                ))}
              </div>
            </div>
          )}

          {result.imported > 0 && (
            <div className="flex items-center gap-3 text-green-600
              font-medium text-sm bg-green-50 dark:bg-green-900/20
              rounded-lg p-4">
              <MdCheckCircle size={24} />
              <div>
                <p>Successfully imported {result.imported} students!</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Default password for all students:
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5
                    rounded text-gray-700 dark:text-gray-300 ml-1">
                    password123
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImportStudents;