import api from './api';

export const importService = {
  downloadTemplate: () =>
    api.get('/import/template', { responseType: 'blob' }),

  previewFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importStudents: (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.departmentId) formData.append('departmentId', metadata.departmentId);
    if (metadata.batchId) formData.append('batchId', metadata.batchId);
    if (metadata.academicYearId) formData.append('academicYearId', metadata.academicYearId);
    if (metadata.semesterId) formData.append('semesterId', metadata.semesterId);
    if (metadata.sectionId) formData.append('sectionId', metadata.sectionId);
    if (metadata.programId) formData.append('programId', metadata.programId);
    return api.post('/import/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};