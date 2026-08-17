import React, { useState, useEffect, useRef } from 'react';
import { AI_AGENTS } from '../data/mockData';
import { queryAgent } from '../services/agentEngine';
import { speakText } from '../services/dictionaryService';
import { 
  IconBot, 
  IconSparkles, 
  IconSend, 
  IconRefresh, 
  IconVolume, 
  IconAward, 
  IconBook, 
  IconUserCheck,
  IconCheck,
  IconX,
  IconLightbulb
} from './Icons';

export const AgentsView = ({ 
  students, 
  savedWords, 
  agentChats, 
  onSaveChats,
  presetWord = null,
  presetStudent = null 
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState('tutor-agent');
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const chatBottomRef = useRef(null);

  const currentAgent = AI_AGENTS.find(a => a.id === selectedAgentId) || AI_AGENTS[0];

  // Load chat history for selected agent
  useEffect(() => {
    const history = agentChats[selectedAgentId] || [
      {
        id: `msg-greet-${selectedAgentId}`,
        sender: 'agent',
        text: currentAgent.systemGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(history);
  }, [selectedAgentId]);

  // Handle Preset Word or Student incoming from other tabs
  useEffect(() => {
    if (presetWord) {
      setSelectedAgentId('tutor-agent');
      handleSendPrompt(`Menga "${presetWord.word}" so'zining ma'nosi, grammatikasi va jonli gaplarda qo'llanilishini chuqur tushuntirib ber.`, { activeWord: presetWord });
    } else if (presetStudent) {
      setSelectedAgentId('evaluation-agent');
      handleSendPrompt(`O'quvchi "${presetStudent.name}"ning (${presetStudent.group}) davomati (${Object.values(presetStudent.attendance || {}).filter(s => s==='present').length} kun bor) va baholarini individual tahlil qilib ber.`);
    }
  }, [presetWord, presetStudent]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendPrompt = async (textToSend = inputPrompt, customContext = {}) => {
    const query = textToSend.trim();
    if (!query || isGenerating) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const response = await queryAgent(selectedAgentId, query, {
        students,
        savedWords,
        ...customContext
      });

      let agentMessage;
      if (typeof response === 'object' && response.isQuiz) {
        setActiveQuiz(response);
        agentMessage = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: `🎯 Siz uchun maxsus interaktiv test yaratdim! Quyidagi savollarga javob berib, bilimlaringizni sinab ko'ring.`,
          quizData: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else {
        agentMessage = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }

      const updatedHistory = [...newMessages, agentMessage];
      setMessages(updatedHistory);
      onSaveChats({
        ...agentChats,
        [selectedAgentId]: updatedHistory
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizOptionClick = (questionId, optionIdx) => {
    setSelectedQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // Quick Action Buttons
  const quickActions = [
    {
      agentId: 'evaluation-agent',
      label: "📊 O'quvchilar Davomati & Baholarini Tahlil Qil",
      prompt: "Barcha o'quvchilarning davomati va baholarini chuqur tahlil qilib, umumiy hisobot va maslahatlar ber."
    },
    {
      agentId: 'quizmaster-agent',
      label: "🎯 Yangi Interaktiv Kviz Yarat",
      prompt: "O'rganilgan so'zlar bo'yicha 4 ta savolli yangi interaktiv test yarat."
    },
    {
      agentId: 'lexicon-agent',
      label: "⚡ So'z Mnemonikasi & Xotira Sirlari",
      prompt: "Chet tili so'zlarini tez va oson esda saqlab qolish bo'yicha eng kuchli mnemonik usullarni o'rgat."
    },
    {
      agentId: 'tutor-agent',
      label: "🎓 Darsda Nutqni Rivojlantirish Mashqlari",
      prompt: "O'quvchilarning speaking (nutq) darajasini oshirish uchun 3 ta qiziqarli dars mashg'ulotini taklif qil."
    }
  ];

  return (
    <div className="agents-view-wrapper">
      {/* Header */}
      <div className="section-header-box">
        <div className="header-info">
          <div className="header-badge">
            <IconBot size={16} /> Ko'p Agentli AI Markazi
          </div>
          <h2>4 ta Ixtisoslashgan Aqlli AI Agentlar Tizimi</h2>
          <p>
            Til o'qituvchisi, etimologiya mutaxassisi, baholar tahlilchisi va avtomatik test tuzuvchi agentlar bilan 
            real-vaqt rejimida muloqot qiling va ta'lim sifatini oshiring.
          </p>
        </div>
      </div>

      {/* Agents Selection Cards */}
      <div className="agents-cards-grid">
        {AI_AGENTS.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <div
              key={agent.id}
              className={`agent-card-item ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedAgentId(agent.id)}
            >
              <div className="agent-card-top-row">
                <span className="agent-big-avatar">{agent.avatar}</span>
                <span className={`agent-status-dot ${isSelected ? 'active' : ''}`} />
              </div>
              <h3 className="agent-card-title">{agent.name}</h3>
              <span className="agent-card-role">{agent.role}</span>
              <p className="agent-card-desc">{agent.description}</p>
              
              <div className="agent-skills-chips">
                {agent.specialties.map((spec, i) => (
                  <span key={i} className="skill-chip">{spec}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Buttons Row */}
      <div className="agent-quick-actions-bar">
        <span className="quick-actions-title">Tezkor AI Amallar:</span>
        <div className="quick-actions-scroll">
          {quickActions.map((qa, idx) => (
            <button
              key={idx}
              type="button"
              className="quick-action-chip"
              onClick={() => {
                setSelectedAgentId(qa.agentId);
                handleSendPrompt(qa.prompt);
              }}
            >
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="agent-chat-container">
        {/* Chat Header */}
        <div className="chat-header-bar">
          <div className="chat-agent-info">
            <span className="chat-header-avatar">{currentAgent.avatar}</span>
            <div>
              <h4 className="chat-header-name">{currentAgent.name}</h4>
              <span className="chat-header-status">🟢 Faol AI Konsultant</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary btn-clear-chat"
            onClick={() => {
              setMessages([
                {
                  id: `msg-greet-${selectedAgentId}`,
                  sender: 'agent',
                  text: currentAgent.systemGreeting,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
          >
            Suhbatni tozalash
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="chat-messages-body">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message-row ${msg.sender === 'user' ? 'user-row' : 'agent-row'}`}
            >
              {msg.sender === 'agent' && (
                <div className="chat-sender-avatar">{currentAgent.avatar}</div>
              )}

              <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'agent-bubble'}`}>
                <div className="bubble-text-content">
                  {msg.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className="bubble-line">
                      {line}
                    </p>
                  ))}
                </div>

                {/* If message contains Interactive Quiz */}
                {msg.quizData && (
                  <div className="inline-quiz-box">
                    <h4 className="quiz-box-title">{msg.quizData.title}</h4>
                    <p className="quiz-box-desc">{msg.quizData.description}</p>
                    
                    <div className="quiz-questions-list">
                      {msg.quizData.questions.map((q, qIndex) => {
                        const selectedAnswer = selectedQuizAnswers[q.id];
                        const hasAnswered = selectedAnswer !== undefined;
                        const isCorrect = selectedAnswer === q.correctAnswer;

                        return (
                          <div key={q.id} className="quiz-question-card">
                            <div className="quiz-q-title">
                              <strong>{qIndex + 1}. {q.question}</strong>
                            </div>

                            <div className="quiz-options-grid">
                              {q.options.map((opt, optIndex) => {
                                const isThisSelected = selectedAnswer === optIndex;
                                const isThisCorrect = q.correctAnswer === optIndex;

                                let optClass = 'quiz-opt-btn';
                                if (hasAnswered) {
                                  if (isThisCorrect) optClass += ' opt-correct';
                                  else if (isThisSelected && !isCorrect) optClass += ' opt-wrong';
                                }

                                return (
                                  <button
                                    key={optIndex}
                                    type="button"
                                    disabled={hasAnswered}
                                    className={optClass}
                                    onClick={() => handleQuizOptionClick(q.id, optIndex)}
                                  >
                                    <span className="opt-letter">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <span className="opt-text">{opt}</span>
                                    {hasAnswered && isThisCorrect && <IconCheck size={16} className="text-green" />}
                                    {hasAnswered && isThisSelected && !isCorrect && <IconX size={16} className="text-red" />}
                                  </button>
                                );
                              })}
                            </div>

                            {hasAnswered && (
                              <div className={`quiz-explanation-box ${isCorrect ? 'exp-correct' : 'exp-wrong'}`}>
                                <IconLightbulb size={16} />
                                <span>{q.explanation}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bubble-footer">
                  <span className="bubble-time">{msg.timestamp}</span>
                  {msg.sender === 'agent' && (
                    <button
                      type="button"
                      className="bubble-audio-btn"
                      onClick={() => speakText(msg.text, 'uz')}
                      title="Matnni ovozli tinglash"
                    >
                      <IconVolume size={14} />
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="chat-sender-avatar user-avatar-bubble">👤</div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="chat-message-row agent-row">
              <div className="chat-sender-avatar">{currentAgent.avatar}</div>
              <div className="chat-bubble agent-bubble generating-bubble">
                <IconRefresh size={18} className="spin-icon text-accent" />
                <span>{currentAgent.name} javob tayyorlamoqda...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="chat-input-footer"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`${currentAgent.name}ga savolingizni yoki so'rovni yozing...`}
            className="chat-text-input"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !inputPrompt.trim()}
            className="btn-primary btn-chat-send"
          >
            <IconSend size={18} />
            <span>Yuborish</span>
          </button>
        </form>
      </div>
    </div>
  );
};
