import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  MdEmail, MdLock, MdVisibility,
  MdVisibilityOff, MdLogin,
} from 'react-icons/md';

export default function Login() {
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      window.location.href = '/home';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#1a1a6e 40%,#050e24 100%)' }}>

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 relative overflow-hidden">

        {/* Grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.8) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* Orbs */}
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle,#06b6d4,transparent)', animationDelay: '1.5s' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500
            flex items-center justify-center text-2xl shadow-xl">
            📚
          </div>
          <div>
            <p className="text-white font-extrabold text-xl tracking-wide">SAMS</p>
            <p className="text-cyan-400 text-xs font-medium">Injibara University · College of Technology</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-10">
          <div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Technology Student
              <span className="block bg-gradient-to-r from-cyan-400 to-indigo-400
                bg-clip-text text-transparent mt-1">
                Attendance System
              </span>
            </h1>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed max-w-md">
              Manage students, teachers, attendance, and academic structure with smart,
              secure, and real-time AI-powered tools.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['🎯 QR Code','👁️ Face ID','🖐️ Fingerprint','📡 RFID','☁️ Cloud Sync','📊 Analytics'].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10
                border border-white/20 text-xs font-semibold text-gray-300">
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: '248+', label: 'Students' },
              { value: '12+',  label: 'Teachers' },
              { value: '7',    label: 'Departments' },
            ].map(s => (
              <div key={s.label} className="text-center p-4 rounded-2xl bg-white/5
                border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <p className="text-gray-300 text-sm leading-relaxed italic">
            "SAMS transformed how we manage attendance. Real-time dashboard,
            QR scanning, and AI reports — all in one system."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400
              flex items-center justify-center text-sm">👨‍🏫</div>
            <div>
              <p className="text-white text-xs font-bold">Dr. Alemu Bekele</p>
              <p className="text-gray-500 text-xs">Dean, College of Technology</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500
              flex items-center justify-center text-xl">📚</div>
            <div>
              <p className="text-white font-extrabold text-base">SAMS</p>
              <p className="text-cyan-400 text-xs">Injibara University</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600
                flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">
                🔐
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your SAMS account</p>
            </div>

            {/* Role tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
              {[
                { role: 'Admin',   icon: '👨‍💼', color: 'from-purple-600 to-purple-700' },
                { role: 'Teacher', icon: '👨‍🏫', color: 'from-blue-600 to-blue-700' },
                { role: 'Student', icon: '👨‍🎓', color: 'from-emerald-600 to-emerald-700' },
              ].map(r => (
                <div key={r.role} className="flex flex-col items-center gap-1 py-2.5 rounded-xl
                  bg-transparent text-gray-400 text-xs font-semibold">
                  <span className="text-lg">{r.icon}</span>
                  {r.role}
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase
                  tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <MdEmail size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="admin@school.com"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200
                      focus:border-indigo-500 focus:outline-none text-sm text-gray-700
                      bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase
                  tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <MdLock size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-gray-200
                      focus:border-indigo-500 focus:outline-none text-sm text-gray-700
                      bg-gray-50 focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                      hover:text-gray-600 transition-colors">
                    {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" />
                  <span className="text-xs text-gray-600 font-medium">Remember me</span>
                </label>
                <Link to="/forgot-password"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600
                  hover:from-indigo-700 hover:to-cyan-700 text-white font-bold rounded-xl
                  shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center
                  justify-center gap-2 transition-all hover:scale-[1.02] text-sm">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                  : <><MdLogin size={18} /> Sign In</>}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or continue as</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            {/* Alternative logins */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🎯', label: 'QR Code' },
                { icon: '🖐️', label: 'Fingerprint' },
                { icon: '📡', label: 'RFID Card' },
              ].map(alt => (
                <button key={alt.label}
                  onClick={() => toast.info(`${alt.label} scanner requires hardware device`)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2
                    border-gray-200 hover:border-indigo-300 hover:bg-indigo-50
                    text-gray-500 hover:text-indigo-600 transition-all text-xs font-semibold">
                  <span className="text-xl">{alt.icon}</span>
                  {alt.label}
                </button>
              ))}
            </div>

            {/* Register links */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-600 text-center mb-3">
                Don't have an account? Register as:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'Admin',   path: '/register/admin',   icon: '👨‍💼', color: 'bg-purple-600 hover:bg-purple-700' },
                  { role: 'Teacher', path: '/register/teacher', icon: '👨‍🏫', color: 'bg-blue-600 hover:bg-blue-700' },
                  { role: 'Student', path: '/register/student', icon: '👨‍🎓', color: 'bg-emerald-600 hover:bg-emerald-700' },
                ].map(r => (
                  <Link key={r.role} to={r.path}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl
                      ${r.color} text-white text-xs font-bold transition-colors`}>
                    <span className="text-base">{r.icon}</span>
                    {r.role}
                  </Link>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 mt-5
              text-xs text-gray-400">
              <span>🔒</span>
              <span>256-bit SSL encrypted · Secure login</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-gray-500 text-xs mt-6">
            © 2026 SAMS · Injibara University College of Technology
          </p>
        </div>
      </div>
    </div>
  );
}