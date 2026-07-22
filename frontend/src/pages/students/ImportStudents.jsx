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
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedAY, setSelectedAY] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    departmentService.getAll().then((r) => setDepartments(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDept) {
      api.get(`/batches?departmentId=${selectedDept}`)
        .then((r) => setBatches(r.data.data))
        .catch(() => {});
    }
  }, [selectedDept]);

  useEffect(() => {
    if (selectedBatch) {
      api.get(`/academic-years?batchId=${selectedBatch}`)
        .then((r) => setAcademicYears(r.data.data))
        .catch(() => {});
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedAY) {
      api.get(`/semesters?academicYearId=${selectedAY}`)
        .then((r) => setSemesters(r.data.data))
        .catch(() => {});
    }
  }, [selectedAY]);

  useEffect(() => {
    if (selectedSem) {
      api.get(`/sections?semesterId=${selectedSem}`)
        .then((r) => setSections(r.data.data))
        .catch(() => {});
    }
  }, [selectedSem]);

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
        departmentId: selectedDept,
        batchId: selectedBatch,
        academicYearId: selectedAY,
        semesterId: selectedSem,
        sectionId: selectedSection,
      });
      setResult(res.data.data);
      toast.success(`Import complete: ${res.data.data.imported} students added`);
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

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-gray-200
    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500`;

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
        <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          Step 1 — Upload Excel or CSV File
        </h2>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center
            cursor-pointer transition-colors
            ${dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <MdUpload size={40} className="mx-auto text-gray-400 mb-3" />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-indigo-600 font-medium">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
                className="text-red-500 hover:text-red-600"
              >
                <MdClose size={18} />
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop your Excel or CSV file here
              </p>
              <p className="text-gray-400 text-sm mt-1">
                or click to browse
              </p>
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

        {file && (
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="w-full py-2.5 border border-indigo-600 text-indigo-600
              hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium
              rounded-lg disabled:opacity-60 transition-colors"
          >
            {previewing ? 'Analyzing file...' : 'Preview File'}
          </button>
        )}
      </div>

      {/* Preview Results */}
      {preview && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            File Preview
          </h2>

          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Total Rows:</span>
              <span className="font-bold text-gray-800 dark:text-white">
                {preview.totalRows}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium
              ${preview.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {preview.isValid
                ? <><MdCheckCircle size={18} /> File is valid</>
                : <><MdError size={18} /> {preview.validationErrors.length} errors found</>
              }
            </div>
          </div>

          {preview.validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-1">
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

          {/* Sample rows */}
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
                        text-gray-600 dark:text-gray-300 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      {preview.columns.map((col) => (
                        <td key={col} className="border border-gray-200
                          dark:border-gray-600 px-3 py-2 text-gray-700
                          dark:text-gray-300">
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

      {/* Step 2 — Assign to Department/Batch/Section */}
      {preview?.isValid && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Step 2 — Assign Students To
          </h2>
          <p className="text-xs text-gray-400">
            All imported students will be assigned to the selections below.
            Leave empty to assign later.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Department</label>
              <select value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setSelectedBatch(''); }}
                className={inputClass}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Batch</label>
              <select value={selectedBatch}
                onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAY(''); }}
                className={inputClass}
                disabled={!selectedDept}>
                <option value="">Select batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Academic Year</label>
              <select value={selectedAY}
                onChange={(e) => { setSelectedAY(e.target.value); setSelectedSem(''); }}
                className={inputClass}
                disabled={!selectedBatch}>
                <option value="">Select academic year</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>{ay.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Semester</label>
              <select value={selectedSem}
                onChange={(e) => { setSelectedSem(e.target.value); setSelectedSection(''); }}
                className={inputClass}
                disabled={!selectedAY}>
                <option value="">Select semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Section</label>
              <select value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className={inputClass}
                disabled={!selectedSem}>
                <option value="">Select section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white
              font-semibold rounded-lg disabled:opacity-60 transition-colors"
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
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Import Results
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50
              rounded-xl">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {result.total}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Rows</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20
              rounded-xl">
              <p className="text-2xl font-bold text-green-600">
                {result.imported}
              </p>
              <p className="text-xs text-gray-400 mt-1">Imported</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20
              rounded-xl">
              <p className="text-2xl font-bold text-red-600">
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
                  <p key={i} className="text-xs text-yellow-600 dark:text-yellow-400">
                    • {e}
                  </p>
                ))}
              </div>
            </div>
          )}

          {result.imported > 0 && (
            <div className="flex items-center gap-2 text-green-600
              font-medium text-sm">
              <MdCheckCircle size={20} />
              Successfully imported {result.imported} students!
              Default password: <code className="bg-gray-100 dark:bg-gray-700
                px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                password123
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImportStudents;