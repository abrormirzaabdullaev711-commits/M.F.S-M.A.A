// Dictionary and Multi-Language Translation Service
// Integrates Cambridge Academic Dictionary, Datamuse Lexicon, Free Dictionary API, and Neural Translation
import { INITIAL_DICTIONARY_ENTRIES, SUPPORTED_LANGUAGES } from '../data/mockData.js';
import { parseCambridgeHtml } from './cambridgeParser.js';

/**
 * Play Audio with fallback to Web Speech API
 */
export const playAudio = (audioUrl, fallbackText = '', langCode = 'en') => {
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (fallbackText) {
            speakText(fallbackText, langCode);
          }
        });
      }
      return;
    } catch {
      // fallback
    }
  }

  if (fallbackText) {
    speakText(fallbackText, langCode);
  }
};

/**
 * Text to Speech using Web Speech API
 */
export const speakText = (text, langCode = 'en') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  utterance.lang = langObj ? langObj.voiceCode : 'en-US';
  utterance.rate = 0.92;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2).toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * High-speed translation using Google GTX + MyMemory fallback
 */
export async function translateText(text, fromLang = 'en', toLang = 'uz') {
  if (!text || !text.trim() || fromLang === toLang) {
    return text;
  }

  const cleanText = text.trim();

  // 1. Google Translate GTX
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(fromLang)}&tl=${encodeURIComponent(toLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(gtxUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map(item => item[0]).filter(Boolean).join(' ');
        if (translated && translated.trim()) {
          return translated.trim();
        }
      }
    }
  } catch {
    // Fall through to MyMemory
  }

  // 2. MyMemory Translation API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const pair = `${fromLang}|${toLang}`;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${pair}`;
    const res = await fetch(myMemoryUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText && !data.responseData.translatedText.includes('MYMEMORY WARNING')) {
        return data.responseData.translatedText.trim();
      }
    }
  } catch {
    // Both failed
  }

  return cleanText;
}

/**
 * Fetch word from Cambridge Dictionary API (via Vite middleware or fallback)
 */
async function fetchFromCambridge(cleanWord) {
  const slug = cleanWord.toLowerCase().trim().replace(/\s+/g, '-');

  // 1. Try local Vite dev server API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`/api/cambridge?word=${encodeURIComponent(slug)}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && !data.notFound && (data.meaning || data.definition)) {
        return data;
      }
      if (data && data.notFound) {
        return null;
      }
    }
  } catch {
    // dev server API not available or network error
  }

  // 2. Direct AllOrigins proxy fallback if static build
  try {
    const targetUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(slug)}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const parsed = parseCambridgeHtml(html, cleanWord);
      if (parsed && (parsed.meaning || parsed.definition)) {
        return parsed;
      }
    }
  } catch {
    // fallback skipped
  }

  return null;
}

/**
 * Fetch definitions, synonyms and antonyms from Datamuse API (fast, open, CORS-enabled)
 */
