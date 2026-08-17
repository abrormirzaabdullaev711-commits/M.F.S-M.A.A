// Dictionary and Translation Service
import { INITIAL_DICTIONARY_ENTRIES, SUPPORTED_LANGUAGES } from '../data/mockData';

/**
 * Text to Speech using Web Speech API
 */
export const speakText = (text, langCode = 'en') => {
  if (!('speechSynthesis' in window)) {
    alert("Kechirasiz, brauzeringiz ovozli talaffuzni qo'llab-quvvatlamaydi.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find language config
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  utterance.lang = langObj ? langObj.voiceCode : 'en-US';
  utterance.rate = 0.9; // clear educational speed
  utterance.pitch = 1.0;

  // Try to find native voice if available
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
 * Search word meaning across APIs and local database
 */
export const lookupWord = async (word, lang = 'en') => {
  const cleanWord = word.trim();
  if (!cleanWord) return null;

  // 1. Check local mock dictionary first for ultra-rich curated entries
  const localMatch = INITIAL_DICTIONARY_ENTRIES.find(
    entry => entry.word.toLowerCase() === cleanWord.toLowerCase() && (!lang || entry.language === lang)
  );

  if (localMatch) {
    return {
      ...localMatch,
      isLocal: true,
      source: 'Mukammal Lug\'at Bazasi'
    };
  }

  // 2. If English, try Free Dictionary API
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

          // Fetch Uzbek translation via MyMemory or translate definition
          let uzbekTranslation = '';
          try {
            const trRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|uz`);
            if (trRes.ok) {
              const trData = await trRes.json();
              if (trData?.responseData?.translatedText) {
                uzbekTranslation = trData.responseData.translatedText;
              }
            }
          } catch (e) {
            console.log('Translation fallback error', e);
          }

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
            category: 'Onlayn Lug\'at & API',
            source: 'Free Dictionary API'
          };
        }
      }
    } catch (apiError) {
      console.warn('Free Dictionary API lookup failed:', apiError);
    }
  }

  // 3. For any other language or fallback, use MyMemory Translation
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
        synonyms: ['bog\'liq iboralar', 'kontekstual ma\'nolar'],
        antonyms: [],
        etymology: `${langConfig.name} tilidagi leksik tarkib.`,
        mnemonicTip: `Har kuni ushbu so'z ishtirokida audio talaffuz qilib qaytaring.`,
        category: `${langConfig.name} So'zligi`,
        source: 'Ko\'p tilli Global Tarjima'
      };
    }
  } catch (err) {
    console.error('Translation failed:', err);
  }

  // 4. Default fallback object
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
    source: 'Tizim'
  };
};
