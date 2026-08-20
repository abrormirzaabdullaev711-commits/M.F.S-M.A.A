// LocalStorage helper for LinguaLoom & EduAgent
import { 
  INITIAL_STUDENTS, 
  INITIAL_DICTIONARY_ENTRIES, 
  INITIAL_USERS,
  ADMIN_DATA,
  STUDENT_PORTAL_DATA,
  INITIAL_TODOS
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
  STUDENT_TASKS: 'edulingua_student_tasks_v1',
  MESSAGES: 'edulingua_messages_v1',
  LANGUAGE: 'edulingua_lang_v1'
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

// Admin/Superadmin: Delete User Account Permanently
export const deleteStoredUser = (userId) => {
  const users = getStoredUsers();
  const userToDelete = users.find(
    (u) => u.id === userId || u.username === userId || (u.studentId && u.studentId === userId)
  );

  if (!userToDelete) {
    return { success: false, message: "Foydalanuvchi topilmadi", users };
  }

  const updatedUsers = users.filter(
    (u) => u.id !== userToDelete.id && u.username !== userToDelete.username
  );
  saveStoredUsers(updatedUsers);

  // If this user has an associated student profile, remove from students as well
  if (userToDelete.studentId || userToDelete.role === 'student') {
    const stdId = userToDelete.studentId || userToDelete.id;
    const students = getStoredStudents();
    const updatedStudents = students.filter(
      (s) => s.id !== stdId && s.id !== userToDelete.id && s.name !== userToDelete.name
    );
    saveStoredStudents(updatedStudents);
  }

  // Check if deleted user is currently authenticated user
  const currentAuth = getStoredAuthUser();
  const wasCurrentAuth =
    currentAuth &&
    (currentAuth.id === userToDelete.id || currentAuth.username === userToDelete.username);

  return {
    success: true,
    deletedUser: userToDelete,
    users: updatedUsers,
    wasCurrentAuth
  };
};

// Admin/Superadmin: Register New User with Any Custom Role
export const registerNewUser = (userData) => {
  const users = getStoredUsers();
  const newUserId = `usr-${userData.role || 'user'}-${Date.now()}`;

  const roleTitles = {
    superadmin: { label: 'Bosh Admin (Super Admin)', title: 'Bosh Tizim Administratori', badge: 'Bosh Admin 👑', avatar: '👑' },
    director: { label: 'Direktor (Headmaster)', title: 'O\'quv Markaz Bosh Direktori', badge: 'Rahbariyat 🏛️', avatar: '🏛️' },
    admin: { label: 'Administrator (Admin)', title: 'Tizim va Xodimlar Boshqaruvchisi', badge: 'Tizim Nazorati ⚙️', avatar: '⚙️' },
    teacher: { label: 'O\'qituvchi (Instructor)', title: 'Katta Til Ustozi', badge: 'IELTS Expert 👨‍🏫', avatar: '👨‍🏫' },
    student: { label: 'O\'quvchi (Student)', title: 'O\'quvchi-Talaba', badge: 'Talaba ⭐', avatar: '👨‍🎓' }
  };

  const roleKey = userData.role || 'student';
  const meta = roleTitles[roleKey] || roleTitles.student;
  const username = userData.username.trim().toLowerCase();

  const newUser = {
    id: newUserId,
    username: username,
    password: userData.password?.trim() || '1234',
    name: userData.name.trim(),
    role: roleKey,
    roleLabel: meta.label,
    roleTitle: meta.title,
    avatar: userData.avatar || meta.avatar,
    email: userData.email?.trim() || `${username}@edulingua.uz`,
    phone: userData.phone?.trim() || '+998 90 000-00-00',
    badge: meta.badge,
    department: userData.department || 'O\'quv Markazi',
    group: userData.group || (roleKey === 'student' ? 'IELTS Mastery (B2-C1)' : undefined),
    level: userData.level || (roleKey === 'student' ? 'B2' : undefined),
    since: new Date().getFullYear().toString()
  };

  if (roleKey === 'student') {
    const stdCount = getStoredStudents().length + 101;
    const stdId = `std-${stdCount}`;
    newUser.studentId = stdId;

    const newStd = {
      id: stdId,
      name: userData.name.trim(),
      email: newUser.email,
      phone: newUser.phone,
      group: userData.group || 'IELTS Mastery (B2-C1)',
      level: userData.level || 'B2',
      avatar: userData.avatar || '👨‍🎓',
      color: '#2563eb',
      enrolledDate: new Date().toISOString().split('T')[0],
      attendance: { [new Date().toISOString().split('T')[0]]: 'present' },
      grades: [],
      vocabCount: 0,
      badge: 'Yangi O\'quvchi 🌟'
    };
    const students = getStoredStudents();
    saveStoredStudents([newStd, ...students]);
  }

  const updatedUsers = [newUser, ...users];
  saveStoredUsers(updatedUsers);
  return { newUser, users: updatedUsers };
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
    if (jsonData.messages && Array.isArray(jsonData.messages)) {
      saveStoredMessages(jsonData.messages);
    }
    return { success: true, message: "db.json muvaffaqiyatli tiklandi va yangilandi!" };
  } catch (e) {
    return { success: false, message: "Xatolik: db.json formati noto'g'ri: " + e.message };
  }
};

