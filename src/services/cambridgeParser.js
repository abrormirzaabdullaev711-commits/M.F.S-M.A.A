// Cambridge Dictionary HTML Parser & Extractor

export function parseCambridgeHtml(html, requestedWord = '') {
  if (!html || typeof html !== 'string') {
    return null;
  }

  // Check if Cambridge returned "Search suggestions" or no definitions found
  if (html.includes('did-you-mean') || html.includes('No exact match found')) {
    const hasDefs = html.includes('ddef_d');
    if (!hasDefs) {
      return null;
    }
  }

  // 1. Headword
  const wordMatch = html.match(/<span[^>]*class="[^"]*hw\s+dhw[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
                    html.match(/<span class="hw dhw"[^>]*>([\s\S]*?)<\/span>/i);
  const headword = wordMatch 
    ? wordMatch[1].replace(/<[^>]+>/g, '').trim() 
    : requestedWord.trim();

  // 2. Part of Speech
  const posMatch = html.match(/<span[^>]*class="[^"]*pos\s+dpos[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
                   html.match(/<span class="pos dpos"[^>]*>([\s\S]*?)<\/span>/i);
  const partOfSpeech = posMatch 
    ? posMatch[1].replace(/<[^>]+>/g, '').trim() 
    : 'word';

  // 3. CEFR Level (e.g. A1, A2, B1, B2, C1, C2)
  const cefrMatch = html.match(/<span class="epp-xref dxref ([A-C][1-2])"[^>]*>([\s\S]*?)<\/span>/i) ||
                    html.match(/<span class="epp-xref dxref[^"]*"[^>]*>([A-C][1-2])<\/span>/i) ||
                    html.match(/class="[^"]*dxref[^"]*"[^>]*>([A-C][1-2])<\/span>/i);
  const cefrLevel = cefrMatch ? (cefrMatch[1] || cefrMatch[2]).trim().toUpperCase() : '';

  // 4. Phonetics & Audio
  // UK
  const ukMatch = html.match(/class="uk dpron-i[\s\S]*?<span class="pron dpron">\/([\s\S]*?)\/<\/span>/i) ||
                  html.match(/class="[^"]*uk[^"]*"[\s\S]*?<span class="pron dpron">\/([\s\S]*?)\/<\/span>/i);
  const ukIpa = ukMatch ? '/' + ukMatch[1].replace(/<[^>]+>/g, '').trim() + '/' : '';

  const ukAudioMatch = html.match(/class="uk dpron-i[\s\S]*?<source type="audio\/mpeg" src="([^"]+)"/i) ||
                       html.match(/class="[^"]*uk[^"]*"[\s\S]*?<source type="audio\/mpeg" src="([^"]+)"/i);
  const ukAudio = ukAudioMatch && ukAudioMatch[1]
    ? (ukAudioMatch[1].startsWith('http') ? ukAudioMatch[1] : `https://dictionary.cambridge.org${ukAudioMatch[1]}`)
    : '';

  // US
  const usMatch = html.match(/class="us dpron-i[\s\S]*?<span class="pron dpron">\/([\s\S]*?)\/<\/span>/i) ||
                  html.match(/class="[^"]*us[^"]*"[\s\S]*?<span class="pron dpron">\/([\s\S]*?)\/<\/span>/i);
  const usIpa = usMatch ? '/' + usMatch[1].replace(/<[^>]+>/g, '').trim() + '/' : '';

  const usAudioMatch = html.match(/class="us dpron-i[\s\S]*?<source type="audio\/mpeg" src="([^"]+)"/i) ||
                       html.match(/class="[^"]*us[^"]*"[\s\S]*?<source type="audio\/mpeg" src="([^"]+)"/i);
  const usAudio = usAudioMatch && usAudioMatch[1]
    ? (usAudioMatch[1].startsWith('http') ? usAudioMatch[1] : `https://dictionary.cambridge.org${usAudioMatch[1]}`)
    : '';

  // Combined phonetic display
  let phonetic = '';
  if (ukIpa && usIpa) {
    phonetic = `UK ${ukIpa} • US ${usIpa}`;
  } else if (ukIpa) {
    phonetic = `UK ${ukIpa}`;
  } else if (usIpa) {
    phonetic = `US ${usIpa}`;
  }

  // 5. Definitions
  const defMatches = [...html.matchAll(/<div[^>]*class="[^"]*ddef_d[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];
  const definitions = defMatches
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/[\r\n\t]+/g, ' ').trim())
    .filter(Boolean);

  const primaryMeaning = definitions[0] || '';

  // 6. Examples
  const exMatches = [...html.matchAll(/<span[^>]*class="[^"]*deg[^"]*"[^>]*>([\s\S]*?)<\/span>/gi)];
  const examples = exMatches
    .map(m => ({
      text: m[1].replace(/<[^>]+>/g, '').replace(/[\r\n\t]+/g, ' ').trim(),
      translation: ''
    }))
    .filter(ex => ex.text.length > 0)
    .slice(0, 4);

  // 7. Synonyms & Related Words
  const synMatches = [
    ...html.matchAll(/<span class="item">([\s\S]*?)<\/span>/gi),
    ...html.matchAll(/<span[^>]*class="[^"]*synonym[^"]*"[^>]*>([\s\S]*?)<\/span>/gi)
  ];
  const synonyms = [...new Set(
    synMatches
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(s => s && s.length < 30 && s.toLowerCase() !== headword.toLowerCase())
  )].slice(0, 6);

  const cleanWord = headword || requestedWord;
  const cambridgeUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(cleanWord.toLowerCase().replace(/\s+/g, '-'))}`;

  if (!primaryMeaning && definitions.length === 0) {
    return null;
  }

  return {
    word: cleanWord,
    language: 'en',
    partOfSpeech,
    phonetic: phonetic || (ukIpa || usIpa || ''),
    ukIpa,
    usIpa,
    ukAudio,
    usAudio,
    cefrLevel,
    meaning: primaryMeaning,
    definition: primaryMeaning,
    definitions: definitions.slice(0, 4),
    examples: examples.length > 0 ? examples : [
      { text: `The word "${cleanWord}" is officially documented in Cambridge Academic Dictionary.`, translation: '' }
    ],
    example: examples[0]?.text || `The word "${cleanWord}" is officially documented in Cambridge Academic Dictionary.`,
    synonyms,
    cambridgeUrl,
    source: 'Cambridge Academic Dictionary',
    isCambridge: true
  };
}
