import React, { useState } from 'react';
import { 
  IconSend, 
  IconCheckCircle, 
  IconClock, 
  IconSearch, 
  IconUsers, 
  IconShield, 
  IconBuilding, 
  IconGraduationCap, 
  IconCheck, 
  IconPlus, 
  IconAlertCircle,
  IconBell
} from './Icons';
import { 
  getStoredMessages, 
  sendNewMessage, 
  markMessageAsRead, 
  markAllMessagesAsRead,
  getUserIncomingMessages,
  getStoredUsers
} from '../services/storage';
import { GROUPS_LIST, ADMIN_DATA } from '../data/mockData';
import { getTranslation } from '../services/translations';

export const MessagesView = ({ 
  currentUser, 
  students = [], 
  language = 'uz',
  onMessageSent = () => {} 
}) => {
  const [messagesTab, setMessagesTab] = useState('inbox'); // 'inbox', 'compose', 'outbox'
  const [searchQuery, setSearchQuery] = useState('');
  const [inboxFilter, setInboxFilter] = useState('all'); // 'all', 'unread', 'leadership', 'teachers', 'students'
  
  // Compose form states
  const [recipientType, setRecipientType] = useState('students'); // 'all', 'students', 'teachers', 'group', 'user'
  const [targetGroup, setTargetGroup] = useState('IELTS Mastery (B2-C1)');
  const [targetUserId, setTargetUserId] = useState('');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgPriority, setMsgPriority] = useState('normal');
  const [sendSuccessMsg, setSendSuccessMsg] = useState(false);

  // Live messages list
  const [allMessages, setAllMessages] = useState(getStoredMessages);

  const t = (key) => getTranslation(key, language);
  const currentRole = currentUser?.role || 'teacher';
  const currentUserId = currentUser?.id || currentUser?.username;

  // Filter incoming messages
  const userIncoming = getUserIncomingMessages(currentUser);

  const filteredInbox = userIncoming.filter((msg) => {
    const matchesSearch = 
      (msg.title && msg.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (msg.senderName && msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()));

    const isUnread = !msg.readBy || !msg.readBy.includes(currentUserId);

    let matchesFilter = true;
    if (inboxFilter === 'unread') matchesFilter = isUnread;
    else if (inboxFilter === 'leadership') matchesFilter = msg.senderRole === 'director' || msg.senderRole === 'admin' || msg.senderRole === 'superadmin';
    else if (inboxFilter === 'teachers') matchesFilter = msg.senderRole === 'teacher';
    else if (inboxFilter === 'students') matchesFilter = msg.senderRole === 'student';

    return matchesSearch && matchesFilter;
  });

  // Outbox messages (sent by this user)
  const outboxMessages = allMessages.filter((msg) => 
    msg.senderId === currentUserId || msg.senderId === currentUser?.username
  );

  const unreadCount = userIncoming.filter(
    (m) => m.senderId !== currentUserId && (!m.readBy || !m.readBy.includes(currentUserId))
  ).length;

  // Handle Mark Single Read
  const handleMarkRead = (msgId) => {
    const updated = markMessageAsRead(msgId, currentUserId);
    setAllMessages(updated);
  };

  // Handle Mark All Read
  const handleMarkAllRead = () => {
    const updated = markAllMessagesAsRead(currentUserId);
    setAllMessages(updated);
  };

  // Quick template selection
  const templates = [
    { title: "Imtihon Eslatmasi", text: "Hurmatli o'quvchilar! Ertaga soat 14:00 da oylik nazorat imtihoni (Mock Exam) bo'lib o'tadi. Kechikmasdan kelishingizni so'raymiz." },
    { title: "To'lov Eslatmasi", text: "Hurmatli o'quvchi! Keyingi oylik darslar to'lovini oyning 20-sanasigacha to'lashingizni so'raymiz." },
    { title: "Uyga Vazifa", text: "Eslatma: Keyingi darsgacha berilgan barcha lug'at va mashqlarni bajarib kelishingiz zarur." },
    { title: "Dars Xonasi O'zgarishi", text: "Diqqat: Bugungi dars yangi Smart Board auditoriyasida bo'lib o'tadi." }
  ];

  // Handle Send Message Form Submit
  const handleSendMessageSubmit = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    let targetName = '';
    const allUsers = getStoredUsers();

    if (recipientType === 'all') targetName = "Barcha O'quvchilar va O'qituvchilar";
    else if (recipientType === 'students') targetName = "Barcha O'quvchilar";
    else if (recipientType === 'teachers') targetName = "Barcha O'qituvchilar";
    else if (recipientType === 'group') targetName = `${targetGroup} guruhi`;
    else if (recipientType === 'user') {
      const foundU = allUsers.find(u => u.id === targetUserId || u.username === targetUserId || u.studentId === targetUserId);
      targetName = foundU ? `${foundU.name} (@${foundU.username})` : `Foydalanuvchi: ${targetUserId}`;
    }

    const res = sendNewMessage({
      senderUser: currentUser,
      recipientType,
      targetGroup: recipientType === 'group' ? targetGroup : null,
      targetUserId: recipientType === 'user' ? targetUserId : null,
      targetName,
      title: msgTitle.trim() || 'SMS Xabarnoma',
      text: msgText.trim(),
      priority: msgPriority
    });

    if (res.success) {
      setAllMessages(res.messages);
      setSendSuccessMsg(true);
      setMsgTitle('');
      setMsgText('');
      onMessageSent(res.newMessage);

      setTimeout(() => {
        setSendSuccessMsg(false);
        setMessagesTab('outbox');
      }, 1500);
    }
  };

  return (
    <div className="messages-view-container animate-fade-in">
      {/* Top Banner */}
      <div className="messages-header-card animate-fade-in">
        <div className="messages-header-left">
          <div className="messages-avatar-badge animate-ring-pulse">
            <IconSend size={28} className="text-white" />
          </div>
          <div>
            <div className="messages-badge-label">
              <span>{t('tabMessages')}</span>
            </div>
            <h1 className="messages-title">SMS & Xabarnomalar Markazi</h1>
            <p className="messages-subtext">
              O'quvchilar, o'qituvchilar, direktor va adminlar o'rtasida to'g'ridan-to'g'ri tezkor aloqa tizimi
            </p>
          </div>
        </div>

        <div className="messages-header-stats">
          <div className="msg-stat-pill">
            <span>📩 Kelgan:</span>
            <strong>{userIncoming.length}</strong>
          </div>
          <div className="msg-stat-pill unread-pill">
            <span>🔔 Yangi:</span>
            <strong>{unreadCount}</strong>
          </div>
          <div className="msg-stat-pill">
            <span>📤 Yuborilgan:</span>
            <strong>{outboxMessages.length}</strong>
          </div>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div className="messages-subnav-tabs">
        <button
          type="button"
          className={`msg-tab-btn ${messagesTab === 'inbox' ? 'active-msg-tab' : ''}`}
          onClick={() => setMessagesTab('inbox')}
        >
          <span>📩 Kelgan Xabarlar</span>
          {unreadCount > 0 && <span className="unread-badge-pill animate-bounce-subtle">{unreadCount}</span>}
        </button>

        <button
          type="button"
          className={`msg-tab-btn ${messagesTab === 'compose' ? 'active-msg-tab' : ''}`}
          onClick={() => setMessagesTab('compose')}
        >
          <IconPlus size={16} />
          <span>Yangi SMS Yozish</span>
        </button>

        <button
          type="button"
          className={`msg-tab-btn ${messagesTab === 'outbox' ? 'active-msg-tab' : ''}`}
          onClick={() => setMessagesTab('outbox')}
        >
          <span>📋 Yuborilganlar ({outboxMessages.length})</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: INBOX (KELGAN XABARLAR)
          ========================================================= */}
      {messagesTab === 'inbox' && (
        <div className="messages-tab-content animate-fade-in">
          {/* Controls Bar */}
          <div className="messages-toolbar-card">
            <div className="search-input-wrap">
              <IconSearch size={18} className="search-icon" />
              <input
                type="text"
                className="radial-input search-input"
                placeholder="Xabarlarni mavzu, matn yoki jo'natuvchi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="inbox-filter-chips">
              <button
                type="button"
                className={`inbox-chip ${inboxFilter === 'all' ? 'active-chip' : ''}`}
                onClick={() => setInboxFilter('all')}
              >
                Barchasi ({userIncoming.length})
              </button>
              <button
                type="button"
                className={`inbox-chip ${inboxFilter === 'unread' ? 'active-chip' : ''}`}
                onClick={() => setInboxFilter('unread')}
              >
                O'qilmagan ({unreadCount})
              </button>
              <button
                type="button"
                className={`inbox-chip ${inboxFilter === 'leadership' ? 'active-chip' : ''}`}
                onClick={() => setInboxFilter('leadership')}
              >
                🏛️ Rahbariyatdan
              </button>
              <button
                type="button"
                className={`inbox-chip ${inboxFilter === 'teachers' ? 'active-chip' : ''}`}
                onClick={() => setInboxFilter('teachers')}
              >
                👨‍🏫 O'qituvchilardan
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="radial-button-secondary py-1 px-3 text-xs"
                onClick={handleMarkAllRead}
              >
                <IconCheck size={14} />
                <span>Barchasini o'qilgan qilish</span>
              </button>
            )}
          </div>

          {/* Messages Cards List */}
          <div className="messages-cards-list">
            {filteredInbox.length === 0 ? (
              <div className="empty-state-box text-center">
                <IconBell size={40} className="text-blue mx-auto mb-2 opacity-50" />
                <h4>Hech qanday xabar topilmadi</h4>
                <p className="text-muted text-sm">Sizga yuborilgan barcha yangi SMS va xabarnomalar shu yerda ko'rinadi.</p>
              </div>
            ) : (
              filteredInbox.map((msg) => {
                const isUnread = !msg.readBy || !msg.readBy.includes(currentUserId);
                const isSelf = msg.senderId === currentUserId;

                return (
                  <div 
                    key={msg.id} 
                    className={`message-card-item animate-pop-in ${isUnread ? 'unread-message-card' : ''}`}
                  >
                    <div className="msg-card-top-row">
                      <div className="msg-sender-info">
                        <span className="msg-sender-avatar">{msg.senderAvatar || '👤'}</span>
                        <div>
                          <div className="msg-sender-name-wrap">
                            <strong className="msg-sender-name">{msg.senderName}</strong>
                            <span className={`role-tag-pill role-${msg.senderRole}`}>
                              {msg.senderRoleLabel || msg.senderRole}
                            </span>
                            {isSelf && <span className="self-tag">(Siz yuborgan)</span>}
                            {isUnread && <span className="unread-dot animate-pulse-danger"></span>}
                          </div>
                          <div className="msg-meta-sub">
                            <span>Kimga: <strong className="text-blue-900">{msg.recipientTargetName}</strong></span>
                            <span>•</span>
                            <span className="msg-time">{msg.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="msg-card-actions">
                        {msg.priority === 'high' && (
                          <span className="priority-high-badge">
                            ⚠️ Muhim
                          </span>
                        )}
                        {isUnread && (
                          <button
                            type="button"
                            className="radial-button-secondary text-xs py-1 px-2.5"
                            onClick={() => handleMarkRead(msg.id)}
                            title="O'qildi deb belgilash"
                          >
                            <IconCheck size={14} />
                            <span>O'qildi</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="msg-card-title">{msg.title}</h4>
                    <p className="msg-card-text">{msg.text}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: COMPOSE (YANGI SMS YOZISH & YUBORISH)
          ========================================================= */}
      {messagesTab === 'compose' && (
        <div className="messages-tab-content animate-fade-in">
          <div className="messages-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-title">
                  <IconSend size={20} />
                  <span>Tezkor SMS & Xabarnoma Jo'natish</span>
                </h3>
                <p className="panel-desc">
                  O'quvchilar, o'qituvchilar yoki ma'muriyatga to'g'ridan-to'g'ri xabar yo'llang
                </p>
              </div>
            </div>

            {sendSuccessMsg && (
              <div className="sms-success-banner animate-toast-slide mb-4">
                <IconCheckCircle size={20} />
                <strong>{t('smsSentSuccess')}</strong>
              </div>
            )}

            <form onSubmit={handleSendMessageSubmit} className="sms-compose-form">
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Kimga Yuborilsin (Auditoriya):</label>
                  <select
                    className="radial-select"
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value)}
                  >
                    <option value="students">👨‍🎓 Barcha O'quvchilarga ({students.length} nafar)</option>
                    <option value="group">👥 Alohida Bir Guruhga</option>
                    <option value="user">👤 Alohida Bitta Foydalanuvchiga</option>
                    {(currentRole === 'director' || currentRole === 'admin' || currentRole === 'superadmin') && (
                      <>
                        <option value="teachers">👨‍🏫 Barcha O'qituvchilarga</option>
                        <option value="all">🌐 Butun O'quv Markaziga (Hammaga)</option>
                      </>
                    )}
                  </select>
                </div>

                {recipientType === 'group' && (
                  <div className="form-group">
                    <label className="form-label">Guruhni Tanlang:</label>
                    <select
                      className="radial-select"
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                    >
                      {GROUPS_LIST.filter(g => g !== 'Barcha guruhlar').map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientType === 'user' && (
                  <div className="form-group">
                    <label className="form-label">Foydalanuvchini Tanlang:</label>
                    <select
                      className="radial-select"
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      required
                    >
                      <option value="">-- Foydalanuvchini tanlang --</option>
                      {getStoredUsers().map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.roleLabel}) - @{u.username}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Muhimlik Darajasi:</label>
                  <select
                    className="radial-select"
                    value={msgPriority}
                    onChange={(e) => setMsgPriority(e.target.value)}
                  >
                    <option value="normal">Oddiy Xabarnoma</option>
                    <option value="high">⚠️ Yuqori Muhimlik (Shoshilinch)</option>
                  </select>
                </div>
              </div>

              {/* Ready Templates Chips */}
              <div className="form-group">
                <label className="form-label">Tayyor SMS Shablonlari:</label>
                <div className="sms-template-chips">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      className="radial-button-secondary py-1 px-2.5 text-xs animate-btn-pop"
                      onClick={() => {
                        setMsgTitle(tpl.title);
                        setMsgText(tpl.text);
                      }}
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Xabar Mavzusi / Sarlavha:</label>
                <input
                  type="text"
                  className="radial-input"
                  placeholder="Masalan: Ertangi dars jadvali o'zgarishi"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMS Matni:</label>
                <textarea
                  rows={5}
                  className="radial-textarea"
                  placeholder="Xabarnoma matnini kiriting..."
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="compose-actions-footer">
                <button 
                  type="submit" 
                  className="radial-button-primary animate-btn-pop px-6 py-2.5"
                >
                  <IconSend size={18} />
                  <span>SMS Xabarni Jo'natish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: OUTBOX (YUBORILGANLAR JURNALI)
          ========================================================= */}
      {messagesTab === 'outbox' && (
        <div className="messages-tab-content animate-fade-in">
          <div className="messages-cards-list">
            {outboxMessages.length === 0 ? (
              <div className="empty-state-box text-center">
                <IconSend size={40} className="text-blue mx-auto mb-2 opacity-50" />
                <h4>Siz hali hech qanday SMS yubormagansiz</h4>
                <p className="text-muted text-sm">"Yangi SMS Yozish" bo'limi orqali o'quvchilaringizga xabarnoma jo'nating.</p>
              </div>
            ) : (
              outboxMessages.map((msg) => (
                <div key={msg.id} className="message-card-item animate-pop-in">
                  <div className="msg-card-top-row">
                    <div className="msg-sender-info">
                      <span className="msg-sender-avatar">📤</span>
                      <div>
                        <div className="msg-sender-name-wrap">
                          <strong className="msg-sender-name">Qabul qiluvchi: {msg.recipientTargetName}</strong>
                        </div>
                        <div className="msg-meta-sub">
                          <span className="msg-time">{msg.createdAt}</span>
                          <span>•</span>
                          <span className="status-pill-green text-xs">
                            <IconCheckCircle size={12} /> {t('smsDelivered')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 className="msg-card-title">{msg.title}</h4>
                  <p className="msg-card-text">{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
