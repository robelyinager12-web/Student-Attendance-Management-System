import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
  MdPerson, MdEmail, MdLock, MdPhone,
  MdVisibility, MdVisibilityOff,
  MdArrowBack, MdCheckCircle,
} from 'react-icons/md';

// ── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    icon: '👨‍💼',
    gradient: 'from-purple-600 to-purple-700',
    light: 'from-purple-50 to-indigo-50',
    accent: 'indigo',
    desc: 'System administrator with full access to all features',
    fields: ['name','email','phone','password','confirm','adminCode'],
    perks: ['Full system access','Manage all users','View all reports','Audit logs','System settings'],
  },
  teacher: {
    label: 'Teacher',
    icon: '👨‍🏫',
    gradient: 'from-blue-600 to-cyan-700',
    light: 'from-blue-50 to-cyan-50',
    accent: 'blue',
    desc: 'Course instructor with attendance and reporting access',
    fields: ['name','email','phone','department','subject','qualification','experience','password','confirm'],
    perks: ['Take attendance','View students','Generate reports','Course management','Section access'],
  },
  student: {
    label: 'Student',
    icon: '👨‍🎓',
    gradient: 'from-emerald-600 to-teal-700',
    light: 'from-emerald-50 to-teal-50',
    accent: 'emerald',
    desc: 'University student with access to personal attendance and records',
    fields: ['name','email','phone','studentId','department','batch','year','password','confirm'],
    perks: ['View attendance','Track progress','Download reports','Notifications','Mobile access'],
  },
};

