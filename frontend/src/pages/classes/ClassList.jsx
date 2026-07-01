import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { classService } from '../../services/class.service';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import ClassForm from './ClassForm';
import { MdAdd, MdDelete } from 'react-icons/md';

function ClassList() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchClasses(); }, []);

  async function fetchClasses() {
    setLoading(true);
    try {
      const res = await classService.getAll();
      setClasses(res.data.data);
    } catch (err) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this class?')) return;
    try {
      await classService.delete(id);
      toast.success('Class deleted');
      fetchClasses();
    } catch (err) {
      toast.error('Failed to delete class');
    }
  }

  const columns = [
    { key: 'name', label: 'Class Name' },
    { key: 'section', label: 'Section' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'semester', label: 'Semester' },
    { key: 'department', label: 'Department', render: (r) => r.Department?.name ?? '—' },
    { key: 'teacher', label: 'Teacher', render: (r) => r.Teacher?.User?.name ?? 'Not Assigned' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button onClick={() => handleDelete(row.id)}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
            dark:hover:bg-red-900/20">
          <MdDelete size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Classes' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Classes</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <MdAdd size={18} /> Add Class
        </button>
      </div>

      <Table columns={columns} data={classes} loading={loading} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Class">
        <ClassForm
          onSuccess={() => { setShowModal(false); fetchClasses(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}

export default ClassList;