async function fetchDatamuseInfo(cleanWord) {
  try {
    const [defRes, synRes, antRes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}&md=d&max=1`),
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=8`),
      fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(cleanWord)}&max=6`)
    ]);

    let definitions = [];
    let partOfSpeech = '';
    if (defRes.ok) {
      const defData = await defRes.json();
      if (defData?.[0]?.defs) {
        definitions = defData[0].defs.map(d => {
          const parts = d.split('\t');
          if (parts.length > 1) {
            if (!partOfSpeech) partOfSpeech = parts[0];
            return parts[1];
          }
          return d;
        });
      }
    }

    let synonyms = [];
    if (synRes.ok) {
      const synData = await synRes.json();
      if (Array.isArray(synData)) {
        synonyms = synData.map(s => s.word);
      }
    }

    let antonyms = [];
    if (antRes.ok) {
      const antData = await antRes.json();
      if (Array.isArray(antData)) {
        antonyms = antData.map(a => a.word);
      }
    }

    return { definitions, synonyms, antonyms, partOfSpeech };
  } catch {
    return { definitions: [], synonyms: [], antonyms: [], partOfSpeech: '' };
  }
}

/**
 * Fetch from Free Dictionary API
 */
async function fetchFreeDictionary(cleanWord) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const firstMeaning = item.meanings?.[0];
        const firstDef = firstMeaning?.definitions?.[0];

        const synonymsList = [];
        const antonymsList = [];
        const examplesList = [];

        item.meanings?.forEach(m => {
          if (m.synonyms) synonymsList.push(...m.synonyms);
          if (m.antonyms) antonymsList.push(...m.antonyms);
          m.definitions?.forEach(d => {
            if (d.synonyms) synonymsList.push(...d.synonyms);
            if (d.antonyms) antonymsList.push(...d.antonyms);
            if (d.example && examplesList.length < 3) {
              examplesList.push({ text: d.example, translation: '' });
            }
          });
        });

        // Phonetics audio
        let ukAudio = '';
        let usAudio = '';
        const ukPhon = item.phonetics?.find(p => p.audio?.includes('-uk') || p.audio?.includes('/uk/'));
        const usPhon = item.phonetics?.find(p => p.audio?.includes('-us') || p.audio?.includes('/us/'));
        if (ukPhon?.audio) ukAudio = ukPhon.audio;
        if (usPhon?.audio) usAudio = usPhon.audio;
        if (!ukAudio && item.phonetics?.[0]?.audio) ukAudio = item.phonetics[0].audio;

        return {
          word: item.word,
          phonetic: item.phonetic || item.phonetics?.find(p => p.text)?.text || '',
          partOfSpeech: firstMeaning?.partOfSpeech || 'general',
          meaning: firstDef?.definition || '',
          definitions: [firstDef?.definition].filter(Boolean),
          examples: examplesList,
          synonyms: [...new Set(synonymsList)].slice(0, 8),
          antonyms: [...new Set(antonymsList)].slice(0, 6),
          ukAudio,
          usAudio
        };
      }
    }
  } catch {
    // API failed or 404
  }
  return null;
}

/**
 * Main Lookup Word Function with full multi-language intelligence
 */
export const lookupWord = async (word, lang = 'en') => {
  const cleanWord = (word || '').trim();
  if (!cleanWord) return null;

  // 1. Check local curated entries first for instantaneous match
  const localMatch = INITIAL_DICTIONARY_ENTRIES.find(
    entry => entry.word.toLowerCase() === cleanWord.toLowerCase() && (!lang || entry.language === lang)
  );

  if (localMatch) {
    const meaningUz = localMatch.meaningUz || localMatch.meaning;
    const meaningRu = localMatch.meaningRu || '';
    const def = localMatch.meaning;
    const firstEx = localMatch.examples?.[0]?.text || '';
    return {
      ...localMatch,
      definition: def,
      translation: meaningUz,
      meaningUz,
      meaningRu,
      example: firstEx,
      mnemonic: localMatch.mnemonicTip || '',
      mnemonicTip: localMatch.mnemonicTip || '',
      cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase().replace(/\s+/g, '-'))}`,
      isLocal: true,
      source: "Mukammal Lug'at Bazasi"
    };
  }

  // 2. ENGLISH SEARCH: Cambridge Dictionary + Free Dict + Datamuse + Translations
  if (lang === 'en' || !lang) {
    try {
      const [cambridgeData, uzbekTranslation, russianTranslation, datamuseData] = await Promise.all([
        fetchFromCambridge(cleanWord),
        translateText(cleanWord, 'en', 'uz'),
        translateText(cleanWord, 'en', 'ru'),
        fetchDatamuseInfo(cleanWord)
      ]);

      if (cambridgeData && (cambridgeData.meaning || cambridgeData.definition)) {
        const meaning = cambridgeData.meaning || cambridgeData.definition;
        const definitions = cambridgeData.definitions || [meaning];
        const synonyms = (cambridgeData.synonyms && cambridgeData.synonyms.length > 0)
          ? cambridgeData.synonyms
          : datamuseData.synonyms;
        const antonyms = datamuseData.antonyms;
        const cefr = cambridgeData.cefrLevel || (cleanWord.length > 8 ? 'B2' : 'B1');

        const examples = cambridgeData.examples?.length > 0 ? cambridgeData.examples : [
          { text: `The word "${cleanWord}" is officially documented in Cambridge Academic Dictionary.`, translation: `"${cleanWord}" so'zi xalqaro akademik darajada faol qo'llaniladi.` }
        ];

        return {
          word: cambridgeData.word || cleanWord,
          language: 'en',
          phonetic: cambridgeData.phonetic || '',
          ukIpa: cambridgeData.ukIpa || '',
          usIpa: cambridgeData.usIpa || '',
          ukAudio: cambridgeData.ukAudio || '',
          usAudio: cambridgeData.usAudio || '',
          cefrLevel: cefr,
          partOfSpeech: cambridgeData.partOfSpeech || datamuseData.partOfSpeech || 'noun / adjective',
          meaning: meaning,
          definition: meaning,
          definitions: definitions.slice(0, 4),
          meaningUz: uzbekTranslation || `Ingliz tilidagi so'z: ${cleanWord}`,
          translation: uzbekTranslation || cleanWord,
          meaningRu: russianTranslation || '',
          examples: examples,
          example: examples[0]?.text || '',
          synonyms: synonyms.slice(0, 8),
          antonyms: antonyms.slice(0, 6),
          etymology: `Cambridge University Press xalqaro standart lug'ati. CEFR darajasi: ${cefr}.`,
          mnemonicTip: `Esda saqlash tavsiyasi: "${cleanWord}" so'zining audio talaffuzini eshitib, kamida 3 ta namunaviy gap tuzing!`,
          mnemonic: `Esda saqlash: "${cleanWord}" so'zining audio talaffuzini eshitib, namunaviy gap bilan bog'lang!`,
          category: `Cambridge Academic (${cefr})`,
          source: 'Cambridge Academic Dictionary',
          cambridgeUrl: cambridgeData.cambridgeUrl || `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase().replace(/\s+/g, '-'))}`,
          isCambridge: true
        };
      }

      // If Cambridge had no entry, try Free Dictionary API
      const freeDictData = await fetchFreeDictionary(cleanWord);
      if (freeDictData && freeDictData.meaning) {
        const synonyms = freeDictData.synonyms?.length > 0 ? freeDictData.synonyms : datamuseData.synonyms;
        const antonyms = freeDictData.antonyms?.length > 0 ? freeDictData.antonyms : datamuseData.antonyms;
        const examples = freeDictData.examples?.length > 0 ? freeDictData.examples : [
          { text: `She learned how to use the word "${cleanWord}" in context.`, translation: `U "${cleanWord}" so'zini kontekstda to'g'ri qo'llashni o'rgandi.` }
        ];

        return {
          word: freeDictData.word || cleanWord,
          language: 'en',
          phonetic: freeDictData.phonetic || '',
          ukAudio: freeDictData.ukAudio || '',
          usAudio: freeDictData.usAudio || '',
          cefrLevel: cleanWord.length > 7 ? 'B2' : 'B1',
          partOfSpeech: freeDictData.partOfSpeech || datamuseData.partOfSpeech || 'general',
          meaning: freeDictData.meaning,
          definition: freeDictData.meaning,
          definitions: freeDictData.definitions || [freeDictData.meaning],
          meaningUz: uzbekTranslation || cleanWord,
          translation: uzbekTranslation || cleanWord,
          meaningRu: russianTranslation || '',
          examples: examples,
          example: examples[0]?.text || '',
          synonyms: synonyms.slice(0, 8),
          antonyms: antonyms.slice(0, 6),
          etymology: `Ingliz tili umumiy leksikasi. Manba: Xalqaro akademik lug'at.`,
          mnemonicTip: `Kontekstual mnemonika: So'z ishtirokida audio talaffuz qilib esda saqlang.`,
          mnemonic: `Audio talaffuzni qaytaring va namunaviy gap tuzing.`,
          category: 'Academic & General English',
          source: 'Free Dictionary & Datamuse Lexicon',
          cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase().replace(/\s+/g, '-'))}`
        };
      }

      // If Datamuse has definitions
      if (datamuseData.definitions && datamuseData.definitions.length > 0) {
        const primaryDef = datamuseData.definitions[0];
        const examples = [
          { text: `The term "${cleanWord}" is commonly used in English speaking practice.`, translation: `"${cleanWord}" iborasi ingliz tili muloqotida faol qo'llaniladi.` }
        ];

        return {
          word: cleanWord,
          language: 'en',
          phonetic: `/${cleanWord}/`,
          partOfSpeech: datamuseData.partOfSpeech || 'word',
          meaning: primaryDef,
          definition: primaryDef,
          definitions: datamuseData.definitions.slice(0, 4),
          meaningUz: uzbekTranslation || cleanWord,
          translation: uzbekTranslation || cleanWord,
          meaningRu: russianTranslation || '',
          examples: examples,
          example: examples[0]?.text || '',
          synonyms: datamuseData.synonyms.slice(0, 8),
          antonyms: datamuseData.antonyms.slice(0, 6),
          etymology: `Ingliz tili leksikasi bazasi.`,
          mnemonicTip: `Har kuni ushbu so'z bilan 2 ta yangi gap tuzing.`,
          mnemonic: `So'zni baland ovozda takrorlang.`,
          category: 'English Vocabulary',
          source: 'Global Lexicon Database',
          cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase().replace(/\s+/g, '-'))}`
        };
      }
    } catch (err) {
      console.warn('English lookup error:', err);
    }
  }

  // 3. UZBEK LANGUAGE SEARCH: Translates to English & Russian, provides deep lexical context
  if (lang === 'uz') {
    try {
      const [englishWord, russianWord] = await Promise.all([
        translateText(cleanWord, 'uz', 'en'),
        translateText(cleanWord, 'uz', 'ru')
      ]);

      const datamuseData = await fetchDatamuseInfo(englishWord);
      const enDef = datamuseData.definitions?.[0] || `The concept of "${cleanWord}" represented in English as "${englishWord}".`;
      const uzDefExplanation = await translateText(enDef, 'en', 'uz');

      const examples = [
        {
          text: `O'zbek tilida "${cleanWord}" so'zi muhim ma'no va fikrni ifodalaydi.`,
          translation: `In English: "${englishWord}" — used widely in literature and conversation.`
        },
        {
          text: `Ushbu ibora til boyligimizning ifodali namunalaridan biridir.`,
          translation: `Corresponding Russian term: "${russianWord}".`
        }
      ];

      return {
        word: cleanWord,
        language: 'uz',
        phonetic: `[${cleanWord}]`,
        partOfSpeech: "O'zbek tili leksikasi",
        meaning: `"${cleanWord}" — Inglizcha: "${englishWord}", Ruscha: "${russianWord}". ${uzDefExplanation}`,
        definition: `"${cleanWord}" — Inglizcha: "${englishWord}", Ruscha: "${russianWord}".`,
        meaningUz: `Asosiy ma'nosi: ${cleanWord} (Tarjimasi: ${englishWord})`,
        translation: englishWord,
        meaningRu: russianWord,
        examples: examples,
        example: examples[0]?.text || '',
        synonyms: datamuseData.synonyms.length > 0 ? datamuseData.synonyms.slice(0, 6) : ["ifodali atama", "bog'liq so'zlar"],
        antonyms: datamuseData.antonyms.slice(0, 4),
        etymology: `O'zbek tili lug'at boyligi. Xalqaro ekvivalenti: "${englishWord}".`,
        mnemonicTip: `Inglizcha "${englishWord}" so'zini eslab qoling va ikkala tilda gap tuzing!`,
        mnemonic: `O'zbekcha: ${cleanWord} ⇄ Inglizcha: ${englishWord}`,
        category: "O'zbekcha-Inglizcha Lug'at",
        source: "Mukammal Ko'p Tilli Lug'at",
        cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(englishWord.toLowerCase().replace(/\s+/g, '-'))}`
      };
    } catch (err) {
      console.warn('Uzbek lookup error:', err);
    }
  }

  // 4. RUSSIAN LANGUAGE SEARCH: Translates to Uzbek and English
  if (lang === 'ru') {
    try {
      const [uzbekWord, englishWord] = await Promise.all([
        translateText(cleanWord, 'ru', 'uz'),
        translateText(cleanWord, 'ru', 'en')
      ]);

      const datamuseData = await fetchDatamuseInfo(englishWord);
      const examples = [
        {
          text: `Слово "${cleanWord}" часто используется в современном общении и литературе.`,
          translation: `O'zbekcha tarjimasi: "${uzbekWord}" (Inglizcha: "${englishWord}").`
        }
      ];

      return {
        word: cleanWord,
        language: 'ru',
        phonetic: `[${cleanWord}]`,
        partOfSpeech: "Русская лексика",
        meaning: `"${cleanWord}" — Перевод на узбекский: "${uzbekWord}", на английский: "${englishWord}".`,
        definition: `"${cleanWord}" — Перевод: "${uzbekWord}" / "${englishWord}".`,
        meaningUz: uzbekWord,
        translation: uzbekWord,
        meaningRu: cleanWord,
        examples: examples,
        example: examples[0]?.text || '',
        synonyms: datamuseData.synonyms.length > 0 ? datamuseData.synonyms.slice(0, 6) : ["связанные выражения"],
        antonyms: datamuseData.antonyms.slice(0, 4),
        etymology: `Лексическая единица русского языка. Международный аналог: "${englishWord}".`,
        mnemonicTip: `Запомните связку: "${cleanWord}" = "${uzbekWord}" (UZ) = "${englishWord}" (EN).`,
        mnemonic: `${cleanWord} = ${uzbekWord}`,
        category: "Русско-Узбекский словарь",
        source: "Международный словарь",
        cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(englishWord.toLowerCase().replace(/\s+/g, '-'))}`
      };
    } catch (err) {
      console.warn('Russian lookup error:', err);
    }
  }

  // 5. ALL OTHER LANGUAGES (de, tr, ar, fr, es, zh, ko, ja)
  try {
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang) || { name: lang, flag: '🌐' };
    const [uzbekWord, englishWord] = await Promise.all([
      translateText(cleanWord, lang, 'uz'),
      translateText(cleanWord, lang, 'en')
    ]);

    const examples = [
      {
        text: `${cleanWord} — ${langConfig.name} tilida muhim leksik birlik.`,
        translation: `O'zbekcha: "${uzbekWord}" • Inglizcha: "${englishWord}".`
      }
    ];

    return {
      word: cleanWord,
      language: lang,
      phonetic: `[${cleanWord}]`,
      partOfSpeech: `${langConfig.name} so'zi`,
      meaning: `"${cleanWord}" (${langConfig.name}) — O'zbekcha tarjimasi: "${uzbekWord}", Inglizcha: "${englishWord}".`,
      definition: `"${cleanWord}" (${langConfig.name}) — O'zbekcha: "${uzbekWord}", Inglizcha: "${englishWord}".`,
      meaningUz: uzbekWord,
      translation: uzbekWord,
      meaningRu: '',
      examples: examples,
      example: examples[0]?.text || '',
      synonyms: ["leksik birlik", "faol so'z"],
      antonyms: [],
      etymology: `${langConfig.name} leksikasi. Xalqaro ekvivalenti: "${englishWord}".`,
      mnemonicTip: `Har kuni ushbu so'zni audio talaffuz bilan birga qaytaring: "${cleanWord}" ➔ "${uzbekWord}".`,
      mnemonic: `${cleanWord} ➔ ${uzbekWord}`,
      category: `${langConfig.name} So'zligi`,
      source: "Ko'p tilli Global Tarjima",
      cambridgeUrl: `https://dictionary.cambridge.org/search/direct/?datasetsearch=english&q=${encodeURIComponent(englishWord.toLowerCase().replace(/\s+/g, '-'))}`
    };
  } catch (err) {
    console.warn('Multi-language translation error:', err);
  }

  // 6. Ultimate Safe Fallback
  return {
    word: cleanWord,
    language: lang,
    phonetic: `[${cleanWord}]`,
    partOfSpeech: "Leksik atama",
    meaning: `"${cleanWord}" so'zining ma'nosi va tushuntirishi.`,
    definition: `"${cleanWord}" so'zining ma'nosi va tushuntirishi.`,
    meaningUz: cleanWord,
    translation: cleanWord,
    meaningRu: '',
    examples: [
      { text: `Please use the word "${cleanWord}" in a sample sentence.`, translation: `Ushbu so'z ishtirokida yangi gap tuzing.` }
    ],
    example: `Please use the word "${cleanWord}" in a sample sentence.`,
    synonyms: [],
    antonyms: [],
    etymology: "Leksik qidiruv",
    mnemonicTip: `So'zni baland ovozda 3 marta takrorlang.`,
    mnemonic: `So'zni baland ovozda 3 marta takrorlang.`,
    category: 'Lug\'at Qidiruvi',
    source: 'Tizim',
    cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase().replace(/\s+/g, '-'))}`
  };
};
