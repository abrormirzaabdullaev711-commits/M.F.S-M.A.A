// LocalStorage helper for LinguaLoom & EduAgent
import { 
  INITIAL_STUDENTS, 
  INITIAL_DICTIONARY_ENTRIES, 
  INITIAL_USERS,
  ADMIN_DATA,
  STUDENT_PORTAL_DATA 
} from '../data/mockData';

const KEYS = {
  STUDENTS: 'edulingua_students_v1',
  SAVED_WORDS: 'edulingua_saved_words_v1',
  GRADES_LOG: 'edulingua_grades_log_v1',
  THEME: 'edulingua_theme_v1',
  AGENT_CHATS: 'edulingua_agent_chats_v1',
  TODOS: 'edulingua_todos_v1',
  AUTH_USER: 'edulingua_auth_user_v1',
  USERS: 'edulingua_users_list_v1',
  ADMIN_GROUPS: 'edulingua_admin_groups_v1',
  ADMIN_LOGS: 'edulingua_admin_logs_v1',
  ADMIN_SMS: 'edulingua_admin_sms_v1',
  STUDENT_FLASHCARDS: 'edulingua_student_flashcards_v1',
  STUDENT_TASKS: 'edulingua_student_tasks_v1'
};

// 1. Users & Auth Management
export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(KEYS.USERS);
    if (data) {
      const parsed = JSON.parse(data);
      // Migrate any 3-digit passwords to 4 digits
      const migrated = parsed.map(u => ({
        ...u,
        password: u.password === '123' ? '1234' : u.password
      }));
      return migrated;
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  } catch (e) {
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
};

export const getStoredAuthUser = () => {
  try {
    const data = localStorage.getItem(KEYS.AUTH_USER);
    if (data) return JSON.parse(data);
    // Return null so new users start at Login/Register view first
    return null;
  } catch (e) {
    return null;
  }
};

export const saveStoredAuthUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to save auth user:', e);
  }
};

// Update Profile Info (Name, Avatar, Phone, Password)
export const updateStoredUserProfile = (userId, updatedFields) => {
  const users = getStoredUsers();
  let updatedCurrentUser = null;

  const updatedUsers = users.map((u) => {
    if (u.id === userId || (u.username && u.username.toLowerCase() === userId.toLowerCase())) {
      const updated = { ...u, ...updatedFields };
      updatedCurrentUser = updated;
      return updated;
    }
    return u;
  });

  saveStoredUsers(updatedUsers);

  // If current auth user is this user, sync auth
  const currentAuth = getStoredAuthUser();
  if (currentAuth && (currentAuth.id === userId || currentAuth.username === userId)) {
    const mergedAuth = { ...currentAuth, ...updatedFields };
    saveStoredAuthUser(mergedAuth);
    return mergedAuth;
  }

  return updatedCurrentUser || currentAuth;
};

// Admin/Superadmin: Promote/Change User Role
export const updateUserRoleInStorage = (userId, newRole) => {
  const users = getStoredUsers();
  const roleTitles = {
    superadmin: { label: 'Bosh Admin (Super Admin)', title: 'Bosh Tizim Administratori', badge: 'Bosh Admin 👑', avatar: '👑' },
    director: { label: 'Direktor (Headmaster)', title: 'O\'quv Markaz Bosh Direktori', badge: 'Rahbariyat 🏛️', avatar: '🏛️' },
    admin: { label: 'Administrator (Admin)', title: 'Tizim va Xodimlar Boshqaruvchisi', badge: 'Tizim Nazorati ⚙️', avatar: '⚙️' },
    teacher: { label: 'O\'qituvchi (Instructor)', title: 'Katta Til Ustozi', badge: 'IELTS Expert 👨‍🏫', avatar: '👨‍🏫' },
    student: { label: 'O\'quvchi (Student)', title: 'O\'quvchi-Talaba', badge: 'Talaba ⭐', avatar: '👨‍🎓' }
  };

  const meta = roleTitles[newRole] || roleTitles.student;

  const updatedUsers = users.map((u) => {
    if (u.id === userId || u.studentId === userId || u.username === userId) {
      return {
        ...u,
        role: newRole,
        roleLabel: meta.label,
        roleTitle: meta.title,
        badge: meta.badge,
        avatar: meta.avatar
      };
    }
    return u;
  });

  saveStoredUsers(updatedUsers);

  // Sync if active user
  const currentAuth = getStoredAuthUser();
  if (currentAuth && (currentAuth.id === userId || currentAuth.studentId === userId || currentAuth.username === userId)) {
    const updatedAuth = {
      ...currentAuth,
      role: newRole,
      roleLabel: meta.label,
      roleTitle: meta.title,
      badge: meta.badge,
      avatar: meta.avatar
    };
    saveStoredAuthUser(updatedAuth);
    return { users: updatedUsers, currentAuth: updatedAuth };
  }

  return { users: updatedUsers, currentAuth };
};