const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200
  focus:border-indigo-500 focus:outline-none text-sm text-gray-700
  bg-gray-50 focus:bg-white transition-all placeholder-gray-400`;

const selectClass = `w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200
  focus:border-indigo-500 focus:outline-none text-sm text-gray-700
  bg-gray-50 focus:bg-white transition-all`;

function FieldIcon({ icon }) {
  return (
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </span>
  );
}

export default function Register() {
  const { role = 'student' } = useParams();
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(1);
  const [done,      setDone]      = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name:     data.name,
        email:    data.email,
        password: data.password,
        phone:    data.phone || undefined,
        role:     role.toUpperCase(),
      };

      if (role === 'teacher') {
        Object.assign(payload, {
          subject:       data.subject,
          qualification: data.qualification,
          experience:    data.experience ? parseInt(data.experience) : undefined,
          departmentId:  data.departmentId || undefined,
        });
      }

      if (role === 'student') {
        Object.assign(payload, {
          studentCode:  data.studentId || undefined,
          departmentId: data.departmentId || undefined,
          year:         data.year || undefined,
        });
      }

      await api.post('/auth/register', payload);
      setDone(true);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#1a1a6e 40%,#050e24 100%)' }}>
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
            flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl">
            🎉
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 mb-2">
            Your <span className="font-bold text-indigo-600">{config.label}</span> account has been
            successfully created.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            {role === 'admin' || role === 'teacher'
              ? 'An administrator will review and activate your account within 24 hours.'
              : 'You can now sign in to access your student portal.'}
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600
                text-white font-bold rounded-xl shadow-lg">
              🔐 Go to Login
            </button>
            <button onClick={() => { setDone(false); setStep(1); }}
              className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50">
              Register Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#1a1a6e 40%,#050e24 100%)' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.8) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
        <div className="absolute bottom-20 right-5 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle,#06b6d4,transparent)', animationDelay: '2s' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500
            flex items-center justify-center text-xl shadow-lg">
            📚
          </div>
          <div>
            <p className="text-white font-extrabold text-base">SAMS</p>
            <p className="text-cyan-400 text-[10px]">Injibara University</p>
          </div>
        </div>

        {/* Role hero */}
        <div className="relative space-y-6">
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${config.gradient}
            flex items-center justify-center text-5xl shadow-2xl`}>
            {config.icon}
          </div>
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              {config.label}
              <span className="block bg-gradient-to-r from-cyan-400 to-indigo-400
                bg-clip-text text-transparent mt-1">
                Registration
              </span>
            </h1>
            <p className="mt-3 text-gray-400 text-sm leading-relaxed max-w-sm">
              {config.desc}
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">What you get:</p>
            {config.perks.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${config.gradient}
                  flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
                <span className="text-sm text-gray-300">{perk}</span>
              </div>
            ))}
          </div>

          {/* Switch role links */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-3">Register as different role:</p>
            <div className="flex gap-2">
              {Object.entries(ROLE_CONFIG).filter(([r]) => r !== role).map(([r, c]) => (
                <Link key={r} to={`/register/${r}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10
                    hover:bg-white/20 border border-white/20 text-xs font-semibold text-white
                    transition-all`}>
                  <span>{c.icon}</span> {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Login link */}
        <div className="relative">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
              Sign in here →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <Link to="/login" className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-semibold">
              <MdArrowBack size={18} /> Back to Login
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500
                flex items-center justify-center text-sm">📚</div>
              <span className="text-white font-bold text-sm">SAMS</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">

            {/* Card header */}
            <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center
                  justify-center text-3xl flex-shrink-0">
                  {config.icon}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold">{config.label} Registration</h2>
                  <p className="text-white/70 text-xs mt-0.5">Create your SAMS account</p>
                </div>
                <Link to="/login"
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/20
                    hover:bg-white/30 text-white text-xs font-bold rounded-xl
                    border border-white/30 transition-colors hidden lg:flex">
                  <MdArrowBack size={14} /> Login
                </Link>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-5">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center
                      text-xs font-bold transition-all
                      ${step >= s ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'}`}>
                      {step > s ? '✓' : s}
                    </div>
                    <span className="text-white/70 text-xs">{s === 1 ? 'Basic Info' : 'Details'}</span>
                    {s < 2 && <div className="w-8 h-0.5 bg-white/30" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-7 space-y-4">

              {step === 1 && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FieldIcon icon={<MdPerson size={18} />} />
                      <input type="text" placeholder={`e.g. ${role === 'admin' ? 'System Admin' : role === 'teacher' ? 'Mr. Robel Yinager' : 'Abel Bekele'}`}
                        {...register('name', { required: 'Full name is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                        className={inputClass} />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FieldIcon icon={<MdEmail size={18} />} />
                      <input type="email" placeholder="your@injibara.edu.et"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                        })}
                        className={inputClass} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FieldIcon icon={<MdPhone size={18} />} />
                      <input type="tel" placeholder="09xxxxxxxx"
                        {...register('phone')} className={inputClass} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <FieldIcon icon={<MdLock size={18} />} />
                      <input type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Min 8 characters' },
                        })}
                        className={`${inputClass} pr-12`} />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <FieldIcon icon={<MdLock size={18} />} />
                      <input type={showConf ? 'text' : 'password'} placeholder="Re-enter password"
                        {...register('confirm', { required: 'Please confirm your password' })}
                        className={`${inputClass} pr-12`} />
                      <button type="button" onClick={() => setShowConf(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConf ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                      </button>
                    </div>
                    {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
                  </div>

                  <button type="button"
                    onClick={() => {
                      if (!watch('name') || !watch('email') || !watch('password') || !watch('confirm')) {
                        toast.error('Please fill all required fields');
                        return;
                      }
                      if (watch('password') !== watch('confirm')) {
                        toast.error('Passwords do not match');
                        return;
                      }
                      setStep(2);
                    }}
                    className={`w-full py-3.5 bg-gradient-to-r ${config.gradient} text-white
                      font-bold rounded-xl shadow-lg transition-all hover:scale-[1.01] text-sm`}>
                    Continue to Details →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* ADMIN extra fields */}
                  {role === 'admin' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Admin Access Code *
                      </label>
                      <div className="relative">
                        <FieldIcon icon={<span className="text-gray-400 text-base">🔑</span>} />
                        <input type="text" placeholder="Enter admin authorization code"
                          {...register('adminCode', { required: 'Admin code is required' })}
                          className={inputClass} />
                      </div>
                      {errors.adminCode && <p className="text-red-500 text-xs mt-1">{errors.adminCode.message}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Contact your IT department for the administrator access code.
                      </p>
                    </div>
                  )}

                  {/* TEACHER extra fields */}
                  {role === 'teacher' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                          Subject / Specialization *
                        </label>
                        <div className="relative">
                          <FieldIcon icon={<span className="text-gray-400 text-base">📖</span>} />
                          <select {...register('subject', { required: true })} className={selectClass}>
                            <option value="">Select your subject</option>
                            {['Software Engineering','Data Structures','Algorithms','Database Systems','Operating Systems','Computer Networks','Machine Learning','Web Development','Mobile Development','Cyber Security','Mathematics','Physics','English'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                            Qualification
                          </label>
                          <div className="relative">
                            <FieldIcon icon={<span className="text-gray-400 text-base">🎓</span>} />
                            <select {...register('qualification')} className={selectClass}>
                              <option value="">Select</option>
                              {['BSc','BA','MSc','MA','MBA','PhD','MD'].map(q => (
                                <option key={q} value={q}>{q}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                            Experience (years)
                          </label>
                          <div className="relative">
                            <FieldIcon icon={<span className="text-gray-400 text-base">📅</span>} />
                            <input type="number" min="0" max="50" placeholder="e.g. 5"
                              {...register('experience')} className={inputClass} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* STUDENT extra fields */}
                  {role === 'student' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                          Student ID
                        </label>
                        <div className="relative">
                          <FieldIcon icon={<span className="text-gray-400 text-base">🪪</span>} />
                          <input type="text" placeholder="e.g. INU1501051"
                            {...register('studentId')} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                            Year Level
                          </label>
                          <div className="relative">
                            <FieldIcon icon={<span className="text-gray-400 text-base">📚</span>} />
                            <select {...register('year')} className={selectClass}>
                              <option value="">Select year</option>
                              {[1,2,3,4,5].map(y => (
                                <option key={y} value={y}>Year {['I','II','III','IV','V'][y-1]}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                            Gender
                          </label>
                          <div className="relative">
                            <FieldIcon icon={<span className="text-gray-400 text-base">👤</span>} />
                            <select {...register('gender')} className={selectClass}>
                              <option value="">Select</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <input type="checkbox" {...register('terms', { required: 'You must accept terms' })}
                      className="w-4 h-4 accent-indigo-600 mt-0.5 cursor-pointer flex-shrink-0" />
                    <label className="text-xs text-gray-600 leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-indigo-600 font-bold hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-indigo-600 font-bold hover:underline">Privacy Policy</a>
                      {' '}of Injibara University SAMS system.
                    </label>
                  </div>
                  {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200
                        text-gray-600 font-bold rounded-xl hover:bg-gray-100 text-sm transition-colors">
                      <MdArrowBack size={16} /> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className={`flex-1 py-3 bg-gradient-to-r ${config.gradient} text-white
                        font-bold rounded-xl shadow-lg disabled:opacity-70 flex items-center
                        justify-center gap-2 text-sm transition-all hover:scale-[1.01]`}>
                      {loading
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Account...</>
                        : <><MdCheckCircle size={18} /> Create Account</>}
                    </button>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Your data is encrypted and secure</span>
              </div>
              <p className="text-center text-xs text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <p className="text-center text-gray-500 text-xs mt-5">
            © 2026 SAMS · Injibara University College of Technology
          </p>
        </div>
      </div>
    </div>
  );
}