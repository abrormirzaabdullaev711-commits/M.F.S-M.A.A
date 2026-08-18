import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DirectorView } from './components/DirectorView';
import { AdminView } from './components/AdminView';
import { StudentView } from './components/StudentView';

import { DashboardView } from './components/DashboardView';
import { DictionaryView } from './components/DictionaryView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { GradingView } from './components/GradingView';
import { AgentsView } from './components/AgentsView';
import { TimerAndTodoView } from './components/TimerAndTodoView';
import { MessagesView } from './components/MessagesView';

import {
  getStoredAuthUser,
  saveStoredAuthUser,
  getStoredStudents,
  saveStoredStudents,
  getSavedWords,
  saveSavedWords,
  getTheme,
  saveTheme,
  getAgentChats,
  saveAgentChats,
  getStoredTodos,
  saveStoredTodos,
  getStoredLanguage,
  saveStoredLanguage
} from './services/storage';

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredAuthUser);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(getTheme);
  const [language, setLanguageState] = useState(getStoredLanguage);
  const [students, setStudents] = useState(getStoredStudents);
  const [savedWords, setSavedWords] = useState(getSavedWords);
  const [agentChats, setAgentChats] = useState(getAgentChats);
  const [todos, setTodos] = useState(getStoredTodos);

  const handleSetLanguage = (lang) => {
    setLanguageState(lang);
    saveStoredLanguage(lang);
  };

  // Cross-tab preset contexts
  const [presetWordForAgent, setPresetWordForAgent] = useState(null);
  const [presetStudentForAgent, setPresetStudentForAgent] = useState(null);
  const [presetStudentForGrading, setPresetStudentForGrading] = useState(null);

  // Sync theme with HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // Sync auth user with storage
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    saveStoredAuthUser(user);
    if (user.role === 'director') setActiveTab('director');
    else if (user.role === 'admin') setActiveTab('admin');
    else if (user.role === 'student') setActiveTab('student');
    else setActiveTab('dashboard');
  };

  const handleSwitchUser = (newUser) => {
    setCurrentUser(newUser);
    saveStoredAuthUser(newUser);
    if (newUser.role === 'director') setActiveTab('director');
    else if (newUser.role === 'admin') setActiveTab('admin');
    else if (newUser.role === 'student') setActiveTab('student');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredAuthUser(null);
  };

  // Sync students with LocalStorage
  const updateStudentsState = (newStudents) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
  };

  // Sync saved words
  const updateSavedWordsState = (newWords) => {
    setSavedWords(newWords);
    saveSavedWords(newWords);
  };

  // Sync agent chats
  const updateAgentChatsState = (newChats) => {
    setAgentChats(newChats);
    saveAgentChats(newChats);
  };

  // Sync todos
  const updateTodosState = (newTodos) => {
    setTodos(newTodos);
    saveStoredTodos(newTodos);
  };

  // 1. Student Actions
  const handleAddStudent = (newStudent) => {
    const updated = [newStudent, ...students];
    updateStudentsState(updated);
  };

  const handleDeleteStudent = (studentId) => {
    const updated = students.filter((s) => s.id !== studentId);
    updateStudentsState(updated);
  };

  // 2. Attendance Actions (Bor / Yo'q / Sababli / Kechikkan)
  const handleUpdateAttendance = (studentId, dateStr, status) => {
    const updated = students.map((std) => {
      if (std.id === studentId) {
        return {
          ...std,
          attendance: {
            ...(std.attendance || {}),
            [dateStr]: status
          }
        };
      }
      return std;
    });
    updateStudentsState(updated);
  };

  const handleMarkAllPresent = (dateStr, groupFilter) => {
    const updated = students.map((std) => {
      if (groupFilter === 'Barcha guruhlar' || std.group === groupFilter) {
        return {
          ...std,
          attendance: {
            ...(std.attendance || {}),
            [dateStr]: 'present'
          }
        };
      }
      return std;
    });
    updateStudentsState(updated);
  };

  // 3. Grading Actions
  const handleAddGrade = (studentId, gradeObject) => {
    const newGrade = {
      id: `gr-${Date.now()}`,
      ...gradeObject
    };

    const updated = students.map((std) => {
      if (std.id === studentId) {
        return {
          ...std,
          grades: [newGrade, ...(std.grades || [])]
        };
      }
      return std;
    });
    updateStudentsState(updated);
  };

  const handleDeleteGrade = (studentId, gradeId) => {
    const updated = students.map((std) => {
      if (std.id === studentId) {
        return {
          ...std,
          grades: (std.grades || []).filter((g) => g.id !== gradeId)
        };
      }
      return std;
    });
    updateStudentsState(updated);
  };

  // 4. Saved Words Actions
  const handleSaveWord = (wordEntry) => {
    const exists = savedWords.some(
      (w) => w.word.toLowerCase() === wordEntry.word.toLowerCase()
    );
    if (!exists) {
      const updated = [wordEntry, ...savedWords];
      updateSavedWordsState(updated);
    }
  };

  const handleDeleteSavedWord = (wordStr) => {
    const updated = savedWords.filter(
      (w) => w.word.toLowerCase() !== wordStr.toLowerCase()
    );
    updateSavedWordsState(updated);
  };

  // 5. Cross-navigation handlers
  const handleConsultAgentWithWord = (wordObj) => {
    setPresetWordForAgent(wordObj);
    setPresetStudentForAgent(null);
    setActiveTab('agents');
  };

  const handleConsultAgentWithStudent = (studentObj) => {
    setPresetStudentForAgent(studentObj);
    setPresetWordForAgent(null);
    setActiveTab('agents');
  };

  const handleNavigateToGrading = (studentId) => {
    setPresetStudentForGrading(studentId);
    setActiveTab('grading');
  };

  const handleNavigateToAttendance = (studentId) => {
    setActiveTab('attendance');
  };

  // Stats calculation for Navbar
  const todayStr = new Date().toISOString().split('T')[0];
  const presentCount = students.filter(
    (s) => s.attendance?.[todayStr] === 'present'
  ).length;
  const todayRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;
  const pendingTasks = todos.filter((t) => !t.completed).length;

  // IF NOT LOGGED IN -> RENDER LOGIN VIEW
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const role = currentUser.role || 'teacher';

  return (
    <div className="app-container">
      {/* Top Navbar Navigation with User Profile & Role Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onUpdateCurrentUser={setCurrentUser}
        language={language}
        setLanguage={handleSetLanguage}
        stats={{
          savedWordsCount: savedWords.length,
          studentsCount: students.length,
          todayAttendanceRate: todayRate,
          pendingTasksCount: pendingTasks
        }}
      />

      {/* Main Views Container according to Role */}
      <main className="main-content-layout">
        {/* 1. DIRECTOR ROLE VIEW */}
        {role === 'director' && (
          <DirectorView
            students={students}
            savedWords={savedWords}
            currentUser={currentUser}
            language={language}
          />
        )}

        {/* 2. ADMIN & SUPERADMIN ROLE VIEW */}
        {(role === 'admin' || role === 'superadmin') && (
          <AdminView
            students={students}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            currentUser={currentUser}
            language={language}
          />
        )}

        {/* 3. STUDENT ROLE VIEW */}
        {role === 'student' && (
          <StudentView
            activeUser={currentUser}
            students={students}
            onUpdateStudents={updateStudentsState}
            savedWords={savedWords}
            onSaveWord={handleSaveWord}
            onDeleteSavedWord={handleDeleteSavedWord}
            language={language}
          />
        )}

        {/* 4. TEACHER ROLE VIEWS */}
        {role === 'teacher' && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                students={students}
                savedWords={savedWords}
                onNavigateTab={setActiveTab}
                onConsultAgentWithStudent={handleConsultAgentWithStudent}
                language={language}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesView
                currentUser={currentUser}
                students={students}
                language={language}
              />
            )}

            {activeTab === 'dictionary' && (
              <DictionaryView
                savedWords={savedWords}
                onSaveWord={handleSaveWord}
                onDeleteSavedWord={handleDeleteSavedWord}
                onConsultAgentWithWord={handleConsultAgentWithWord}
                language={language}
              />
            )}

            {activeTab === 'timer-todo' && (
              <TimerAndTodoView
                todos={todos}
                onUpdateTodos={updateTodosState}
                language={language}
              />
            )}

            {activeTab === 'students' && (
              <StudentsView
                students={students}
                onAddStudent={handleAddStudent}
                onDeleteStudent={handleDeleteStudent}
                onNavigateToGrading={handleNavigateToGrading}
                onNavigateToAttendance={handleNavigateToAttendance}
                onConsultAgentWithStudent={handleConsultAgentWithStudent}
                language={language}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                students={students}
                onUpdateAttendance={handleUpdateAttendance}
                onMarkAllPresent={handleMarkAllPresent}
                language={language}
              />
            )}

            {activeTab === 'grading' && (
              <GradingView
                students={students}
                onAddGrade={handleAddGrade}
                onDeleteGrade={handleDeleteGrade}
                initialSelectedStudentId={presetStudentForGrading}
                language={language}
              />
            )}

            {activeTab === 'agents' && (
              <AgentsView
                students={students}
                savedWords={savedWords}
                agentChats={agentChats}
                onSaveChats={updateAgentChatsState}
                presetWord={presetWordForAgent}
                presetStudent={presetStudentForAgent}
                language={language}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;


