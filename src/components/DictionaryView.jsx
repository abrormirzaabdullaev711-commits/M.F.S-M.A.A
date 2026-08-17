import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../data/mockData';
import { lookupWord, speakText } from '../services/dictionaryService';
import { 
  IconSearch, 
  IconVolume, 
  IconBookmark, 
  IconSparkles, 
  IconLightbulb, 
  IconBook, 
  IconTrash, 
  IconRefresh, 
  IconCheck,
  IconGlobe
} from './Icons';

export const DictionaryView = ({ 
  savedWords, 
  onSaveWord, 
  onDeleteSavedWord, 
  onConsultAgentWithWord 
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('resilient');
  const [activeResult, setActiveResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sample quick chip words for fast testing
  const sampleSuggestions = {
    en: ['resilient', 'serendipity', 'diligent', 'eloquent', 'ubiquitous'],
    uz: ['sabot', 'maftunkor', 'muvaffaqiyat', 'tirishqoqlik', 'farosat'],
    ru: ['вдохновение', 'упорство', 'достижение', 'искренность'],
    de: ['Ausdauer', 'Sehnsucht', 'Erfolg', 'Leidenschaft'],
    tr: ['azim', 'ilham', 'başarı', 'samimiyet'],
    ar: ['إلهام', 'عزيمة', 'نجاح', 'معرفة']
  };

  const handleSearch = async (wordToSearch = searchQuery, langCode = selectedLanguage) => {
    const term = wordToSearch.trim();
    if (!term) return;

    setIsLoading(true);
    try {
      const result = await lookupWord(term, langCode);
      setActiveResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search if activeResult is empty
  React.useEffect(() => {
    if (!activeResult) {
      handleSearch('resilient', 'en');
    }
  }, []);

  const handleLanguageChange = (code) => {
    setSelectedLanguage(code);
    const defaults = sampleSuggestions[code] || ['hello'];
    const firstWord = defaults[0];
    setSearchQuery(firstWord);
    handleSearch(firstWord, code);
  };

  const handleSaveCurrentWord = () => {
    if (!activeResult) return;
    onSaveWord(activeResult);
    setSaveSuccessMsg("So'z shaxsiy lug'atga muvaffaqiyatli saqlandi!");
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const isWordAlreadySaved = activeResult && savedWords.some(
    w => w.word.toLowerCase() === activeResult.word.toLowerCase()
  );

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="dictionary-view-wrapper">
      {/* Top Banner */}
      <div className="section-header-box">
        <div className="header-info">
          <div className="header-badge">
            <IconGlobe size={16} /> Ko'p Tilli Aqlli Lug'at
          </div>
          <h2>Tilni tanlang va so'z ma'nosini chuqur o'rganing</h2>
          <p>
            Istalgan tildagi so'zni yozing: uning xalqaro ma'nosi, o'zbekcha tarjimasi, 
            fonetik talaffuzi, misollar, sinonimlar va AI xotira kalitlarini bir zumda bilib oling.
          </p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            className={`btn-secondary ${flashcardMode ? 'btn-active-toggle' : ''}`}
            onClick={() => {
              setFlashcardMode(!flashcardMode);
              setFlashcardIndex(0);
              setIsCardFlipped(false);
            }}
          >
            <IconBook size={18} />
            <span>{flashcardMode ? "Lug'atga Qaytish" : "Flashcard Mashg'uloti"}</span>
          </button>
        </div>
      </div>

      {/* Language Selector Tabs */}
      <div className="language-selector-bar">
        <span className="lang-bar-title">Qidiruv Tili:</span>
        <div className="language-pills-scroll">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`lang-pill ${selectedLanguage === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {!flashcardMode ? (
        <div className="dictionary-main-grid">
          {/* Left Column: Search & Rich Word Result */}
          <div className="dict-content-col">
            {/* Search Input Box */}
            <div className="search-card">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchQuery, selectedLanguage);
                }}
                className="search-form"
              >
                <div className="search-input-wrap">
                  <IconSearch size={22} className="search-icon-inside" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={currentLangObj.placeholder || "So'zni yozing..."}
                    className="search-main-input"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      className="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !searchQuery.trim()}
                  className="btn-primary search-submit-btn"
                >
                  {isLoading ? <IconRefresh size={18} className="spin-icon" /> : <IconSearch size={18} />}
                  <span>Qidirish</span>
                </button>
              </form>

              {/* Suggestions chips */}
              <div className="suggestions-row">
                <span className="sug-label">Tavsiya so'zlar:</span>
                {(sampleSuggestions[selectedLanguage] || ['hello', 'learn', 'knowledge']).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    className="sug-chip"
                    onClick={() => {
                      setSearchQuery(sug);
                      handleSearch(sug, selectedLanguage);
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Result Card */}
            {isLoading ? (
              <div className="loading-card">
                <IconRefresh size={36} className="spin-icon text-accent" />
                <p>So'z ma'nosi va tarjimalari yuklanmoqda...</p>
              </div>
            ) : activeResult ? (
              <div className="word-detail-card">
                {/* Header */}
                <div className="word-card-top">
                  <div className="word-title-group">
                    <div className="word-heading-row">
                      <h1 className="word-main-title">{activeResult.word}</h1>
                      <span className="word-lang-badge">
                        {currentLangObj.flag} {activeResult.language.toUpperCase()}
                      </span>
                      {activeResult.partOfSpeech && (
                        <span className="word-pos-tag">{activeResult.partOfSpeech}</span>
                      )}
                    </div>
                    {activeResult.phonetic && (
                      <div className="word-phonetic-row">
                        <span className="phonetic-text">{activeResult.phonetic}</span>
                        <button
                          type="button"
                          className="audio-play-btn"
                          onClick={() => speakText(activeResult.word, activeResult.language)}
                          title="Baland ovozda talaffuz qilish"
                        >
                          <IconVolume size={18} />
                          <span>Talaffuzni eshitish</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="word-card-actions">
                    <button
                      type="button"
                      className={`btn-save-vocab ${isWordAlreadySaved ? 'saved' : ''}`}
                      onClick={handleSaveCurrentWord}
                    >
                      <IconBookmark size={18} fill={isWordAlreadySaved ? 'currentColor' : 'none'} />
                      <span>{isWordAlreadySaved ? 'Saqlangan' : "Lug'atga saqlash"}</span>
                    </button>
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="toast-banner-inline">
                    <IconCheck size={18} /> {saveSuccessMsg}
                  </div>
                )}

                {/* Main Definition & Uzbek Translation */}
                <div className="meaning-highlight-box">
                  <div className="meaning-block">
                    <span className="meaning-label">📌 Asosiy ma'nosi (Definition):</span>
                    <p className="meaning-text-primary">{activeResult.meaning}</p>
                  </div>

                  {activeResult.meaningUz && (
                    <div className="meaning-block uzbek-meaning-block">
                      <span className="meaning-label uz-label">🇺🇿 O'zbekcha izohi & Tarjimasi:</span>
                      <p className="meaning-text-uz">{activeResult.meaningUz}</p>
                    </div>
                  )}

                  {activeResult.meaningRu && (
                    <div className="meaning-block">
                      <span className="meaning-label">🇷🇺 Ruscha tarjimasi:</span>
                      <p className="meaning-text-ru">{activeResult.meaningRu}</p>
                    </div>
                  )}
                </div>

                {/* Example Sentences */}
                {activeResult.examples && activeResult.examples.length > 0 && (
                  <div className="word-section-box">
                    <h3 className="section-subtitle">
                      <IconBook size={18} /> Namunaviy gaplar & Kontekst (Examples):
                    </h3>
                    <div className="examples-list">
                      {activeResult.examples.map((ex, idx) => (
                        <div key={idx} className="example-item">
                          <div className="example-text-row">
                            <span className="example-bullet">•</span>
                            <span className="example-en">"{ex.text}"</span>
                            <button
                              type="button"
                              className="example-audio-btn"
                              onClick={() => speakText(ex.text, activeResult.language)}
                              title="Gapni tinglash"
                            >
                              <IconVolume size={15} />
                            </button>
                          </div>
                          {ex.translation && (
                            <p className="example-uz">↳ {ex.translation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synonyms & Antonyms */}
                <div className="syn-ant-grid">
                  {activeResult.synonyms && activeResult.synonyms.length > 0 && (
                    <div className="lexicon-chips-box">
                      <h4>🟢 Sinonimlar (Synonyms):</h4>
                      <div className="chips-flex">
                        {activeResult.synonyms.map((syn, i) => (
                          <button
                            key={i}
                            type="button"
                            className="interactive-lexicon-chip syn-chip"
                            onClick={() => {
                              setSearchQuery(syn);
                              handleSearch(syn, selectedLanguage);
                            }}
                            title="Ushbu sinonim ma'nosini qidirish"
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeResult.antonyms && activeResult.antonyms.length > 0 && (
                    <div className="lexicon-chips-box">
                      <h4>🔴 Antonimlar (Antonyms):</h4>
                      <div className="chips-flex">
                        {activeResult.antonyms.map((ant, i) => (
                          <button
                            key={i}
                            type="button"
                            className="interactive-lexicon-chip ant-chip"
                            onClick={() => {
                              setSearchQuery(ant);
                              handleSearch(ant, selectedLanguage);
                            }}
                            title="Ushbu antonim ma'nosini qidirish"
                          >
                            {ant}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Etymology & Mnemonics */}
                {(activeResult.etymology || activeResult.mnemonicTip) && (
                  <div className="mnemonics-card">
                    {activeResult.etymology && (
                      <div className="mnemonic-sub">
                        <span className="mn-icon">🏛️</span>
                        <div>
                          <strong>Kelib chiqishi:</strong> {activeResult.etymology}
                        </div>
                      </div>
                    )}
                    {activeResult.mnemonicTip && (
                      <div className="mnemonic-sub">
                        <span className="mn-icon"><IconLightbulb size={20} /></span>
                        <div>
                          <strong>Xotira kaliti (Mnemonika):</strong> {activeResult.mnemonicTip}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Agent Deep Explanation Callout */}
                <div className="ai-consult-trigger-bar">
                  <div className="ai-prompt-left">
                    <IconSparkles size={22} className="text-accent" />
                    <div>
                      <strong>Ushbu so'zni AI Agent bilan chuqur o'rganmoqchimisiz?</strong>
                      <p>Prof. Azamat grammatik tahlil va muloqot mashqlarini tayyorlab beradi.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-accent-glow"
                    onClick={() => onConsultAgentWithWord(activeResult)}
                  >
                    AI Agentga yuborish ➔
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Column: Saved Vocabulary List */}
          <div className="dict-sidebar-col">
            <div className="saved-words-panel">
              <div className="saved-panel-header">
                <div className="saved-title-row">
                  <IconBookmark size={20} className="text-accent" />
                  <h3>Mening Saqlangan So'zlarim</h3>
                </div>
                <span className="saved-counter-badge">{savedWords.length} ta so'z</span>
              </div>

              {savedWords.length === 0 ? (
                <div className="empty-saved-state">
                  <IconBook size={36} className="empty-icon" />
                  <p>Hozircha saqlangan so'zlar yo'q.</p>
                  <span>Qidirilgan so'z kartasidagi "Lug'atga saqlash" tugmasini bosing.</span>
                </div>
              ) : (
                <div className="saved-words-list-scroll">
                  {savedWords.map((item, idx) => (
                    <div key={idx} className="saved-word-item-card">
                      <div className="saved-item-top">
                        <div 
                          className="saved-word-clickable"
                          onClick={() => {
                            setSearchQuery(item.word);
                            setSelectedLanguage(item.language || 'en');
                            setActiveResult(item);
                          }}
                        >
                          <strong className="saved-item-title">{item.word}</strong>
                          <span className="saved-item-pos">{item.partOfSpeech || 'so\'z'}</span>
                        </div>
                        <div className="saved-item-actions">
                          <button
                            type="button"
                            className="icon-mini-btn"
                            onClick={() => speakText(item.word, item.language)}
                            title="Ovozni eshitish"
                          >
                            <IconVolume size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-mini-btn delete-mini-btn"
                            onClick={() => onDeleteSavedWord(item.word)}
                            title="O'chirish"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="saved-item-uz-desc">
                        {item.meaningUz || item.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Flashcard Study Mode */
        <div className="flashcard-study-container">
          <div className="flashcard-controls-top">
            <h3>Flashcard Takrorlash Mashg'uloti</h3>
            <span className="flashcard-progress-counter">
              Kartochka: {savedWords.length > 0 ? flashcardIndex + 1 : 0} / {savedWords.length}
            </span>
          </div>

          {savedWords.length === 0 ? (
            <div className="empty-flashcards-box">
              <p>Mashg'ulotni boshlash uchun avval bir nechta so'zni lug'atga saqlang.</p>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => setFlashcardMode(false)}
              >
                Lug'atga Qaytish
              </button>
            </div>
          ) : (
            <div className="flashcard-box-centered">
              {(() => {
                const currentCard = savedWords[flashcardIndex] || savedWords[0];
                return (
                  <div 
                    className={`flashcard-3d-card ${isCardFlipped ? 'flipped' : ''}`}
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                  >
                    {!isCardFlipped ? (
                      /* Front Face */
                      <div className="card-face card-front">
                        <span className="card-flip-hint">🔄 Kartani aylantirish uchun bosing</span>
                        <h2 className="card-word-huge">{currentCard.word}</h2>
                        {currentCard.phonetic && (
                          <span className="card-phonetic-text">{currentCard.phonetic}</span>
                        )}
                        <span className="card-pos-badge">{currentCard.partOfSpeech}</span>
                        <button
                          type="button"
                          className="card-audio-play"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(currentCard.word, currentCard.language);
                          }}
                        >
                          <IconVolume size={20} /> Talaffuz
                        </button>
                      </div>
                    ) : (
                      /* Back Face */
                      <div className="card-face card-back">
                        <span className="card-flip-hint">🔄 Kartani qaytarish uchun bosing</span>
                        <h3 className="card-back-title">{currentCard.word}</h3>
                        <div className="card-back-uz-box">
                          <strong>Ma'nosi:</strong>
                          <p>{currentCard.meaningUz || currentCard.meaning}</p>
                        </div>
                        {currentCard.examples?.[0] && (
                          <div className="card-back-example">
                            <em>"{currentCard.examples[0].text}"</em>
                            {currentCard.examples[0].translation && (
                              <p className="card-back-ex-uz">↳ {currentCard.examples[0].translation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Navigation Buttons */}
              <div className="flashcard-nav-row">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setIsCardFlipped(false);
                    setFlashcardIndex(prev => Math.max(0, prev - 1));
                  }}
                >
                  ◀ Oldingi
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setIsCardFlipped(false);
                    setFlashcardIndex(prev => (prev + 1) % savedWords.length);
                  }}
                >
                  Keyingi So'z ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
