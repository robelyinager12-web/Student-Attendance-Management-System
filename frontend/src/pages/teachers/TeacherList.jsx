import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { teacherService } from '../../services/teacher.service';
import { departmentService } from '../../services/department.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import TeacherForm from './TeacherForm';
import api from '../../services/api';
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility,
  MdDownload, MdUpload, MdFilterList, MdRefresh,
  MdSchool, MdClose,
} from 'react-icons/md';

const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200
  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
  dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

const STATUS_COLORS = {
  ACTIVE:   'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-gray-100    text-gray-600',
  ON_LEAVE: 'bg-amber-100   text-amber-700',
};

export default function TeacherList() {
  const navigate = useNavigate();
  const [teachers,    setTeachers]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: '', status: 'ACTIVE', search: '',
  });

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
  }, []);

  const fetchTeachers = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await teacherService.getAll(params);
      const data = res.data.data;
      setTeachers(Array.isArray(data) ? data : data.items || []);
      setTotal(data.total || (Array.isArray(data) ? data.length : 0));
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Failed to load teachers'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchTeachers(1); setPage(1); }, [filters]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await teacherService.delete(deleteId);
      toast.success('Teacher deleted');
      setDeleteId(null);
      fetchTeachers(page);
    } catch { toast.error('Failed to delete teacher'); }
    finally { setDeleting(false); }
  };

  const sf = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/home' }, { label: 'Teacher Management' }]} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <MdSchool className="text-blue-600" size={28} /> Teacher Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} teacher{total !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-indigo-600
            text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl">
            <MdUpload size={18} /> Import Teachers
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-600
            text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-xl">
            <MdDownload size={18} /> Export Excel
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700
              text-white text-sm font-semibold rounded-xl shadow-md">
            <MdAdd size={18} /> Add Teacher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <MdFilterList size={18} className="text-blue-500" /> Filters
          </span>
          <button onClick={() => fetchTeachers(1)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 font-medium">
            <MdRefresh size={14} /> Refresh
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</label>
              <select value={filters.departmentId} onChange={e => sf('departmentId', e.target.value)} className={inputClass}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
              <select value={filters.status} onChange={e => sf('status', e.target.value)} className={inputClass}>
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Search Teacher</label>
              <div className="relative">
                <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={filters.search}
                  onChange={e => sf('search', e.target.value)}
                  placeholder="Search by name, ID, email..."
                  className={`${inputClass} pl-9`} />
                {filters.search && (
                  <button onClick={() => sf('search', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <MdClose size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ departmentId: '', status: 'ACTIVE', search: '' })}
                className="w-full py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 font-semibold">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500 text-sm">Loading teachers...</span>
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-3">🎓</div>
            <p className="text-gray-500 font-semibold">No teachers found</p>
            <button onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl">
              Add Teacher
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  {['Photo','Teacher ID','Name','Department','Subject','Courses','Experience','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {teachers.map((t, i) => (
                  <tr key={t.id} className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-900/20
                    ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      {t.photo ? (
                        <img src={t.photo} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-blue-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white text-sm font-bold border-2 border-blue-200">
                          {t.User?.name?.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                        {t.teacherCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 dark:text-white whitespace-nowrap">{t.User?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.User?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {t.Department?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {t.subject ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {t.CourseAssignments?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {t.experience ? `${t.experience} yrs` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                        ${STATUS_COLORS[t.status] ?? STATUS_COLORS.INACTIVE}`}>
                        {t.status ?? 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/teachers/${t.id}`)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                          <MdVisibility size={17} />
                        </button>
                        <button className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                          <MdEdit size={17} />
                        </button>
                        <button onClick={() => setDeleteId(t.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <MdDelete size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {totalPages} · {total} total</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={pg => { setPage(pg); fetchTeachers(pg); }} />
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Teacher" size="lg">
        <TeacherForm
          onSuccess={() => { setShowModal(false); fetchTeachers(page); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white text-center mb-2">Delete Teacher</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This will permanently delete the teacher account.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}