// Student Registration with Unique IDs and Full Sync
export const registerNewStudent = (studentRegData) => {
  const users = getStoredUsers();
  const students = getStoredStudents();

  // Generate clean readable unique IDs
  const stdCount = students.length + 101;
  const newStudentId = `std-${stdCount}`;
  const newUserId = `usr-std-${stdCount}`;

  const email = studentRegData.email?.trim() || `${studentRegData.username.trim()}@edulingua.uz`;
  const phone = studentRegData.phone?.trim() || '+998 90 000-00-00';
  const name = studentRegData.name.trim();
  const group = studentRegData.group || 'IELTS Mastery (B2-C1)';
  const level = studentRegData.level || 'B1';
  const username = studentRegData.username.trim().toLowerCase();
  const password = studentRegData.password?.trim() || '1234';

  const newStudent = {
    id: newStudentId,
    name: name,
    email: email,
    group: group,
    level: level,
    phone: phone,
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

  const newUser = {
    id: newUserId,
    username: username,
    password: password,
    name: name,
    role: 'student',
    roleLabel: 'O\'quvchi (Student)',
    roleTitle: `${group} Talabasi`,
    avatar: '👨‍🎓',
    email: email,
    phone: phone,
    studentId: newStudentId,
    badge: 'Yangi Talaba',
    group: group,
    level: level,
    department: 'Talabalar Tarkibi',
    since: new Date().getFullYear().toString()
  };

  const updatedUsers = [newUser, ...users];
  const updatedStudents = [newStudent, ...students];

  saveStoredUsers(updatedUsers);
  saveStoredStudents(updatedStudents);
  saveStoredAuthUser(newUser);

  return { newUser, newStudent };
};

// 2. Students Management
export const getStoredStudents = () => {
  try {
    const data = localStorage.getItem(KEYS.STUDENTS);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  } catch (e) {
    console.error('Failed to read students from storage:', e);
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students) => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to storage:', e);
  }
};

// 3. Saved Words
export const getSavedWords = () => {
  try {
    const data = localStorage.getItem(KEYS.SAVED_WORDS);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEYS.SAVED_WORDS, JSON.stringify(INITIAL_DICTIONARY_ENTRIES));
    return INITIAL_DICTIONARY_ENTRIES;
  } catch (e) {
    console.error('Failed to read saved words:', e);
    return INITIAL_DICTIONARY_ENTRIES;
  }
};

export const saveSavedWords = (words) => {
  try {
    localStorage.setItem(KEYS.SAVED_WORDS, JSON.stringify(words));
  } catch (e) {
    console.error('Failed to save words:', e);
  }
};

// 4. Theme (Light Mode by default)
export const getTheme = () => {
  return 'light';
};

