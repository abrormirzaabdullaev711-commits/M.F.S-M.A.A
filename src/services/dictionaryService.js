// Dictionary and Translation Service with Cambridge Academic Dictionary Integration
import { INITIAL_DICTIONARY_ENTRIES, SUPPORTED_LANGUAGES } from '../data/mockData';
import { parseCambridgeHtml } from './cambridgeParser';

/**
 * Play Audio with fallback to Web Speech API
 */
export const playAudio = (audioUrl, fallbackText = '', langCode = 'en') => {
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        if (fallbackText) {
          speakText(fallbackText, langCode);
        }
      });
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
  if (!('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  utterance.lang = langObj ? langObj.voiceCode : 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Fetch word from Cambridge Dictionary
 */
async function fetchFromCambridge(cleanWord) {
  // 1. Try local Vite dev server API
  try {
    const res = await fetch(`/api/cambridge?word=${encodeURIComponent(cleanWord)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.notFound && data.meaning) {
        return data;
      }
    }
  } catch {
    // server API not available or network error
  }

  // 2. Try CORS proxy fallback if running without Vite backend
  try {
    const targetUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase().trim())}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const parsed = parseCambridgeHtml(html, cleanWord);
      if (parsed && parsed.meaning) {
        return parsed;
      }
    }
  } catch {
    // CORS proxy fallback skipped
  }

  return null;
}

/**
 * Fetch Uzbek translation using MyMemory
 */
async function fetchUzbekTranslation(cleanWord) {
  try {
    const trRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|uz`);
    if (trRes.ok) {
      const trData = await trRes.json();
      if (trData?.responseData?.translatedText) {
        return trData.responseData.translatedText;
      }
    }
  } catch (e) {
    console.warn('Uzbek translation error:', e);
  }
  return '';
}

/**
 * Search word meaning across Cambridge Dictionary, Free Dictionary API, and local curated base
 */
export const lookupWord = async (word, lang = 'en') => {
  const cleanWord = word.trim();
  if (!cleanWord) return null;

  // 1. If English, search CAMBRIDGE DICTIONARY first!
  if (lang === 'en' || !lang) {
    try {
      const [cambridgeData, uzbekTranslation] = await Promise.all([
        fetchFromCambridge(cleanWord),
        fetchUzbekTranslation(cleanWord)
      ]);

      if (cambridgeData && cambridgeData.meaning) {
        const localMatch = INITIAL_DICTIONARY_ENTRIES.find(
          entry => entry.word.toLowerCase() === cleanWord.toLowerCase()
        );

        return {
          word: cambridgeData.word,
          language: 'en',
          phonetic: cambridgeData.phonetic || localMatch?.phonetic || '',
          ukIpa: cambridgeData.ukIpa || '',
          usIpa: cambridgeData.usIpa || '',
          ukAudio: cambridgeData.ukAudio || '',
          usAudio: cambridgeData.usAudio || '',
          cefrLevel: cambridgeData.cefrLevel || localMatch?.cefrLevel || '',
          partOfSpeech: cambridgeData.partOfSpeech || 'word',
          meaning: cambridgeData.meaning,
          definitions: cambridgeData.definitions || [cambridgeData.meaning],
          meaningUz: uzbekTranslation || localMatch?.meaningUz || `Ingliz tilidagi so'z: ${cleanWord}`,
          meaningRu: localMatch?.meaningRu || '',
          examples: (cambridgeData.examples && cambridgeData.examples.length > 0) 
            ? cambridgeData.examples 
            : (localMatch?.examples || [{ text: `The word "${cleanWord}" is used in academic English.`, translation: '' }]),
          synonyms: cambridgeData.synonyms?.length > 0 ? cambridgeData.synonyms : (localMatch?.synonyms || []),
          antonyms: localMatch?.antonyms || [],
          etymology: localMatch?.etymology || `Cambridge University Press xalqaro standart lug'ati. CEFR darajasi: ${cambridgeData.cefrLevel || 'Akademik'}.`,
          mnemonicTip: localMatch?.mnemonicTip || `Cambridge namunaviy gaplarini audio talaffuz bilan birga takrorlang.`,
          category: `Cambridge Academic (${cambridgeData.cefrLevel || 'B1-C2'})`,
          source: 'Cambridge Academic Dictionary',
          cambridgeUrl: cambridgeData.cambridgeUrl,
          isCambridge: true
        };
      }
    } catch (cambridgeErr) {
      console.warn('Cambridge lookup error, falling back:', cambridgeErr);
    }
  }

  // 2. Check local curated entries
  const localMatch = INITIAL_DICTIONARY_ENTRIES.find(
    entry => entry.word.toLowerCase() === cleanWord.toLowerCase() && (!lang || entry.language === lang)
  );

  if (localMatch) {
    return {
      ...localMatch,
      cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase())}`,
      isLocal: true,
      source: "Mukammal Lug'at Bazasi"
    };
  }

  // 3. If English and Cambridge was unreachable, try Free Dictionary API
  if (lang === 'en' || !lang) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          const firstMeaning = item.meanings?.[0];
          const firstDef = firstMeaning?.definitions?.[0];
          
          const synonymsList = [];
          const antonymsList = [];
          item.meanings?.forEach(m => {
            if (m.synonyms) synonymsList.push(...m.synonyms);
            if (m.antonyms) antonymsList.push(...m.antonyms);
            m.definitions?.forEach(d => {
              if (d.synonyms) synonymsList.push(...d.synonyms);
              if (d.antonyms) antonymsList.push(...d.antonyms);
            });
          });

          const uzbekTranslation = await fetchUzbekTranslation(cleanWord);

          const examples = [];
          item.meanings?.forEach(m => {
            m.definitions?.forEach(d => {
              if (d.example && examples.length < 3) {
                examples.push({
                  text: d.example,
                  translation: ''
                });
              }
            });
          });

          return {
            word: item.word,
            language: 'en',
            phonetic: item.phonetic || item.phonetics?.find(p => p.text)?.text || '',
            partOfSpeech: firstMeaning?.partOfSpeech || 'general',
            meaning: firstDef?.definition || "Definition not found.",
            meaningUz: uzbekTranslation || `Ingliz tilidagi so'z: ${cleanWord}`,
            meaningRu: '',
            examples: examples.length > 0 ? examples : [
              { text: `The word "${cleanWord}" is commonly used in everyday speech and academic writing.`, translation: "" }
            ],
            synonyms: [...new Set(synonymsList)].slice(0, 8),
            antonyms: [...new Set(antonymsList)].slice(0, 6),
            etymology: item.origin || `Etimologiya: "${cleanWord}" so'zining ingliz tili leksikasidagi o'rni va qo'llanish doirasi.`,
            mnemonicTip: `Esda saqlash tavsiyasi: Ushbu so'z bilan kamida 3 ta o'z hayotingizga bog'liq gap tuzing!`,
            category: "Onlayn Lug'at & API",
            source: 'Cambridge & Free Dictionary API',
            cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase())}`
          };
        }
      }
    } catch (apiError) {
      console.warn('Free Dictionary API lookup failed:', apiError);
    }
  }

  // 4. For any other language or fallback, use MyMemory Translation
  try {
    const pair = `${lang}|uz`;
    const trRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=${pair}`);
    if (trRes.ok) {
      const trData = await trRes.json();
      const translated = trData?.responseData?.translatedText || cleanWord;
      
      const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang) || { name: lang, flag: '🌐' };

      return {
        word: cleanWord,
        language: lang,
        phonetic: `[${cleanWord}]`,
        partOfSpeech: "Leksik birlik / So'z",
        meaning: `"${cleanWord}" (${langConfig.name}) — O'zbek tiliga tarjimasi: ${translated}`,
        meaningUz: translated,
        meaningRu: '',
        examples: [
          {
            text: `${cleanWord} — til o'rganish amaliyotida faol qo'llaniladigan muhim atama.`,
            translation: `Ushbu so'z muloqot va yozuvda tez-tez ishlatiladi.`
          }
        ],
        synonyms: ["bog'liq iboralar", "kontekstual ma'nolar"],
        antonyms: [],
        etymology: `${langConfig.name} tilidagi leksik tarkib.`,
        mnemonicTip: `Har kuni ushbu so'z ishtirokida audio talaffuz qilib qaytaring.`,
        category: `${langConfig.name} So'zligi`,
        source: "Ko'p tilli Global Tarjima",
        cambridgeUrl: `https://dictionary.cambridge.org/search/direct/?datasetsearch=english&q=${encodeURIComponent(cleanWord.toLowerCase())}`
      };
    }
  } catch (err) {
    console.error('Translation failed:', err);
  }

  // 5. Default fallback object
  return {
    word: cleanWord,
    language: lang,
    phonetic: `[${cleanWord}]`,
    partOfSpeech: "So'z",
    meaning: `"${cleanWord}" so'zining ma'nosi va tushuntirishi.`,
    meaningUz: cleanWord,
    meaningRu: '',
    examples: [
      { text: `Please use the word "${cleanWord}" in a sample sentence.`, translation: "Ushbu so'z ishtirokida yangi gap tuzing." }
    ],
    synonyms: [],
    antonyms: [],
    etymology: "Leksik qidiruv",
    mnemonicTip: "So'zni baland ovozda 3 marta takrorlang.",
    category: 'Maxsus qidiruv',
    source: 'Tizim',
    cambridgeUrl: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase())}`
  };
};
