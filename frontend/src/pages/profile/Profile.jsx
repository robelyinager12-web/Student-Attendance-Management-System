import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset,
    formState: { isSubmitting: savingProfile },
  } = useForm();

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPwd,
    formState: { isSubmitting: savingPassword },
  } = useForm();

  useEffect(() => {
    api.get('/profile/me').then((res) => {
      setProfile(res.data.data);
      reset({ name: res.data.data.user.name });
    });
  }, []);

  const onSaveProfile = async (data) => {
    try {
      await api.put('/profile/update', data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const onChangePassword = async (data) => {
    try {
      await api.put('/profile/change-password', data);
      toast.success('Password changed successfully');
      resetPwd();
      setChangingPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await api.post('/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo uploaded successfully');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</h1>

      {/* Avatar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-100
            dark:bg-indigo-900/30 flex items-center justify-center
            text-3xl font-bold text-indigo-600 overflow-hidden">
            {profile?.user?.profileImage ? (
              <img
                src={`http://localhost:5000${profile.user.profileImage}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {profile?.user?.name}
          </p>
          <p className="text-sm text-gray-400">{profile?.user?.email}</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">
            {profile?.user?.role}
          </p>
          <label className="mt-2 inline-block cursor-pointer text-xs
            text-indigo-600 hover:underline">
            Change Photo
            <input type="file" accept="image/*" className="hidden"
              onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>

      {/* Edit Profile */}
      <form
        onSubmit={handleProfile(onSaveProfile)}
        className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-6 space-y-4"
      >
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
          Edit Profile
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1">Full Name</label>
          <input
            {...regProfile('name', { required: 'Name is required' })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
              dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
              dark:text-gray-200 text-sm focus:outline-none focus:ring-2
              focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={savingProfile}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium rounded-lg disabled:opacity-60">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border
        border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
            Change Password
          </h2>
          <button
            onClick={() => setChangingPassword((p) => !p)}
            className="text-sm text-indigo-600 hover:underline"
          >
            {changingPassword ? 'Cancel' : 'Change'}
          </button>
        </div>

        {changingPassword && (
          <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
            {[
              ['Current Password', 'currentPassword'],
              ['New Password', 'newPassword'],
            ].map(([label, name]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1">{label}</label>
                <input
                  type="password"
                  {...regPassword(name, { required: true, minLength: 6 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                    dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700
                    dark:text-gray-200 text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-500"
                />
              </div>
            ))}
            <div className="flex justify-end">
              <button type="submit" disabled={savingPassword}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
                  text-white text-sm font-medium rounded-lg disabled:opacity-60">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;