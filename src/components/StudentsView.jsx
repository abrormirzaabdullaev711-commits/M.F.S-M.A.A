import React, { useState } from 'react';
import { GROUPS_LIST } from '../data/mockData';
import { 
  IconUsers, 
  IconPlus, 
  IconSearch, 
  IconUserCheck, 
  IconAward, 
  IconTrash, 
  IconSparkles, 
  IconCalendar,
  IconClock,
  IconUserX,
  IconCheck,
  IconFlame,
  IconBook
} from './Icons';

export const StudentsView = ({ 
  students, 
  onAddStudent, 
  onDeleteStudent, 
  onNavigateToGrading,
  onNavigateToAttendance,
  onConsultAgentWithStudent 
}) => {
  const [selectedGroup, setSelectedGroup] = useState('Barcha guruhlar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGroup, setNewGroup] = useState('IELTS Mastery (B2-C1)');
  const [newLevel, setNewLevel] = useState('B1');
  const [newPhone, setNewPhone] = useState('+998 90 ');
  const [newAvatar, setNewAvatar] = useState('👨‍🎓');

  const avatarOptions = ['👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '👨‍🏫', '👩‍🏫', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨'];
  const levelOptions = ['A1 (Boshlang\'ich)', 'A2 (Elementary)', 'B1 (O\'rta)', 'B2 (Yuqori o\'rta)', 'C1 (Ilg\'or)', 'C2 (Mukammal)'];

  // Filter students
  const filteredStudents = students.filter((std) => {
    const matchesGroup = selectedGroup === 'Barcha guruhlar' || std.group === selectedGroup;
    const matchesSearch = std.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          std.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          std.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const stdNumber = students.length + 101;
    const newStudentId = `std-${stdNumber}`;
    const newUserId = `usr-std-${stdNumber}`;
    const username = newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || `student_${stdNumber}`;
    const email = newEmail.trim() || `${username}@edulingua.uz`;

    const newStudent = {
      id: newStudentId,
      name: newName.trim(),
      email: email,
      group: newGroup,
      level: newLevel.split(' ')[0],
      phone: newPhone,
      avatar: newAvatar,
      color: '#3b82f6',
      enrolledDate: new Date().toISOString().split('T')[0],
      attendance: {
        [new Date().toISOString().split('T')[0]]: 'present'
      },
      grades: [],
      vocabCount: 0,
      badge: 'Yangi O\'quvchi 🌱'
    };

    onAddStudent(newStudent);
    setNewName('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  const calculateStudentStats = (std) => {
    const attList = Object.values(std.attendance || {});
    const totalDays = attList.length || 0;
    const presentDays = attList.filter(s => s === 'present').length;
    const absentDays = attList.filter(s => s === 'absent').length;
    const excusedDays = attList.filter(s => s === 'excused').length;
    const lateDays = attList.filter(s => s === 'late').length;
    const attPercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const grades = std.grades || [];
    const avgScore = grades.length > 0
      ? Math.round(grades.reduce((acc, g) => acc + (g.score || 0), 0) / grades.length)
      : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      excusedDays,
      lateDays,
      attPercentage,
      avgScore,
      gradesCount: grades.length
    };
  };

  return (
    <div className="students-view-wrapper">
      {/* Header Banner */}
      <div className="section-header-box">
        <div className="header-info">
          <div className="header-badge">
            <IconUsers size={16} /> O'quvchilar Boshqaruvi
          </div>
          <h2>O'quvchilar ro'yxati, davomat va individual ko'rsatkichlar</h2>
          <p>
            Yangi o'quvchi qo'shing, ularning darajasi va guruhini belgilang, davomatini kuzatib boring hamda 
            AI agent yordamida har bir o'quvchiga individual tavsiyalar oling.
          </p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <IconPlus size={18} />
            <span>Yangi O'quvchi Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="students-toolbar-card">
        <div className="toolbar-search">
          <IconSearch size={18} className="search-icon-inside" />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki guruhi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-input"
          />
        </div>

        <div className="group-filters-row">
          {GROUPS_LIST.map((grp) => (
            <button
              key={grp}
              type="button"
              className={`group-filter-btn ${selectedGroup === grp ? 'active' : ''}`}
              onClick={() => setSelectedGroup(grp)}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Students Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="empty-state-box">
          <IconUsers size={48} className="text-muted" />
          <h3>O'quvchi topilmadi</h3>
          <p>Qidiruv so'rovini o'zgartiring yoki yangi o'quvchi qo'shing.</p>
        </div>
      ) : (
        <div className="students-cards-grid">
          {filteredStudents.map((student) => {
            const stats = calculateStudentStats(student);
            
            return (
              <div key={student.id} className="student-profile-card">
                {/* Top Info */}
                <div className="student-card-top">
                  <div className="student-avatar-wrap">
                    <span className="student-emoji-avatar">{student.avatar}</span>
                    <span className="student-level-chip">{student.level}</span>
                  </div>
                  <div className="student-identity">
                    <div className="flex items-center gap-2">
                      <h3 className="student-fullname">{student.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-white font-mono font-bold">
                        {student.id.toUpperCase()}
                      </span>
                    </div>
                    <span className="student-group-name">{student.group}</span>
                    <div className="text-xs text-blue-700 font-sans mt-0.5">
                      📧 {student.email || `${student.name.toLowerCase().replace(/\s+/g, '')}@edulingua.uz`}
                    </div>
                    {student.badge && (
                      <span className="student-badge-pill mt-1">{student.badge}</span>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="student-stats-row">
                  <div className="student-stat-item">
                    <span className="stat-label">Davomati:</span>
                    <span className={`stat-value ${stats.attPercentage >= 80 ? 'text-green' : stats.attPercentage >= 65 ? 'text-orange' : 'text-red'}`}>
                      {stats.attPercentage}%
                    </span>
                  </div>

                  <div className="student-stat-item">
                    <span className="stat-label">O'rtacha Ball:</span>
                    <span className="stat-value text-accent">
                      {stats.avgScore > 0 ? `${stats.avgScore}/100` : '—'}
                    </span>
                  </div>

                  <div className="student-stat-item">
                    <span className="stat-label">Baholar soni:</span>
                    <span className="stat-value text-main">
                      {stats.gradesCount} ta
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="student-card-actions">
                  <button
                    type="button"
                    className="btn-card-action btn-action-profile"
                    onClick={() => setSelectedStudentForModal(student)}
                  >
                    Batafsil Profil
                  </button>

                  <button
                    type="button"
                    className="btn-card-action btn-action-grade"
                    onClick={() => onNavigateToGrading(student.id)}
                    title="Ushbu o'quvchini baholash"
                  >
                    <IconAward size={15} /> Baholash
                  </button>

                  <button
                    type="button"
                    className="btn-card-action btn-action-att"
                    onClick={() => onNavigateToAttendance(student.id)}
                    title="Davomatga o'tish"
                  >
                    <IconUserCheck size={15} /> Bor/Yo'q
                  </button>

                  <button
                    type="button"
                    className="btn-card-action btn-action-delete"
                    onClick={() => {
                      if (window.confirm(`"${student.name}"ni ro'yxatdan o'chirmoqchimisiz?`)) {
                        onDeleteStudent(student.id);
                      }
                    }}
                    title="O'quvchini o'chirish"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Student */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <IconPlus size={22} className="text-accent" />
                <h3>Yangi O'quvchi Qo'shish</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="modal-form">
              <div className="form-group">
                <label>F.I.O (Ism va Familiya):</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Abdulloh Mahmudov"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Email Manzili:</label>
                <input
                  type="email"
                  placeholder="Masalan: abdulloh@edulingua.uz"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label>Guruh:</label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="modal-select"
                  >
                    {GROUPS_LIST.filter(g => g !== 'Barcha guruhlar').map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Til Darajasi:</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="modal-select"
                  >
                    {levelOptions.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Telefon raqam / Bog'lanish:</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Avatar / Emotsiya:</label>
                <div className="avatar-pick-row">
                  {avatarOptions.map(av => (
                    <button
                      key={av}
                      type="button"
                      className={`avatar-pick-btn ${newAvatar === av ? 'selected' : ''}`}
                      onClick={() => setNewAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions-row">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  O'quvchini Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detailed Student Profile */}
      {selectedStudentForModal && (() => {
        const stats = calculateStudentStats(selectedStudentForModal);
        const attEntries = Object.entries(selectedStudentForModal.attendance || {}).reverse();
        const gradesList = (selectedStudentForModal.grades || []).slice().reverse();

        return (
          <div className="modal-overlay" onClick={() => setSelectedStudentForModal(null)}>
            <div className="modal-content-card modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="student-profile-header-info">
                  <span className="profile-large-avatar">{selectedStudentForModal.avatar}</span>
                  <div>
                    <h2>{selectedStudentForModal.name}</h2>
                    <span className="profile-subtitle">
                      {selectedStudentForModal.group} • Daraja: <strong>{selectedStudentForModal.level}</strong>
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="modal-close-btn"
                  onClick={() => setSelectedStudentForModal(null)}
                >
                  ✕
                </button>
              </div>

              {/* Quick Stat Badges */}
              <div className="profile-summary-cards">
                <div className="prof-stat-box">
                  <span className="prof-label">Davomat Foizi:</span>
                  <strong className={stats.attPercentage >= 80 ? 'text-green' : 'text-orange'}>
                    {stats.attPercentage}%
                  </strong>
                  <small>{stats.presentDays} kun bor / {stats.totalDays} kun</small>
                </div>

                <div className="prof-stat-box">
                  <span className="prof-label">O'rtacha Ball:</span>
                  <strong className="text-accent">{stats.avgScore > 0 ? `${stats.avgScore}/100` : '—'}</strong>
                  <small>{stats.gradesCount} ta baholash</small>
                </div>

                <div className="prof-stat-box">
                  <span className="prof-label">Telefon:</span>
                  <strong>{selectedStudentForModal.phone || 'Mavjud emas'}</strong>
                  <small>Ro'yxatdan o'tgan: {selectedStudentForModal.enrolledDate}</small>
                </div>
              </div>

              {/* AI Diagnosis CTA */}
              <div className="student-ai-diagnosis-banner">
                <div className="ai-diag-text">
                  <IconSparkles size={20} className="text-accent" />
                  <div>
                    <strong>AI Maslahatchi Tahlili</strong>
                    <p>Ushbu o'quvchining davomat va baholari asosida individual o'qitish strategiyasini oling.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-accent-glow"
                  onClick={() => {
                    const std = selectedStudentForModal;
                    setSelectedStudentForModal(null);
                    onConsultAgentWithStudent(std);
                  }}
                >
                  AI Tahlilini Ko'rish ➔
                </button>
              </div>

              {/* Tabs inside modal: Attendance History & Grades */}
              <div className="modal-sections-grid">
                {/* Attendance History */}
                <div className="modal-sub-section">
                  <h4 className="sub-title">
                    <IconCalendar size={18} /> Davomat Tarixi
                  </h4>
                  <div className="history-scroll-list">
                    {attEntries.length === 0 ? (
                      <p className="empty-sub-text">Hozircha davomat qaydlari yo'q.</p>
                    ) : (
                      attEntries.map(([date, status]) => (
                        <div key={date} className="history-row-item">
                          <span className="history-date">{date}</span>
                          <span className={`status-pill status-${status}`}>
                            {status === 'present' && '🟢 BOR'}
                            {status === 'absent' && '🔴 YO\'Q'}
                            {status === 'excused' && '🟡 SABABLI'}
                            {status === 'late' && '🟠 KECHIKDI'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Grades History */}
                <div className="modal-sub-section">
                  <h4 className="sub-title">
                    <IconAward size={18} /> Baholar Jurnali
                  </h4>
                  <div className="history-scroll-list">
                    {gradesList.length === 0 ? (
                      <p className="empty-sub-text">Hozircha baholar qo'yilmagan.</p>
                    ) : (
                      gradesList.map((g) => (
                        <div key={g.id} className="grade-history-card">
                          <div className="grade-hist-top">
                            <strong>{g.subject}</strong>
                            <span className="grade-score-pill">
                              {g.percentage !== undefined ? `${g.percentage}%` : `${g.score}/${g.maxScore || 100}`}
                            </span>
                          </div>
                          {g.sections && g.sections.length > 0 && (
                            <div className="gb-sections-badges-row mt-1">
                              {g.sections.map((sec, sIdx) => (
                                <span key={sIdx} className="gb-sec-badge">
                                  <strong>{sec.name}:</strong> {sec.score}/{sec.maxScore} ({sec.percentage}%)
                                </span>
                              ))}
                            </div>
                          )}
                          {g.bandScore && <span className="text-xs text-accent font-semibold">🎓 {g.bandScore}</span>}
                          {g.note && <p className="grade-hist-note">💬 {g.note}</p>}
                          <small className="grade-hist-date">{g.date}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
