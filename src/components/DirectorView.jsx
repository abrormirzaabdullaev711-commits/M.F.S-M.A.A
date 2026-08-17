import React, { useState } from 'react';
import { 
  IconBuilding, 
  IconDollarSign, 
  IconUsers, 
  IconAward, 
  IconTrendingUp, 
  IconCalendar, 
  IconSparkles, 
  IconCheckCircle, 
  IconPrinter, 
  IconBot, 
  IconSend, 
  IconFlame, 
  IconBarChart,
  IconShield,
  IconBriefcase
} from './Icons';
import { DIRECTOR_DATA } from '../data/mockData';

export const DirectorView = ({ students = [], savedWords = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, teachers, groups, ai-advisor, reports
  const [selectedMonth, setSelectedMonth] = useState('Avgust');
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Assalomu alaykum, Hurmatli Direktor Dr. Rustam Karimov! Men sizning Strategik Boshqaruv AI Maslahatchisiman. Markazning oylik daromadi, o'qituvchilar KPI ko'rsatkichlari yoki guruhlar kengayishi bo'yicha qanday tahlil kerak?",
      time: '15:30'
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState(null);

  // Stats calculation
  const totalStudentsCount = students.length || DIRECTOR_DATA.kpis.totalStudents;
  const activeTeachers = DIRECTOR_DATA.teachersList;

  // AI Chat submission
  const handleSendAiPrompt = async (customPrompt) => {
    const query = customPrompt || aiInputText;
    if (!query.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setAiInputText('');
    setIsAiThinking(true);

    setTimeout(() => {
      let aiResponseText = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('daromad') || qLower.includes('moliya') || qLower.includes('pul') || qLower.includes('tushum')) {
        aiResponseText = `💰 **Moliyaviy Tahlil & Prognoz:**\n\n• Avgust oyi kutilgan tushum: **68,400,000 UZS**\n• Yig'ilgan faktik summa: **59,200,000 UZS (86.5%)**\n• Qarzdorlik / Kutilayotgan: **9,200,000 UZS**\n\n💡 **Strategik Tavsiya:** O'quvchilarga to'lovlar bo'yicha SMS eslatmalarni 18-20 sanalarda yuborish oylik tushumni 97% ga yetkazadi.`;
      } else if (qLower.includes('kpi') || qLower.includes('oqituvchi') || qLower.includes('ustoz') || qLower.includes('xodim')) {
        aiResponseText = `👨‍🏫 **O'qituvchilar KPI & Samaradorlik Auditi:**\n\n• Eng yuqori KPI ko'rsatkichi: **Azizbek Toshmatov (96 ball)** — IELTS Mastery guruhlari o'zlashtirishi 88.5%\n• Shahnoza Ergasheva (94 ball) — Davomat 95.0%\n\n💡 **Tavsiya:** O'qituvchilar uchun 15% oylik mukofot fondini tasdiqlash xodimlar sadoqatini 98% ga oshiradi.`;
      } else if (qLower.includes('guruh') || qLower.includes('kengaytirish') || qLower.includes('yangi')) {
        aiResponseText = `📈 **Guruhlar Kengayishi & Yangi Yo'nalishlar:**\n\n• IELTS kurslariga talab 28% ga o'sdi.\n• VIP Speaking Pro individual darslarida bo'sh o'rin qolmagan (100% band).\n\n💡 **Tavsiya:** Toq kunlar soat 16:30 ga yangi "IELTS Express 7.0+" guruhini ochish qo'shimcha 12,000,000 UZS oylik sof foyda keltiradi.`;
      } else {
        aiResponseText = `🏛️ **Boshqaruv Tahlili:**\n\nSizning so'rovingiz: "${query}"\n\nO'quv markazimizning asosiy 3 ta ustuni a'lo darajada:\n1. O'quvchilar umumiy davomati: **94.6%**\n2. O'rtacha imtihon ko'rsatkichi: **86.8% (A / Band 7.5)**\n3. Mijozlarni saqlab qolish (Retention): **97.2%**\n\nBarcha jarayonlar barqaror va o'sish tendentsiyasida davom etmoqda.`;
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAiChatMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);
    }, 650);
  };

  return (
    <div className="director-container animate-fade-in">
      {/* Top Director Header */}
      <div className="director-header-card">
        <div className="director-header-left">
          <div className="director-avatar-badge">
            <IconBuilding size={30} className="text-white" />
          </div>
          <div>
            <div className="director-badge-label">
              <IconShield size={14} />
              <span>Boshqaruv & Strategiya Portali</span>
            </div>
            <h1 className="director-title">Bosh Direktor Kabineti</h1>
            <p className="director-subtext">
              EduLingua O'quv Markazi — Moliyaviy, Ta'limiy va Xodimlar Monitoringi
            </p>
          </div>
        </div>

        <div className="director-header-actions">
          <div className="month-selector-wrap">
            <span className="month-label">Hisobot davri:</span>
            <select
              className="radial-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="Avgust">Avgust 2026 (Joriy)</option>
              <option value="Iyul">Iyul 2026</option>
              <option value="Iyun">Iyun 2026</option>
              <option value="May">May 2026</option>
            </select>
          </div>

          <button
            type="button"
            className="radial-button-secondary"
            onClick={() => window.print()}
          >
            <IconPrinter size={16} />
            <span>Chop Etish / Export</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="director-subnav-tabs">
        <button
          type="button"
          className={`director-nav-btn ${activeSubTab === 'overview' ? 'active-nav-btn' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          <IconBarChart size={18} />
          <span>Strategik KPI Paneli</span>
        </button>

        <button
          type="button"
          className={`director-nav-btn ${activeSubTab === 'teachers' ? 'active-nav-btn' : ''}`}
          onClick={() => setActiveSubTab('teachers')}
        >
          <IconUsers size={18} />
          <span>O'qituvchilar Auditi & KPI</span>
          <span className="tab-pill-count">{activeTeachers.length}</span>
        </button>

        <button
          type="button"
          className={`director-nav-btn ${activeSubTab === 'groups' ? 'active-nav-btn' : ''}`}
          onClick={() => setActiveSubTab('groups')}
        >
          <IconBriefcase size={18} />
          <span>Guruhlar & Kurslar Holati</span>
        </button>

        <button
          type="button"
          className={`director-nav-btn ${activeSubTab === 'ai-advisor' ? 'active-nav-btn' : ''}`}
          onClick={() => setActiveSubTab('ai-advisor')}
        >
          <IconBot size={18} />
          <span>AI Direktor Maslahatchisi</span>
          <span className="tab-pill-sparkle">AI 2.6</span>
        </button>

        <button
          type="button"
          className={`director-nav-btn ${activeSubTab === 'reports' ? 'active-nav-btn' : ''}`}
          onClick={() => setActiveSubTab('reports')}
        >
          <IconAward size={18} />
          <span>Rasmiy Hisobotlar</span>
        </button>
      </div>

      {/* SUB-TAB 1: STRATEGIC KPI OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="director-tab-content animate-fade-in">
          {/* Main 5 Metric Cards */}
          <div className="director-kpi-grid">
            <div className="director-kpi-card">
              <div className="kpi-icon-box blue-bg">
                <IconDollarSign size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Oylik Tushum (Avgust)</span>
                <div className="kpi-value">
                  {DIRECTOR_DATA.kpis.collectedRevenue.toLocaleString()} <span className="kpi-unit">UZS</span>
                </div>
                <div className="kpi-sub positive">
                  <IconTrendingUp size={14} />
                  <span>Reja: {DIRECTOR_DATA.kpis.monthlyRevenue.toLocaleString()} UZS (86.5%)</span>
                </div>
              </div>
            </div>

            <div className="director-kpi-card">
              <div className="kpi-icon-box deep-blue-bg">
                <IconUsers size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Jami O'quvchilar</span>
                <div className="kpi-value">{totalStudentsCount} <span className="kpi-unit">nafar</span></div>
                <div className="kpi-sub positive">
                  <IconTrendingUp size={14} />
                  <span>{DIRECTOR_DATA.kpis.growthRate} o'sish o'tgan oyga nisbatan</span>
                </div>
              </div>
            </div>

            <div className="director-kpi-card">
              <div className="kpi-icon-box ocean-bg">
                <IconCalendar size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">Umumiy Davomat</span>
                <div className="kpi-value">{DIRECTOR_DATA.kpis.overallAttendanceRate}%</div>
                <div className="kpi-sub positive">
                  <IconCheckCircle size={14} />
                  <span>Yuqori intizom (Markaz normasi 90%)</span>
                </div>
              </div>
            </div>

            <div className="director-kpi-card">
              <div className="kpi-icon-box royal-bg">
                <IconAward size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-title">O'rtacha Imtihon Balli</span>
                <div className="kpi-value">{DIRECTOR_DATA.kpis.averageExamScore}%</div>
                <div className="kpi-sub positive">
                  <IconFlame size={14} />
                  <span>IELTS 7.5 Band o'rtacha daraja</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Finance Chart & Progress Overview */}
          <div className="director-two-column-layout">
            {/* Financial Trend Table / Graph */}
            <div className="director-panel-card">
              <div className="panel-card-header">
                <h3 className="panel-title">
                  <IconDollarSign size={20} />
                  <span>Oylik Daromad va O'quvchilar Dinamikasi (2026)</span>
                </h3>
                <span className="panel-tag">6 Oylik Moliya Grafigi</span>
              </div>

              <div className="financial-bars-container">
                {DIRECTOR_DATA.financialMonths.map((fm) => {
                  const percent = Math.min(100, Math.round((fm.fact / 75000000) * 100));
                  const isCurrent = fm.month === selectedMonth;
                  return (
                    <div key={fm.month} className={`finance-bar-row ${isCurrent ? 'current-month-row' : ''}`}>
                      <div className="finance-bar-label">
                        <strong>{fm.month}</strong>
                        <span className="finance-students-badge">{fm.students} o'quvchi</span>
                      </div>
                      <div className="finance-bar-track">
                        <div
                          className="finance-bar-fill"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="finance-bar-values">
                        <span className="fact-val">{fm.fact.toLocaleString()} UZS</span>
                        <span className="plan-val">Reja: {fm.plan.toLocaleString()} UZS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Strategic AI Insights */}
            <div className="director-panel-card">
              <div className="panel-card-header">
                <h3 className="panel-title">
                  <IconSparkles size={20} />
                  <span>Direktor Uchun Tezkor AI Xulosalari</span>
                </h3>
                <button
                  type="button"
                  className="radial-button-secondary text-sm"
                  onClick={() => setActiveSubTab('ai-advisor')}
                >
                  Batafsil Chat
                </button>
              </div>

              <div className="director-tips-list">
                {DIRECTOR_DATA.directorAiTips.map((tip) => (
                  <div key={tip.id} className="director-tip-card">
                    <div className="tip-header-line">
                      <span className="tip-badge">{tip.priority} Muhimlik</span>
                      <span className="tip-impact">{tip.impact}</span>
                    </div>
                    <h4 className="tip-title">{tip.title}</h4>
                    <p className="tip-desc">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TEACHERS KPI & AUDIT */}
      {activeSubTab === 'teachers' && (
        <div className="director-tab-content animate-fade-in">
          <div className="director-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconUsers size={20} />
                  <span>O'qituvchilarning KPI Reytingi va O'zlashtirish Ko'rsatkichi</span>
                </h3>
                <p className="panel-desc">
                  Har bir o'qituvchining o'quvchilari davomati, imtihon ballari va oylik reytingi
                </p>
              </div>
              <button
                type="button"
                className="radial-button-primary"
                onClick={() => alert("Barcha o'qituvchilarning oylik KPI bonusi tasdiqlandi!")}
              >
                <IconAward size={16} />
                <span>Oylik Bonusni Tasdiqlash</span>
              </button>
            </div>

            <div className="teachers-table-wrapper">
              <table className="director-custom-table">
                <thead>
                  <tr>
                    <th>O'qituvchi</th>
                    <th>Lavozim & Yo'nalish</th>
                    <th>Guruhlar</th>
                    <th>O'quvchilar</th>
                    <th>O'rtacha Ball</th>
                    <th>Davomat</th>
                    <th>KPI Balli</th>
                    <th>Mukofot / Holat</th>
                    <th>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTeachers.map((tch) => (
                    <tr key={tch.id} className="teacher-table-row">
                      <td>
                        <div className="teacher-name-cell">
                          <span className="teacher-avatar-circle">{tch.avatar}</span>
                          <strong>{tch.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="teacher-role-tag">{tch.role}</span>
                      </td>
                      <td>
                        <strong>{tch.groupsCount} ta guruh</strong>
                      </td>
                      <td>
                        <strong>{tch.studentsCount} nafar</strong>
                      </td>
                      <td>
                        <span className="score-badge-blue">{tch.avgScore}%</span>
                      </td>
                      <td>
                        <span className="attendance-badge-green">{tch.attendanceRate}%</span>
                      </td>
                      <td>
                        <div className="kpi-score-pill">
                          <strong>{tch.kpiScore}</strong> / 100
                        </div>
                      </td>
                      <td>
                        <span className="award-badge-pill">{tch.awardBadge}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="radial-button-secondary py-1 px-3 text-xs"
                          onClick={() => setSelectedTeacherForDetail(tch)}
                        >
                          Tahlil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher Detail Modal/Drawer if selected */}
          {selectedTeacherForDetail && (
            <div className="director-modal-backdrop animate-fade-in">
              <div className="director-modal-card animate-pop-in">
                <div className="modal-header-line">
                  <div className="modal-teacher-info">
                    <span className="modal-avatar">{selectedTeacherForDetail.avatar}</span>
                    <div>
                      <h3 className="modal-title">{selectedTeacherForDetail.name}</h3>
                      <p className="modal-subtitle">{selectedTeacherForDetail.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setSelectedTeacherForDetail(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-metrics-grid">
                  <div className="modal-metric-box">
                    <span className="metric-lbl">KPI Reytingi</span>
                    <strong className="metric-val">{selectedTeacherForDetail.kpiScore} ball</strong>
                  </div>
                  <div className="modal-metric-box">
                    <span className="metric-lbl">O'quvchilar soni</span>
                    <strong className="metric-val">{selectedTeacherForDetail.studentsCount} nafar</strong>
                  </div>
                  <div className="modal-metric-box">
                    <span className="metric-lbl">O'rtacha Imtihon</span>
                    <strong className="metric-val">{selectedTeacherForDetail.avgScore}%</strong>
                  </div>
                  <div className="modal-metric-box">
                    <span className="metric-lbl">Davomat Intizomi</span>
                    <strong className="metric-val">{selectedTeacherForDetail.attendanceRate}%</strong>
                  </div>
                </div>

                <div className="modal-ai-audit-box">
                  <h4>💡 Direktor Maslahatchisi Tahlili:</h4>
                  <p>
                    {selectedTeacherForDetail.name} — O'quv markazimizning yetakchi mutaxassislaridan biri. O'quvchilarning 92% dan ortig'i belgilangan imtihonlarni "A" darajada topshirmoqda. Darslarga tayyorgarlik sifati yuqori. Tavsiya: Yil yakunida "Eng Yaxshi Metodist" faxriy yorlig'i bilan taqdirlash.
                  </p>
                </div>

                <div className="modal-actions-footer">
                  <button
                    type="button"
                    className="radial-button-secondary"
                    onClick={() => setSelectedTeacherForDetail(null)}
                  >
                    Yopish
                  </button>
                  <button
                    type="button"
                    className="radial-button-primary"
                    onClick={() => {
                      alert(`${selectedTeacherForDetail.name} uchun 1,500,000 UZS rag'batlantirish bonusi kiritildi!`);
                      setSelectedTeacherForDetail(null);
                    }}
                  >
                    Mukofot Pulini Biriktirish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: GROUPS & COURSES OVERVIEW */}
      {activeSubTab === 'groups' && (
        <div className="director-tab-content animate-fade-in">
          <div className="director-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconBriefcase size={20} />
                  <span>Barcha Guruhlar va Kurslarning Sig'im Monitoringi</span>
                </h3>
                <p className="panel-desc">
                  O'quv xonalari bandligi, guruh to'liqligi va oylik daromadlik ko'rsatkichlari
                </p>
              </div>
            </div>

            <div className="groups-grid-layout">
              <div className="director-group-card">
                <div className="group-card-top">
                  <span className="group-name">IELTS Mastery (B2-C1)</span>
                  <span className="group-status-pill green">To'liq (93%)</span>
                </div>
                <div className="group-info-row">
                  <span>Ustoz:</span>
                  <strong>Azizbek Toshmatov</strong>
                </div>
                <div className="group-info-row">
                  <span>Dars kunlari:</span>
                  <strong>Dush-Chor-Juma (14:00)</strong>
                </div>
                <div className="group-info-row">
                  <span>Talabalar:</span>
                  <strong>14 / 15 nafar</strong>
                </div>
                <div className="group-progress-wrap">
                  <div className="group-progress-bar" style={{ width: '93%' }}></div>
                </div>
                <div className="group-revenue-footer">
                  <span>Oylik Tushum:</span>
                  <strong>9,100,000 UZS</strong>
                </div>
              </div>

              <div className="director-group-card">
                <div className="group-card-top">
                  <span className="group-name">General English (B1)</span>
                  <span className="group-status-pill green">To'liq (100%)</span>
                </div>
                <div className="group-info-row">
                  <span>Ustoz:</span>
                  <strong>Nigora Umarova</strong>
                </div>
                <div className="group-info-row">
                  <span>Dars kunlari:</span>
                  <strong>Sesh-Pay-Shanba (10:00)</strong>
                </div>
                <div className="group-info-row">
                  <span>Talabalar:</span>
                  <strong>15 / 15 nafar</strong>
                </div>
                <div className="group-progress-wrap">
                  <div className="group-progress-bar" style={{ width: '100%' }}></div>
                </div>
                <div className="group-revenue-footer">
                  <span>Oylik Tushum:</span>
                  <strong>8,250,000 UZS</strong>
                </div>
              </div>

              <div className="director-group-card">
                <div className="group-card-top">
                  <span className="group-name">Beginner Intensive (A1-A2)</span>
                  <span className="group-status-pill blue">Qabul Davomida (75%)</span>
                </div>
                <div className="group-info-row">
                  <span>Ustoz:</span>
                  <strong>Shahnoza Ergasheva</strong>
                </div>
                <div className="group-info-row">
                  <span>Dars kunlari:</span>
                  <strong>Dush-Chor-Juma (16:30)</strong>
                </div>
                <div className="group-info-row">
                  <span>Talabalar:</span>
                  <strong>12 / 16 nafar</strong>
                </div>
                <div className="group-progress-wrap">
                  <div className="group-progress-bar" style={{ width: '75%' }}></div>
                </div>
                <div className="group-revenue-footer">
                  <span>Oylik Tushum:</span>
                  <strong>5,760,000 UZS</strong>
                </div>
              </div>

              <div className="director-group-card">
                <div className="group-card-top">
                  <span className="group-name">Individual Speaking Pro</span>
                  <span className="group-status-pill purple">VIP Kurs (100%)</span>
                </div>
                <div className="group-info-row">
                  <span>Ustoz:</span>
                  <strong>Azizbek Toshmatov</strong>
                </div>
                <div className="group-info-row">
                  <span>Dars kunlari:</span>
                  <strong>Moslashuvchan (18:30)</strong>
                </div>
                <div className="group-info-row">
                  <span>Talabalar:</span>
                  <strong>4 / 4 nafar</strong>
                </div>
                <div className="group-progress-wrap">
                  <div className="group-progress-bar" style={{ width: '100%' }}></div>
                </div>
                <div className="group-revenue-footer">
                  <span>Oylik Tushum:</span>
                  <strong>4,800,000 UZS</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AI EXECUTIVE ADVISOR */}
      {activeSubTab === 'ai-advisor' && (
        <div className="director-tab-content animate-fade-in">
          <div className="director-panel-card">
            <div className="panel-card-header">
              <div className="ai-advisor-header-title">
                <div className="ai-badge-circle">
                  <IconBot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="panel-title">Direktor Strategik AI Maslahatchisi</h3>
                  <p className="panel-desc">
                    Markaz boshqaruvi, moliyaviy barqarorlik, yangi filiallar va kadrlar tahlili bo'yicha sun'iy intellekt
                  </p>
                </div>
              </div>

              {/* Quick AI Prompt Pills */}
              <div className="ai-quick-pills-row">
                <button
                  type="button"
                  className="radial-button-secondary py-1 px-3 text-xs"
                  onClick={() => handleSendAiPrompt("Oylik daromad va tushumlar bo'yicha to'liq tahlil ber")}
                >
                  💰 Moliya Tahlili
                </button>
                <button
                  type="button"
                  className="radial-button-secondary py-1 px-3 text-xs"
                  onClick={() => handleSendAiPrompt("O'qituvchilar KPI va sifat nazorati hisoboti")}
                >
                  👨‍🏫 O'qituvchilar KPI
                </button>
                <button
                  type="button"
                  className="radial-button-secondary py-1 px-3 text-xs"
                  onClick={() => handleSendAiPrompt("Yangi IELTS guruhlarini ochish va kengaytirish tavsiyalari")}
                >
                  📈 Yangi Guruhlar Ochish
                </button>
              </div>
            </div>

            {/* Chat Messages Display */}
            <div className="director-ai-chat-box">
              {aiChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${msg.sender === 'user' ? 'user-bubble-row' : 'ai-bubble-row'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="chat-avatar ai-avatar-circle">
                      <IconBot size={18} />
                    </div>
                  )}
                  <div className={`chat-message-card ${msg.sender === 'user' ? 'user-msg-card' : 'ai-msg-card'}`}>
                    <div className="chat-message-text" style={{ whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </div>
                    <div className="chat-message-time">{msg.time}</div>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="chat-avatar user-avatar-circle">
                      <span>🏛️</span>
                    </div>
                  )}
                </div>
              ))}

              {isAiThinking && (
                <div className="chat-bubble-row ai-bubble-row">
                  <div className="chat-avatar ai-avatar-circle">
                    <IconBot size={18} />
                  </div>
                  <div className="ai-thinking-card">
                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>
                    <span className="ml-2 text-xs">Strategik ma'lumotlar tahlil qilinmoqda...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiPrompt();
              }}
              className="director-ai-input-form"
            >
              <input
                type="text"
                className="director-ai-input"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="Direktor savoli: Masalan, 'Keyingi oy uchun moliyaviy rejani qanday oshirish mumkin?'..."
              />
              <button
                type="submit"
                disabled={isAiThinking || !aiInputText.trim()}
                className="radial-button-primary"
              >
                <IconSend size={16} />
                <span>Yuborish</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: OFFICIAL REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="director-tab-content animate-fade-in">
          <div className="director-panel-card printable-report-card">
            <div className="report-doc-header">
              <div className="report-org-title">
                <h2>"EDULINGUA AI" TA'LIM VA CHET TILLARI MARKAZI</h2>
                <p>Bosh Boshqarma • Oylik Rasmiy Hisobot & Audit Hujjati</p>
              </div>
              <div className="report-doc-stamp">
                <IconShield size={36} className="stamp-icon" />
                <span>TASDIQLANGAN</span>
              </div>
            </div>

            <div className="report-meta-grid">
              <div className="report-meta-item">
                <span>Hisobot Davri:</span>
                <strong>Avgust 2026</strong>
              </div>
              <div className="report-meta-item">
                <span>Direktor:</span>
                <strong>Dr. Rustam Karimov</strong>
              </div>
              <div className="report-meta-item">
                <span>Jami Faol O'quvchilar:</span>
                <strong>{totalStudentsCount} nafar</strong>
              </div>
              <div className="report-meta-item">
                <span>O'rtacha Davomat:</span>
                <strong>94.6%</strong>
              </div>
            </div>

            <div className="report-section-block">
              <h3>1. Moliyaviy Ko'rsatkichlar Yakuni</h3>
              <p>
                2026-yil Avgust oyida umumiy hisoblangan to'lovlar summasi <strong>68,400,000 so'm</strong>ni tashkil qildi. Shundan <strong>59,200,000 so'm</strong> (86.5%) kassa va bank hisoblariga kelib tushdi. Kutilayotgan qarzdorlik <strong>9,200,000 so'm</strong> bo'lib, admin nazoratiga yuklatildi.
              </p>
            </div>

            <div className="report-section-block">
              <h3>2. O'quv Sifati va IELTS Natijalari</h3>
              <p>
                Avgust oyidagi nazorat testlarida o'quvchilarning 88% dan ortig'i B2-C1 darajalarini muvaffaqiyatli himoya qildi. Reading va Listening bo'yicha o'rtacha ko'rsatkich 88.5% ni tashkil etmoqda.
              </p>
            </div>

            <div className="report-section-block">
              <h3>3. Rahbariyat Xulosasi</h3>
              <p>
                O'quv markazida ta'lim sifati, intizom va moddiy-texnik baza to'liq ta'minlangan. O'qituvchilar Azizbek Toshmatov va Shahnoza Ergashevalar uchun oylik rag'batlantirish mukofoti ajratilishi tavsiya etiladi.
              </p>
            </div>

            <div className="report-signature-row">
              <div className="sig-block">
                <span>Bosh Direktor Imzosi:</span>
                <div className="sig-line">Dr. R. Karimov _________</div>
              </div>
              <div className="sig-block">
                <span>Bosh Administrator Imzosi:</span>
                <div className="sig-line">M. Rahimova _________</div>
              </div>
              <div className="sig-block">
                <span>Sana:</span>
                <div className="sig-line">17.08.2026</div>
              </div>
            </div>

            <div className="report-actions-row no-print">
              <button
                type="button"
                className="radial-button-primary"
                onClick={() => window.print()}
              >
                <IconPrinter size={18} />
                <span>Hisobotni Chop Etish (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
