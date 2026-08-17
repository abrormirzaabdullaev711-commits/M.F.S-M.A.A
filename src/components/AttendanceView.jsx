import React, { useState } from 'react';
import { GROUPS_LIST } from '../data/mockData';
import { 
  IconCalendar, 
  IconUserCheck, 
  IconUserX, 
  IconClock, 
  IconAlertCircle, 
  IconCheck, 
  IconRefresh,
  IconSparkles,
  IconGlobe
} from './Icons';

export const AttendanceView = ({ 
  students, 
  onUpdateAttendance, 
  onMarkAllPresent 
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedGroup, setSelectedGroup] = useState('Barcha guruhlar');
  const [exportNotice, setExportNotice] = useState('');

  // Filter students based on group
  const filteredStudents = students.filter(
    std => selectedGroup === 'Barcha guruhlar' || std.group === selectedGroup
  );

  // Compute daily attendance counts
  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;
  let lateCount = 0;
  let unmarkedCount = 0;

  filteredStudents.forEach(std => {
    const status = std.attendance?.[selectedDate];
    if (status === 'present') presentCount++;
    else if (status === 'absent') absentCount++;
    else if (status === 'excused') excusedCount++;
    else if (status === 'late') lateCount++;
    else unmarkedCount++;
  });

  const total = filteredStudents.length || 1;
  const presentRate = Math.round((presentCount / total) * 100);

  const handleStatusChange = (studentId, newStatus) => {
    onUpdateAttendance(studentId, selectedDate, newStatus);
  };

  const handleExportSummary = () => {
    let summary = `📋 DAVOMAT HISOBOTI (${selectedDate})\n`;
    summary += `Guruh: ${selectedGroup}\n`;
    summary += `Jami o'quvchilar: ${filteredStudents.length} nafar\n`;
    summary += `🟢 Bor: ${presentCount} (${presentRate}%)\n`;
    summary += `🔴 Yo'q: ${absentCount}\n`;
    summary += `🟡 Sababli: ${excusedCount}\n`;
    summary += `🟠 Kechikkan: ${lateCount}\n\n`;
    summary += `Ro'yxat:\n`;
    
    filteredStudents.forEach((std, idx) => {
      const st = std.attendance?.[selectedDate] || 'Belgilanmagan';
      summary += `${idx + 1}. ${std.name} (${std.group}) — [${st.toUpperCase()}]\n`;
    });

    navigator.clipboard.writeText(summary);
    setExportNotice("Davomat hisoboti buferga (clipboard) nusxalandi!");
    setTimeout(() => setExportNotice(''), 3000);
  };

  return (
    <div className="attendance-view-wrapper">
      {/* Header */}
      <div className="section-header-box">
        <div className="header-info">
          <div className="header-badge">
            <IconCalendar size={16} /> Davomat Nazorati (Bor / Yo'q)
          </div>
          <h2>Kunlik va Guruhlar Kesimidagi Davomat Tizimi</h2>
          <p>
            O'quvchilarning darsdagi ishtirokini "Bor", "Yo'q", "Sababli" va "Kechikkan" holatlarida bitta tugma bilan 
            tezkor belgilang va real-vaqt statistikasini kuzating.
          </p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn-success-action"
            onClick={() => onMarkAllPresent(selectedDate, selectedGroup)}
          >
            <IconCheck size={18} />
            <span>Barchasini BOR Qilish</span>
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={handleExportSummary}
          >
            Hisobotni Nusxalash
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="toast-banner-inline">
          <IconCheck size={18} /> {exportNotice}
        </div>
      )}

      {/* Control Bar: Date Selector & Group Filter */}
      <div className="attendance-controls-bar">
        <div className="att-date-picker-group">
          <label className="ctrl-label">
            <IconCalendar size={18} /> Davomat Sanasi:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input-field"
          />
          {selectedDate === todayStr && (
            <span className="today-pill">Bugun</span>
          )}
        </div>

        <div className="att-group-selector">
          <label className="ctrl-label">Guruh:</label>
          <div className="group-chips-scroll">
            {GROUPS_LIST.map((grp) => (
              <button
                key={grp}
                type="button"
                className={`group-chip-btn ${selectedGroup === grp ? 'active' : ''}`}
                onClick={() => setSelectedGroup(grp)}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="attendance-kpi-grid">
        <div className="kpi-card kpi-total">
          <span className="kpi-label">Jami O'quvchilar</span>
          <strong className="kpi-number">{filteredStudents.length}</strong>
          <span className="kpi-sub">Tanlangan guruhda</span>
        </div>

        <div className="kpi-card kpi-present">
          <span className="kpi-label">🟢 Bor (Present)</span>
          <strong className="kpi-number text-green">{presentCount}</strong>
          <span className="kpi-sub">{presentRate}% ishtirok</span>
        </div>

        <div className="kpi-card kpi-absent">
          <span className="kpi-label">🔴 Yo'q (Absent)</span>
          <strong className="kpi-number text-red">{absentCount}</strong>
          <span className="kpi-sub">Darsga kelmaganlar</span>
        </div>

        <div className="kpi-card kpi-excused">
          <span className="kpi-label">🟡 Sababli (Excused)</span>
          <strong className="kpi-number text-orange">{excusedCount}</strong>
          <span className="kpi-sub">Sababli qoldirgan</span>
        </div>

        <div className="kpi-card kpi-late">
          <span className="kpi-label">🟠 Kechikkan (Late)</span>
          <strong className="kpi-number text-purple">{lateCount}</strong>
          <span className="kpi-sub">Kechikib kelgan</span>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="attendance-progress-container">
        <div className="progress-bar-wrapper">
          <div 
            className="prog-segment seg-present" 
            style={{ width: `${(presentCount / total) * 100}%` }}
            title={`Bor: ${presentCount}`}
          />
          <div 
            className="prog-segment seg-late" 
            style={{ width: `${(lateCount / total) * 100}%` }}
            title={`Kechikkan: ${lateCount}`}
          />
          <div 
            className="prog-segment seg-excused" 
            style={{ width: `${(excusedCount / total) * 100}%` }}
            title={`Sababli: ${excusedCount}`}
          />
          <div 
            className="prog-segment seg-absent" 
            style={{ width: `${(absentCount / total) * 100}%` }}
            title={`Yo'q: ${absentCount}`}
          />
        </div>
      </div>

      {/* Attendance Interactive List */}
      <div className="attendance-table-card">
        <div className="att-table-header-row">
          <div className="col-student-info">O'quvchi (Ism, Guruh, Daraja)</div>
          <div className="col-status-buttons">Davomat Holatini Belgilash (1 ta bosishda)</div>
        </div>

        <div className="att-students-list">
          {filteredStudents.length === 0 ? (
            <div className="empty-sub-text text-center py-6">
              Tanlangan guruhda o'quvchilar mavjud emas.
            </div>
          ) : (
            filteredStudents.map((std, idx) => {
              const currentStatus = std.attendance?.[selectedDate] || 'unmarked';

              return (
                <div key={std.id} className="att-student-row">
                  <div className="att-student-meta">
                    <span className="att-idx-num">{idx + 1}</span>
                    <span className="att-avatar-circle">{std.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="att-std-name">{std.name}</h4>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-white font-mono font-bold">
                          {std.id.toUpperCase()}
                        </span>
                      </div>
                      <span className="att-std-group">{std.group} • {std.level}</span>
                    </div>
                  </div>

                  {/* 4 Interactive Status Buttons */}
                  <div className="att-actions-group">
                    <button
                      type="button"
                      className={`btn-att-toggle btn-present ${currentStatus === 'present' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(std.id, 'present')}
                    >
                      <IconUserCheck size={16} />
                      <span>BOR</span>
                    </button>

                    <button
                      type="button"
                      className={`btn-att-toggle btn-absent ${currentStatus === 'absent' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(std.id, 'absent')}
                    >
                      <IconUserX size={16} />
                      <span>YO'Q</span>
                    </button>

                    <button
                      type="button"
                      className={`btn-att-toggle btn-excused ${currentStatus === 'excused' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(std.id, 'excused')}
                    >
                      <IconAlertCircle size={16} />
                      <span>SABABLI</span>
                    </button>

                    <button
                      type="button"
                      className={`btn-att-toggle btn-late ${currentStatus === 'late' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(std.id, 'late')}
                    >
                      <IconClock size={16} />
                      <span>KECHIKDI</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