// =========================================================
// 12. INITIAL SMS & BROADCAST MESSAGES
// =========================================================
export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    senderId: 'usr-superadmin',
    senderName: 'Jahongir Olimov',
    senderRole: 'superadmin',
    senderRoleLabel: 'Bosh Admin (Super Admin)',
    senderAvatar: '👑',
    recipientType: 'all',
    recipientTargetName: 'Barcha O\'quvchilar va O\'qituvchilar',
    targetGroup: null,
    targetUserId: null,
    title: '🎉 Yangi Semestr va EduLingua AI Platformasi Yangilanishi',
    text: 'Assalomu alaykum hurmatli o\'quvchilar va ustozlar! Markazimizda yangi semestr darslari boshlandi. Tizimda barcha shaxsiy kabinetlar, AI repetitor, SMS markazi va baholash moduli to\'liq ishga tushirildi.',
    createdAt: '2026-08-18 09:00',
    priority: 'high',
    readBy: []
  },
  {
    id: 'msg-2',
    senderId: 'usr-director',
    senderName: 'Dr. Rustam Karimov',
    senderRole: 'director',
    senderRoleLabel: 'Direktor (Headmaster)',
    senderAvatar: '🏛️',
    recipientType: 'students',
    recipientTargetName: 'Barcha Talabalar',
    targetGroup: null,
    targetUserId: null,
    title: '📢 Shanbalik Mock Exam Imtihoni Eslatmasi',
    text: 'Hurmatli talabalar! Shanba kuni soat 14:00 da barcha guruhlar uchun oylik rasmiy Mock Exam bo\'lib o\'tadi. O\'z vaqtida kelishingiz va ID kartangizni olib kelishingiz so\'raladi.',
    createdAt: '2026-08-17 16:30',
    priority: 'high',
    readBy: []
  },
  {
    id: 'msg-3',
    senderId: 'usr-admin',
    senderName: 'Madina Rahimova',
    senderRole: 'admin',
    senderRoleLabel: 'Administrator (Admin)',
    senderAvatar: '⚙️',
    recipientType: 'group',
    recipientTargetName: 'IELTS Mastery (B2-C1) Guruhi',
    targetGroup: 'IELTS Mastery (B2-C1)',
    targetUserId: null,
    title: '🏢 Yangi Smart Board Xonasi Haqida',
    text: 'IELTS Mastery guruhi talabalari diqqatiga: Bugungi va keyingi barcha darslar yangi 201-Smart Board auditoriyasida bo\'lib o\'tadi.',
    createdAt: '2026-08-17 11:15',
    priority: 'normal',
    readBy: []
  },
  {
    id: 'msg-4',
    senderId: 'usr-director',
    senderName: 'Dr. Rustam Karimov',
    senderRole: 'director',
    senderRoleLabel: 'Direktor (Headmaster)',
    senderAvatar: '🏛️',
    recipientType: 'teachers',
    recipientTargetName: 'Barcha O\'qituvchilar (Pedagogik Tarkib)',
    targetGroup: null,
    targetUserId: null,
    title: '👨‍🏫 O\'qituvchilar Metodik Kengashi',
    text: 'Hurmatli ustozlar! Juma kuni darslardan so\'ng soat 18:00 da oylik KPI natijalari va yangi o\'quv dasturlari tahlili bo\'yicha qisqa metodik yig\'ilish o\'tkaziladi.',
    createdAt: '2026-08-16 17:00',
    priority: 'high',
    readBy: []
  },
  {
    id: 'msg-5',
    senderId: 'usr-teacher',
    senderName: 'Azizbek Toshmatov',
    senderRole: 'teacher',
    senderRoleLabel: 'Katta Til Ustozi',
    senderAvatar: '👨‍🏫',
    recipientType: 'group',
    recipientTargetName: 'IELTS Mastery (B2-C1) Guruhi',
    targetGroup: 'IELTS Mastery (B2-C1)',
    targetUserId: null,
    title: '📚 Writing Task 2 Uyga Vazifasi',
    text: 'Hurmatli o\'quvchilar! Keyingi darsgacha IELTS Writing Task 2 bo\'yicha "Education & Technology" mavzusidagi inshoni yozib kelishingiz zarur. Flashcardlar orqali 10 ta yangi so\'zni takrorlang.',
    createdAt: '2026-08-16 14:20',
    priority: 'normal',
    readBy: []
  }
];

// =========================================================
// 13. MULTI-LANGUAGE SYSTEM
// =========================================================
export const getStoredLanguage = () => {
  try {
    return localStorage.getItem('edulingua_lang_v1') || 'uz';
  } catch (e) {
    return 'uz';
  }
};