export const saveTheme = () => {
  try {
    localStorage.setItem(KEYS.THEME, 'light');
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
};

// 5. Agent Chats
export const getAgentChats = () => {
  try {
    const data = localStorage.getItem(KEYS.AGENT_CHATS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const saveAgentChats = (chats) => {
  try {
    localStorage.setItem(KEYS.AGENT_CHATS, JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save chats:', e);
  }
};

// 6. Todos
export const getStoredTodos = () => {
  try {
    const data = localStorage.getItem(KEYS.TODOS);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEYS.TODOS, JSON.stringify(INITIAL_TODOS));
    return INITIAL_TODOS;
  } catch (e) {
    return INITIAL_TODOS;
  }
};

export const saveStoredTodos = (todos) => {
  try {
    localStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
  } catch (e) {
    console.error('Failed to save todos:', e);
  }
};

// 7. Admin Groups
export const getStoredAdminGroups = () => {
  try {
    const data = localStorage.getItem(KEYS.ADMIN_GROUPS);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEYS.ADMIN_GROUPS, JSON.stringify(ADMIN_DATA.managedGroups));
    return ADMIN_DATA.managedGroups;
  } catch (e) {
    return ADMIN_DATA.managedGroups;
  }
};

export const saveStoredAdminGroups = (groups) => {
  try {
    localStorage.setItem(KEYS.ADMIN_GROUPS, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save admin groups:', e);
  }
};

// 8. Admin Logs
export const getStoredAdminLogs = () => {
  try {
    const data = localStorage.getItem(KEYS.ADMIN_LOGS);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEYS.ADMIN_LOGS, JSON.stringify(ADMIN_DATA.systemLogs));
    return ADMIN_DATA.systemLogs;
  } catch (e) {
    return ADMIN_DATA.systemLogs;
  }
};

export const saveStoredAdminLogs = (logs) => {
  try {
    localStorage.setItem(KEYS.ADMIN_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save admin logs:', e);
  }
};

// 9. Student Portal Tasks & To-Dos (EMPTY BY DEFAULT)
export const INITIAL_STUDENT_TODOS = [];

export const getStoredStudentTasks = () => {
  try {
    const data = localStorage.getItem(KEYS.STUDENT_TASKS);
    if (data !== null) return JSON.parse(data);
    localStorage.setItem(KEYS.STUDENT_TASKS, JSON.stringify([]));
    return [];
  } catch (e) {
    return [];
  }
};

export const saveStoredStudentTasks = (tasks) => {
  try {
    localStorage.setItem(KEYS.STUDENT_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save student tasks:', e);
  }
};

// 10. Student Pomodoro Focus Stats
export const getStoredPomodoroStats = () => {
  try {
    const data = localStorage.getItem('edulingua_pomodoro_v1');
    if (data) return JSON.parse(data);
    const initial = { completedToday: 3, totalFocusMinutes: 75, currentStreak: 5, targetSessions: 4 };
    localStorage.setItem('edulingua_pomodoro_v1', JSON.stringify(initial));
    return initial;
  } catch (e) {
    return { completedToday: 3, totalFocusMinutes: 75, currentStreak: 5, targetSessions: 4 };
  }
};

export const saveStoredPomodoroStats = (stats) => {
  try {
    localStorage.setItem('edulingua_pomodoro_v1', JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save pomodoro stats:', e);
  }
};

// 11. Database JSON Export & Import Sync
export const exportDatabaseToJson = () => {
  const db = {
    exportedAt: new Date().toISOString(),
    users: getStoredUsers(),
    students: getStoredStudents(),
    studentTodos: getStoredStudentTasks(),
    savedWords: getSavedWords(),
    adminGroups: getStoredAdminGroups(),
    systemLogs: getStoredAdminLogs(),
    todos: getStoredTodos(),
    pomodoro: getStoredPomodoroStats()
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `db.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  return db;
};

export const importDatabaseFromJson = (jsonData) => {
  try {
    if (jsonData.users && Array.isArray(jsonData.users)) {
      saveStoredUsers(jsonData.users);
    }
    if (jsonData.students && Array.isArray(jsonData.students)) {
      saveStoredStudents(jsonData.students);
    }
    if (jsonData.savedWords && Array.isArray(jsonData.savedWords)) {
      saveSavedWords(jsonData.savedWords);
    }
    if (jsonData.studentTodos && Array.isArray(jsonData.studentTodos)) {
      saveStoredStudentTasks(jsonData.studentTodos);
    }
    if (jsonData.adminGroups && Array.isArray(jsonData.adminGroups)) {
      saveStoredAdminGroups(jsonData.adminGroups);
    }
    if (jsonData.systemLogs && Array.isArray(jsonData.systemLogs)) {
      saveStoredAdminLogs(jsonData.systemLogs);
    }
    if (jsonData.todos && Array.isArray(jsonData.todos)) {
      saveStoredTodos(jsonData.todos);
    }
    if (jsonData.pomodoro) {
      saveStoredPomodoroStats(jsonData.pomodoro);
    }
    return { success: true, message: "db.json muvaffaqiyatli tiklandi va yangilandi!" };
  } catch (e) {
    return { success: false, message: "Xatolik: db.json formati noto'g'ri: " + e.message };
  }
};


