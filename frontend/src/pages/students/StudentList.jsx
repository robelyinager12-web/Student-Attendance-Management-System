import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService } from '../../services/student.service';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Breadcrumb from '../../components/common/Breadcrumb';
import useDebounce from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatDate';
import { MdAdd, MdVisibility, MdDelete, MdUpload } from 'react-icons/md';

function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
      });
      setStudents(res.data.data.items);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.delete(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error('Failed to delete student');
    }
  }

  const columns = [
    { key: 'studentCode', label: 'ID' },
    { key: 'name', label: 'Name', render: (row) => row.User?.name },
    { key: 'email', label: 'Email', render: (row) => row.User?.email },
    { key: 'class', label: 'Class', render: (row) => row.Class?.name ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium
          ${row.status === 'ACTIVE'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
          }`}>
          {row.status}
        </span>
      ),
    },
    { key: 'admissionDate', label: 'Admitted', render: (row) => formatDate(row.admissionDate) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/students/${row.id}`)}
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50
              dark:hover:bg-indigo-900/20"
          >
            <MdVisibility size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
              dark:hover:bg-red-900/20"
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]} />

      <div className="flex items-center gap-3">
  <button
    onClick={() => navigate('/students/import')}
    className="flex items-center gap-2 px-4 py-2 border border-indigo-600
      text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
      text-sm font-medium rounded-lg"
  >
    <MdUpload size={18} /> Import Excel
  </button>
  <button
    onClick={() => navigate('/students/new')}
    className="flex items-center gap-2 px-4 py-2 bg-indigo-600
      hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
  >
    <MdAdd size={18} /> Add Student
  </button>
</div>

      <div className="max-w-sm">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search students..."
        />
      </div>

      <Table columns={columns} data={students} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export default StudentList;