export const saveStoredLanguage = (lang) => {
  try {
    localStorage.setItem('edulingua_lang_v1', lang);
  } catch (e) {
    console.error('Failed to save language:', e);
  }
};

// =========================================================
// 14. MESSAGES & REAL-TIME SMS ENGINE
// =========================================================
export const getStoredMessages = () => {
  try {
    const data = localStorage.getItem(KEYS.MESSAGES);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES;
  } catch (e) {
    return INITIAL_MESSAGES;
  }
};

export const saveStoredMessages = (messages) => {
  try {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
};

export const sendNewMessage = ({
  senderUser,
  recipientType = 'all',
  targetGroup = null,
  targetUserId = null,
  targetName = '',
  title = '',
  text = '',
  priority = 'normal'
}) => {
  const messages = getStoredMessages();
  const newMsgId = `msg-${Date.now()}`;

  let recipientTargetName = targetName;
  if (!recipientTargetName) {
    if (recipientType === 'all') recipientTargetName = 'Barcha O\'quvchilar va O\'qituvchilar';
    else if (recipientType === 'students') recipientTargetName = 'Barcha O\'quvchilar';
    else if (recipientType === 'teachers') recipientTargetName = 'Barcha O\'qituvchilar';
    else if (recipientType === 'group') recipientTargetName = `${targetGroup} guruhi`;
    else if (recipientType === 'user') recipientTargetName = `Foydalanuvchi: ${targetUserId}`;
  }

  const newMsg = {
    id: newMsgId,
    senderId: senderUser?.id || senderUser?.username || 'admin',
    senderName: senderUser?.name || 'Ma\'muriyat',
    senderRole: senderUser?.role || 'admin',
    senderRoleLabel: senderUser?.roleLabel || senderUser?.roleTitle || 'Administrator',
    senderAvatar: senderUser?.avatar || '💬',
    recipientType,
    recipientTargetName,
    targetGroup,
    targetUserId,
    title: title.trim() || 'Xabarnoma',
    text: text.trim(),
    createdAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' }),
    priority,
    readBy: [senderUser?.id || senderUser?.username || 'admin']
  };

  const updatedMessages = [newMsg, ...messages];
  saveStoredMessages(updatedMessages);

  // System audit log
  const logs = getStoredAdminLogs();
  const newLog = {
    id: `log-${Date.now()}`,
    user: senderUser?.name || 'Admin',
    action: `SMS jo'natildi -> ${recipientTargetName}: "${title || text.slice(0, 30)}"`,
    timestamp: new Date().toLocaleString(),
    ip: '192.168.1.12'
  };
  saveStoredAdminLogs([newLog, ...logs]);

  return { success: true, newMessage: newMsg, messages: updatedMessages };
};

export const markMessageAsRead = (messageId, userId) => {
  if (!userId) return getStoredMessages();
  const messages = getStoredMessages();
  const updated = messages.map(msg => {
    if (msg.id === messageId) {
      const readSet = new Set(msg.readBy || []);
      readSet.add(userId);
      return { ...msg, readBy: Array.from(readSet) };
    }
    return msg;
  });
  saveStoredMessages(updated);
  return updated;
};

export const markAllMessagesAsRead = (userId) => {
  if (!userId) return getStoredMessages();
  const messages = getStoredMessages();
  const updated = messages.map(msg => {
    const readSet = new Set(msg.readBy || []);
    readSet.add(userId);
    return { ...msg, readBy: Array.from(readSet) };
  });
  saveStoredMessages(updated);
  return updated;
};

export const getUserIncomingMessages = (currentUser) => {
  if (!currentUser) return [];
  const messages = getStoredMessages();
  const userRole = currentUser.role || 'student';
  const userId = currentUser.id || currentUser.username;
  const userStdId = currentUser.studentId;
  const userGroup = currentUser.group;

  return messages.filter(msg => {
    // If sent by this user -> show in history/sent
    if (msg.senderId === userId || msg.senderId === currentUser.username) return true;

    // Director / Admin / Superadmin sees all communications
    if (userRole === 'director' || userRole === 'admin' || userRole === 'superadmin') return true;

    // Broadcast to all
    if (msg.recipientType === 'all') return true;

    // Students broadcast
    if (msg.recipientType === 'students' && userRole === 'student') return true;

    // Teachers broadcast
    if (msg.recipientType === 'teachers' && userRole === 'teacher') return true;

    // Group broadcast
    if (msg.recipientType === 'group' && userGroup && msg.targetGroup === userGroup) return true;

    // Direct message to user
    if (msg.recipientType === 'user' && (msg.targetUserId === userId || msg.targetUserId === currentUser.username || (userStdId && msg.targetUserId === userStdId))) {
      return true;
    }

    return false;
  });
};

export const getUnreadMessagesCount = (currentUser) => {
  if (!currentUser) return 0;
  const userId = currentUser.id || currentUser.username;
  const userIncoming = getUserIncomingMessages(currentUser);
  return userIncoming.filter(m => m.senderId !== userId && (!m.readBy || !m.readBy.includes(userId))).length;
};



