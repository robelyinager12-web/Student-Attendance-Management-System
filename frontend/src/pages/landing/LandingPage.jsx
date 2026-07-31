import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Animated counter hook ────────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ navigate }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = ['Home','Features','Departments','Gallery','About','Contact'];

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500
              flex items-center justify-center text-xl shadow-md flex-shrink-0">
              📚
            </div>
            <div className="hidden sm:block">
              <p className="font-extrabold text-indigo-900 text-sm leading-tight">SAMS</p>
              <p className="text-[10px] text-gray-500 leading-tight max-w-[180px]">
                Technology Student Attendance
              </p>
            </div>
          </div>

          {/* Center links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <button key={link}
                onClick={() => scrollTo(link)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600
                  hover:bg-indigo-50 rounded-xl transition-all duration-200">
                {link}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600
                hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md
                transition-all duration-200 hover:scale-105">
              🔐 Login
            </button>

            {/* Sign Up dropdown */}
            <div className="relative">
              <button
                onClick={() => setSignupOpen(p => !p)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 border-2 border-indigo-600
                  text-indigo-600 hover:bg-indigo-50 text-sm font-bold rounded-xl transition-all duration-200">
                Sign Up ▾
              </button>
              {signupOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSignupOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl
                    border border-gray-100 z-20 overflow-hidden animate-in">
                    {[
                      { icon: '👨‍💼', role: 'Admin',   path: '/register/admin',   color: 'from-purple-500 to-purple-600', desc: 'System administrator' },
                      { icon: '👨‍🏫', role: 'Teacher', path: '/register/teacher', color: 'from-blue-500 to-blue-600',     desc: 'Course instructor' },
                      { icon: '👨‍🎓', role: 'Student', path: '/register/student', color: 'from-green-500 to-green-600',   desc: 'University student' },
                    ].map(item => (
                      <button key={item.role}
                        onClick={() => { navigate(item.path); setSignupOpen(false); }}
                        className="flex items-center gap-4 w-full px-5 py-4 hover:bg-gray-50
                          transition-colors border-b border-gray-50 last:border-0 group">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color}
                          flex items-center justify-center text-lg flex-shrink-0
                          group-hover:scale-110 transition-transform`}>
                          {item.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 text-sm">{item.role} Registration</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(p => !p)}
              className="lg:hidden p-2 rounded-xl border border-gray-200 text-gray-600">
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 pb-4">
            {navLinks.map(link => (
              <button key={link} onClick={() => scrollTo(link)}
                className="block w-full text-left px-4 py-3 text-sm font-semibold text-gray-700
                  hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                {link}
              </button>
            ))}
            <div className="flex gap-2 px-4 pt-3">
              <button onClick={() => navigate('/login')}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl">
                🔐 Login
              </button>
              <button className="flex-1 py-2.5 border-2 border-indigo-600 text-indigo-600 text-sm font-bold rounded-xl">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ navigate }) {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a6e 40%, #0d1b4b 70%, #050e24 100%)' }}>

      {/* Animated background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)', animationDelay: '2s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-white/10 border border-white/20 backdrop-blur-sm text-cyan-300 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Injibara University · College of Technology
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight">
                Technology Student
                <span className="block mt-1 bg-gradient-to-r from-cyan-400 to-indigo-400
                  bg-clip-text text-transparent">
                  Attendance Management
                </span>
                <span className="block mt-1 text-white">System</span>
              </h1>
              <p className="mt-6 text-gray-300 text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                An intelligent digital attendance platform for universities. Manage students, teachers,
                departments, and attendance with secure role-based access, QR codes, facial recognition,
                RFID, fingerprint integration, and real-time analytics.
              </p>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {['🎯 QR Code','👁️ Face ID','🖐️ Fingerprint','📡 RFID','☁️ Cloud','📊 Analytics'].map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20
                  text-xs font-semibold text-gray-300 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r
                  from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700
                  text-white text-base font-bold rounded-2xl shadow-xl transition-all
                  duration-200 hover:scale-105 hover:shadow-cyan-500/25">
                🚀 Get Started
              </button>
              <button onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-8 py-4 border-2
                  border-white/30 hover:border-white/60 text-white text-base font-bold
                  rounded-2xl backdrop-blur-sm transition-all duration-200 hover:bg-white/10">
                🔐 Login
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 px-8 py-4 text-cyan-400
                  hover:text-cyan-300 text-base font-bold transition-colors">
                Explore Features ↓
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 justify-center lg:justify-start pt-4 border-t border-white/10">
              {[['248+','Students'],['12+','Teachers'],['7','Departments']].map(([n,l]) => (
                <div key={l} className="text-center lg:text-left">
                  <p className="text-2xl font-extrabold text-white">{n}</p>
                  <p className="text-xs text-gray-400 font-medium">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — SVG illustration */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg">

              {/* Main card */}
              <div className="rounded-3xl p-6 backdrop-blur-xl border border-white/20 shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.06)' }}>

                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold text-sm">AI Attendance Dashboard</p>
                    <p className="text-cyan-400 text-xs">Live · 2026/2027 — Semester I</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-bold">LIVE</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Present', value: '87%', color: '#10b981' },
                    { label: 'Absent',  value: '13%', color: '#f43f5e' },
                    { label: 'Students',value: '248',  color: '#06b6d4' },
                    { label: 'Sections',value: '12',   color: '#a855f7' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5 font-medium uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Attendance bar chart */}
                <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Weekly Trend</p>
                  <div className="flex items-end gap-2 h-20">
                    {[65,80,72,90,85,88,92].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(to top, #4f46e5, #06b6d4)`,
                          opacity: i === 6 ? 1 : 0.6 + i * 0.05,
                        }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['M','T','W','T','F','S','S'].map((d,i) => (
                      <span key={i} className="flex-1 text-center text-[9px] text-gray-500">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Recent notifications */}
                <div className="space-y-2">
                  {[
                    { icon: '✓', name: 'Selam Tesfaye',  msg: 'Marked Present · CS301',    color: '#10b981' },
                    { icon: '✗', name: 'Biruk Yasin',    msg: 'Absent Alert · SE402',       color: '#f43f5e' },
                    { icon: '📊', name: 'Report Ready',  msg: 'Monthly report generated',   color: '#a855f7' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${n.color}20`, border: `1px solid ${n.color}40` }}>
                        <span style={{ color: n.color }}>{n.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{n.name}</p>
                        <p className="text-gray-400 text-[10px] truncate">{n.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating tech badges */}
              {[
                { icon: '🎯', label: 'QR Code',     pos: '-top-4 -left-4',   color: 'from-indigo-500 to-indigo-600' },
                { icon: '👁️', label: 'Face ID',     pos: '-top-4 -right-4',  color: 'from-cyan-500 to-cyan-600' },
                { icon: '🖐️', label: 'Fingerprint', pos: '-bottom-4 -left-4', color: 'from-purple-500 to-purple-600' },
                { icon: '📡', label: 'RFID',        pos: '-bottom-4 -right-4',color: 'from-rose-500 to-rose-600' },
              ].map(b => (
                <div key={b.label}
                  className={`absolute ${b.pos} flex items-center gap-2 px-3 py-2 rounded-2xl
                    shadow-2xl border border-white/20 backdrop-blur-xl`}
                  style={{ background: 'rgba(15,12,41,0.8)' }}>
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${b.color}
                    flex items-center justify-center text-sm flex-shrink-0`}>
                    {b.icon}
                  </div>
                  <span className="text-white text-xs font-bold">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-gray-400 text-xs">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-gray-400 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-gray-400 animate-scroll" />
        </div>
      </div>
    </section>
  );
}

// ── Features Section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const [ref, inView] = useInView();
  const features = [
    { icon: '👥', title: 'Student Management',    desc: 'Complete student lifecycle with profiles, enrollment, batch/section tracking, and status management.',        color: 'from-indigo-500 to-indigo-600' },
    { icon: '🎓', title: 'Teacher Management',    desc: 'Manage teacher profiles, course assignments, and departmental roles with full access control.',               color: 'from-blue-500 to-blue-600' },
    { icon: '✅', title: 'Attendance Tracking',   desc: 'Real-time attendance recording with multiple methods: manual, QR, fingerprint, RFID, and facial recognition.', color: 'from-emerald-500 to-emerald-600' },
    { icon: '🎯', title: 'QR Code Attendance',    desc: 'Lightning-fast QR code scanning for instant attendance marking in crowded lecture halls.',                     color: 'from-cyan-500 to-cyan-600' },
    { icon: '👁️', title: 'Facial Recognition',    desc: 'AI-powered face ID technology for contactless and accurate student identification.',                          color: 'from-purple-500 to-purple-600' },
    { icon: '🖐️', title: 'Fingerprint Scanner',  desc: 'Biometric fingerprint integration for secure and fast identity verification.',                                  color: 'from-rose-500 to-rose-600' },
    { icon: '📡', title: 'RFID Attendance',       desc: 'Smart RFID card tap-to-attend system compatible with university ID cards.',                                    color: 'from-amber-500 to-amber-600' },
    { icon: '📚', title: 'Course Management',     desc: 'Structured course catalog with credit hours, semester assignment, and instructor allocation.',                  color: 'from-teal-500 to-teal-600' },
    { icon: '🏛️', title: 'Department Management', desc: 'Multi-department structure with HOD assignment, program management, and statistics.',                         color: 'from-indigo-500 to-purple-600' },
    { icon: '📊', title: 'Real-time Dashboard',   desc: 'Beautiful live dashboard with charts, at-risk alerts, activity feed, and instant statistics.',                 color: 'from-blue-500 to-cyan-600' },
    { icon: '📋', title: 'Reports & Analytics',   desc: 'Export professional reports in Excel, PDF, and CSV with advanced filters.',                                    color: 'from-green-500 to-emerald-600' },
    { icon: '☁️', title: 'Cloud Backup',          desc: 'Automatic cloud backup with data encryption, audit logging, and disaster recovery.',                           color: 'from-sky-500 to-sky-600' },
    { icon: '🔔', title: 'Smart Notifications',   desc: 'Automated alerts for low attendance, absent students, and guardian notifications.',                            color: 'from-orange-500 to-orange-600' },
    { icon: '🔒', title: 'Role-Based Security',   desc: 'Military-grade JWT authentication with granular role-based access control for Admin, Teacher, and Student.',   color: 'from-red-500 to-red-600' },
    { icon: '📱', title: 'Mobile Friendly',       desc: 'Fully responsive design that works perfectly on phones, tablets, and desktop computers.',                      color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-indigo-100 text-indigo-700 text-sm font-bold mb-4">
            ✨ System Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Everything You Need to
            <span className="block bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Manage Attendance
            </span>
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            A comprehensive suite of tools designed for modern university attendance management.
          </p>
        </div>

        {/* Feature cards */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((f, i) => (
            <div key={f.title}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100
                dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                group cursor-pointer"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color}
                flex items-center justify-center text-2xl mb-4 shadow-lg
                group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── System Modules ────────────────────────────────────────────────────────────
function ModulesSection({ navigate }) {
  const modules = [
    {
      role: 'Admin Panel',
      icon: '👨‍💼',
      gradient: 'from-purple-600 to-indigo-700',
      features: ['Manage All Users','Manage Departments','Manage Courses','Manage Programs','Manage Batches & Sections','Take & Edit Attendance','Generate Reports','Audit Logs','System Settings','Import/Export Data'],
    },
    {
      role: 'Teacher Panel',
      icon: '👨‍🏫',
      gradient: 'from-blue-600 to-cyan-700',
      features: ['Take Attendance','View Assigned Courses','View Student Lists','Attendance History','Attendance Reports','Mark Present/Absent/Late','Edit Attendance','Course Statistics','Section Management','Profile'],
    },
    {
      role: 'Student Portal',
      icon: '👨‍🎓',
      gradient: 'from-emerald-600 to-teal-700',
      features: ['View My Attendance','Attendance Percentage','Course Enrollment','Profile Management','Attendance History','Download Reports','Notifications','Section Info','Academic Progress','Mobile Access'],
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-blue-100 text-blue-700 text-sm font-bold mb-4">
            🏗️ System Modules
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Three Powerful Role-Based
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Dashboards
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {modules.map((mod, i) => (
            <div key={mod.role}
              className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl
                hover:-translate-y-2 transition-all duration-300 group">
              {/* Header */}
              <div className={`p-8 bg-gradient-to-br ${mod.gradient} text-white`}>
                <div className="text-5xl mb-4">{mod.icon}</div>
                <h3 className="text-2xl font-extrabold">{mod.role}</h3>
                <p className="text-white/70 text-sm mt-1">Role-based access control</p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white
                    text-sm font-bold rounded-xl border border-white/30 transition-colors">
                  Access Panel →
                </button>
              </div>
              {/* Features list */}
              <div className="bg-white dark:bg-gray-800 p-6">
                <div className="grid grid-cols-1 gap-2">
                  {mod.features.map(feat => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${mod.gradient}
                        flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Departments Section ───────────────────────────────────────────────────────
function DepartmentsSection() {
  const departments = [
    { icon: '💻', name: 'Computer Science',        code: 'CS',  students: 320, teachers: 18, color: 'from-blue-500 to-blue-600',     desc: 'Algorithms, data structures, and theoretical computing.' },
    { icon: '⚙️', name: 'Software Engineering',    code: 'SE',  students: 280, teachers: 16, color: 'from-indigo-500 to-indigo-600', desc: 'Software design, development, and lifecycle management.' },
    { icon: '🌐', name: 'Information Technology',  code: 'IT',  students: 260, teachers: 14, color: 'from-cyan-500 to-cyan-600',     desc: 'Network systems, databases, and tech infrastructure.' },
    { icon: '📊', name: 'Information Systems',     code: 'IS',  students: 210, teachers: 12, color: 'from-teal-500 to-teal-600',     desc: 'Business information, ERP, and enterprise systems.' },
    { icon: '🛡️', name: 'Cyber Security',          code: 'CYS', students: 180, teachers: 11, color: 'from-red-500 to-red-600',       desc: 'Network security, ethical hacking, and cryptography.' },
    { icon: '🤖', name: 'Artificial Intelligence', code: 'AI',  students: 150, teachers: 10, color: 'from-purple-500 to-purple-600', desc: 'Machine learning, neural networks, and NLP.' },
    { icon: '⚡', name: 'Electrical Engineering',  code: 'EE',  students: 240, teachers: 17, color: 'from-yellow-500 to-yellow-600', desc: 'Electronics, circuits, and power systems.' },
    { icon: '🔧', name: 'Mechanical Engineering',  code: 'ME',  students: 260, teachers: 19, color: 'from-orange-500 to-orange-600', desc: 'Mechanics, thermodynamics, and design.' },
    { icon: '🏗️', name: 'Civil Engineering',       code: 'CE',  students: 290, teachers: 20, color: 'from-stone-500 to-stone-600',   desc: 'Structures, geotechnics, and construction.' },
    { icon: '🏛️', name: 'Architecture',            code: 'ARC', students: 120, teachers: 9,  color: 'from-pink-500 to-pink-600',     desc: 'Architectural design, urban planning, and aesthetics.' },
  ];

  return (
    <section id="departments" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-emerald-100 text-emerald-700 text-sm font-bold mb-4">
            🏛️ Academic Departments
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Technology College
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Departments
            </span>
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Injibara University College of Technology manages attendance across 10 specialized departments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {departments.map((dept, i) => (
            <div key={dept.name}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm
                border border-gray-100 dark:border-gray-700 hover:shadow-xl
                hover:-translate-y-1 transition-all duration-300 group">
              {/* Top gradient band */}
              <div className={`h-2 bg-gradient-to-r ${dept.color}`} />
              <div className="p-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dept.color}
                  flex items-center justify-center text-2xl mb-3 shadow-lg
                  group-hover:scale-110 transition-transform duration-300`}>
                  {dept.icon}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm leading-tight flex-1">
                    {dept.name}
                  </h3>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg
                    bg-gradient-to-r ${dept.color} text-white ml-2 flex-shrink-0`}>
                    {dept.code}
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{dept.desc}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 text-center">
                    <p className="text-sm font-extrabold text-gray-800 dark:text-white">{dept.students}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Students</p>
                  </div>
                  <div className="w-px h-8 bg-gray-100 dark:bg-gray-700" />
                  <div className="flex-1 text-center">
                    <p className="text-sm font-extrabold text-gray-800 dark:text-white">{dept.teachers}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Teachers</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats Section ─────────────────────────────────────────────────────────────
function StatsSection() {
  const [ref, inView] = useInView(0.3);
  const stats = [
    { target: 2480, label: 'Students Enrolled',  icon: '👥', suffix: '+' },
    { target: 149,  label: 'Expert Teachers',    icon: '🎓', suffix: '+' },
    { target: 10,   label: 'Departments',        icon: '🏛️', suffix: '' },
    { target: 85,   label: 'Courses Offered',    icon: '📚', suffix: '+' },
    { target: 50000,label: 'Attendance Records', icon: '✅', suffix: '+' },
    { target: 1250, label: 'Reports Generated',  icon: '📊', suffix: '+' },
  ];

  return (
    <section className="py-20 lg:py-28"
      style={{ background: 'linear-gradient(135deg, #1a1a6e 0%, #0d1b4b 50%, #050e24 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Trusted by the
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              {' '}University Community
            </span>
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((s, i) => {
            const count = useCounter(s.target, 2500, inView);
            return (
              <div key={s.label} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20
                  flex items-center justify-center text-3xl mx-auto mb-4 backdrop-blur-sm
                  group-hover:bg-white/20 transition-colors">
                  {s.icon}
                </div>
                <p className="text-3xl font-extrabold text-white">
                  {count.toLocaleString()}{s.suffix}
                </p>
                <p className="text-gray-400 text-xs font-semibold mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Why Choose Section ────────────────────────────────────────────────────────
function WhyChooseSection() {
  const reasons = [
    { icon: '🔐', title: 'Secure Authentication',  desc: 'Military-grade JWT tokens, bcrypt password hashing, and secure session management.' },
    { icon: '🎭', title: 'Role-Based Access',       desc: 'Granular permissions for Admin, Teacher, and Student with protected API routes.' },
    { icon: '⚡', title: 'Fast Attendance',         desc: 'Mark attendance for 100+ students in under 60 seconds with bulk tools.' },
    { icon: '☁️', title: 'Cloud Integration',       desc: 'PostgreSQL cloud database with automatic backups and 99.9% uptime.' },
    { icon: '📱', title: 'Mobile Friendly',         desc: 'Fully responsive interface that works seamlessly on any device.' },
    { icon: '🧩', title: 'Easy Management',         desc: 'Intuitive dashboard designed for non-technical staff and administrators.' },
    { icon: '🤖', title: 'AI Ready',                desc: 'Built-in support for facial recognition, QR scanning, and biometric devices.' },
    { icon: '📈', title: 'Real-Time Reports',       desc: 'Live attendance analytics, charts, and exportable reports in Excel/PDF/CSV.' },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-purple-100 text-purple-700 text-sm font-bold mb-4">
            💡 Why Choose SAMS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Built for Modern
            <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Universities
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <div key={r.title}
              className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100
                dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700
                hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg
                hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {r.icon}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">{r.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-100
                dark:bg-indigo-900/30 flex items-center justify-center opacity-0
                group-hover:opacity-100 transition-opacity">
                <span className="text-indigo-600 text-xs font-bold">✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { name: 'Dr. Alemu Bekele',    role: 'Dean, College of Technology',     avatar: '👨‍🏫', rating: 5,
      text: 'SAMS has revolutionized how we manage attendance. The real-time dashboard gives us instant visibility across all departments. Exceptional system!' },
    { name: 'Mr. Robel Yinager',  role: 'Software Engineering Lecturer',    avatar: '👨‍💻', rating: 5,
      text: 'Taking attendance for 45 students used to take 10 minutes. Now it takes under a minute. The QR code and section-based attendance is brilliant.' },
    { name: 'Selam Tesfaye',      role: 'Software Engineering Student',     avatar: '👩‍🎓', rating: 5,
      text: 'I can see my attendance percentage, missing classes, and course records anytime on my phone. This system is incredibly useful for students.' },
    { name: 'Hana Demisew',       role: 'University Registrar',            avatar: '👩‍💼', rating: 5,
      text: 'The Excel and PDF export features save us hours every month. The audit log and role-based access make compliance reporting straightforward.' },
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-amber-100 text-amber-700 text-sm font-bold mb-4">
            💬 Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Loved by the
            <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              University Community
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border
                border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1
                transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-amber-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500
                  flex items-center justify-center text-xl flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Gallery Section ───────────────────────────────────────────────────────────
function GallerySection() {
  const [active, setActive] = useState(null);

  const galleryItems = [
    { emoji: '🖥️', title: 'AI Attendance Dashboard',  desc: 'Real-time analytics and live monitoring',        bg: 'from-indigo-600 to-purple-700' },
    { emoji: '📱', title: 'Mobile Attendance App',    desc: 'QR code scanning on any device',                bg: 'from-cyan-600 to-blue-700' },
    { emoji: '🎯', title: 'QR Code Scanner',          desc: 'Instant attendance with QR codes',              bg: 'from-emerald-600 to-teal-700' },
    { emoji: '🖐️', title: 'Fingerprint System',      desc: 'Biometric authentication integration',          bg: 'from-rose-600 to-red-700' },
    { emoji: '👁️', title: 'Facial Recognition',      desc: 'AI-powered identity verification',              bg: 'from-amber-600 to-orange-700' },
    { emoji: '📊', title: 'Analytics Reports',        desc: 'Detailed charts and exported reports',          bg: 'from-violet-600 to-purple-700' },
    { emoji: '🏫', title: 'Smart Classroom',          desc: 'Technology-enabled learning environment',       bg: 'from-sky-600 to-cyan-700' },
    { emoji: '📡', title: 'RFID Attendance',          desc: 'Smart card tap-to-attend system',               bg: 'from-pink-600 to-rose-700' },
    { emoji: '🏛️', title: 'University Campus',       desc: 'Injibara University College of Technology',    bg: 'from-green-600 to-emerald-700' },
  ];

  return (
    <section id="gallery" className="py-20 lg:py-32 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-teal-100 text-teal-700 text-sm font-bold mb-4">
            🖼️ Gallery
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            System in
            <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Action
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {galleryItems.map((item, i) => (
            <div key={item.title}
              onClick={() => setActive(item)}
              className={`rounded-3xl overflow-hidden cursor-pointer hover:scale-105
                transition-transform duration-300 shadow-lg hover:shadow-2xl
                ${i === 0 ? 'row-span-2' : ''}`}>
              <div className={`h-full bg-gradient-to-br ${item.bg} flex flex-col items-center
                justify-center p-8 min-h-[180px] text-center`}>
                <div className="text-6xl mb-3">{item.emoji}</div>
                <p className="font-bold text-white text-sm">{item.title}</p>
                <p className="text-white/70 text-xs mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActive(null)}>
            <div className={`bg-gradient-to-br ${active.bg} rounded-3xl p-16 text-center max-w-md w-full
              shadow-2xl transform scale-100`}
              onClick={e => e.stopPropagation()}>
              <div className="text-8xl mb-6">{active.emoji}</div>
              <h3 className="text-2xl font-extrabold text-white mb-2">{active.title}</h3>
              <p className="text-white/70">{active.desc}</p>
              <button onClick={() => setActive(null)}
                className="mt-6 px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white
                  font-bold rounded-xl border border-white/30 transition-colors">
                Close ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Contact Section ───────────────────────────────────────────────────────────
function ContactSection() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    placeholder-gray-400 transition-all`;

  return (
    <section id="contact" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-rose-100 text-rose-700 text-sm font-bold mb-4">
            📬 Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            Get In
            <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              {' '}Touch
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Send us a Message</h3>
            {sent && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
                ✅ Message sent successfully! We'll respond within 24 hours.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com" required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subject *</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="How can we help?" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us more..." rows={5} required
                  className={`${inputClass} resize-none`} />
              </div>
              <button type="submit" disabled={sending}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600
                  hover:from-indigo-700 hover:to-cyan-700 text-white font-bold rounded-xl
                  shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                {sending
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                  : '📨 Send Message'}
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            {/* Map placeholder */}
            <div className="rounded-3xl overflow-hidden h-56 relative shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1a1a6e 0%, #0d1b4b 100%)' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-3">🗺️</div>
                  <p className="text-white font-bold">Injibara University</p>
                  <p className="text-white/70 text-sm">Awi Zone, Amhara Region, Ethiopia</p>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                    className="inline-block mt-3 px-4 py-2 bg-white/20 text-white text-xs font-bold rounded-xl hover:bg-white/30 transition-colors">
                    📍 View on Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Contact details */}
            {[
              { icon: '📞', label: 'Phone',   value: '+251-58-000-0000',             sub: 'Mon-Fri 8:00 AM – 5:00 PM' },
              { icon: '📧', label: 'Email',   value: 'sams@injibara.edu.et',         sub: 'We reply within 24 hours' },
              { icon: '📍', label: 'Address', value: 'College of Technology, Injibara', sub: 'Awi Zone, Amhara, Ethiopia' },
              { icon: '🕐', label: 'Hours',   value: 'Mon – Fri: 8:00 AM – 5:00 PM',  sub: 'Saturday: 9:00 AM – 12:00 PM' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800
                rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm
                hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30
                  flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="font-bold text-gray-800 dark:text-white text-sm mt-0.5">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ navigate }) {
  const cols = [
    { title: 'About System',
      links: ['About SAMS','How It Works','Technology Stack','Security','Privacy Policy'] },
    { title: 'Quick Links',
      links: ['Login','Admin Panel','Teacher Portal','Student Portal','Contact Support'] },
    { title: 'Departments',
      links: ['Software Engineering','Computer Science','Information Technology','Electrical Engineering','Civil Engineering'] },
    { title: 'Resources',
      links: ['User Manual','API Documentation','Video Tutorials','FAQs','System Updates'] },
    { title: 'Support',
      links: ['Help Center','Report a Bug','Feature Request','IT Support','Training'] },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500
                flex items-center justify-center text-xl">
                📚
              </div>
              <div>
                <p className="font-extrabold text-white text-base">SAMS</p>
                <p className="text-[10px] text-gray-500">Injibara University</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-xs">
              Intelligent digital attendance platform for Injibara University College of Technology.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: '📘', label: 'Facebook',  href: '#' },
                { icon: '✈️', label: 'Telegram',  href: '#' },
                { icon: '💼', label: 'LinkedIn',  href: '#' },
                { icon: '🐙', label: 'GitHub',    href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} title={s.label}
                  className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-indigo-600 flex items-center
                    justify-center text-lg transition-colors duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="font-bold text-white text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-indigo-400
                      transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6
          flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 SAMS — Injibara University College of Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(link => (
              <a key={link} href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── About Section ─────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-32"
      style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eff2ff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-indigo-100 text-indigo-700 text-sm font-bold mb-6">
              🏛️ About SAMS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Designed for
              <span className="block bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Injibara University
              </span>
              College of Technology
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              SAMS (Student Attendance Management System) is a modern, enterprise-level platform
              built specifically for the technology departments of Injibara University. It replaces
              paper-based attendance with a fully digital, role-based system.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              The system supports 10 academic departments, multiple batches, sections, semesters,
              and programs — with full audit logging, reporting, and biometric integration readiness.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🎯', title: 'Mission',  desc: 'Digitize attendance for 2,480+ students' },
                { icon: '🔭', title: 'Vision',   desc: 'AI-powered smart campus by 2030' },
                { icon: '⚡', title: 'Speed',    desc: '100 students in under 60 seconds' },
                { icon: '🔒', title: 'Security', desc: 'Zero-breach since deployment' },
              ].map(item => (
                <div key={item.title} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {[
              { year: '2022', title: 'Project Initiated',      desc: 'Requirement gathering and planning started.',              color: 'from-indigo-500 to-indigo-600' },
              { year: '2023', title: 'Backend Development',    desc: 'Node.js API, PostgreSQL, and authentication built.',       color: 'from-blue-500 to-blue-600' },
              { year: '2024', title: 'Frontend Development',   desc: 'React dashboard, attendance UI, and reporting complete.',  color: 'from-cyan-500 to-cyan-600' },
              { year: '2025', title: 'University Integration', desc: 'Injibara University structure — 10 depts, 45 sections.',    color: 'from-emerald-500 to-emerald-600' },
              { year: '2026', title: 'Full Deployment',        desc: '248 students, 12 teachers, fully operational system.',     color: 'from-purple-500 to-purple-600' },
            ].map((item, i) => (
              <div key={item.year} className="flex gap-4 items-start">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color}
                  flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-lg`}>
                  {item.year}
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="font-bold text-gray-800">{item.title}</p>
                  <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTASection({ navigate }) {
  return (
    <section className="py-20 lg:py-28"
      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
          Ready to Transform Your
          <span className="block text-cyan-300 mt-1">Attendance Management?</span>
        </h2>
        <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
          Join hundreds of students, teachers, and administrators at Injibara University
          who are already using SAMS to modernize their attendance workflow.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/login')}
            className="px-10 py-4 bg-white text-indigo-700 font-extrabold rounded-2xl
              shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-200 text-lg">
            🚀 Login Now
          </button>
          <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 border-2 border-white/50 text-white font-bold rounded-2xl
              hover:bg-white/10 transition-all duration-200 text-lg">
            📬 Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans antialiased">
      <Navbar navigate={navigate} />
      <HeroSection navigate={navigate} />
      <FeaturesSection />
      <ModulesSection navigate={navigate} />
      <DepartmentsSection />
      <StatsSection />
      <WhyChooseSection />
      <GallerySection />
      <TestimonialsSection />
      <AboutSection />
      <CTASection navigate={navigate} />
      <ContactSection />
      <Footer navigate={navigate} />
    </div>
  );
}