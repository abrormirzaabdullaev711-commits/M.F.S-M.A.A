import React from 'react';
import { 
  IconUsers, 
  IconCalendar, 
  IconAward, 
  IconBook, 
  IconSparkles, 
  IconTrendingUp, 
  IconUserCheck,
  IconClock,
  IconBot,
  IconGlobe,
  IconFlame
} from './Icons';

export const DashboardView = ({ 
  students, 
  savedWords, 
  onNavigateTab, 
  onConsultAgentWithStudent 
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate statistics
  const totalStudents = students.length;
  
  let todayPresent = 0;
  let todayAbsent = 0;
  let todayLate = 0;

  students.forEach((std) => {
    const st = std.attendance?.[todayStr];
    if (st === 'present') todayPresent++;
    else if (st === 'absent') todayAbsent++;
    else if (st === 'late') todayLate++;
  });

  const attendanceRate = totalStudents > 0 
    ? Math.round((todayPresent / totalStudents) * 100) 
    : 100;

  // Calculate average score across all students
  let totalScoreSum = 0;
  let totalScoreCount = 0;
  const allGrades = [];

  students.forEach((std) => {
    (std.grades || []).forEach((g) => {
      totalScoreSum += (g.score || 0);
      totalScoreCount++;
      allGrades.push({
        ...g,
        studentName: std.name,
        studentAvatar: std.avatar,
        studentGroup: std.group
      });
    });
  });

  const averageGPA = totalScoreCount > 0 
    ? Math.round(totalScoreSum / totalScoreCount) 
    : 88;

  allGrades.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentGrades = allGrades.slice(0, 5);

  // Top Student
  const studentRankings = students.map((std) => {
    const grades = std.grades || [];
    const avg = grades.length > 0 
      ? Math.round(grades.reduce((a, b) => a + (b.score || 0), 0) / grades.length) 
      : 0;
    return { ...std, avgScore: avg };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const topStudent = studentRankings[0] || null;

  return (
    <div className="dashboard-view-wrapper">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <IconSparkles size={16} /> Aqlli O'quv & Boshqaruv Markazi
          </div>
          <h1 className="hero-title">
            Xush kelibsiz! Ta'lim, Til va AI Agentlar Boshqaruvi
          </h1>
          <p className="hero-desc">
            Ko'p tilli lug'at qidiruvi, real-vaqt davomati (Bor/Yo'q), ko'p parametrli baholash 
            va 4 ta ixtisoslashgan AI agentlar bir joyda.
          </p>

          <div className="hero-quick-buttons">
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => onNavigateTab('dictionary')}
            >
              <IconBook size={18} />
              <span>Lug'atda So'z Qidirish</span>
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => onNavigateTab('timer-todo')}
            >
              <IconClock size={18} />
              <span>⏱️ Dars Taymeri & Rejalar</span>
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => onNavigateTab('attendance')}
            >
              <IconUserCheck size={18} />
              <span>Davomat (Bor/Yo'q)</span>
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => onNavigateTab('agents')}
            >
              <IconBot size={18} />
              <span>AI Agentlar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="dashboard-kpi-grid">
        <div className="dash-kpi-card" onClick={() => onNavigateTab('students')}>
          <div className="kpi-icon-wrap icon-blue">
            <IconUsers size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Jami O'quvchilar</span>
            <strong className="kpi-val">{totalStudents} nafar</strong>
            <span className="kpi-hint">3 ta faol guruh</span>
          </div>
        </div>

        <div className="dash-kpi-card" onClick={() => onNavigateTab('attendance')}>
          <div className="kpi-icon-wrap icon-green">
            <IconCalendar size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Bugungi Davomat</span>
            <strong className="kpi-val text-green">{attendanceRate}%</strong>
            <span className="kpi-hint">{todayPresent} bor / {todayAbsent} yo'q</span>
          </div>
        </div>

        <div className="dash-kpi-card" onClick={() => onNavigateTab('grading')}>
          <div className="kpi-icon-wrap icon-purple">
            <IconAward size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">O'rtacha O'zlashtirish</span>
            <strong className="kpi-val text-purple">{averageGPA} / 100</strong>
            <span className="kpi-hint">{totalScoreCount} ta umumiy baho</span>
          </div>
        </div>

        <div className="dash-kpi-card" onClick={() => onNavigateTab('dictionary')}>
          <div className="kpi-icon-wrap icon-orange">
            <IconGlobe size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Saqlangan So'zlar</span>
            <strong className="kpi-val text-orange">{savedWords.length} ta</strong>
            <span className="kpi-hint">11 ta til lug'ati</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content: Left (AI Insights & Top Student), Right (Recent Activity) */}
      <div className="dashboard-grid-2col">
        {/* Left: AI Advisor Widget & Top Student */}
        <div className="dash-col-left">
          {/* AI Advisor Box */}
          <div className="dash-ai-advisor-card">
            <div className="advisor-header">
              <div className="advisor-title-row">
                <span className="advisor-avatar">📊</span>
                <div>
                  <h4>AI Tahlil Agenti Kundalik Maslahati</h4>
                  <span className="advisor-sub">Avtomatlashtirilgan pedagogik tahlil</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-accent-glow btn-sm"
                onClick={() => onNavigateTab('agents')}
              >
                Agentga o'tish ➔
              </button>
            </div>

            <div className="advisor-body">
              <p>
                💡 <strong>Bugungi tavsiya:</strong> O'quvchilar davomati {attendanceRate}% darajasida. 
                Lug'at boyligini mustahkamlash uchun dars boshida <em>"Resilient"</em> va <em>"Serendipity"</em> so'zlari 
                bo'yicha tezkor Kviz o'tkazish tavsiya etiladi.
              </p>
            </div>
          </div>

          {/* Top Performer Card */}
          {topStudent && (
            <div className="dash-top-student-card">
              <div className="top-std-header">
                <IconFlame size={22} className="text-orange" />
                <h4>Haftaning Yetakchi O'quvchisi</h4>
              </div>
              <div className="top-std-body">
                <span className="top-std-big-avatar">{topStudent.avatar}</span>
                <div className="top-std-info">
                  <h3>{topStudent.name}</h3>
                  <span className="top-std-group">{topStudent.group}</span>
                  <div className="top-std-stats-row">
                    <span>O'rtacha ball: <strong>{topStudent.avgScore}</strong></span>
                    <span>Daraja: <strong>{topStudent.level}</strong></span>
                    <span>Yutuq: <strong>{topStudent.badge}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent Grades Log */}
        <div className="dash-col-right">
          <div className="dash-recent-grades-card">
            <div className="recent-grades-header">
              <div className="recent-title-wrap">
                <IconAward size={20} className="text-accent" />
                <h4>So'nggi Baholash Natijalari</h4>
              </div>
              <button 
                type="button" 
                className="btn-link"
                onClick={() => onNavigateTab('grading')}
              >
                Barchasini ko'rish
              </button>
            </div>

            <div className="recent-grades-list">
              {recentGrades.length === 0 ? (
                <p className="empty-sub-text">Hozircha baholar yo'q.</p>
              ) : (
                recentGrades.map((rg) => (
                  <div key={rg.id} className="recent-grade-item">
                    <span className="rg-avatar">{rg.studentAvatar}</span>
                    <div className="rg-meta">
                      <strong>{rg.studentName}</strong>
                      <span>{rg.subject}</span>
                    </div>
                    <div className="rg-score-badge">
                      <strong>{rg.percentage !== undefined ? `${rg.percentage}%` : `${rg.score}/${rg.maxScore}`}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
