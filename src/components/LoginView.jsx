import React, { useState } from 'react';
import { 
  IconSparkles, 
  IconShield, 
  IconBuilding, 
  IconUsers, 
  IconGraduationCap, 
  IconAward, 
  IconCheck, 
  IconLock,
  IconArrowRight,
  IconPlus,
  IconCheckCircle
} from './Icons';
import { getStoredUsers, registerNewStudent } from '../services/storage';
import { GROUPS_LIST } from '../data/mockData';

export const LoginView = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('student'); // 'student', 'teacher', 'director', 'admin', 'superadmin'
  
  // Login Form States (COMPLETELY EMPTY BY DEFAULT)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Student Registration Form States (WITH EMAIL)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGroup, setRegGroup] = useState('IELTS Mastery (B2-C1)');
  const [regLevel, setRegLevel] = useState('B2');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // 5 Distinct Role Portals
  const rolePortals = [
    {
      id: 'student',
      label: 'O\'quvchi',
      title: 'Talaba Shaxsiy Portali',
      icon: IconGraduationCap,
      color: '#0284c7',
      badge: 'Talaba Kabineti',
      defaultUser: 'student',
      demoPass: '1234',
      desc: 'Mening baholarim jurnali, shaxsiy davomat kalendari, interaktiv flashcardlar, test viktorinasi va 24/7 AI repetitor.'
    },
    {
      id: 'teacher',
      label: 'O\'qituvchi',
      title: 'Til Ustozi & Metodist',
      icon: IconUsers,
      color: '#2563eb',
      badge: 'Dars & Baholash',
      defaultUser: 'teacher',
      demoPass: '1234',
      desc: 'Guruhlar davomati, 4 ko\'nikmali baholash, 11 ta tilli lug\'at, dars taymeri va 4 ta AI metodik agenti.'
    },
    {
      id: 'director',
      label: 'Direktor',
      title: 'Bosh Direktor & Rahbariyat',
      icon: IconBuilding,
      color: '#1e3a8a',
      badge: 'Boshqaruv & KPI',
      defaultUser: 'director',
      demoPass: '1234',
      desc: 'Markazning umumiy moliyasi, oylik daromad grafigi, o\'qituvchilar KPI auditi, guruhlar monitoringi va strategik AI maslahatchisi.'
    },
    {
      id: 'admin',
      label: 'Administrator',
      title: 'Tizim Administratori',
      icon: IconShield,
      color: '#0369a1',
      badge: 'Tizim Boshqaruvi',
      defaultUser: 'admin',
      demoPass: '1234',
      desc: 'Talabalar va guruhlar boshqaruvi, o\'quvchilar rolini o\'zgartirish (O\'qituvchi/Direktor/Admin), SMS markazi va tizim loglari.'
    },
    {
      id: 'superadmin',
      label: 'Bosh Admin',
      title: 'Bosh Admin (Super Administrator)',
      icon: IconAward,
      color: '#4338ca',
      badge: 'Master Control 👑',
      defaultUser: 'superadmin',
      demoPass: '1234',
      desc: 'Tizimning to\'liq boshqaruvi, barcha foydalanuvchilar rollarini belgilash, global sozlamalar va umumiy tizim nazorati.'
    }
  ];

  // Select a role portal (DO NOT AUTO-FILL, KEEP COMPLETELY EMPTY!)
  const handleSelectRolePortal = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    setUsername('');
    setPassword('');
  };

  // Quick 1-Click Login for testing
  const handleQuickLogin = (roleId) => {
    setIsLoading(true);
    setErrorMessage('');
    const users = getStoredUsers();
    const user = users.find(u => u.role === roleId) || users[0];
    
    // Fill the inputs visually
    setUsername(user.username);
    setPassword(user.password || '1234');

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(user);
    }, 300);
  };

  // Submit Login with Strict Validation (Accepts Username OR Email)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const uName = username.trim().toLowerCase();
    const enteredPass = password.trim();

    if (!uName) {
      setErrorMessage('Iltimos, login (username) yoki emailni kiriting!');
      return;
    }

    if (!enteredPass) {
      setErrorMessage('Iltimos, parolingizni kiriting!');
      return;
    }

    // Minimum 4 characters validation
    if (enteredPass.length < 4) {
      setErrorMessage("Parol kamida 4 ta raqam yoki belgidan iborat bo'lishi kerak!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const users = getStoredUsers();

      // Find user matching username OR email
      const found = users.find(
        u => (u.username.toLowerCase() === uName || (u.email && u.email.toLowerCase() === uName))
      );

      if (!found) {
        setErrorMessage('Bunday login yoki email mavjud emas! Iltimos, tekshirib qaytadan kiriting.');
        return;
      }

      // Check password strictly!
      if (found.password !== enteredPass) {
        setErrorMessage("❌ Parol noto'g'ri! Iltimos, to'g'ri parolni kiriting (Demo parol: 1234).");
        return;
      }

      // Check role authorization
      if (found.role !== selectedRole && !(selectedRole === 'admin' && found.role === 'superadmin')) {
        setErrorMessage(`Diqqat: Siz "${found.roleLabel}" sifatida ro'yxatdan o'tgansiz. Iltimos, "${found.roleLabel}" portalini tanlang!`);
        return;
      }

      // Successful login
      onLoginSuccess(found);
    }, 350);
  };

  // Submit Student Registration with Minimum 4 chars Password & Email
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim()) {
      setErrorMessage('Iltimos, Ism va Familiyangizni kiriting!');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Iltimos, Login (username) tanlang!');
      return;
    }
    if (regPassword.trim().length < 4) {
      setErrorMessage("Yangi parol kamida 4 ta raqam yoki belgidan iborat bo'lishi shart!");
      return;
    }

    const users = getStoredUsers();
    const exists = users.some(
      u => u.username.toLowerCase() === regUsername.trim().toLowerCase() ||
           (regEmail && u.email && u.email.toLowerCase() === regEmail.trim().toLowerCase())
    );
    if (exists) {
      setErrorMessage('Ushbu login yoki email band! Boshqa login/email tanlang.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const { newUser, newStudent } = registerNewStudent({
        name: regName,
        email: regEmail,
        phone: regPhone,
        group: regGroup,
        level: regLevel,
        username: regUsername,
        password: regPassword.trim()
      });

      setRegSuccessMessage(`Tabriklaymiz, ${regName}! Ro'yxatdan muvaffaqiyatli o'tdingiz. Talaba ID: ${newStudent.id}. Tizimga kiritilmoqda...`);

      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1000);
    }, 500);
  };

  const currentPortal = rolePortals.find(p => p.id === selectedRole) || rolePortals[0];
  const PortalIcon = currentPortal.icon;

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper animate-pop-in">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo-badge">
            <IconSparkles size={32} className="text-white" />
          </div>
          <h1 className="login-title">EduLingua AI Platform</h1>
          <p className="login-subtitle">
            O'quv Markaz Boshqaruv & Imtihon Ekotizimi
          </p>

          {/* Mode Switcher Tabs: Login vs Register */}
          <div className="auth-mode-switch-row">
            <button
              type="button"
              className={`mode-switch-btn ${authMode === 'login' ? 'active-mode-btn' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
            >
              <span>🔑 Tizimga Kirish</span>
            </button>
            <button
              type="button"
              className={`mode-switch-btn ${authMode === 'register' ? 'active-mode-btn' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
              }}
            >
              <span>📝 O'quvchi Ro'yxatdan O'tishi</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="login-error-alert animate-fade-in">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {regSuccessMessage && (
          <div className="login-success-alert animate-fade-in">
            <IconCheckCircle size={18} />
            <span>{regSuccessMessage}</span>
          </div>
        )}

        {/* =========================================================
            MODE 1: LOGIN (WITH DISTINCT ROLE PORTALS)
            ========================================================= */}
        {authMode === 'login' && (
          <div className="login-content-box animate-fade-in">
            {/* Dedicated Role Tabs Bar */}
            <div className="role-selector-label">1. Kirish Portalini Tanlang:</div>
            <div className="login-role-tabs-bar">
              {rolePortals.map((portal) => {
                const Icon = portal.icon;
                const isSelected = selectedRole === portal.id;
                return (
                  <button
                    key={portal.id}
                    type="button"
                    className={`login-role-tab ${isSelected ? 'active-role-tab' : ''}`}
                    onClick={() => handleSelectRolePortal(portal.id)}
                  >
                    <Icon size={16} />
                    <span>{portal.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Header Preview Box */}
            <div className="active-role-preview-box">
              <div className="role-preview-header">
                <div className="role-preview-icon-wrap">
                  <PortalIcon size={22} />
                </div>
                <div className="role-preview-titles">
                  <div className="role-preview-name">{currentPortal.title}</div>
                  <span className="role-preview-tag">{currentPortal.badge}</span>
                </div>
              </div>
              <p className="role-preview-desc">{currentPortal.desc}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-user">
                  {currentPortal.label} Logini yoki Email Manzili:
                </label>
                <input
                  id="login-user"
                  type="text"
                  className="radial-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Login (username) yoki emailni kiriting..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-pass">
                  Maxfiy Parol (Kamida 4 ta raqam):
                </label>
                <div className="password-input-wrap">
                  <input
                    id="login-pass"
                    type="password"
                    className="radial-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolni kiriting..."
                    minLength={4}
                    required
                  />
                  <IconLock size={18} className="password-icon" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-login-submit radial-button-primary"
              >
                {isLoading ? (
                  <span>Tekshirilmoqda...</span>
                ) : (
                  <>
                    <span>{currentPortal.label} Sifatida Kirish</span>
                    <IconArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Access Bar */}
            <div className="quick-access-section">
              <div className="quick-access-divider">
                <span>Yoki 1-Tugma bilan Demo Kirish (Parol: 1234):</span>
              </div>

              <div className="quick-roles-grid">
                {rolePortals.map((portal) => (
                  <button
                    key={portal.id}
                    type="button"
                    className="quick-role-chip radial-button-secondary"
                    onClick={() => handleQuickLogin(portal.id)}
                  >
                    <strong>{portal.label}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODE 2: STUDENT REGISTRATION (RO'YXATDAN O'TISH)
            ========================================================= */}
        {authMode === 'register' && (
          <div className="register-content-box animate-fade-in">
            <div className="register-header-banner">
              <IconGraduationCap size={24} className="text-blue" />
              <div>
                <h3 className="reg-title">Yangi O'quvchi Ro'yxatdan O'tishi</h3>
                <p className="reg-desc">Kursni tanlang, emailingiz va profilingizni yarating (Parol kamida 4 ta raqam)!</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">To'liq Ism va Familiyangiz:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="Masalan: Dilshod Rustamov"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Email Manzilingiz:</label>
                  <input
                    type="email"
                    className="radial-input"
                    placeholder="Masalan: dilshod@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon Raqamingiz:</label>
                  <input
                    type="text"
                    className="radial-input"
                    placeholder="+998 90 123-45-67"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">O'qimoqchi Bo'lgan Kurs:</label>
                  <select
                    className="radial-select"
                    value={regGroup}
                    onChange={(e) => setRegGroup(e.target.value)}
                  >
                    {GROUPS_LIST.filter(g => g !== 'Barcha guruhlar').map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Joriy Til Darajangiz:</label>
                  <select
                    className="radial-select"
                    value={regLevel}
                    onChange={(e) => setRegLevel(e.target.value)}
                  >
                    <option value="A1">A1 — Beginner</option>
                    <option value="A2">A2 — Elementary</option>
                    <option value="B1">B1 — Intermediate</option>
                    <option value="B2">B2 — Upper-Intermediate</option>
                    <option value="C1">C1 — Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Yangi Login (Username):</label>
                  <input
                    type="text"
                    className="radial-input"
                    placeholder="Masalan: dilshod2026"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maxfiy Parol (Kamida 4 ta raqam):</label>
                  <input
                    type="password"
                    className="radial-input"
                    placeholder="Kamida 4 ta raqam (Masalan: 7788)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    minLength={4}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-login-submit radial-button-primary"
              >
                {isLoading ? (
                  <span>Ro'yxatdan o'tkazilmoqda...</span>
                ) : (
                  <>
                    <IconPlus size={18} />
                    <span>Ro'yxatdan O'tish va Kirish</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security & System Info */}
        <div className="login-footer-info">
          <div className="security-status">
            <IconShield size={16} />
            <span>EduLingua Secure Multi-Role System • Bosh Admin, Direktor, Admin, O'qituvchi, O'quvchi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
