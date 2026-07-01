import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { courseService } from '../../services/course.service';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Breadcrumb from '../../components/common/Breadcrumb';
import CourseForm from './CourseForm';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await courseService.getAll();
      setCourses(res.data.data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this course?')) return;
    try {
      await courseService.delete(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'creditHour', label: 'Credits' },
    { key: 'semester', label: 'Semester' },
    { key: 'department', label: 'Department', render: (row) => row.Department?.name ?? '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(row); setShowModal(true); }}
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50
              dark:hover:bg-indigo-900/20"
          >
            <MdEdit size={18} />
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
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Courses' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Courses</h1>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600
            hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
        >
          <MdAdd size={18} /> Add Course
        </button>
      </div>

      <Table columns={columns} data={courses} loading={loading} />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Course' : 'Add Course'}
      >
        <CourseForm
          initialData={editing}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchCourses(); }}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}

export default CourseList;