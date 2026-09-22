import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, INITIAL_DICTIONARY_ENTRIES } from '../data/mockData';
import { lookupWord, speakText, playAudio } from '../services/dictionaryService';
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
  IconGlobe,
  IconExternalLink
} from './Icons';
import { getTranslation } from '../services/translations';

export const DictionaryView = ({ 
  savedWords = [], 
  onSaveWord = () => {}, 
  onDeleteSavedWord = () => {}, 
  onConsultAgentWithWord = () => {},
  language = 'uz'
}) => {
  const t = (k) => getTranslation(k, language);

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
    uz: ['sabot', 'kitob', 'maftunkor', 'muvaffaqiyat', 'farosat'],
    ru: ['вдохновение', 'упорство', 'достижение', 'искренность'],
    de: ['Ausdauer', 'Sehnsucht', 'Erfolg', 'Leidenschaft'],
    tr: ['azim', 'ilham', 'başarı', 'samimiyet'],
    ar: ['إلهام', 'عزيمة', 'نجاح', 'معرفة']
  };

  const handleSearch = async (wordToSearch = searchQuery, langCode = selectedLanguage) => {
    const term = (wordToSearch || '').trim();
    if (!term) return;

    setIsLoading(true);
    try {
      const result = await lookupWord(term, langCode);
      setActiveResult(result);
    } catch (err) {
      console.error('Dictionary search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search if activeResult is empty
  useEffect(() => {
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
    setSaveSuccessMsg(t('dictWordSavedSuccess'));
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const isWordAlreadySaved = activeResult && savedWords.some(
    w => w.word.toLowerCase() === activeResult.word.toLowerCase()
  );

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Active flashcard pool (Saved words or fallback to rich curated entries)
  const flashcardPool = savedWords.length > 0 ? savedWords : INITIAL_DICTIONARY_ENTRIES;

  return (
    <div className="dictionary-view-wrapper">
      {/* Top Banner */}
      <div className="section-header-box">
        <div className="header-info">
          <div className="header-badge">
            <IconGlobe size={16} /> {t('dictHeaderBadge')}
          </div>
          <h2>{t('dictHeaderTitle')}</h2>
          <p>{t('dictHeaderSubtitle')}</p>
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
            <span>{flashcardMode ? t('dictBackToDictionary') : t('dictFlashcardStudy')}</span>
          </button>
        </div>
      </div>

      {/* Language Selector Tabs */}
      <div className="language-selector-bar">
        <span className="lang-bar-title">{t('dictSearchLanguage')}</span>
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
                    placeholder={
                      selectedLanguage === 'en' 
                        ? t('dictSearchPlaceholderEn') 
                        : (currentLangObj.placeholder || t('dictSearchPlaceholder'))
                    }
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
                  <span>{t('dictSearchBtn')}</span>
                </button>
              </form>

              {/* Suggestions chips */}
              <div className="suggestions-row">
                <span className="sug-label">{t('dictSuggestedWords')}</span>
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
                <p>{t('dictLoading')}</p>
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
                      {activeResult.cefrLevel && (
                        <span className="word-cefr-badge" title="CEFR Bilim Darajasi">
                          CEFR {activeResult.cefrLevel}
                        </span>
                      )}
                      {activeResult.partOfSpeech && (
                        <span className="word-pos-tag">{activeResult.partOfSpeech}</span>
                      )}
                      {(activeResult.isCambridge || activeResult.source?.includes('Cambridge')) && (
                        <span className="word-cambridge-badge" title="Cambridge Academic Dictionary ma'lumotlar bazasi">
                          🎓 Cambridge Dictionary
                        </span>
                      )}
                    </div>

                    <div className="word-phonetic-row">
                      {activeResult.phonetic && (
                        <span className="phonetic-text">{activeResult.phonetic}</span>
                      )}

                      {/* UK Audio */}
                      {activeResult.ukAudio ? (
                        <button
                          type="button"
                          className="audio-play-btn audio-uk-pill"
                          onClick={() => playAudio(activeResult.ukAudio, activeResult.word, 'en')}
                          title="British English (UK)"
                        >
                          <IconVolume size={16} />
                          <span>🇬🇧 UK</span>
                        </button>
                      ) : null}

                      {/* US Audio */}
                      {activeResult.usAudio ? (
                        <button
                          type="button"
                          className="audio-play-btn audio-us-pill"
                          onClick={() => playAudio(activeResult.usAudio, activeResult.word, 'en')}
                          title="American English (US)"
                        >
                          <IconVolume size={16} />
                          <span>🇺🇸 US</span>
                        </button>
                      ) : null}

                      {/* Fallback Speech synthesis button */}
                      <button
                        type="button"
                        className="audio-play-btn"
                        onClick={() => speakText(activeResult.word, activeResult.language)}
                        title={t('dictListenAudio')}
                      >
                        <IconVolume size={18} />
                        <span>{t('dictListenAudio')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="word-card-actions">
                    {activeResult.cambridgeUrl && (
                      <a
                        href={activeResult.cambridgeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cambridge-external"
                        title={t('dictOpenCambridge')}
                      >
                        <IconExternalLink size={16} />
                        <span>{t('dictOpenCambridge')}</span>
                      </a>
                    )}
                    <button
                      type="button"
                      className={`btn-save-vocab ${isWordAlreadySaved ? 'saved' : ''}`}
                      onClick={handleSaveCurrentWord}
                    >
                      <IconBookmark size={18} fill={isWordAlreadySaved ? 'currentColor' : 'none'} />
                      <span>{isWordAlreadySaved ? t('dictSavedBtn') : t('dictSaveBtn')}</span>
                    </button>
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="toast-banner-inline">
                    <IconCheck size={18} /> {saveSuccessMsg}
                  </div>
                )}

                {/* Main Definition & Translations */}
                <div className="meaning-highlight-box">
                  <div className="meaning-block">
                    <span className="meaning-label">📌 {t('dictMainDefinition')}</span>
                    <p className="meaning-text-primary">{activeResult.meaning || activeResult.definition}</p>
                  </div>

                  {activeResult.meaningUz && (
                    <div className="meaning-block uzbek-meaning-block">
                      <span className="meaning-label uz-label">🇺🇿 {t('dictUzbekMeaning')}</span>
                      <p className="meaning-text-uz">{activeResult.meaningUz || activeResult.translation}</p>
                    </div>
                  )}

                  {activeResult.meaningRu && (
                    <div className="meaning-block">
                      <span className="meaning-label">🇷🇺 {t('dictRussianMeaning')}</span>
                      <p className="meaning-text-ru">{activeResult.meaningRu}</p>
                    </div>
                  )}
                </div>

                {/* Example Sentences */}
                {activeResult.examples && activeResult.examples.length > 0 && (
                  <div className="word-section-box">
                    <h3 className="section-subtitle">
                      <IconBook size={18} /> {t('dictExamples')}
                    </h3>
                    <div className="examples-list">
                      {activeResult.examples.map((ex, idx) => (
                        <div key={idx} className="example-item">
                          <div className="example-text-row">
                            <span className="example-bullet">•</span>
                            <span className="example-en">"{ex.text || ex}"</span>
                            <button
                              type="button"
                              className="example-audio-btn"
                              onClick={() => speakText(ex.text || ex, activeResult.language)}
                              title={t('dictListenAudio')}
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
                      <h4>🟢 {t('dictSynonyms')}</h4>
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
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeResult.antonyms && activeResult.antonyms.length > 0 && (
                    <div className="lexicon-chips-box">
                      <h4>🔴 {t('dictAntonyms')}</h4>
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
                          >
                            {ant}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Etymology & Mnemonics */}
                {(activeResult.etymology || activeResult.mnemonicTip || activeResult.mnemonic) && (
                  <div className="mnemonics-card">
                    {activeResult.etymology && (
                      <div className="mnemonic-sub">
                        <span className="mn-icon">🏛️</span>
                        <div>
                          <strong>{t('dictEtymology')}</strong> {activeResult.etymology}
                        </div>
                      </div>
                    )}
                    {(activeResult.mnemonicTip || activeResult.mnemonic) && (
                      <div className="mnemonic-sub">
                        <span className="mn-icon"><IconLightbulb size={20} /></span>
                        <div>
                          <strong>{t('dictMnemonic')}</strong> {activeResult.mnemonicTip || activeResult.mnemonic}
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
                      <strong>{t('dictAiConsultTitle')}</strong>
                      <p>{t('dictAiConsultSub')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-accent-glow"
                    onClick={() => onConsultAgentWithWord(activeResult)}
                  >
                    {t('dictSendToAi')}
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
                  <h3>{t('dictMySavedWords')}</h3>
                </div>
                <span className="saved-counter-badge">
                  {savedWords.length} {t('dictSavedWordsCount')}
                </span>
              </div>

              {savedWords.length === 0 ? (
                <div className="empty-saved-state">
                  <IconBook size={36} className="empty-icon" />
                  <p>{t('dictNoSavedWords')}</p>
                  <span>{t('dictSavePrompt')}</span>
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
                            title={t('dictListenAudio')}
                          >
                            <IconVolume size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-mini-btn delete-mini-btn"
                            onClick={() => onDeleteSavedWord(item.word)}
                            title={t('btnDelete')}
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="saved-item-uz-desc">
                        {item.meaningUz || item.translation || item.meaning}
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
            <h3>{t('dictFlashcardTitle')}</h3>
            <span className="flashcard-progress-counter">
              {t('dictCardProgress')} {flashcardPool.length > 0 ? flashcardIndex + 1 : 0} / {flashcardPool.length}
            </span>
          </div>

          <div className="flashcard-box-centered">
            {(() => {
              const currentCard = flashcardPool[flashcardIndex] || flashcardPool[0];
              if (!currentCard) return null;

              return (
                <div 
                  className={`flashcard-3d-card ${isCardFlipped ? 'flipped' : ''}`}
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                >
                  {!isCardFlipped ? (
                    /* Front Face */
                    <div className="card-face card-front">
                      <span className="card-flip-hint">🔄 {t('dictCardFlipHint')}</span>
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
                          if (currentCard.ukAudio) {
                            playAudio(currentCard.ukAudio, currentCard.word, currentCard.language);
                          } else {
                            speakText(currentCard.word, currentCard.language);
                          }
                        }}
                      >
                        <IconVolume size={20} /> {t('dictListenAudio')}
                      </button>
                    </div>
                  ) : (
                    /* Back Face */
                    <div className="card-face card-back">
                      <span className="card-flip-hint">🔄 {t('dictCardFlipBackHint')}</span>
                      <h3 className="card-back-title">{currentCard.word}</h3>
                      <div className="card-back-uz-box">
                        <strong>{t('dictMainDefinition')}</strong>
                        <p>{currentCard.meaningUz || currentCard.translation || currentCard.meaning}</p>
                      </div>
                      {currentCard.examples?.[0] && (
                        <div className="card-back-example">
                          <em>"{currentCard.examples[0].text || currentCard.examples[0]}"</em>
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
                {t('dictCardPrev')}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setIsCardFlipped(false);
                  setFlashcardIndex(prev => (prev + 1) % flashcardPool.length);
                }}
              >
                {t('dictCardNext')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
