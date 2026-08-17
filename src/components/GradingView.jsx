import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TEST_TEMPLATES } from '../data/mockData';
import { 
  IconAward, 
  IconSparkles, 
  IconStar, 
  IconCheck, 
  IconTrash, 
  IconTrendingUp,
  IconFlame,
  IconBook,
  IconPlus,
  IconLightbulb
} from './Icons';

export const GradingView = ({ 
  students, 
  onAddGrade, 
  onDeleteGrade,
  initialSelectedStudentId = null 
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(
    initialSelectedStudentId || (students[0]?.id || '')
  );
  const [testTitle, setTestTitle] = useState('4 Ko\'nikma Imtihoni (Reading, Listening, Writing, Speaking)');
  
  // Dynamic Sections Array
  const [sections, setSections] = useState([
    { id: 'sec-1', name: 'Reading', score: 13, maxScore: 20, icon: '📖' },
    { id: 'sec-2', name: 'Listening', score: 10, maxScore: 20, icon: '🎧' },
    { id: 'sec-3', name: 'Writing', score: 15, maxScore: 20, icon: '✍️' },
    { id: 'sec-4', name: 'Speaking', score: 14, maxScore: 20, icon: '🗣️' }
  ]);

  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionMax, setNewSectionMax] = useState(20);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState('');

  // 1. Calculate Real-Time Totals
  const totalScore = sections.reduce((acc, s) => acc + (Number(s.score) || 0), 0);
  const totalMaxScore = sections.reduce((acc, s) => acc + (Number(s.maxScore) || 20), 0);
  const totalPercentage = totalMaxScore > 0 
    ? Math.round((totalScore / totalMaxScore) * 100) 
    : 0;

  // Derive Band Score & Grade Letter
  const getGradeEvaluation = (pct) => {
    if (pct >= 90) return { letter: 'A+', band: '8.5 - 9.0 Band (C2)', status: 'Mukammal (Mastery)', color: 'text-green' };
    if (pct >= 80) return { letter: 'A', band: '7.5 - 8.0 Band (C1)', status: 'A\'lo (Proficient)', color: 'text-green' };
    if (pct >= 70) return { letter: 'B', band: '6.5 - 7.0 Band (B2)', status: 'Yaxshi (Good)', color: 'text-accent' };
    if (pct >= 55) return { letter: 'C', band: '5.5 - 6.0 Band (B1)', status: 'O\'rta (Intermediate)', color: 'text-orange' };
    if (pct >= 40) return { letter: 'D', band: '4.5 - 5.0 Band (A2)', status: 'Qoniqarli (Elementary)', color: 'text-orange' };
    return { letter: 'F', band: '3.5 - 4.0 Band (A1)', status: 'Qo\'shimcha Mashq Kerak', color: 'text-red' };
  };

  const currentEval = getGradeEvaluation(totalPercentage);

  // Section with lowest score (Weakest) and highest score (Strongest)
  const sortedSectionsByPct = [...sections].sort((a, b) => {
    const aPct = (Number(a.score) || 0) / (Number(a.maxScore) || 1);
    const bPct = (Number(b.score) || 0) / (Number(b.maxScore) || 1);
    return aPct - bPct;
  });

  const weakestSection = sortedSectionsByPct[0];
  const strongestSection = sortedSectionsByPct[sortedSectionsByPct.length - 1];

  // Auto AI Feedback Generator based on actual numbers
  const handleGenerateAIFeedback = () => {
    const student = students.find(s => s.id === selectedStudentId);
    const stdName = student ? student.name.split(' ')[0] : 'O\'quvchi';
    
    let note = `${stdName}ning umumiy natijasi: ${totalScore}/${totalMaxScore} ball (${totalPercentage}% - ${currentEval.band}). `;
    
    if (sections.length > 1 && weakestSection && strongestSection) {
      const weakPct = Math.round(((weakestSection.score || 0) / (weakestSection.maxScore || 1)) * 100);
      const strongPct = Math.round(((strongestSection.score || 0) / (strongestSection.maxScore || 1)) * 100);
      
      note += `Eng kuchli tomoni: ${strongestSection.name} (${strongestSection.score}/${strongestSection.maxScore} - ${strongPct}%). `;
      
      if (weakPct < 70) {
        note += `E'tibor qaratish kerak bo'lgan bo'lim: ${weakestSection.name} (${weakestSection.score}/${weakestSection.maxScore} - ${weakPct}%). Tavsiya: qo'shimcha audio va leksik mashqlar bajarish.`;
      } else {
        note += `Barcha bo'limlar barqaror yaxshi o'zlashtirilgan.`;
      }
    }

    setFeedbackNote(note);
  };

  // Section handlers
  const handleScoreChange = (secId, val) => {
    setSections(sections.map(s => s.id === secId ? { ...s, score: Math.max(0, Number(val)) } : s));
  };

  const handleMaxScoreChange = (secId, val) => {
    setSections(sections.map(s => s.id === secId ? { ...s, maxScore: Math.max(1, Number(val)) } : s));
  };

  const handleAddCustomSection = () => {
    if (!newSectionName.trim()) return;
    const newSec = {
      id: `sec-${Date.now()}`,
      name: newSectionName.trim(),
      score: 0,
      maxScore: Number(newSectionMax) || 20,
      icon: '📝'
    };
    setSections([...sections, newSec]);
    setNewSectionName('');
  };

  const handleRemoveSection = (secId) => {
    if (sections.length <= 1) {
      alert("Kamida 1 ta bo'lim qolishi kerak.");
      return;
    }
    setSections(sections.filter(s => s.id !== secId));
  };

  const handleApplyTemplate = (tpl) => {
    setTestTitle(tpl.title);
    setSections(tpl.sections.map((sec, idx) => ({
      ...sec,
      id: `sec-tpl-${idx}-${Date.now()}`
    })));
  };

  // Submit Grade
  const handleScoreSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    if (totalPercentage >= 85) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    }

    const calculatedSections = sections.map(s => ({
      name: s.name,
      score: Number(s.score) || 0,
      maxScore: Number(s.maxScore) || 20,
      percentage: Math.round(((Number(s.score) || 0) / (Number(s.maxScore) || 1)) * 100)
    }));

    onAddGrade(selectedStudentId, {
      subject: testTitle,
      score: totalScore,
      maxScore: totalMaxScore,
      percentage: totalPercentage,
      gradeLetter: currentEval.letter,
      bandScore: currentEval.band,
      sections: calculatedSections,
      note: feedbackNote || `Umumiy natija: ${totalPercentage}% (${currentEval.band})`,
      date: new Date().toISOString().split('T')[0]
    });

    setGradeSuccessMsg(`Baho muvaffaqiyatli jurnalga kiritildi: ${totalScore}/${totalMaxScore} ball (${totalPercentage}% — ${currentEval.band})! 🎉`);
    setTimeout(() => setGradeSuccessMsg(''), 4500);
  };

  // Compile full gradebook entries from all students
  const allGrades = [];
  students.forEach((std) => {
    (std.grades || []).forEach((g) => {
      allGrades.push({
        ...g,
        studentId: std.id,
        studentName: std.name,
        studentAvatar: std.avatar,
        studentGroup: std.group
      });
    });
  });

  allGrades.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Compile Leaderboard Ranking
  const leaderboard = students.map((std) => {
    const grades = std.grades || [];
    const avg = grades.length > 0
      ? Math.round(grades.reduce((acc, g) => acc + (g.percentage || g.score || 0), 0) / grades.length)
      : 0;
    
    return {
      id: std.id,
      name: std.name,
      avatar: std.avatar,
      group: std.group,
      level: std.level,
      avgPercentage: avg,
      gradesCount: grades.length,
      badge: std.badge || 'Faol O\'quvchi'
    };
  });

  leaderboard.sort((a, b) => b.avgPercentage - a.avgPercentage);

  return (
    <div className="grading-view-wrapper">
      {/* Header Banner */}
      <div className="section-header-box">
        <div className="header-info">
          <div className="header-badge">
            <IconAward size={16} /> Aqlli Imtihon & Baholash Kalkulyatori
          </div>
          <h2>Bo'limlar kesimida avtomatik Foiz (%), Ball va Band hisoblagich</h2>
          <p>
            Masalan: <strong>Reading: 13, Listening: 10, Writing: 15, Speaking: 14</strong> yozing — tizim har bir 
            bo'lim foizi, umumiy to'plangan ball ({totalScore}/{totalMaxScore}), umumiy foiz ({totalPercentage}%) va 
            IELTS/CEFR darajasini avtomatik chiqarib beradi!
          </p>
        </div>
      </div>

      {gradeSuccessMsg && (
        <div className="toast-banner-inline">
          <IconCheck size={18} /> {gradeSuccessMsg}
        </div>
      )}

      {/* Main Grid: Auto-Grading Calculator & Leaderboard */}
      <div className="grading-main-grid">
        {/* Left Column: Multi-Section Calculator Form */}
        <div className="grading-form-col">
          <div className="grading-card">
            <div className="grading-card-header">
              <div className="flex items-center gap-2">
                <IconAward size={22} className="text-accent" />
                <h3>Imtihon & Sinov Natijalarini Kiritish</h3>
              </div>
            </div>

            {/* Quick Templates Selector */}
            <div className="test-templates-bar">
              <span className="tpl-label">Tayyor shablonlar:</span>
              <div className="tpl-chips-row">
                {TEST_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    className="tpl-chip-btn"
                    onClick={() => handleApplyTemplate(tpl)}
                  >
                    {tpl.title.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleScoreSubmit} className="grading-form">
              {/* Select Student & Subject */}
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">O'quvchini tanlang:</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="modal-select"
                  >
                    {students.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.avatar} [{std.id.toUpperCase()}] {std.name} — ({std.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Imtihon / Test Nomi:</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="modal-input"
                    placeholder="Masalan: Midterm Mock Exam"
                  />
                </div>
              </div>

              {/* Dynamic Section Inputs List */}
              <div className="sections-container-box">
                <div className="sections-box-header">
                  <label className="form-label">Bo'limlar bo'yicha to'g'ri javoblar va umumiy savollar:</label>
                  <span className="text-muted text-xs">Ball kiritishingiz bilan foiz avtomatik hisoblanadi</span>
                </div>

                <div className="sections-inputs-list">
                  {sections.map((sec) => {
                    const secScore = Number(sec.score) || 0;
                    const secMax = Number(sec.maxScore) || 20;
                    const secPct = Math.round((secScore / secMax) * 100);
                    
                    let pillColor = 'sec-pct-good';
                    if (secPct >= 80) pillColor = 'sec-pct-excellent';
                    else if (secPct < 60) pillColor = 'sec-pct-warning';

                    return (
                      <div key={sec.id} className="section-row-card">
                        <div className="sec-icon-title">
                          <span className="sec-icon">{sec.icon || '📝'}</span>
                          <strong className="sec-name">{sec.name}:</strong>
                        </div>

                        <div className="sec-inputs-wrap">
                          <div className="sec-score-input-box">
                            <label className="sec-mini-lbl">To'g'ri ball:</label>
                            <input
                              type="number"
                              min="0"
                              max={secMax}
                              value={sec.score}
                              onChange={(e) => handleScoreChange(sec.id, e.target.value)}
                              className="sec-input-num"
                            />
                          </div>

                          <span className="sec-divider">/</span>

                          <div className="sec-score-input-box">
                            <label className="sec-mini-lbl">Maksimal:</label>
                            <input
                              type="number"
                              min="1"
                              value={sec.maxScore}
                              onChange={(e) => handleMaxScoreChange(sec.id, e.target.value)}
                              className="sec-input-num sec-max-num"
                            />
                          </div>

                          {/* Instant Percentage Display */}
                          <div className={`sec-pct-pill ${pillColor}`}>
                            <strong>{secPct}%</strong>
                          </div>

                          {/* Delete Section Button */}
                          <button
                            type="button"
                            className="sec-delete-btn"
                            onClick={() => handleRemoveSection(sec.id)}
                            title="Ushbu bo'limni o'chirish"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Section Form */}
                <div className="add-custom-sec-bar">
                  <input
                    type="text"
                    placeholder="Yangi bo'lim nomi (masalan: Collocations, Translation)..."
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="modal-input new-sec-input"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Maks (20)"
                    value={newSectionMax}
                    onChange={(e) => setNewSectionMax(e.target.value)}
                    className="modal-input new-sec-max"
                  />
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={handleAddCustomSection}
                  >
                    <IconPlus size={16} /> Qo'shish
                  </button>
                </div>
              </div>

              {/* REAL-TIME LIVE CALCULATION SUMMARY CARD */}
              <div className="live-calculation-card">
                <div className="calc-card-top">
                  <div className="calc-metric-box">
                    <span className="calc-lbl">Jami Ball:</span>
                    <strong className="calc-val-huge">{totalScore} <span className="calc-max">/ {totalMaxScore}</span></strong>
                  </div>

                  <div className="calc-metric-box">
                    <span className="calc-lbl">Yakuniy Foiz:</span>
                    <strong className="calc-val-huge text-accent">{totalPercentage}%</strong>
                  </div>

                  <div className="calc-metric-box">
                    <span className="calc-lbl">Daraja & Band:</span>
                    <strong className={`calc-val-huge ${currentEval.color}`}>{currentEval.letter}</strong>
                    <span className="calc-sub-band">{currentEval.band}</span>
                  </div>
                </div>

                {/* Skill diagnostic highlight */}
                {sections.length > 1 && (
                  <div className="calc-insights-row">
                    {strongestSection && (
                      <span className="insight-chip chip-strong">
                        🌟 Eng kuchli: <strong>{strongestSection.name}</strong> ({Math.round(((strongestSection.score || 0)/(strongestSection.maxScore || 1))*100)}%)
                      </span>
                    )}
                    {weakestSection && (
                      <span className="insight-chip chip-weak">
                        ⚠️ E'tibor kerak: <strong>{weakestSection.name}</strong> ({Math.round(((weakestSection.score || 0)/(weakestSection.maxScore || 1))*100)}%)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Teacher Feedback / Note with AI Generator */}
              <div className="form-group">
                <div className="feedback-label-row">
                  <label className="form-label">O'qituvchi Izohi & Tavsiyasi (Feedback):</label>
                  <button
                    type="button"
                    className="btn-ai-auto-feedback"
                    onClick={handleGenerateAIFeedback}
                    title="Kiritilgan ballar asosida avtomatik tahliliy izoh yozish"
                  >
                    <IconSparkles size={14} /> AI Tavsiya Yaratish
                  </button>
                </div>
                <textarea
                  rows="3"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Kiritilgan ballar asosida izoh qoldiring yoki 'AI Tavsiya Yaratish' tugmasini bosing..."
                  className="modal-textarea"
                />
              </div>

              <button type="submit" className="btn-primary btn-submit-grade">
                <IconSparkles size={18} />
                <span>Bahoni Jurnalga Saqlash ({totalPercentage}% — {currentEval.band})</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Top Students Leaderboard */}
        <div className="leaderboard-col">
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <div className="leaderboard-title-wrap">
                <IconFlame size={22} className="text-orange" />
                <h3>🏆 O'quvchilar Reytingi (Leaderboard)</h3>
              </div>
              <span className="top-badge">O'rtacha Foiz Asosida</span>
            </div>

            <div className="leaderboard-list">
              {leaderboard.map((item, index) => {
                let rankIcon = `#${index + 1}`;
                let rankClass = '';
                if (index === 0) {
                  rankIcon = '🥇 1';
                  rankClass = 'rank-gold';
                } else if (index === 1) {
                  rankIcon = '🥈 2';
                  rankClass = 'rank-silver';
                } else if (index === 2) {
                  rankIcon = '🥉 3';
                  rankClass = 'rank-bronze';
                }

                return (
                  <div key={item.id} className={`leaderboard-item ${rankClass}`}>
                    <div className="rank-badge">{rankIcon}</div>
                    <span className="lead-avatar">{item.avatar}</span>
                    <div className="lead-meta">
                      <strong className="lead-name">{item.name}</strong>
                      <span className="lead-sub">{item.group} • {item.badge}</span>
                    </div>
                    <div className="lead-score-box">
                      <span className="lead-score-val">{item.avgPercentage > 0 ? `${item.avgPercentage}%` : '0%'}</span>
                      <small className="lead-count">{item.gradesCount} ta imtihon</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Gradebook History Table with Section Details */}
      <div className="gradebook-table-card">
        <div className="gradebook-header">
          <div className="gb-title">
            <IconAward size={20} className="text-accent" />
            <h3>Barcha Baholar Jurnali va Bo'limlar Tahlili</h3>
          </div>
          <span className="gb-counter">{allGrades.length} ta qayd</span>
        </div>

        {allGrades.length === 0 ? (
          <div className="empty-sub-text text-center py-6">
            Hozircha baholar jurnali bo'sh.
          </div>
        ) : (
          <div className="gradebook-list-scroll">
            {allGrades.map((grade) => (
              <div key={grade.id} className="gradebook-row">
                <div className="gb-student-meta">
                  <span className="gb-avatar">{grade.studentAvatar}</span>
                  <div>
                    <strong className="gb-name">{grade.studentName}</strong>
                    <span className="gb-group">{grade.studentGroup}</span>
                  </div>
                </div>

                <div className="gb-subject-col">
                  <div className="gb-subject-title-row">
                    <strong className="gb-subject-title">{grade.subject}</strong>
                    {grade.bandScore && (
                      <span className="gb-band-tag">{grade.bandScore}</span>
                    )}
                  </div>

                  {/* Sectional Breakdown Chips */}
                  {grade.sections && grade.sections.length > 0 && (
                    <div className="gb-sections-badges-row">
                      {grade.sections.map((sec, sIdx) => (
                        <span key={sIdx} className="gb-sec-badge">
                          <strong>{sec.name}:</strong> {sec.score}/{sec.maxScore} ({sec.percentage}%)
                        </span>
                      ))}
                    </div>
                  )}

                  {grade.note && <span className="gb-note">💬 {grade.note}</span>}
                </div>

                <div className="gb-score-col">
                  <span className={`gb-score-pill ${(grade.percentage || grade.score) >= 80 ? 'score-excellent' : (grade.percentage || grade.score) >= 60 ? 'score-good' : 'score-fair'}`}>
                    {grade.percentage !== undefined ? `${grade.percentage}%` : `${grade.score} ball`} ({grade.score}/{grade.maxScore})
                  </span>
                  <span className="gb-date">{grade.date}</span>
                </div>

                <button
                  type="button"
                  className="icon-mini-btn delete-mini-btn"
                  onClick={() => onDeleteGrade(grade.studentId, grade.id)}
                  title="Bahoni o'chirish"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
