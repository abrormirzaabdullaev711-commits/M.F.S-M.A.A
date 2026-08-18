import React, { useState, useEffect } from 'react';
import { 
  IconBook, 
  IconUsers, 
  IconCalendar, 
  IconAward, 
  IconBot, 
  IconBarChart,
  IconClock, 
  IconSun, 
  IconMoon, 
  IconSparkles,
  IconBuilding,
  IconShield,
  IconGraduationCap,
  IconLogOut,
  IconCheck,
  IconEdit,
  IconCheckCircle,
  IconBell,
  IconGlobe,
  IconSend
} from './Icons';
import { 
  getStoredUsers, 
  updateStoredUserProfile,
  getUserIncomingMessages,
  getUnreadMessagesCount,
  markMessageAsRead,
  markAllMessagesAsRead
} from '../services/storage';
import { getTranslation } from '../services/translations';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  stats = {},
  currentUser,
  onSwitchUser,
  onLogout,
  onUpdateCurrentUser,
  language = 'uz',
  setLanguage = () => {}
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Edit Profile States
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '👤');
  const [editSuccessMsg, setEditSuccessMsg] = useState(false);

  // Avatar options to pick
  const avatarOptions = ['👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '🏛️', '⚙️', '👑', '👨‍💻', '👩‍🔬', '🚀', '⭐', '💡'];

  const t = (key) => getTranslation(key, language);
  const userRole = currentUser?.role || 'student';
  const currentUserId = currentUser?.id || currentUser?.username;
  const allUsers = getStoredUsers();

  // Incoming messages & unread count
  const incomingMessages = getUserIncomingMessages(currentUser);
  const unreadMessagesCount = getUnreadMessagesCount(currentUser);

  // Tabs for Teacher
  const teacherTabs = [
    { id: 'dashboard', label: t('tabDashboard'), icon: IconBarChart, badge: null },
    { id: 'messages', label: t('tabMessages'), icon: IconSend, badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : null },
    { id: 'dictionary', label: t('tabDictionary'), icon: IconBook, badge: `${stats.savedWordsCount || 0}` },
    { id: 'timer-todo', label: t('tabTimerTodo'), icon: IconClock, badge: `${stats.pendingTasksCount || 0}` },
    { id: 'students', label: t('tabStudents'), icon: IconUsers, badge: `${stats.studentsCount || 0}` },
    { id: 'attendance', label: t('tabAttendance'), icon: IconCalendar, badge: `${stats.todayAttendanceRate || 0}%` },
    { id: 'grading', label: t('tabGrading'), icon: IconAward, badge: 'GPA' },
    { id: 'agents', label: t('tabAgents'), icon: IconBot, badge: '4 AI' }
  ];

  const roleMeta = {
    superadmin: { label: t('roleSuperadmin'), color: 'purple-role', icon: IconAward },
    director: { label: t('roleDirector'), color: 'blue-role', icon: IconBuilding },
    admin: { label: t('roleAdmin'), color: 'sky-role', icon: IconShield },
    teacher: { label: t('roleTeacher'), color: 'indigo-role', icon: IconUsers },
    student: { label: t('roleStudent'), color: 'cyan-role', icon: IconGraduationCap }
  };

  const currentRoleInfo = roleMeta[userRole] || roleMeta.student;

  const handleOpenEditProfile = () => {
    setEditName(currentUser?.name || '');
    setEditPhone(currentUser?.phone || '');
    setEditAvatar(currentUser?.avatar || '👤');
    setEditSuccessMsg(false);
    setShowRoleDropdown(false);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updatedUser = updateStoredUserProfile(currentUser.id || currentUser.username, {
      name: editName.trim(),
      phone: editPhone.trim(),
      avatar: editAvatar
    });

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(updatedUser);
    }
    setEditSuccessMsg(true);
    setTimeout(() => {
      setShowEditProfileModal(false);
      setEditSuccessMsg(false);
    }, 900);
  };

  const handleNotificationClick = (msg) => {
    markMessageAsRead(msg.id, currentUserId);
    setShowNotifDropdown(false);

    if (userRole === 'teacher') setActiveTab('messages');
    else if (userRole === 'student') setActiveTab('student');
    else if (userRole === 'director') setActiveTab('director');
    else if (userRole === 'admin' || userRole === 'superadmin') setActiveTab('admin');
  };

  const handleMarkAllRead = () => {
    markAllMessagesAsRead(currentUserId);
  };

  return (
    <>
      <header className="app-navbar">
        <div className="navbar-container">
          {/* Brand Logo */}
          <div 
            className="brand-logo" 
            onClick={() => {
              if (userRole === 'director') setActiveTab('director');
              else if (userRole === 'admin' || userRole === 'superadmin') setActiveTab('admin');
              else if (userRole === 'student') setActiveTab('student');
              else setActiveTab('dashboard');
            }}
          >
            <div className="logo-badge">
              <IconSparkles size={24} className="logo-sparkle animate-float" />
            </div>
            <div className="brand-text">
              <div className="brand-title">
                EduLingua <span className="brand-highlight">AI Platform</span>
              </div>
              <div className="brand-subtitle">
                {t('brandSubtitle')}
              </div>
            </div>
          </div>

          {/* Navigation Bar based on Role */}
          <nav className="nav-menu">
            {userRole === 'superadmin' && (
              <div className="role-nav-indicator purple-ind animate-glow-purple">
                <IconAward size={18} />
                <span>👑 Bosh Admin Master Portali</span>
              </div>
            )}

            {userRole === 'director' && (
              <div className="role-nav-indicator blue-ind animate-ripple">
                <IconBuilding size={18} />
                <span>🏛️ Bosh Direktor Strategik Kabineti</span>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="role-nav-indicator sky-ind">
                <IconShield size={18} />
                <span>⚙️ Administrator Boshqaruv Markazi</span>
              </div>
            )}

            {userRole === 'student' && (
              <div className="role-nav-indicator cyan-ind animate-float-gentle">
                <IconGraduationCap size={18} />
                <span>👨‍🎓 O'quvchi Shaxsiy Portali</span>
              </div>
            )}

            {userRole === 'teacher' && (
              teacherTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{tab.label}</span>
                    {tab.badge && (
                      <span className={`nav-badge ${isActive ? 'active-badge' : ''} animate-count-pop`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </nav>

          {/* Actions & Controls */}
          <div className="nav-actions">
            {/* 1. Language Selector (Til Almashtirish) */}
            <div className="nav-lang-menu-wrap">
              <button
                type="button"
                className="nav-lang-btn animate-btn-pop"
                onClick={() => {
                  setShowLangDropdown(!showLangDropdown);
                  setShowNotifDropdown(false);
                  setShowRoleDropdown(false);
                }}
                title={t('selectLanguage')}
              >
                <IconGlobe size={17} />
                <span className="lang-code-tag">
                  {language === 'uz' ? '🇺🇿 UZ' : language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
                </span>
              </button>

              {showLangDropdown && (
                <div className="lang-dropdown-popover animate-pop-in">
                  <div className="lang-dropdown-title">{t('selectLanguage')}</div>
                  <button
                    type="button"
                    className={`lang-option-btn ${language === 'uz' ? 'active-lang' : ''}`}
                    onClick={() => {
                      setLanguage('uz');
                      setShowLangDropdown(false);
                    }}
                  >
                    <span>🇺🇿</span>
                    <span>O'zbekcha (UZ)</span>
                  </button>
                  <button
                    type="button"
                    className={`lang-option-btn ${language === 'ru' ? 'active-lang' : ''}`}
                    onClick={() => {
                      setLanguage('ru');
                      setShowLangDropdown(false);
                    }}
                  >
                    <span>🇷🇺</span>
                    <span>Русский (RU)</span>
                  </button>
                  <button
                    type="button"
                    className={`lang-option-btn ${language === 'en' ? 'active-lang' : ''}`}
                    onClick={() => {
                      setLanguage('en');
                      setShowLangDropdown(false);
                    }}
                  >
                    <span>🇬🇧</span>
                    <span>English (EN)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Notification Bell (Bildirishnomalar & SMS) */}
            <div className="nav-notif-menu-wrap">
              <button
                type="button"
                className="nav-icon-btn notif-bell-btn animate-btn-pop"
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowLangDropdown(false);
                  setShowRoleDropdown(false);
                }}
                title={t('notificationsTitle')}
              >
                <IconBell size={19} className={unreadMessagesCount > 0 ? "animate-attention text-blue" : ""} />
                {unreadMessagesCount > 0 && (
                  <span className="notif-badge-count animate-pulse-danger">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown-popover animate-pop-in">
                  <div className="notif-dropdown-header">
                    <div>
                      <strong className="notif-title">{t('notificationsTitle')}</strong>
                      <span className="notif-unread-sub">{unreadMessagesCount} {t('unreadCount')}</span>
                    </div>
                    {unreadMessagesCount > 0 && (
                      <button
                        type="button"
                        className="notif-mark-all-btn"
                        onClick={handleMarkAllRead}
                      >
                        {t('btnMarkAllRead')}
                      </button>
                    )}
                  </div>

                  <div className="notif-items-list">
                    {incomingMessages.length === 0 ? (
                      <div className="notif-empty-state">
                        <p>{t('noNotifications')}</p>
                      </div>
                    ) : (
                      incomingMessages.slice(0, 6).map((msg) => {
                        const isUnread = !msg.readBy || !msg.readBy.includes(currentUserId);
                        return (
                          <div
                            key={msg.id}
                            className={`notif-item-row ${isUnread ? 'notif-unread' : ''}`}
                            onClick={() => handleNotificationClick(msg)}
                          >
                            <span className="notif-sender-av">{msg.senderAvatar || '💬'}</span>
                            <div className="notif-item-body">
                              <div className="notif-item-top">
                                <strong className="notif-sender">{msg.senderName}</strong>
                                <span className="notif-time">{msg.createdAt}</span>
                              </div>
                              <div className="notif-subject">{msg.title}</div>
                              <p className="notif-text-snippet">{msg.text}</p>
                            </div>
                            {isUnread && <span className="notif-blue-dot animate-pulse-danger"></span>}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="notif-dropdown-footer">
                    <button
                      type="button"
                      className="notif-view-all-btn"
                      onClick={() => {
                        setShowNotifDropdown(false);
                        if (userRole === 'teacher') setActiveTab('messages');
                        else if (userRole === 'student') setActiveTab('student');
                        else if (userRole === 'director') setActiveTab('director');
                        else if (userRole === 'admin' || userRole === 'superadmin') setActiveTab('admin');
                      }}
                    >
                      {t('tabMessages')} Markaziga O'tish →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. User Profile Chip with Menu Dropdown */}
            <div className="user-profile-menu-wrap">
              <button
                type="button"
                className="user-profile-chip animate-btn-pop"
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowNotifDropdown(false);
                  setShowLangDropdown(false);
                }}
                title="Profilni boshqarish va rollarni almashtirish"
              >
                <span className="user-chip-avatar">{currentUser?.avatar || '👤'}</span>
                <div className="user-chip-meta">
                  <span className="user-chip-name">{currentUser?.name || 'Foydalanuvchi'}</span>
                  <div className="flex items-center gap-1">
                    <span className="user-id-chip-mini text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-semibold">
                      {(currentUser?.studentId || currentUser?.id || '').toUpperCase()}
                    </span>
                    <span className={`user-chip-role-badge ${currentRoleInfo.color}`}>
                      {currentRoleInfo.label}
                    </span>
                  </div>
                </div>
              </button>

              {/* Popover Dropdown */}
              {showRoleDropdown && (
                <div className="role-dropdown-popover animate-pop-in">
                  <div className="dropdown-header">
                    <div className="dropdown-user-row">
                      <span className="dropdown-big-avatar">{currentUser?.avatar || '👤'}</span>
                      <div>
                        <strong className="dropdown-user-name">{currentUser?.name}</strong>
                        <div className="text-xs text-blue-800 font-mono">
                          ID: {(currentUser?.studentId || currentUser?.id || '').toUpperCase()} • @{currentUser?.username}
                        </div>
                        <div className="text-xs text-blue-600">
                          {currentUser?.email || `${currentUser?.username}@edulingua.uz`}
                        </div>
                        <div className="dropdown-user-role mt-1">{currentUser?.roleTitle || currentRoleInfo.label}</div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="btn-edit-profile-action radial-button-secondary animate-btn-pop"
                      onClick={handleOpenEditProfile}
                    >
                      <IconEdit size={14} />
                      <span>{t('btnEditProfile')}</span>
                    </button>
                  </div>

                  <div className="dropdown-divider"></div>
                  <div className="dropdown-section-title">{t('btnSwitchUser')}:</div>

                  <div className="dropdown-roles-list">
                    {allUsers.map((usr) => {
                      const isCurrent = (usr.id === currentUser?.id || usr.username === currentUser?.username);
                      const displayId = (usr.studentId || usr.id || '').toUpperCase();
                      return (
                        <button
                          key={usr.id}
                          type="button"
                          className={`dropdown-role-item ${isCurrent ? 'selected-role-item' : ''}`}
                          onClick={() => {
                            onSwitchUser(usr);
                            setShowRoleDropdown(false);
                          }}
                        >
                          <span className="dropdown-role-avatar">{usr.avatar}</span>
                          <div className="dropdown-role-info">
                            <strong>{usr.name} <span className="text-xs text-blue-700 font-mono">[{displayId}]</span></strong>
                            <span>{usr.roleLabel} • @{usr.username}</span>
                          </div>
                          {isCurrent && <IconCheck size={16} className="text-blue" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="dropdown-divider"></div>

                  <button
                    type="button"
                    className="dropdown-logout-btn"
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onLogout();
                    }}
                  >
                    <IconLogOut size={16} />
                    <span>{t('btnLogout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          PROFILE EDIT MODAL (Ism Almashtirish & Profilni Yangilash)
          ========================================================= */}
      {showEditProfileModal && (
        <div className="director-modal-backdrop animate-fade-in">
          <div className="director-modal-card animate-pop-in">
            <div className="modal-header-line">
              <div className="modal-teacher-info">
                <span className="modal-avatar">{editAvatar}</span>
                <div>
                  <h3 className="modal-title">Profil Ma'lumotlarini Tahrirlash</h3>
                  <p className="modal-subtitle">Ismingiz, telefon va avatarni yangilang</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEditProfileModal(false)}
              >
                ✕
              </button>
            </div>

            {editSuccessMsg && (
              <div className="login-success-alert animate-fade-in mb-3">
                <IconCheckCircle size={18} />
                <span>Profil ma'lumotlari muvaffaqiyatli saqlandi!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-group">
                <label className="form-label">To'liq Ismingiz (F.I.Sh):</label>
                <input
                  type="text"
                  className="radial-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ism Familiyangizni kiriting"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Raqamingiz:</label>
                <input
                  type="text"
                  className="radial-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+998 90 123-45-67"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatarni Tanlang:</label>
                <div className="avatar-pick-grid">
                  {avatarOptions.map((av) => (
                    <button
                      key={av}
                      type="button"
                      className={`avatar-pick-btn ${editAvatar === av ? 'selected-avatar-btn' : ''}`}
                      onClick={() => setEditAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="radial-button-secondary"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  {t('btnCancel')}
                </button>
                <button type="submit" className="radial-button-primary animate-btn-pop">
                  <IconCheck size={16} />
                  <span>{t('btnSave')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
