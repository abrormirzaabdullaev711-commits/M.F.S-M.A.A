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
  updateUserRoleInStorage 
} from '../services/storage';
import { GROUPS_LIST, ADMIN_DATA } from '../data/mockData';

export const AdminView = ({ 
  students = [], 
  onAddStudent, 
  onDeleteStudent,
  currentUser 
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState('users-roles'); // 'users-roles', 'students', 'groups', 'sms', 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('Barcha guruhlar');

  // Dynamic Users & Role Management state
  const [usersList, setUsersList] = useState(getStoredUsers);
  const [userRoleToast, setUserRoleToast] = useState('');

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
      user: `${currentUser?.name || 'Admin'}`,
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
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery))
    );
  });

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
              <span>Boshqaruv & Rollar Nazorati</span>
            </div>
            <h1 className="admin-title">Tizim Administratori Paneli</h1>
            <p className="admin-subtext">
              Foydalanuvchilar va rollarni boshqarish (O'quvchi, O'qituvchi, Direktor, Admin), dars jadvallari va SMS markazi
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="radial-button-secondary"
            onClick={handleExportBackup}
            title="Barcha ma'lumotlarni JSON zaxirada yuklab olish"
          >
            <span>💾 Zaxira Nusxa (Backup)</span>
          </button>
        </div>
      </div>

      {/* Role Change Toast Alert */}
      {userRoleToast && (
        <div className="login-success-alert animate-pop-in">
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
          <span className="tab-pill-count">{usersList.length}</span>
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
          TAB 1: USERS & ROLE ASSIGNMENT (O'QUVCHINI O'QITUVCHI / DIREKTOR / ADMIN QILISH)
          ========================================================= */}
      {activeAdminTab === 'users-roles' && (
        <div className="admin-tab-content animate-fade-in">
          <div className="admin-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconShield size={20} />
                  <span>Foydalanuvchilar Rollari va Huquqlarini Boshqarish</span>
                </h3>
                <p className="panel-desc">
                  Administrator va Bosh Admin istalgan foydalanuvchi/o'quvchi rolini O'qituvchi, Direktor yoki Adminga o'zgartirishi mumkin
                </p>
              </div>
            </div>

            {/* Search toolbar */}
            <div className="admin-toolbar-row">
              <div className="search-input-wrap">
                <IconSearch size={18} className="search-icon" />
                <input
                  type="text"
                  className="radial-input search-input"
                  placeholder="Foydalanuvchi ismi, login yoki telefoni bo'yicha qidirish..."
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
                    <th>Rolni O'zgartirish (Tezkor Tayinlash)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((usr) => {
                    const displayId = (usr.studentId || usr.id || '').toUpperCase();
                    return (
                      <tr key={usr.id} className="admin-table-row">
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
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-mono-code text-blue-900 font-semibold">@{usr.username}</div>
                          <div className="text-xs text-blue-600 font-sans">{usr.email || `${usr.username}@edulingua.uz`}</div>
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
                      </tr>
                    );
                  })}
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
          <div className="admin-two-col-layout">
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3 className="panel-title">
                  <IconSend size={20} />
                  <span>Tezkor SMS & Xabarnoma Yuborish</span>
                </h3>
              </div>

              {smsSentSuccess && (
                <div className="sms-success-banner animate-fade-in">
                  <IconCheckCircle size={18} />
                  <span>Xabarnoma barcha qabul qiluvchilarga muvaffaqiyatli jo'natildi!</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcastSms} className="sms-compose-form">
                <div className="form-group">
                  <label className="form-label">Kimga Yuborilsin?</label>
                  <select
                    className="radial-select"
                    value={smsRecipientType}
                    onChange={(e) => setSmsRecipientType(e.target.value)}
                  >
                    <option value="all">Barcha O'quvchilarga ({students.length} nafar)</option>
                    <option value="group">Alohida Bir Guruhga</option>
                    <option value="debtors">To'lov Eslatmasi Kutilayotganlarga</option>
                  </select>
                </div>

                {smsRecipientType === 'group' && (
                  <div className="form-group">
                    <label className="form-label">Guruhni Tanlang:</label>
                    <select
                      className="radial-select"
                      value={smsTargetGroup}
                      onChange={(e) => setSmsTargetGroup(e.target.value)}
                    >
                      {GROUPS_LIST.filter((g) => g !== 'Barcha guruhlar').map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tayyor SMS Shablonlari:</label>
                  <div className="sms-template-chips">
                    {ADMIN_DATA.broadcastTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        className="radial-button-secondary py-1 px-2 text-xs"
                        onClick={() => setSmsMessageText(tpl.text)}
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">SMS Matni:</label>
                  <textarea
                    rows={4}
                    className="radial-textarea"
                    value={smsMessageText}
                    onChange={(e) => setSmsMessageText(e.target.value)}
                    placeholder="Xabarnoma matnini kiriting..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="radial-button-primary w-full">
                  <IconSend size={18} />
                  <span>Ommaviy SMS Yuborish</span>
                </button>
              </form>
            </div>

            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3 className="panel-title">
                  <IconClock size={20} />
                  <span>Yuborilgan Xabarnomalar Jurnali</span>
                </h3>
              </div>

              <div className="sms-history-list">
                {smsHistory.map((item) => (
                  <div key={item.id} className="sms-history-card">
                    <div className="sms-history-header">
                      <strong className="sms-recipient">{item.recipient}</strong>
                      <span className="sms-time">{item.sentAt}</span>
                    </div>
                    <p className="sms-text">{item.text}</p>
                    <div className="sms-status-line">
                      <IconCheckCircle size={14} className="text-green" />
                      <span>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
    </div>
  );
};
