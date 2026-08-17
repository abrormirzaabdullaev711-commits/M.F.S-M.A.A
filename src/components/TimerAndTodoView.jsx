import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  IconClock, 
  IconCheck, 
  IconPlus, 
  IconTrash, 
  IconRefresh, 
  IconSparkles, 
  IconBook, 
  IconAward, 
  IconFlame, 
  IconVolume,
  IconStar
} from './Icons';

export const TimerAndTodoView = ({ todos, onUpdateTodos }) => {
  // ==========================================
  // 1. TIMER STATE & LOGIC
  // ==========================================
  const TIMER_PRESETS = [
    { id: 'pomodoro', name: '🍅 Pomodoro Fokus', minutes: 25, color: '#2563eb' },
    { id: 'short-break', name: '☕ Qisqa Tanaffus', minutes: 5, color: '#059669' },
    { id: 'long-break', name: '🌴 Katta Tanaffus', minutes: 15, color: '#d97706' },
    { id: 'exam', name: '⏱️ Imtihon (45m)', minutes: 45, color: '#1d4ed8' },
    { id: 'ielts', name: '🎯 IELTS Reading/Listening (60m)', minutes: 60, color: '#1e40af' },
    { id: 'stopwatch', name: '⚡ Sekundomer (Speaking)', minutes: 0, isStopwatch: true, color: '#7c3aed' }
  ];

  const [activePreset, setActivePreset] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(20);
  const [completedSessions, setCompletedSessions] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef(null);

  // Play audio beep using Web Audio API
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio alert error:', e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (activePreset === 'stopwatch') {
          // Stopwatch counts up
          setTimeLeft((prev) => prev + 1);
        } else {
          // Timer counts down
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              playAlertSound();
              setCompletedSessions((s) => s + 1);
              try {
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
              } catch (err) {}
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, activePreset, soundEnabled]);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setIsRunning(false);
    if (preset.isStopwatch) {
      setTimeLeft(0);
      setTotalDuration(0);
    } else {
      const secs = preset.minutes * 60;
      setTimeLeft(secs);
      setTotalDuration(secs);
    }
  };

  const handleApplyCustomMinutes = () => {
    const mins = Math.max(1, Number(customMinutes) || 20);
    setActivePreset('custom');
    setIsRunning(false);
    const secs = mins * 60;
    setTimeLeft(secs);
    setTotalDuration(secs);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (activePreset === 'stopwatch') {
      setTimeLeft(0);
    } else {
      const preset = TIMER_PRESETS.find((p) => p.id === activePreset);
      const secs = preset ? preset.minutes * 60 : (Number(customMinutes) || 20) * 60;
      setTimeLeft(secs);
      setTotalDuration(secs);
    }
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Progress calculation
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const progressPct = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progressPct * circumference;

  // ==========================================
  // 2. TO-DO LIST STATE & LOGIC
  // ==========================================
  const [todoFilter, setTodoFilter] = useState('all'); // all, active, completed
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Lug\'at');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskTimeEst, setNewTaskTimeEst] = useState('20 daqiqa');

  const categories = ['Lug\'at', 'Dars', 'Imtihon', 'Davomat', 'AI Agent', 'Shaxsiy'];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `td-${Date.now()}`,
      text: newTaskText.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
      timeEst: newTaskTimeEst
    };

    onUpdateTodos([newTask, ...todos]);
    setNewTaskText('');
  };

  const handleToggleTodo = (id) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          try {
            confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
          } catch (e) {}
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    onUpdateTodos(updated);
  };

  const handleDeleteTodo = (id) => {
    onUpdateTodos(todos.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    onUpdateTodos(todos.filter((t) => !t.completed));
  };

  // Filtered Todos
  const filteredTodos = todos.filter((t) => {
    if (todoFilter === 'active') return !t.completed;
    if (todoFilter === 'completed') return t.completed;
    return true;
  });

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="timer-todo-wrapper">
      {/* Header Banner */}
      <div className="section-header-box">
        <div className="header-info">
          <div className="header-badge">
            <IconClock size={16} /> Samaradorlik & Fokus Markazi
          </div>
          <h2>Dars & Imtihon Taymeri va Kunlik Rejalar (To-Do List)</h2>
          <p>
            Vaqtingizni Pomodoro va Imtihon taymeri yordamida to'g'ri taqsimlang, o'quv vazifalarini rejalashtiring 
            va har bir bajarilgan topshiriqni bitta joyda kuzatib boring.
          </p>
        </div>
        <div className="header-actions">
          <div className="timer-sessions-pill">
            <IconFlame size={18} className="text-orange animate-bounce-subtle" />
            <span>Bugun: <strong>{completedSessions} ta</strong> sessiya yakunlandi</span>
          </div>
        </div>
      </div>

      {/* Main Unified 2-Column Grid */}
      <div className="timer-todo-grid">
        {/* ==========================================
            LEFT COLUMN: SMART TIMER & STOPWATCH
            ========================================== */}
        <div className="timer-section-card">
          <div className="timer-card-header">
            <div className="flex items-center gap-2">
              <IconClock size={22} className="text-accent" />
              <h3>Dars & Fokus Taymeri</h3>
            </div>
            <button
              type="button"
              className={`sound-toggle-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Ovozli signal yoqilgan' : 'Ovozli signal o\'chirilgan'}
            >
              <IconVolume size={17} />
              <span>{soundEnabled ? 'Ovoz: ON' : 'Ovoz: OFF'}</span>
            </button>
          </div>

          {/* Preset Chips */}
          <div className="timer-presets-row">
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`timer-preset-btn ${activePreset === preset.id ? 'active' : ''}`}
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Circular Animated Countdown Display */}
          <div className="circular-timer-wrapper">
            <div className={`circular-timer-container ${isRunning ? 'animate-timer-pulse' : ''}`}>
              <svg className="timer-svg-ring" width="230" height="230">
                {/* Background Track */}
                <circle
                  className="timer-ring-bg"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                  r={radius}
                  cx="115"
                  cy="115"
                />
                {/* Animated Progress Track */}
                {activePreset !== 'stopwatch' && (
                  <circle
                    className="timer-ring-prog animate-stroke-smooth"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="115"
                    cy="115"
                  />
                )}
              </svg>

              {/* Time Numbers in Center */}
              <div className="timer-center-text">
                <span className="timer-clock-digits">{formatTime(timeLeft)}</span>
                <span className="timer-state-label">
                  {activePreset === 'stopwatch'
                    ? '⚡ Nutq / Speaking hisobi'
                    : isRunning
                    ? '🟢 Fokus darsi davom etmoqda'
                    : timeLeft === 0
                    ? '🎉 Vaqt yakunlandi!'
                    : 'Pauzada'}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Action Controls */}
          <div className="timer-main-controls-row">
            {!isRunning ? (
              <button
                type="button"
                className="btn-primary timer-btn-huge animate-btn-pop"
                onClick={() => setIsRunning(true)}
              >
                ▶️ Boshlash (Start)
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary timer-btn-huge timer-btn-pause animate-btn-pop"
                onClick={() => setIsRunning(false)}
              >
                ⏸️ Pauza qilish
              </button>
            )}

            <button
              type="button"
              className="btn-secondary timer-btn-reset"
              onClick={handleResetTimer}
              title="Qayta o'rnatish"
            >
              <IconRefresh size={18} />
              <span>Qayta o'rnatish</span>
            </button>
          </div>

          {/* Custom Minutes Input Row */}
          <div className="custom-minutes-bar">
            <span className="custom-min-lbl">Ixtiyoriy daqiqa:</span>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="custom-min-input"
            />
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={handleApplyCustomMinutes}
            >
              O'rnatish
            </button>
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: TASK & TO-DO MANAGER
            ========================================== */}
        <div className="todo-section-card">
          <div className="todo-card-header">
            <div className="flex items-center gap-2">
              <IconAward size={22} className="text-accent" />
              <h3>Vazifalar & Kunlik Rejalar</h3>
            </div>
            <span className="todo-progress-counter">
              {completedTasks} / {totalTasks} bajarildi ({completionPercentage}%)
            </span>
          </div>

          {/* Progress Bar with Keyframes Animation */}
          <div className="todo-progress-bar-wrap">
            <div
              className="todo-progress-fill animate-progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Add New Task Form */}
          <form onSubmit={handleAddTask} className="add-todo-form-card">
            <div className="todo-input-row">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Yangi vazifa yoki reja yozing (masalan: 15 ta yangi so'z yodlash)..."
                className="todo-main-text-input"
              />
              <button
                type="submit"
                disabled={!newTaskText.trim()}
                className="btn-primary btn-add-todo animate-btn-pop"
              >
                <IconPlus size={18} />
                <span>Qo'shish</span>
              </button>
            </div>

            <div className="todo-options-row">
              <div className="todo-opt-group">
                <label>Kategoriya:</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="todo-mini-select"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="todo-opt-group">
                <label>Muhimlik:</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="todo-mini-select"
                >
                  <option value="high">🔴 Yuqori</option>
                  <option value="medium">🟡 O'rta</option>
                  <option value="low">🟢 Oddiy</option>
                </select>
              </div>

              <div className="todo-opt-group">
                <label>Taxminiy vaqt:</label>
                <input
                  type="text"
                  value={newTaskTimeEst}
                  onChange={(e) => setNewTaskTimeEst(e.target.value)}
                  className="todo-time-input"
                  placeholder="20 daqiqa"
                />
              </div>
            </div>
          </form>

          {/* Filter Tabs & Clear Actions */}
          <div className="todo-toolbar-row">
            <div className="todo-filter-pills">
              <button
                type="button"
                className={`todo-filter-btn ${todoFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTodoFilter('all')}
              >
                Barchasi ({todos.length})
              </button>
              <button
                type="button"
                className={`todo-filter-btn ${todoFilter === 'active' ? 'active' : ''}`}
                onClick={() => setTodoFilter('active')}
              >
                Bajarilmoqda ({todos.filter((t) => !t.completed).length})
              </button>
              <button
                type="button"
                className={`todo-filter-btn ${todoFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setTodoFilter('completed')}
              >
                Bajarildi ({todos.filter((t) => t.completed).length})
              </button>
            </div>

            {completedTasks > 0 && (
              <button
                type="button"
                className="btn-clear-completed"
                onClick={handleClearCompleted}
                title="Bajarilgan barcha vazifalarni ro'yxatdan o'chirish"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Tasks Scrollable List */}
          <div className="todo-items-scroll-list">
            {filteredTodos.length === 0 ? (
              <div className="empty-todo-box animate-fade-in">
                <IconCheck size={36} className="text-accent mb-2" />
                <p>Hozircha ushbu bo'limda vazifalar yo'q.</p>
                <span>Yuqoridagi formadan yangi vazifa qo'shing.</span>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`todo-item-row animate-slide-up ${todo.completed ? 'completed-row' : ''}`}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    className={`todo-checkbox-btn ${todo.completed ? 'checked animate-check-pop' : ''}`}
                    onClick={() => handleToggleTodo(todo.id)}
                    title={todo.completed ? 'Bajarilmagan deb belgilash' : 'Bajarildi deb belgilash'}
                  >
                    {todo.completed && <IconCheck size={16} />}
                  </button>

                  {/* Task Content */}
                  <div
                    className="todo-text-wrap"
                    onClick={() => handleToggleTodo(todo.id)}
                  >
                    <span className={`todo-title-text ${todo.completed ? 'strikethrough' : ''}`}>
                      {todo.text}
                    </span>
                    <div className="todo-meta-tags">
                      <span className="todo-cat-tag">{todo.category}</span>
                      <span className={`todo-prio-tag prio-${todo.priority}`}>
                        {todo.priority === 'high' ? '🔴 Yuqori' : todo.priority === 'medium' ? '🟡 O\'rta' : '🟢 Oddiy'}
                      </span>
                      {todo.timeEst && (
                        <span className="todo-time-tag">⏱️ {todo.timeEst}</span>
                      )}
                    </div>
                  </div>

                  {/* Delete Task */}
                  <button
                    type="button"
                    className="icon-mini-btn delete-mini-btn"
                    onClick={() => handleDeleteTodo(todo.id)}
                    title="Vazifani o'chirish"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
