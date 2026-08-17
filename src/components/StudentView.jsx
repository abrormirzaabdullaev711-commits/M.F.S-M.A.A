import React, { useState, useEffect, useRef } from 'react';
import { 
  IconGraduationCap, 
  IconAward, 
  IconBook, 
  IconCalendar, 
  IconBot, 
  IconVolume, 
  IconCheck, 
  IconSparkles, 
  IconSend, 
  IconFlame, 
  IconTrophy, 
  IconClock, 
  IconCheckCircle, 
  IconStar,
  IconArrowRight,
  IconPlus,
  IconTrash,
  IconRefresh,
  IconGlobe,
  IconSearch,
  IconBookmark
} from './Icons';
import { 
  STUDENT_PORTAL_DATA, 
  INITIAL_STUDENTS,
  SUPPORTED_LANGUAGES 
} from '../data/mockData';
import { lookupWord, speakText } from '../services/dictionaryService';
import { 
  getStoredStudentTasks, 
  saveStoredStudentTasks,
  getStoredPomodoroStats,
  saveStoredPomodoroStats,
  exportDatabaseToJson 
} from '../services/storage';

export const StudentView = ({ 
  activeUser,
  students = [],
  onUpdateStudents = () => {},
  savedWords = [],
  onSaveWord = () => {},
  onDeleteSavedWord = () => {}
}) => {
  const [activeStudentTab, setActiveStudentTab] = useState('dictionary'); // 'dictionary', 'timer-todo', 'grades', 'attendance', 'flashcards', 'ai-tutor'
  
  // Find current student dynamically from live students state
  const currentStudent = students.find(s => 
    s.id === activeUser?.studentId || 
    s.id === activeUser?.id || 
    (s.email && activeUser?.email && s.email.toLowerCase() === activeUser.email.toLowerCase()) ||
    (s.name && activeUser?.name && s.name.toLowerCase() === activeUser.name.toLowerCase())
  ) || {
    id: activeUser?.studentId || activeUser?.id || 'std-101',
    name: activeUser?.name || 'Talaba',
    email: activeUser?.email || `${activeUser?.username || 'student'}@edulingua.uz`,
    group: activeUser?.group || 'IELTS Mastery (B2-C1)',
    level: activeUser?.level || 'B2',
    phone: activeUser?.phone || '+998 90 123-45-67',
    avatar: activeUser?.avatar || '👨‍🎓',
    color: '#2563eb',
    enrolledDate: activeUser?.since || '2026-01-15',
    attendance: {
      '2026-08-17': 'present',
      '2026-08-16': 'present',
      '2026-08-15': 'present',
      '2026-08-14': 'late',
      '2026-08-13': 'present'
    },
    grades: [],
    vocabCount: savedWords.length,
    badge: activeUser?.badge || 'Yangi O\'quvchi ⭐'
  };
  
  // =========================================================
  // TIL VA LUG'AT (DICTIONARY & 11 LANGUAGES) STATE
  // =========================================================
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [dictSearchQuery, setDictSearchQuery] = useState('resilient');
  const [dictResult, setDictResult] = useState(null);
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [dictSaveMsg, setDictSaveMsg] = useState('');

  const sampleSuggestions = {
    en: ['resilient', 'serendipity', 'diligent', 'eloquent', 'ubiquitous', 'meticulous'],
    uz: ['sabot', 'maftunkor', 'muvaffaqiyat', 'tirishqoqlik', 'farosat'],
    ru: ['вдохновение', 'упорство', 'достижение', 'искренность'],
    de: ['Ausdauer', 'Sehnsucht', 'Erfolg', 'Leidenschaft'],
    tr: ['azim', 'ilham', 'başarı', 'samimiyet'],
    ar: ['إلهام', 'عزيمة', 'نجاح', 'معرفة']
  };

  const handleDictSearch = async (wordToSearch = dictSearchQuery, langCode = selectedLanguage) => {
    const term = wordToSearch.trim();
    if (!term) return;

    setIsDictLoading(true);
    try {
      const result = await lookupWord(term, langCode);
      setDictResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDictLoading(false);
    }
  };

  useEffect(() => {
    if (!dictResult) {
      handleDictSearch('resilient', 'en');
    }
  }, []);

  const handleDictLanguageChange = (code) => {
    setSelectedLanguage(code);
    const defaults = sampleSuggestions[code] || ['hello'];
    const firstWord = defaults[0];
    setDictSearchQuery(firstWord);
    handleDictSearch(firstWord, code);
  };

  const handleSaveStudentWord = () => {
    if (!dictResult) return;
    onSaveWord(dictResult);
    setDictSaveMsg("So'z shaxsiy lug'atingizga saqlandi!");
    setTimeout(() => setDictSaveMsg(''), 2500);
  };

  const isWordSaved = dictResult && savedWords.some(
    w => w.word.toLowerCase() === dictResult.word.toLowerCase()
  );

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // =========================================================
  // FLASHCARDS STATE
  // =========================================================
  const [flashcards, setFlashcards] = useState(STUDENT_PORTAL_DATA.flashcards);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // =========================================================
  // STUDENT TO-DO LIST STATE
  // =========================================================
  const [tasks, setTasks] = useState(getStoredStudentTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('IELTS Reading');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Bugun');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [taskFilter, setTaskFilter] = useState('all');

  // =========================================================
  // POMODORO FOCUS TIMER STATE
  // =========================================================
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' (25m), 'shortBreak' (5m), 'longBreak' (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pomodoroStats, setPomodoroStats] = useState(getStoredPomodoroStats);
  const timerRef = useRef(null);

  // =========================================================
  // MINI QUIZ GAME STATE
  // =========================================================
  const [quizQuestions] = useState(STUDENT_PORTAL_DATA.studentQuizQuestions);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // =========================================================
  // AI TUTOR STATE
  // =========================================================
  const [tutorMessages, setTutorMessages] = useState([
    {
      id: 'tutor-1',
      sender: 'ai',
      text: `Salom, ${activeUser?.name || currentStudent.name}! 👋 Men sizning 24/7 Shaxsiy AI Repetitoringizman. Bugun qaysi mavzuni o'rganamiz? Til & Lug'at bo'yicha yangi so'zlarni tahlil qilish, IELTS Writing insho tekshirish yoki grammatik mashqlar bormi?`,
      time: '16:00'
    }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorThinking, setIsTutorThinking] = useState(false);

  // Play Sound Effect using Web Audio API
  const playTimerChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio chime not supported');
    }
  };

  // Timer Tick Engine
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            playTimerChime();

            if (timerMode === 'focus') {
              const updatedStats = {
                ...pomodoroStats,
                completedToday: pomodoroStats.completedToday + 1,
                totalFocusMinutes: pomodoroStats.totalFocusMinutes + 25,
                currentStreak: pomodoroStats.currentStreak + 1
              };
              setPomodoroStats(updatedStats);
              saveStoredPomodoroStats(updatedStats);
              alert("🎉 Barakalla! 25 daqiqalik fokus dars sessiyasi yakunlandi. Endi 5 daqiqa dam oling!");
              setTimerMode('shortBreak');
              return 5 * 60;
            } else {
              alert("☕ Tanaffus tugadi! Yangi o'rganish sessiyasini boshlaymiz.");
              setTimerMode('focus');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerMode, pomodoroStats]);

  const handleSelectTimerMode = (mode) => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else if (mode === 'longBreak') setTimeLeft(15 * 60);
  };

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'focus') setTimeLeft(25 * 60);
    else if (timerMode === 'shortBreak') setTimeLeft(5 * 60);
    else if (timerMode === 'longBreak') setTimeLeft(15 * 60);
  };

  const add5Minutes = () => setTimeLeft((prev) => prev + 300);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handlePronounce = (text, lang = 'en-US') => {
    speakText(text, lang);
  };

  const handleToggleTask = (taskId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updated);
    saveStoredStudentTasks(updated);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `std-td-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      completed: false,
      timeEst: '25 daqiqa'
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStoredStudentTasks(updated);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation();
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    saveStoredStudentTasks(updated);
  };

  const handleAnswerOption = (optIdx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(optIdx);
    setIsAnswerSubmitted(true);
    if (optIdx === quizQuestions[quizIdx].correctIndex) {
      setQuizScore(prev => prev + 10);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    if (quizIdx + 1 < quizQuestions.length) {
      setQuizIdx(prev => prev + 1);
    } else {
      setQuizIdx(0);
    }
  };

  const handleSendToTutor = (e) => {
    e?.preventDefault();
    if (!tutorInput.trim()) return;

    const userMsg = {
      id: `std-msg-${Date.now()}`,
      sender: 'user',
      text: tutorInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTutorMessages(prev => [...prev, userMsg]);
    const question = tutorInput.trim();
    setTutorInput('');
    setIsTutorThinking(true);

    setTimeout(() => {
      let reply = '';
      const qLower = question.toLowerCase();

      if (qLower.includes('writing') || qLower.includes('essay') || qLower.includes('insho')) {
        reply = `✍️ **IELTS Writing Tahlili:**\n\nSiz kiritgan mavzu bo'yicha 4-bosqichli reja:\n1. **Introduction:** Paraphrase the prompt + clear thesis statement.\n2. **Body Paragraph 1:** Asosiy sabab (Masalan: Technological advancements) + misol.\n3. **Body Paragraph 2:** Qarama-qarshi tomon yoki natija.\n4. **Conclusion:** Xulosa va shaxsiy qarash.\n\n💡 *Maslahat:* "Furthermore", "Consequently", "On the contrary" kabi akademik bog'lovchilarni qo'llang.`;
      } else if (qLower.includes('grammatika') || qLower.includes('qoida') || qLower.includes('zamonaviy') || qLower.includes('past')) {
        reply = `🧠 **Grammatika Maslahati:**\n\nIngliz tilida fikrni chiroyli ifodalash uchun **Inversion** va **Conditionals** strukturalaridan foydalaning:\n• *Oddiy gap:* "I rarely visit that place."\n• *Yuqori Band (C1):* "Seldom do I visit such places."\n\nBu kabi tuzilmalar imtihonda baland ball olishga yordam beradi!`;
      } else {
        reply = `🎯 **Shaxsiy Repetitor Javobi:**\n\nAjoyib savol! "${question}" bo'yicha quyidagilarni bilish foydali:\n• Ushbu mavzuda eng ko'p ishlatiladigan so'zlar: *substantially, diligently, accomplish, crucial*.\n• Darsdagi bugungi mavzularni mustahkamlash uchun "Til & Lug'at" bo'limidagi so'zlarni audio talaffuz qilib ko'ring!`;
      }

      const aiReply = {
        id: `ai-rep-${Date.now()}`,
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTutorMessages(prev => [...prev, aiReply]);
      setIsTutorThinking(false);
    }, 550);
  };

  const activeCard = flashcards[currentCardIdx];

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'active') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="student-container animate-fade-in">
      {/* Student Profile Overview Header */}
      <div className="student-profile-card">
        <div className="student-header-left">
          <div className="student-avatar-box animate-float">
            <span>{activeUser?.avatar || currentStudent.avatar || '👨‍🎓'}</span>
          </div>
          <div>
            <div className="student-badge-line">
              <span className="student-role-pill">O'quvchi Shaxsiy Kabineti</span>
              <span className="student-id-tag-pill" style={{ background: '#1e3a8a', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                ID: {currentStudent.id.toUpperCase()}
              </span>
              <span className="student-group-pill">{currentStudent.group}</span>
            </div>
            <h1 className="student-name">{activeUser?.name || currentStudent.name}</h1>
            <p className="student-bio">
              📧 <strong>{currentStudent.email || activeUser?.email || 'student@edulingua.uz'}</strong> • 📞 <strong>{currentStudent.phone || '+998 90 000-00-00'}</strong> • Daraja: <strong>{currentStudent.level || 'B2'}</strong>
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="student-stats-chips">
          <div className="student-stat-chip">
            <div className="stat-chip-icon blue">
              <IconBook size={20} />
            </div>
            <div>
              <div className="stat-chip-val">{savedWords.length} ta</div>
              <div className="stat-chip-lbl">Saqlangan So'zlar</div>
            </div>
          </div>

          <div className="student-stat-chip">
            <div className="stat-chip-icon green">
              <IconCheckCircle size={20} />
            </div>
            <div>
              <div className="stat-chip-val">{completedCount}/{tasks.length}</div>
              <div className="stat-chip-lbl">Bajarilgan Rejalar</div>
            </div>
          </div>

          <div className="student-stat-chip">
            <div className="stat-chip-icon purple">
              <IconClock size={20} />
            </div>
            <div>
              <div className="stat-chip-val">{pomodoroStats.completedToday} ta</div>
              <div className="stat-chip-lbl">Fokus Taymer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Subnav Tabs */}
      <div className="student-subnav-tabs">
        <button
          type="button"
          className={`student-nav-btn ${activeStudentTab === 'dictionary' ? 'active-student-tab' : ''}`}
          onClick={() => setActiveStudentTab('dictionary')}
        >
          <IconBook size={18} />
          <span>Til & Lug'at (11 ta Til)</span>
          <span className="tab-pill-sparkle">{savedWords.length}</span>
        </button>

        <button
          type="button"
          className={`student-nav-btn ${activeStudentTab === 'timer-todo' ? 'active-student-tab' : ''}`}
          onClick={() => setActiveStudentTab('timer-todo')}
        >
          <IconClock size={18} />
          <span>Fokus Taymer & To-Do List</span>
          <span className="tab-pill-count">{tasks.filter(t => !t.completed).length}</span>
        </button>

        <button
          type="button"
          className={`student-nav-btn ${activeStudentTab === 'grades' ? 'active-student-tab' : ''}`}
          onClick={() => setActiveStudentTab('grades')}
        >
          <IconAward size={18} />
          <span>Mening Baholarim & Jurnal</span>
        </button>

        <button
          type="button"
          className={`student-nav-btn ${activeStudentTab === 'attendance' ? 'active-student-tab' : ''}`}
          onClick={() => setActiveStudentTab('attendance')}
        >
          <IconCalendar size={18} />
          <span>Mening Davomatim</span>
        </button>

        <button
          type="button"
          className={`student-nav-btn ${activeStudentTab === 'flashcards' ? 'active-student-tab' : ''}`}
          onClick={() => setActiveStudentTab('flashcards')}
        >
          <IconTrophy size={18} />
          <span>Flashcard & Viktorina</span>
          <span className="tab-pill-sparkle">Quiz</span>
        </button>

        <button
          type="button"
          className={`student-nav-btn ${activeStudentTab === 'ai-tutor' ? 'active-student-tab' : ''}`}
          onClick={() => setActiveStudentTab('ai-tutor')}
        >
          <IconBot size={18} />
          <span>24/7 AI Repetitor</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: TIL VA LUG'AT (DICTIONARY & 11 LANGUAGES)
          ========================================================= */}
      {activeStudentTab === 'dictionary' && (
        <div className="student-tab-content animate-fade-in">
          {/* Language Selector Bar */}
          <div className="language-selector-bar mb-4">
            <span className="lang-bar-label">
              <IconGlobe size={18} />
              <span>O'rganish Tilini Tanlang:</span>
            </span>
            <div className="languages-scroll">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-chip-btn ${selectedLanguage === lang.code ? 'active-lang-chip' : ''}`}
                  onClick={() => handleDictLanguageChange(lang.code)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="dictionary-search-box mb-4">
            <div className="search-input-wrapper">
              <IconSearch size={20} className="search-icon" />
              <input
                type="text"
                className="radial-input dict-search-field"
                value={dictSearchQuery}
                onChange={(e) => setDictSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDictSearch()}
                placeholder={`${currentLangObj.name} tilida so'z yozing (Masalan: ${sampleSuggestions[selectedLanguage]?.[0] || 'resilient'})...`}
              />
              <button
                type="button"
                className="radial-button-primary"
                onClick={() => handleDictSearch()}
                disabled={isDictLoading}
              >
                {isDictLoading ? 'Qidirilmoqda...' : 'Qidirish'}
              </button>
            </div>

            {/* Quick Sample Chips */}
            <div className="quick-suggestions-row mt-2">
              <span className="suggestions-label">Namunaviy so'zlar:</span>
              {(sampleSuggestions[selectedLanguage] || []).map((w) => (
                <button
                  key={w}
                  type="button"
                  className="quick-word-chip radial-button-secondary py-1 px-2 text-xs"
                  onClick={() => {
                    setDictSearchQuery(w);
                    handleDictSearch(w, selectedLanguage);
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {dictSaveMsg && (
            <div className="login-success-alert animate-pop-in mb-3">
              <IconCheckCircle size={18} />
              <span>{dictSaveMsg}</span>
            </div>
          )}

          {/* Word Result Card */}
          {dictResult && (
            <div className="dictionary-result-card animate-slide-up">
              <div className="result-header-row">
                <div className="word-title-wrap">
                  <h2 className="result-word-heading">{dictResult.word}</h2>
                  <span className="phonetic-badge">{dictResult.phonetic}</span>
                  <button
                    type="button"
                    className="audio-btn-circle"
                    onClick={() => handlePronounce(dictResult.word, dictResult.language)}
                    title="Audio talaffuzni tinglash"
                  >
                    <IconVolume size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`radial-button-${isWordSaved ? 'secondary' : 'primary'}`}
                  onClick={handleSaveStudentWord}
                >
                  <IconBookmark size={16} />
                  <span>{isWordSaved ? "Lug'atda Saqlangan ✓" : "Lug'atga Saqlash"}</span>
                </button>
              </div>

              {/* Translation & Definition */}
              <div className="result-body-grid">
                <div className="result-definition-box">
                  <div className="box-subheading">O'zbekcha Tarjimasi & Ma'nosi:</div>
                  <div className="translation-highlight">{dictResult.translation}</div>
                  <p className="definition-text">{dictResult.definition}</p>
                </div>

                {dictResult.mnemonic && (
                  <div className="result-mnemonic-box">
                    <div className="box-subheading">
                      <IconSparkles size={16} className="text-yellow" />
                      <span>AI Mnemonika (Xotirada Qolish Usuli):</span>
                    </div>
                    <p className="mnemonic-text">{dictResult.mnemonic}</p>
                  </div>
                )}
              </div>

              {/* Examples & Synonyms */}
              <div className="result-examples-box mt-3">
                <div className="box-subheading">Namunaviy Gap (Kontekst):</div>
                <blockquote className="example-quote">"{dictResult.example}"</blockquote>
              </div>

              {dictResult.synonyms && dictResult.synonyms.length > 0 && (
                <div className="result-synonyms-row mt-3">
                  <span className="synonyms-lbl">Sinonimlar:</span>
                  <div className="synonyms-tags">
                    {dictResult.synonyms.map((syn) => (
                      <span key={syn} className="synonym-tag">{syn}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved Vocabulary List */}
          <div className="saved-vocabulary-section mt-4">
            <div className="panel-card-header">
              <h3 className="panel-title">
                <IconBookmark size={20} />
                <span>Mening Shaxsiy Lug'atim ({savedWords.length} ta so'z)</span>
              </h3>
            </div>

            <div className="saved-words-chips-grid">
              {savedWords.map((item) => (
                <div key={item.word} className="saved-word-card animate-slide-up">
                  <div className="saved-word-header">
                    <strong className="saved-word-name">{item.word}</strong>
                    <button
                      type="button"
                      className="saved-word-audio"
                      onClick={() => handlePronounce(item.word, item.language)}
                    >
                      <IconVolume size={14} />
                    </button>
                  </div>
                  <div className="saved-word-trans">{item.translation}</div>
                  <button
                    type="button"
                    className="delete-saved-word-btn"
                    onClick={() => onDeleteSavedWord(item.word)}
                    title="Lug'atdan o'chirish"
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: POMODORO FOCUS TIMER & TO-DO LIST
          ========================================================= */}
      {activeStudentTab === 'timer-todo' && (
        <div className="student-tab-content animate-fade-in">
          <div className="student-two-col-layout">
            {/* Left: Pomodoro Timer Card */}
            <div className="student-panel-card timer-interactive-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-title">
                    <IconClock size={20} />
                    <span>Pomodoro Dars Taymeri</span>
                  </h3>
                  <p className="panel-desc">Fokus bilan o'rganing va tanaffus qilib miyani dam oldiring</p>
                </div>
                <div className="timer-streak-badge animate-bounce-subtle">
                  <IconFlame size={16} />
                  <span>{pomodoroStats.currentStreak} Kunlik Streak!</span>
                </div>
              </div>

              {/* Mode Selectors */}
              <div className="timer-modes-bar">
                <button
                  type="button"
                  className={`timer-mode-btn ${timerMode === 'focus' ? 'active-mode' : ''}`}
                  onClick={() => handleSelectTimerMode('focus')}
                >
                  <span>🧠 Fokus Dars (25 daqiqa)</span>
                </button>
                <button
                  type="button"
                  className={`timer-mode-btn ${timerMode === 'shortBreak' ? 'active-mode' : ''}`}
                  onClick={() => handleSelectTimerMode('shortBreak')}
                >
                  <span>☕ Qisqa Tanaffus (5 daqiqa)</span>
                </button>
                <button
                  type="button"
                  className={`timer-mode-btn ${timerMode === 'longBreak' ? 'active-mode' : ''}`}
                  onClick={() => handleSelectTimerMode('longBreak')}
                >
                  <span>🌴 Katta Tanaffus (15 daqiqa)</span>
                </button>
              </div>

              {/* Big Animated Circular Display */}
              <div className="timer-circle-wrap animate-pop-in">
                <div className={`timer-clock-display ${isTimerRunning ? 'animate-timer-pulse' : ''}`}>
                  <div className="timer-time-text">{formatTime(timeLeft)}</div>
                  <div className="timer-status-sub">
                    {isTimerRunning ? '⏳ Dars vaqti ketmoqda...' : '⏸ Taymer to\'xtatilgan'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="timer-buttons-row">
                <button
                  type="button"
                  className={`timer-main-btn radial-button-primary ${isTimerRunning ? 'btn-pause' : ''}`}
                  onClick={toggleTimer}
                >
                  {isTimerRunning ? '⏸ To\'xtatish (Pause)' : '▶ Boshlash (Start)'}
                </button>
                <button
                  type="button"
                  className="radial-button-secondary"
                  onClick={resetTimer}
                  title="Taymerni boshiga qaytarish"
                >
                  <IconRefresh size={16} />
                  <span>Qayta o'rnatish</span>
                </button>
                <button
                  type="button"
                  className="radial-button-secondary"
                  onClick={add5Minutes}
                  title="+5 daqiqa qo'shish"
                >
                  <span>+5 daqiqa</span>
                </button>
              </div>

              {/* Today Focus Stats */}
              <div className="timer-stats-footer">
                <div className="timer-stat-box">
                  <span>Bugungi sessiyalar:</span>
                  <strong>{pomodoroStats.completedToday} ta</strong>
                </div>
                <div className="timer-stat-box">
                  <span>Fokus daqiqalari:</span>
                  <strong>{pomodoroStats.totalFocusMinutes} daqiqa</strong>
                </div>
                <div className="timer-stat-box">
                  <span>Kunlik maqsad:</span>
                  <strong>{pomodoroStats.targetSessions} sessiya</strong>
                </div>
              </div>
            </div>

            {/* Right: Student To-Do List */}
            <div className="student-panel-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-title">
                    <IconCheckCircle size={20} />
                    <span>Mening Vazifalarim & To-Do List</span>
                  </h3>
                  <p className="panel-desc">Dars topshiriqlari va uy vazifalari nazorati</p>
                </div>
                <div className="progress-badge-chip">
                  <span>{progressPercent}% Bajarildi</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="todo-progress-track">
                <div
                  className="todo-progress-fill animate-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="todo-add-form">
                <input
                  type="text"
                  className="radial-input"
                  placeholder="Yangi dars vazifasini yozing..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
                <div className="todo-form-controls">
                  <select
                    className="radial-select py-1 px-2 text-xs"
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                  >
                    <option value="IELTS Reading">📖 IELTS Reading</option>
                    <option value="IELTS Listening">🎧 IELTS Listening</option>
                    <option value="IELTS Writing">✍️ IELTS Writing</option>
                    <option value="IELTS Speaking">🗣️ IELTS Speaking</option>
                    <option value="Vocabulary">💡 Lug'at</option>
                    <option value="Grammar">📝 Grammatika</option>
                  </select>

                  <select
                    className="radial-select py-1 px-2 text-xs"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="high">🔴 Yuqori</option>
                    <option value="medium">🟡 O'rta</option>
                    <option value="low">🟢 Oddiy</option>
                  </select>

                  <button type="submit" className="radial-button-primary py-1 px-3 text-xs">
                    <IconPlus size={16} />
                    <span>Qo'shish</span>
                  </button>
                </div>
              </form>

              {/* Filter Pills */}
              <div className="todo-filter-pills">
                <button
                  type="button"
                  className={`todo-filter-btn ${taskFilter === 'all' ? 'active-filter' : ''}`}
                  onClick={() => setTaskFilter('all')}
                >
                  Barchasi ({tasks.length})
                </button>
                <button
                  type="button"
                  className={`todo-filter-btn ${taskFilter === 'active' ? 'active-filter' : ''}`}
                  onClick={() => setTaskFilter('active')}
                >
                  Bajarilmoqda ({tasks.filter(t => !t.completed).length})
                </button>
                <button
                  type="button"
                  className={`todo-filter-btn ${taskFilter === 'completed' ? 'active-filter' : ''}`}
                  onClick={() => setTaskFilter('completed')}
                >
                  Bajarilgan ({completedCount})
                </button>
              </div>

              {/* Task Items List */}
              <div className="todo-items-list">
                {filteredTasks.length === 0 ? (
                  <div className="empty-state-box text-center py-6">
                    <IconCheckCircle size={36} className="text-muted mx-auto mb-2" />
                    <h4 className="text-dark-navy font-semibold text-base">Hozircha birorta ham vazifa qo'shilmagan</h4>
                    <p className="text-muted text-xs mt-1">
                      Yuqoridagi shakldan yangi dars topshirig'i yoki mashg'ulot rejasini o'zingiz kiritishingiz mumkin!
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`student-task-card ${t.completed ? 'task-done' : ''} animate-slide-up`}
                      onClick={() => handleToggleTask(t.id)}
                    >
                      <div className="task-checkbox-wrap">
                        <div className={`custom-checkbox ${t.completed ? 'checked animate-check-pop' : ''}`}>
                          {t.completed && <IconCheck size={14} />}
                        </div>
                      </div>
                      <div className="task-info">
                        <strong className="task-title">{t.title}</strong>
                        <div className="task-meta">
                          <span className="task-subject-tag">{t.subject}</span>
                          <span className={`task-priority-tag pri-${t.priority}`}>
                            {t.priority === 'high' ? 'Yuqori' : t.priority === 'medium' ? 'O\'rta' : 'Oddiy'}
                          </span>
                          <span className="task-deadline">⏱ {t.timeEst || t.deadline}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="task-delete-btn"
                        onClick={(e) => handleDeleteTask(t.id, e)}
                        title="Vazifani o'chirish"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Database JSON backup sync button */}
              <div className="db-sync-bar mt-3">
                <button
                  type="button"
                  className="radial-button-secondary py-1 px-3 text-xs w-full"
                  onClick={exportDatabaseToJson}
                  title="db.json fayliga barcha ma'lumotlarni saqlab yuklab olish"
                >
                  <span>💾 db.json Formatida Ma'lumotlarni Saqlash / Eksport Qilish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: GRADES & REPORT
          ========================================================= */}
      {activeStudentTab === 'grades' && (
        <div className="student-tab-content animate-fade-in">
          <div className="student-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconAward size={20} />
                  <span>Barcha Nazorat Testlari va Imtihon Natijalari</span>
                </h3>
                <p className="panel-desc">
                  Reading, Listening, Writing va Speaking ko'nikmalari bo'yicha to'liq hisobot
                </p>
              </div>
            </div>

            <div className="student-grades-list">
              {(!currentStudent.grades || currentStudent.grades.length === 0) ? (
                <div className="empty-state-box text-center py-8">
                  <IconAward size={48} className="text-muted mx-auto mb-2" />
                  <h4 className="text-dark-navy font-semibold text-lg">Hozircha baholash o'tkazilmagan</h4>
                  <p className="text-muted text-sm mt-1">
                    O'qituvchingiz yangi test yoki imtihon baholarini kiritishi bilan bu yerda to'liq bo'limlar kesimida aks etadi.
                  </p>
                </div>
              ) : (
                currentStudent.grades.map((gr) => (
                  <div key={gr.id} className="student-grade-item-card animate-slide-up">
                    <div className="grade-item-top">
                      <div>
                        <h4 className="grade-subject">{gr.subject}</h4>
                        <span className="grade-date">{gr.date}</span>
                      </div>
                      <div className="grade-score-pill">
                        <span className="grade-letter">{gr.gradeLetter}</span>
                        <span className="grade-pts">{gr.score} / {gr.maxScore} ball ({gr.percentage}%)</span>
                      </div>
                    </div>

                    {gr.sections && (
                      <div className="grade-sections-grid">
                        {gr.sections.map((sec) => (
                          <div key={sec.name} className="grade-sec-box">
                            <span className="sec-name">{sec.name}</span>
                            <strong className="sec-score">{sec.score} / {sec.maxScore}</strong>
                            <div className="sec-bar-track">
                              <div className="sec-bar-fill animate-progress-fill" style={{ width: `${sec.percentage}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {gr.note && (
                      <div className="teacher-note-box">
                        <strong>👨‍🏫 Ustoz Izohi:</strong>
                        <p>{gr.note}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: MY ATTENDANCE
          ========================================================= */}
      {activeStudentTab === 'attendance' && (() => {
        const attEntries = Object.entries(currentStudent.attendance || {});
        const defaultDates = ['2026-08-17', '2026-08-16', '2026-08-15', '2026-08-14', '2026-08-13', '2026-08-12', '2026-08-10'];
        const datesToRender = attEntries.length > 0 ? Object.keys(currentStudent.attendance) : defaultDates;
        
        const presentCount = datesToRender.filter(d => (currentStudent.attendance?.[d] || 'present') === 'present').length;
        const lateCount = datesToRender.filter(d => currentStudent.attendance?.[d] === 'late').length;
        const absentCount = datesToRender.filter(d => currentStudent.attendance?.[d] === 'absent').length;
        const excusedCount = datesToRender.filter(d => currentStudent.attendance?.[d] === 'excused').length;
        const totalCount = datesToRender.length;
        const attRate = totalCount > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / totalCount) * 100) : 100;

        return (
          <div className="student-tab-content animate-fade-in">
            <div className="student-panel-card">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-title">
                    <IconCalendar size={20} />
                    <span>Shaxsiy Davomat Kalendari (Avgust 2026)</span>
                  </h3>
                  <p className="panel-desc">
                    Darslarga qatnashish intizomi va darslar kesimidagi davomat holati
                  </p>
                </div>
                <div className="attendance-percentage-badge">
                  <IconCheckCircle size={18} />
                  <span>{attRate}% Qatnashish Ko'rsatkichi</span>
                </div>
              </div>

              {/* Attendance Quick Stats Chips */}
              <div className="profile-summary-cards mb-4">
                <div className="prof-stat-box" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                  <small style={{ color: '#15803d', fontWeight: 800 }}>✓ Darsda Qatnashdi</small>
                  <strong style={{ color: '#15803d' }}>{presentCount} ta dars</strong>
                </div>
                <div className="prof-stat-box" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                  <small style={{ color: '#b45309', fontWeight: 800 }}>⚠️ Kechikib Keldi</small>
                  <strong style={{ color: '#b45309' }}>{lateCount} ta dars</strong>
                </div>
                <div className="prof-stat-box" style={{ background: '#fff1f2', borderColor: '#fecdd3' }}>
                  <small style={{ color: '#be123c', fontWeight: 800 }}>✗ Kelmadi (Qoldirdi)</small>
                  <strong style={{ color: '#be123c' }}>{absentCount} ta dars</strong>
                </div>
              </div>

              <div className="student-attendance-calendar">
                {datesToRender.map((date) => {
                  const status = currentStudent.attendance?.[date] || 'present';
                  return (
                    <div key={date} className={`calendar-day-card ${status}-card animate-slide-up`}>
                      <div className="cal-day-date">{date}</div>
                      <div className="cal-day-status">
                        {status === 'present' && <span className="status-tag green">✓ Darsda Qatnashdi</span>}
                        {status === 'late' && <span className="status-tag yellow">⚠️ Kechikib Keldi</span>}
                        {status === 'absent' && <span className="status-tag red">✗ Kelmadi</span>}
                        {status === 'excused' && <span className="status-tag blue">ℹ Sababli</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================
          TAB 5: FLASHCARDS & QUIZ GAME
          ========================================================= */}
      {activeStudentTab === 'flashcards' && (
        <div className="student-tab-content animate-fade-in">
          <div className="student-two-col-layout">
            {/* Interactive Flashcard Card */}
            <div className="student-panel-card">
              <div className="panel-card-header">
                <h3 className="panel-title">
                  <IconBook size={20} />
                  <span>Interaktiv Flashcard ({currentCardIdx + 1} / {flashcards.length})</span>
                </h3>
                <button
                  type="button"
                  className="radial-button-secondary py-1 px-3 text-xs"
                  onClick={() => handlePronounce(activeCard.word)}
                >
                  <IconVolume size={16} />
                  <span>Ovozli Talaffuz</span>
                </button>
              </div>

              <div
                className={`interactive-flashcard ${isCardFlipped ? 'card-flipped' : ''}`}
                onClick={() => setIsCardFlipped(!isCardFlipped)}
              >
                {!isCardFlipped ? (
                  <div className="flashcard-front">
                    <span className="card-category-tag">{activeCard.category}</span>
                    <h2 className="card-word">{activeCard.word}</h2>
                    <span className="card-phonetic">{activeCard.phonetic}</span>
                    <div className="card-flip-hint">Kartani aylantirish uchun bosing 🔄</div>
                  </div>
                ) : (
                  <div className="flashcard-back">
                    <span className="card-category-tag">Ma'nosi & Tarjimasi</span>
                    <h3 className="card-translation">{activeCard.translation}</h3>
                    <p className="card-example">"{activeCard.example}"</p>
                    <div className="card-flip-hint">Oldinga qaytish uchun bosing 🔄</div>
                  </div>
                )}
              </div>

              <div className="flashcard-controls">
                <button
                  type="button"
                  className="radial-button-secondary"
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCurrentCardIdx((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                  }}
                >
                  ← Oldingi So'z
                </button>

                <button
                  type="button"
                  className="radial-button-primary"
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCurrentCardIdx((prev) => (prev + 1 < flashcards.length ? prev + 1 : 0));
                  }}
                >
                  Keyingi So'z →
                </button>
              </div>
            </div>

            {/* Quick Word Quiz Mini-Game */}
            <div className="student-panel-card">
              <div className="panel-card-header">
                <h3 className="panel-title">
                  <IconTrophy size={20} />
                  <span>Lug'at Viktorinasi (Quiz Game)</span>
                </h3>
                <span className="quiz-score-badge">Ball: {quizScore} ⭐</span>
              </div>

              <div className="quiz-container">
                <div className="quiz-question-box">
                  <span className="quiz-step-tag">Savol {quizIdx + 1} / {quizQuestions.length}</span>
                  <h4 className="quiz-question-title">{quizQuestions[quizIdx].question}</h4>
                </div>

                <div className="quiz-options-list">
                  {quizQuestions[quizIdx].options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === quizQuestions[quizIdx].correctIndex;
                    let optionClass = 'quiz-opt-btn';
                    if (isAnswerSubmitted) {
                      if (isCorrect) optionClass += ' opt-correct';
                      else if (isSelected) optionClass += ' opt-wrong';
                    } else if (isSelected) {
                      optionClass += ' opt-selected';
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        className={optionClass}
                        onClick={() => handleAnswerOption(idx)}
                      >
                        <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                        <span className="opt-text">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswerSubmitted && (
                  <div className="quiz-explanation-box animate-fade-in">
                    <p>💡 {quizQuestions[quizIdx].explanation}</p>
                    <button
                      type="button"
                      className="radial-button-primary mt-3"
                      onClick={handleNextQuestion}
                    >
                      Keyingi Savol →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: 24/7 AI TUTOR CHAT
          ========================================================= */}
      {activeStudentTab === 'ai-tutor' && (
        <div className="student-tab-content animate-fade-in">
          <div className="student-panel-card">
            <div className="panel-card-header">
              <div className="ai-advisor-header-title">
                <div className="ai-badge-circle">
                  <IconBot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="panel-title">O'quvchi Shaxsiy AI Repetitori (24/7)</h3>
                  <p className="panel-desc">
                    Ingliz tili, grammatika, insho tekshirish va talaffuz bo'yicha sun'iy intellekt
                  </p>
                </div>
              </div>

              <div className="ai-quick-pills-row">
                <button
                  type="button"
                  className="radial-button-secondary py-1 px-3 text-xs"
                  onClick={() => setTutorInput("Mening IELTS Writing Task 2 inshomni tekshirib ber")}
                >
                  ✍️ Writing Tekshirish
                </button>
                <button
                  type="button"
                  className="radial-button-secondary py-1 px-3 text-xs"
                  onClick={() => setTutorInput("Conditionals mavzusini sodda qilib tushuntir")}
                >
                  🧠 Grammatika Qoidasi
                </button>
              </div>
            </div>

            <div className="director-ai-chat-box">
              {tutorMessages.map((msg) => (
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
                      <span>👨‍🎓</span>
                    </div>
                  )}
                </div>
              ))}

              {isTutorThinking && (
                <div className="chat-bubble-row ai-bubble-row">
                  <div className="chat-avatar ai-avatar-circle">
                    <IconBot size={18} />
                  </div>
                  <div className="ai-thinking-card">
                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>
                    <span className="thinking-dot"></span>
                    <span className="ml-2 text-xs">AI Repetitor javob tayyorlamoqda...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendToTutor} className="director-ai-input-form">
              <input
                type="text"
                className="director-ai-input"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Savolingizni yozing: Masalan, 'Resilient so'ziga gap tuzib ber'..."
              />
              <button
                type="submit"
                disabled={isTutorThinking || !tutorInput.trim()}
                className="radial-button-primary"
              >
                <IconSend size={16} />
                <span>So'rash</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
