import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { teacherService } from '../../services/teacher.service';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import useDebounce from '../../hooks/useDebounce';
import TeacherForm from './TeacherForm';
import { MdAdd, MdDelete } from 'react-icons/md';

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { fetchTeachers(); }, [debouncedSearch]);

  async function fetchTeachers() {
    setLoading(true);
    try {
      const res = await teacherService.getAll({ search: debouncedSearch });
      setTeachers(res.data.data);
    } catch (err) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await teacherService.delete(id);
      toast.success('Teacher deleted');
      fetchTeachers();
    } catch (err) {
      toast.error('Failed to delete teacher');
    }
  }

  const columns = [
    { key: 'teacherCode', label: 'ID' },
    { key: 'name', label: 'Name', render: (row) => row.User?.name },
    { key: 'email', label: 'Email', render: (row) => row.User?.email },
    { key: 'department', label: 'Department', render: (row) => row.Department?.name ?? '—' },
    { key: 'subject', label: 'Subject', render: (row) => row.subject ?? '—' },
    { key: 'experience', label: 'Experience', render: (row) => row.experience ? `${row.experience} yrs` : '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
            dark:hover:bg-red-900/20"
        >
          <MdDelete size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teachers' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Teachers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
        >
          <MdAdd size={18} /> Add Teacher
        </button>
      </div>

      <div className="max-w-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Search teachers..." />
      </div>

      <Table columns={columns} data={teachers} loading={loading} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Teacher" size="lg">
        <TeacherForm
          onSuccess={() => { setShowModal(false); fetchTeachers(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}

export default TeacherList;