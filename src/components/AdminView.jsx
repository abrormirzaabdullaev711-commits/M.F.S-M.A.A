import React, { useState } from 'react';
import { 
  IconShield, 
  IconUsers, 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconSearch, 
  IconSend, 
  IconCheck, 
  IconCalendar, 
  IconClock, 
  IconBriefcase, 
  IconDollarSign,
  IconCheckCircle,
  IconAlertCircle,
  IconAward,
  IconBuilding,
  IconGraduationCap
} from './Icons';
import { 
  getStoredAdminGroups, 
  saveStoredAdminGroups, 
  getStoredAdminLogs, 
  saveStoredAdminLogs,
  getStoredUsers,
  saveStoredUsers,
  updateUserRoleInStorage,
  deleteStoredUser,
  registerNewUser
} from '../services/storage';
import { GROUPS_LIST, ADMIN_DATA } from '../data/mockData';
import { MessagesView } from './MessagesView';

export const AdminView = ({ 
  students = [], 
  onAddStudent, 
  onDeleteStudent,
  currentUser,
  language = 'uz'
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState('users-roles'); // 'users-roles', 'students', 'groups', 'sms', 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('Barcha guruhlar');

  // Dynamic Users & Role Management state
  const [usersList, setUsersList] = useState(getStoredUsers);
  const [userRoleToast, setUserRoleToast] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // User deletion state & animation
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // New User Form Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('1234');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserGroup, setNewUserGroup] = useState('IELTS Mastery (B2-C1)');
  const [newUserLevel, setNewUserLevel] = useState('B2');
  const [newUserAvatar, setNewUserAvatar] = useState('👨‍🎓');

  // Groups state
  const [groups, setGroups] = useState(getStoredAdminGroups);
  const [logs, setLogs] = useState(getStoredAdminLogs);

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentGroup, setNewStudentGroup] = useState('IELTS Mastery (B2-C1)');
  const [newStudentLevel, setNewStudentLevel] = useState('B2');

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTeacher, setNewGroupTeacher] = useState('Azizbek Toshmatov');
  const [newGroupDays, setNewGroupDays] = useState('Dush - Chor - Juma');
  const [newGroupTime, setNewGroupTime] = useState('14:00 - 16:00');
  const [newGroupRoom, setNewGroupRoom] = useState('Auditoriya 101');
  const [newGroupFee, setNewGroupFee] = useState('650,000 UZS');

  // SMS Broadcast State
  const [smsRecipientType, setSmsRecipientType] = useState('all'); // all, group, debtors
  const [smsTargetGroup, setSmsTargetGroup] = useState('IELTS Mastery (B2-C1)');
  const [smsMessageText, setSmsMessageText] = useState(ADMIN_DATA.broadcastTemplates[0].text);
  const [smsHistory, setSmsHistory] = useState([
    {
      id: 'sms-1',
      recipient: 'Barcha O\'quvchilar (156 nafar)',
      text: 'Hurmatli o\'quvchi! Shanba kuni soat 14:00 da oylik nazorat imtihoni (Mock Exam) bo\'lib o\'tadi.',
      sentAt: '2026-08-17 11:30',
      status: 'Yetkazildi (100%)'
    },
    {
      id: 'sms-2',
      recipient: 'IELTS Mastery Guruhi (14 nafar)',
      text: 'Eslatma: Bugungi dars yangi Smart Board xonasida o\'tiladi.',
      sentAt: '2026-08-16 13:15',
      status: 'Yetkazildi (100%)'
    }
  ]);
  const [smsSentSuccess, setSmsSentSuccess] = useState(false);

  // Promote / Change User Role Action
  const handlePromoteUser = (userId, targetRole) => {
    const roleLabels = {
      superadmin: 'Bosh Admin (Super Admin)',
      director: 'Direktor (Headmaster)',
      admin: 'Administrator',
      teacher: 'O\'qituvchi',
      student: 'O\'quvchi'
    };

    const res = updateUserRoleInStorage(userId, targetRole);
    setUsersList(res.users);

    const userObj = res.users.find(u => u.id === userId || u.username === userId);
    const uName = userObj ? userObj.name : 'Foydalanuvchi';

    // Log action
    const newLog = {
      id: `log-${Date.now()}`,
      user: `${currentUser?.name || 'Bosh Admin'}`,
      action: `${uName} ning roli "${roleLabels[targetRole]}" ga o'zgartirildi`,
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.12'
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredAdminLogs(updatedLogs);

    setUserRoleToast(`Muvaffaqiyatli! ${uName} roli "${roleLabels[targetRole]}" etib belgilandi.`);
    setTimeout(() => {
      setUserRoleToast('');
    }, 4000);
  };

  // Request to delete a user account (opens custom modal)
  const handleRequestDeleteUser = (usr) => {
    setUserToDelete(usr);
    setShowDeleteUserModal(true);
  };

  // Confirmed Delete User Handler
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;

    const targetId = userToDelete.id;
    const targetName = userToDelete.name;
    const targetUsername = userToDelete.username;
    const targetRole = userToDelete.roleLabel || userToDelete.role;

    // Trigger row exit animation
    setDeletingUserId(targetId);
    setShowDeleteUserModal(false);

    setTimeout(() => {
      const res = deleteStoredUser(targetId);
      if (res.success) {
        setUsersList(res.users);

        // If this user has a student record, sync deletion
        if (onDeleteStudent && (userToDelete.studentId || userToDelete.role === 'student')) {
          onDeleteStudent(userToDelete.studentId || targetId);
        }

        // Add to audit logs
        const newLog = {
          id: `log-${Date.now()}`,
          user: `${currentUser?.name || 'Bosh Admin'}`,
          action: `🚨 Foydalanuvchi hisobi butunlay o'chirildi: ${targetName} (@${targetUsername}, ${targetRole})`,
          timestamp: new Date().toLocaleString(),
          ip: '192.168.1.12'
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        saveStoredAdminLogs(updatedLogs);

        setUserRoleToast(`🗑️ "${targetName}" (@${targetUsername}) hisobi muvaffaqiyatli o'chirildi!`);
        setTimeout(() => {
          setUserRoleToast('');
        }, 4500);
      }
      setDeletingUserId(null);
      setUserToDelete(null);
    }, 420);
  };

  // Handle Add New User of Any Role
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim()) return;

    const res = registerNewUser({
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      password: newUserPassword.trim() || '1234',
      role: newUserRole,
      avatar: newUserAvatar,
      email: newUserEmail.trim(),
      phone: newUserPhone.trim(),
      group: newUserGroup,
      level: newUserLevel
    });

    setUsersList(res.users);

    const newLog = {
      id: `log-${Date.now()}`,
      user: `${currentUser?.name || 'Bosh Admin'}`,
      action: `✨ Yangi foydalanuvchi yaratildi: [${res.newUser.roleLabel}] ${res.newUser.name} (@${res.newUser.username})`,
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.12'
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredAdminLogs(updatedLogs);

    setUserRoleToast(`✅ "${res.newUser.name}" (@${res.newUser.username}) muvaffaqiyatli ro'yxatdan o'tkazildi!`);
    setTimeout(() => setUserRoleToast(''), 4000);

    // Reset Form
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('1234');
    setNewUserEmail('');
    setNewUserPhone('');
    setShowAddUserModal(false);
  };

  // Handle Add Student
  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const stdNumber = students.length + 101;
    const newStudentId = `std-${stdNumber}`;
    const newUserId = `usr-std-${stdNumber}`;
    const username = newStudentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || `student_${stdNumber}`;
    const email = newStudentEmail.trim() || `${username}@edulingua.uz`;

    const newStd = {
      id: newStudentId,
      name: newStudentName.trim(),
      email: email,
      phone: newStudentPhone.trim() || '+998 90 000-00-00',
      group: newStudentGroup,
      level: newStudentLevel,
      avatar: '👨‍🎓',
      color: '#2563eb',
      enrolledDate: new Date().toISOString().split('T')[0],
      attendance: {
        [new Date().toISOString().split('T')[0]]: 'present'
      },
      grades: [],
      vocabCount: 0,
      badge: 'Yangi O\'quvchi 🌟'
    };

    onAddStudent(newStd);

    // Also register user
    const newUser = {
      id: newUserId,
      username: username,
      password: '1234',
      name: newStudentName.trim(),
      role: 'student',
      roleLabel: 'O\'quvchi (Student)',
      roleTitle: `${newStudentGroup} Talabasi`,
      avatar: '👨‍🎓',
      email: email,
      phone: newStudentPhone.trim() || '+998 90 000-00-00',
      studentId: newStudentId,
      badge: 'Yangi Talaba',
      group: newStudentGroup,
      level: newStudentLevel,
      department: 'Talabalar Tarkibi',
      since: new Date().getFullYear().toString()
    };
    const updatedUsers = [newUser, ...usersList];
    setUsersList(updatedUsers);
    saveStoredUsers(updatedUsers);

    // Log action
    const newLog = {
      id: `log-${Date.now()}`,
      user: `${currentUser?.name || 'Admin'}`,
      action: `Yangi o'quvchi qo'shildi: [${newStudentId.toUpperCase()}] ${newStudentName} (${newStudentGroup})`,
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.12'
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredAdminLogs(updatedLogs);

    // Reset & close
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentPhone('');
    setShowAddStudentModal(false);
  };

  // Handle Add Group
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGrp = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      teacher: newGroupTeacher,
      days: newGroupDays,
      time: newGroupTime,
      room: newGroupRoom,
      capacity: 15,
      enrolled: 0,
      fee: newGroupFee,
      status: 'Yangi ochildi'
    };

    const updatedGroups = [newGrp, ...groups];
    setGroups(updatedGroups);
    saveStoredAdminGroups(updatedGroups);

    // Log
    const newLog = {
      id: `log-${Date.now()}`,
      user: `${currentUser?.name || 'Admin'}`,
      action: `Yangi guruh ochildi: ${newGroupName} (${newGroupTeacher})`,
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.12'
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredAdminLogs(updatedLogs);

    setNewGroupName('');
    setShowAddGroupModal(false);
  };

  // Delete Group
  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Haqiqatan ham ushbu guruhni o'chirmoqchimisiz?")) {
      const updated = groups.filter((g) => g.id !== groupId);
      setGroups(updated);
      saveStoredAdminGroups(updated);
    }
  };

  // Send Broadcast SMS
  const handleSendBroadcastSms = (e) => {
    e.preventDefault();
    if (!smsMessageText.trim()) return;

    const targetLabel =
      smsRecipientType === 'all'
        ? `Barcha O'quvchilar (${students.length} nafar)`
        : smsRecipientType === 'group'
        ? `${smsTargetGroup} Guruhi`
        : "To'lov Muddati Kutilayotganlar (12 nafar)";

    const newSmsRecord = {
      id: `sms-${Date.now()}`,
      recipient: targetLabel,
      text: smsMessageText,
      sentAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      status: 'Muvaffaqiyatli yetkazildi (100%)'
    };

    setSmsHistory([newSmsRecord, ...smsHistory]);
    setSmsSentSuccess(true);

    // Log
    const newLog = {
      id: `log-${Date.now()}`,
      user: `${currentUser?.name || 'Admin'}`,
      action: `Ommaviy SMS yuborildi -> ${targetLabel}`,
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.12'
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredAdminLogs(updatedLogs);

    setTimeout(() => {
      setSmsSentSuccess(false);
    }, 3500);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      students,
      users: usersList,
      groups,
      logs
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `edulingua_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  // User counts by role
  const countAllUsers = usersList.length;
  const countStudents = usersList.filter((u) => u.role === 'student').length;
  const countTeachers = usersList.filter((u) => u.role === 'teacher').length;
  const countDirectors = usersList.filter((u) => u.role === 'director').length;
  const countAdmins = usersList.filter((u) => u.role === 'admin').length;
  const countSuperAdmins = usersList.filter((u) => u.role === 'superadmin').length;

  // Filter students
  const filteredStudents = students.filter((std) => {
    const matchesSearch =
      std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (std.phone && std.phone.includes(searchQuery));
    const matchesGroup =
      selectedGroupFilter === 'Barcha guruhlar' || std.group === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="admin-container animate-fade-in">
      {/* Admin Top Header */}
      <div className="admin-header-card">
        <div className="admin-header-left">
          <div className="admin-avatar-badge">
            <IconShield size={30} className="text-white" />
          </div>
          <div>
            <div className="admin-badge-label">
              <span className="animate-pulse-danger">👑 Boshqaruv & Rollar Nazorati</span>
            </div>
            <h1 className="admin-title">Tizim Administratori & Bosh Admin Paneli</h1>
            <p className="admin-subtext">
              Foydalanuvchilar hisoblarini o'chirish, rollarni boshqarish (O'quvchi, O'qituvchi, Direktor, Admin), dars jadvallari va SMS markazi
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="radial-button-secondary animate-btn-pop"
            onClick={handleExportBackup}
            title="Barcha ma'lumotlarni JSON zaxirada yuklab olish"
          >
            <span>💾 Zaxira Nusxa (Backup)</span>
          </button>
        </div>
      </div>

      {/* Role Change Toast Alert */}
      {userRoleToast && (
        <div className="login-success-alert animate-toast-slide">
          <IconCheckCircle size={20} />
          <strong>{userRoleToast}</strong>
        </div>
      )}

      {/* Admin Subnav */}
      <div className="admin-subnav-tabs">
        <button
          type="button"
          className={`admin-nav-btn ${activeAdminTab === 'users-roles' ? 'active-admin-tab' : ''}`}
          onClick={() => setActiveAdminTab('users-roles')}
        >
          <IconShield size={18} />
          <span>Foydalanuvchilar & Rollar Boshqaruvi</span>
          <span className="tab-pill-count animate-count-pop">{usersList.length}</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeAdminTab === 'students' ? 'active-admin-tab' : ''}`}
          onClick={() => setActiveAdminTab('students')}
        >
          <IconUsers size={18} />
          <span>Talabalar Ro'yxati</span>
          <span className="tab-pill-count">{students.length}</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeAdminTab === 'groups' ? 'active-admin-tab' : ''}`}
          onClick={() => setActiveAdminTab('groups')}
        >
          <IconBriefcase size={18} />
          <span>Guruhlar & Jadvallar</span>
          <span className="tab-pill-count">{groups.length}</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeAdminTab === 'sms' ? 'active-admin-tab' : ''}`}
          onClick={() => setActiveAdminTab('sms')}
        >
          <IconSend size={18} />
          <span>SMS & Xabarnomalar</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeAdminTab === 'logs' ? 'active-admin-tab' : ''}`}
          onClick={() => setActiveAdminTab('logs')}
        >
          <IconClock size={18} />
          <span>Tizim Loglari</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: USERS & ROLE ASSIGNMENT & ACCOUNT DELETION (SUPERADMIN & ADMIN)
          ========================================================= */}
      {activeAdminTab === 'users-roles' && (
        <div className="admin-tab-content animate-fade-in">
          {/* Superadmin Master Control Banner */}
          <div className="superadmin-badge-banner animate-fade-in">
            <div className="superadmin-banner-glow"></div>
            <div className="superadmin-banner-left">
              <div className="superadmin-crown-icon-wrap animate-crown-float">
                👑
              </div>
              <div>
                <div className="superadmin-banner-title">
                  Bosh Admin Master Nazorat & Hisoblar Boshqaruvi
                </div>
                <p className="superadmin-banner-desc">
                  Bosh Admin (Super Administrator) barcha foydalanuvchilar (O'quvchi, O'qituvchi, Direktor, Administrator) hisoblarini butunlay o'chirish, rollarni o'zgartirish va yangi hisoblar yaratish to'liq vakolatiga ega.
                </p>
              </div>
            </div>
            <div className="superadmin-stat-pills">
              <div className="superadmin-stat-pill">
                <span>Jami Hisoblar:</span> <strong>{countAllUsers}</strong>
              </div>
              <div className="superadmin-stat-pill">
                <span>👨‍🎓 O'quvchilar:</span> <strong>{countStudents}</strong>
              </div>
              <div className="superadmin-stat-pill">
                <span>👨‍🏫 O'qituvchilar:</span> <strong>{countTeachers}</strong>
              </div>
              <div className="superadmin-stat-pill">
                <span>👑 Boshqaruv:</span> <strong>{countSuperAdmins + countDirectors + countAdmins}</strong>
              </div>
            </div>
          </div>

          <div className="admin-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconShield size={20} />
                  <span>Foydalanuvchilar Ro'yxati, Rollari va Hisoblarni O'chirish</span>
                </h3>
                <p className="panel-desc">
                  Bosh Admin istalgan foydalanuvchi hisobini butunlay o'chirish yoki rolini o'zgartirishi mumkin
                </p>
              </div>

              <button
                type="button"
                className="radial-button-primary animate-btn-pop"
                onClick={() => setShowAddUserModal(true)}
              >
                <IconPlus size={18} />
                <span>Yangi Foydalanuvchi Qo'shish</span>
              </button>
            </div>

            {/* Role Filter Chips */}
            <div className="role-filters-toolbar animate-fade-in">
              <button
                type="button"
                className={`role-filter-chip ${userRoleFilter === 'all' ? 'active-filter' : ''}`}
                onClick={() => setUserRoleFilter('all')}
              >
                <span>Barchasi</span>
                <span className="filter-badge-num">{countAllUsers}</span>
              </button>
              <button
                type="button"
                className={`role-filter-chip ${userRoleFilter === 'student' ? 'active-filter' : ''}`}
                onClick={() => setUserRoleFilter('student')}
              >
                <span>👨‍🎓 O'quvchilar</span>
                <span className="filter-badge-num">{countStudents}</span>
              </button>
              <button
                type="button"
                className={`role-filter-chip ${userRoleFilter === 'teacher' ? 'active-filter' : ''}`}
                onClick={() => setUserRoleFilter('teacher')}
              >
                <span>👨‍🏫 O'qituvchilar</span>
                <span className="filter-badge-num">{countTeachers}</span>
              </button>
              <button
                type="button"
                className={`role-filter-chip ${userRoleFilter === 'director' ? 'active-filter' : ''}`}
                onClick={() => setUserRoleFilter('director')}
              >
                <span>🏛️ Direktorlar</span>
                <span className="filter-badge-num">{countDirectors}</span>
              </button>
              <button
                type="button"
                className={`role-filter-chip ${userRoleFilter === 'admin' ? 'active-filter' : ''}`}
                onClick={() => setUserRoleFilter('admin')}
              >
                <span>⚙️ Administratorlar</span>
                <span className="filter-badge-num">{countAdmins}</span>
              </button>
              <button
                type="button"
                className={`role-filter-chip ${userRoleFilter === 'superadmin' ? 'active-filter' : ''}`}
                onClick={() => setUserRoleFilter('superadmin')}
              >
                <span>👑 Bosh Admin</span>
                <span className="filter-badge-num">{countSuperAdmins}</span>
              </button>
            </div>

            {/* Search toolbar */}
            <div className="admin-toolbar-row">
              <div className="search-input-wrap">
                <IconSearch size={18} className="search-icon" />
                <input
                  type="text"
                  className="radial-input search-input"
                  placeholder="Foydalanuvchi ismi, login, telefon yoki emaili bo'yicha qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Users & Roles Table */}
            <div className="admin-table-wrapper">
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>ID & Foydalanuvchi</th>
                    <th>Login & Email</th>
                    <th>Telefon Raqami</th>
                    <th>Joriy Roli</th>
                    <th>Rolni O'zgartirish</th>
                    <th>Amallar (Hisobni O'chirish)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                          Hech qanday foydalanuvchi topilmadi.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => {
                      const displayId = (usr.studentId || usr.id || '').toUpperCase();
                      const isCurrent =
                        currentUser &&
                        (currentUser.id === usr.id || currentUser.username === usr.username);

                      return (
                        <tr
                          key={usr.id}
                          className={`admin-table-row ${
                            deletingUserId === usr.id ? 'user-row-deleting' : ''
                          }`}
                        >
                          <td>
                            <div className="student-cell">
                              <span className="student-avatar-circle">{usr.avatar || '👤'}</span>
                              <div>
                                <strong className="text-dark-navy">{usr.name}</strong>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold">
                                    {displayId}
                                  </span>
                                  <span className="student-badge-mini">{usr.badge || 'Faol'}</span>
                                  {isCurrent && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                      (Siz)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="font-mono-code text-blue-900 font-semibold">
                              @{usr.username}
                            </div>
                            <div className="text-xs text-blue-600 font-sans">
                              {usr.email || `${usr.username}@edulingua.uz`}
                            </div>
                          </td>
                          <td>
                            <span className="phone-text">{usr.phone || '+998 90 000-00-00'}</span>
                          </td>
                          <td>
                            <span className={`role-tag-pill role-${usr.role}`}>
                              {usr.roleLabel || usr.role}
                            </span>
                          </td>
                          <td>
                            <div className="role-change-cell">
                              <select
                                className="radial-select role-quick-select"
                                value={usr.role}
                                onChange={(e) => handlePromoteUser(usr.id, e.target.value)}
                              >
                                <option value="student">👨‍🎓 O'quvchi (Student)</option>
                                <option value="teacher">👨‍🏫 O'qituvchi (Teacher)</option>
                                <option value="director">🏛️ Direktor (Director)</option>
                                <option value="admin">⚙️ Administrator (Admin)</option>
                                <option value="superadmin">👑 Bosh Admin (Super Admin)</option>
                              </select>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-delete-user-btn"
                              onClick={() => handleRequestDeleteUser(usr)}
                              title={`"${usr.name}" hisobini butunlay o'chirish`}
                            >
                              <IconTrash size={14} />
                              <span>O'chirish</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: STUDENTS MANAGEMENT
          ========================================================= */}
      {activeAdminTab === 'students' && (
        <div className="admin-tab-content animate-fade-in">
          <div className="admin-panel-card">
            <div className="admin-toolbar-row">
              <div className="search-input-wrap">
                <IconSearch size={18} className="search-icon" />
                <input
                  type="text"
                  className="radial-input search-input"
                  placeholder="Talaba ismi, ID yoki telefon raqami bo'yicha qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="group-filter-wrap">
                <select
                  className="radial-select"
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                >
                  {GROUPS_LIST.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="radial-button-primary"
                onClick={() => setShowAddStudentModal(true)}
              >
                <IconPlus size={18} />
                <span>Yangi O'quvchi Qo'shish</span>
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>Talaba ID & Ismi</th>
                    <th>Email & Telefon</th>
                    <th>Biriktirilgan Guruh</th>
                    <th>Daraja</th>
                    <th>Qabul Sanasi</th>
                    <th>Holat</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((std) => (
                    <tr key={std.id} className="admin-table-row">
                      <td>
                        <div className="student-cell">
                          <span className="student-avatar-circle">{std.avatar || '👨‍🎓'}</span>
                          <div>
                            <strong className="text-dark-navy">{std.name}</strong>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-white font-mono font-bold">
                                {std.id.toUpperCase()}
                              </span>
                              <span className="student-badge-mini">{std.badge || 'Faol'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-blue-900 font-semibold">{std.email || `${std.name.toLowerCase().replace(/\s+/g, '')}@edulingua.uz`}</div>
                        <div className="phone-text text-xs">{std.phone || '+998 90 123-45-67'}</div>
                      </td>
                      <td>
                        <span className="group-badge-pill">{std.group}</span>
                      </td>
                      <td>
                        <span className="level-badge-pill">{std.level || 'B2'}</span>
                      </td>
                      <td>
                        <span className="enrolled-date">{std.enrolledDate || '2026-01-15'}</span>
                      </td>
                      <td>
                        <span className="status-pill-green">
                          <IconCheck size={12} /> Faol
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            type="button"
                            className="radial-button-danger py-1 px-2 text-xs"
                            onClick={() => {
                              if (window.confirm(`${std.name}ni o'chirmoqchimisiz?`)) {
                                onDeleteStudent(std.id);
                              }
                            }}
                            title="O'quvchini o'chirish"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: GROUPS & TIMETABLES
          ========================================================= */}
      {activeAdminTab === 'groups' && (
        <div className="admin-tab-content animate-fade-in">
          <div className="admin-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconBriefcase size={20} />
                  <span>Dars Jadvallari va Guruhlar Boshqaruvi</span>
                </h3>
                <p className="panel-desc">
                  Har bir guruhning dars vaqti, xonasi, o'qituvchisi va oylik to'lov summasi
                </p>
              </div>

              <button
                type="button"
                className="radial-button-primary"
                onClick={() => setShowAddGroupModal(true)}
              >
                <IconPlus size={18} />
                <span>Yangi Guruh Ochish</span>
              </button>
            </div>

            <div className="groups-cards-grid">
              {groups.map((grp) => (
                <div key={grp.id} className="admin-group-card">
                  <div className="group-card-header">
                    <div>
                      <h4 className="grp-title">{grp.name}</h4>
                      <span className="grp-status-badge">{grp.status}</span>
                    </div>
                    <button
                      type="button"
                      className="radial-button-danger p-1 text-xs"
                      onClick={() => handleDeleteGroup(grp.id)}
                      title="Guruhni o'chirish"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>

                  <div className="grp-details-list">
                    <div className="grp-detail-item">
                      <span className="detail-lbl">O'qituvchi:</span>
                      <strong className="detail-val">{grp.teacher}</strong>
                    </div>
                    <div className="grp-detail-item">
                      <span className="detail-lbl">Kunlar:</span>
                      <strong className="detail-val">{grp.days}</strong>
                    </div>
                    <div className="grp-detail-item">
                      <span className="detail-lbl">Dars Vaqti:</span>
                      <strong className="detail-val">{grp.time}</strong>
                    </div>
                    <div className="grp-detail-item">
                      <span className="detail-lbl">Auditoriya / Xona:</span>
                      <strong className="detail-val">{grp.room}</strong>
                    </div>
                    <div className="grp-detail-item">
                      <span className="detail-lbl">Oylik To'lov:</span>
                      <strong className="detail-val text-blue">{grp.fee}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: SMS & BROADCAST CENTER
          ========================================================= */}
      {activeAdminTab === 'sms' && (
        <div className="admin-tab-content animate-fade-in">
          <MessagesView
            currentUser={currentUser || { id: 'usr-admin', name: 'Madina Rahimova', role: 'admin', roleLabel: 'Administrator (Admin)', avatar: '⚙️' }}
            students={students}
            language={language}
          />
        </div>
      )}

      {/* =========================================================
          TAB 5: SYSTEM LOGS
          ========================================================= */}
      {activeAdminTab === 'logs' && (
        <div className="admin-tab-content animate-fade-in">
          <div className="admin-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconShield size={20} />
                  <span>Tizim Kirishlari va Xavfsizlik Audit Loglari</span>
                </h3>
                <p className="panel-desc">
                  Barcha rollar va administratorlarning tizimdagi harakatlari jurnali
                </p>
              </div>
            </div>

            <div className="logs-table-wrapper">
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>Foydalanuvchi</th>
                    <th>Amal / Hodisa</th>
                    <th>Vaqt</th>
                    <th>IP Manzil</th>
                    <th>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="admin-table-row">
                      <td>
                        <strong className="text-dark-navy">{log.user}</strong>
                      </td>
                      <td>
                        <span className="log-action-text">{log.action}</span>
                      </td>
                      <td>
                        <span className="log-time-text">{log.timestamp}</span>
                      </td>
                      <td>
                        <span className="log-ip-code">{log.ip}</span>
                      </td>
                      <td>
                        <span className="status-pill-green">Xavfsiz</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      {showAddStudentModal && (
        <div className="director-modal-backdrop animate-fade-in">
          <div className="director-modal-card animate-pop-in">
            <div className="modal-header-line">
              <h3 className="modal-title">Yangi O'quvchini Tizimga Qo'shish</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddStudentModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="modal-form">
              <div className="form-group">
                <label className="form-label">O'quvchi F.I.Sh:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="Masalan: Shoxrux Boboyev"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Manzili:</label>
                <input
                  type="email"
                  className="radial-input"
                  placeholder="Masalan: shoxrux@edulingua.uz"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Raqami:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="+998 90 123-45-67"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biriktiriladigan Guruh:</label>
                <select
                  className="radial-select"
                  value={newStudentGroup}
                  onChange={(e) => setNewStudentGroup(e.target.value)}
                >
                  {GROUPS_LIST.filter((g) => g !== 'Barcha guruhlar').map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Boshlang'ich Til Darajasi:</label>
                <select
                  className="radial-select"
                  value={newStudentLevel}
                  onChange={(e) => setNewStudentLevel(e.target.value)}
                >
                  <option value="A1">A1 — Beginner</option>
                  <option value="A2">A2 — Elementary</option>
                  <option value="B1">B1 — Intermediate</option>
                  <option value="B2">B2 — Upper-Intermediate</option>
                  <option value="C1">C1 — Advanced</option>
                </select>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="radial-button-secondary"
                  onClick={() => setShowAddStudentModal(false)}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="radial-button-primary">
                  <IconCheck size={16} />
                  <span>O'quvchini Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GROUP */}
      {showAddGroupModal && (
        <div className="director-modal-backdrop animate-fade-in">
          <div className="director-modal-card animate-pop-in">
            <div className="modal-header-line">
              <h3 className="modal-title">Yangi Guruh Ochish</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddGroupModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="modal-form">
              <div className="form-group">
                <label className="form-label">Guruh Nomi:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="Masalan: IELTS Express Evening"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mas'ul O'qituvchi:</label>
                <select
                  className="radial-select"
                  value={newGroupTeacher}
                  onChange={(e) => setNewGroupTeacher(e.target.value)}
                >
                  <option value="Azizbek Toshmatov">Azizbek Toshmatov (IELTS Senior)</option>
                  <option value="Nigora Umarova">Nigora Umarova (General English)</option>
                  <option value="Shahnoza Ergasheva">Shahnoza Ergasheva (Beginner)</option>
                  <option value="Bobur Mirzayev">Bobur Mirzayev (Nemis/Fransuz)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dars Kunlari:</label>
                <select
                  className="radial-select"
                  value={newGroupDays}
                  onChange={(e) => setNewGroupDays(e.target.value)}
                >
                  <option value="Dush - Chor - Juma">Dush - Chor - Juma (Toq kunlar)</option>
                  <option value="Sesh - Pay - Shanba">Sesh - Pay - Shanba (Juft kunlar)</option>
                  <option value="Har kuni moslashuvchan">Har kuni (Intensiv)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dars Vaqti:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="14:00 - 16:00"
                  value={newGroupTime}
                  onChange={(e) => setNewGroupTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Auditoriya / Xona:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="Auditoriya 101"
                  value={newGroupRoom}
                  onChange={(e) => setNewGroupRoom(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Oylik Kurs Narxi:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="650,000 UZS"
                  value={newGroupFee}
                  onChange={(e) => setNewGroupFee(e.target.value)}
                />
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="radial-button-secondary"
                  onClick={() => setShowAddGroupModal(false)}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="radial-button-primary">
                  <IconCheck size={16} />
                  <span>Guruhni Ochish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE USER ACCOUNT (SUPERADMIN) */}
      {showDeleteUserModal && userToDelete && (
        <div className="delete-modal-backdrop animate-modal-backdrop">
          <div className="delete-modal-card animate-modal-spring">
            <div className="delete-modal-top-accent"></div>

            <div className="delete-modal-header">
              <div className="delete-danger-icon-circle animate-pulse-danger">
                <IconTrash size={24} />
              </div>
              <div>
                <h3 className="delete-modal-title">Foydalanuvchi Hisobini O'chirish</h3>
                <p className="delete-modal-subtitle">
                  Ushbu hisob tizimdan butunlay o'chiriladi
                </p>
              </div>
            </div>

            <div className="delete-target-preview-box">
              <span className="delete-target-avatar">{userToDelete.avatar || '👤'}</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                  {userToDelete.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '12.5px' }}>
                    @{userToDelete.username}
                  </span>
                  <span className={`role-tag-pill role-${userToDelete.role}`} style={{ fontSize: '10.5px', padding: '2px 8px' }}>
                    {userToDelete.roleLabel || userToDelete.role}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {userToDelete.email || `${userToDelete.username}@edulingua.uz`} • {userToDelete.phone || '+998 90 000-00-00'}
                </div>
              </div>
            </div>

            <div className="delete-warning-box animate-attention">
              <strong>⚠️ Diqqat, ushbu amal qaytarilmaydi!</strong>
              <div style={{ marginTop: '4px' }}>
                Foydalanuvchining login paroli, ro'yxatdan o'tgan ma'lumotlari, dars statistikasi va unga biriktirilgan barcha yozuvlar LocalStorage bazasidan butunlay o'chiriladi.
              </div>
            </div>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="radial-button-secondary"
                onClick={() => {
                  setShowDeleteUserModal(false);
                  setUserToDelete(null);
                }}
              >
                Bekor Qilish
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleConfirmDeleteUser}
              >
                <IconTrash size={16} />
                <span>Ha, Hisobni Butunlay O'chirish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER (ANY ROLE) */}
      {showAddUserModal && (
        <div className="director-modal-backdrop animate-fade-in">
          <div className="director-modal-card animate-pop-in">
            <div className="modal-header-line">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconShield size={22} className="text-blue" />
                <h3 className="modal-title">Yangi Foydalanuvchi Hisobi Ochish</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label className="form-label">Tizimdagi Roli:</label>
                <select
                  className="radial-select"
                  value={newUserRole}
                  onChange={(e) => {
                    setNewUserRole(e.target.value);
                    if (e.target.value === 'teacher') setNewUserAvatar('👨‍🏫');
                    else if (e.target.value === 'director') setNewUserAvatar('🏛️');
                    else if (e.target.value === 'admin') setNewUserAvatar('⚙️');
                    else if (e.target.value === 'superadmin') setNewUserAvatar('👑');
                    else setNewUserAvatar('👨‍🎓');
                  }}
                >
                  <option value="student">👨‍🎓 O'quvchi (Student)</option>
                  <option value="teacher">👨‍🏫 O'qituvchi (Teacher / Instructor)</option>
                  <option value="director">🏛️ Direktor (Director / Headmaster)</option>
                  <option value="admin">⚙️ Administrator (System Admin)</option>
                  <option value="superadmin">👑 Bosh Admin (Super Administrator)</option>
                </select>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">F.I.Sh (To'liq Ism):</label>
                  <input
                    type="text"
                    className="radial-input"
                    placeholder="Masalan: Sardorbek Aliyev"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Login (Username):</label>
                  <input
                    type="text"
                    className="radial-input"
                    placeholder="Masalan: sardor_al"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Parol (Kamida 4 belgi):</label>
                  <input
                    type="text"
                    className="radial-input"
                    placeholder="1234"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon Raqami:</label>
                  <input
                    type="text"
                    className="radial-input"
                    placeholder="+998 90 123-45-67"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Manzili (Ixtiyoriy):</label>
                <input
                  type="email"
                  className="radial-input"
                  placeholder="masalan: sardor@edulingua.uz"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              {newUserRole === 'student' && (
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Guruh:</label>
                    <select
                      className="radial-select"
                      value={newUserGroup}
                      onChange={(e) => setNewUserGroup(e.target.value)}
                    >
                      {GROUPS_LIST.filter((g) => g !== 'Barcha guruhlar').map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Daraja:</label>
                    <select
                      className="radial-select"
                      value={newUserLevel}
                      onChange={(e) => setNewUserLevel(e.target.value)}
                    >
                      <option value="A1">A1 — Beginner</option>
                      <option value="A2">A2 — Elementary</option>
                      <option value="B1">B1 — Intermediate</option>
                      <option value="B2">B2 — Upper-Intermediate</option>
                      <option value="C1">C1 — Advanced</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="radial-button-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="radial-button-primary animate-btn-pop">
                  <IconCheck size={16} />
                  <span>Hisobni Yaratish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
