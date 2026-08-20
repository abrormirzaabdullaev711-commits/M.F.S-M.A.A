// Mock Data for Multi-Language Dictionary, Student Attendance, Grading, and Multi-Agent AI System

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'Ingliz tili (English)', flag: '🇬🇧', voiceCode: 'en-US', placeholder: 'Masalan: serendipity, resilient, accomplish...' },
  { code: 'uz', name: "O'zbek tili (Uzbek)", flag: '🇺🇿', voiceCode: 'uz-UZ', placeholder: 'Masalan: maftunkor, sabot, muvaffaqiyat...' },
  { code: 'ru', name: 'Rus tili (Русский)', flag: '🇷🇺', voiceCode: 'ru-RU', placeholder: 'Masalan: вдохновение, упорство, достижение...' },
  { code: 'de', name: 'Nemis tili (Deutsch)', flag: '🇩🇪', voiceCode: 'de-DE', placeholder: 'Masalan: Sehnsucht, Ausdauer, Erfolg...' },
  { code: 'ar', name: 'Arab tili (العربية)', flag: '🇸🇦', voiceCode: 'ar-SA', placeholder: 'Masalan: إلهام, عزيمة, نجاح...' },
  { code: 'tr', name: 'Turk tili (Türkçe)', flag: '🇹🇷', voiceCode: 'tr-TR', placeholder: 'Masalan: ilham, azim, başarı...' },
  { code: 'fr', name: 'Fransuz tili (Français)', flag: '🇫🇷', voiceCode: 'fr-FR', placeholder: 'Masalan: persévérance, réussite, passion...' },
  { code: 'es', name: 'Ispan tili (Español)', flag: '🇪🇸', voiceCode: 'es-ES', placeholder: 'Masalan: resiliencia, éxito, inspiración...' },
  { code: 'zh', name: 'Xitoy tili (中文)', flag: '🇨🇳', voiceCode: 'zh-CN', placeholder: 'Masalan: 毅力, 成功, 灵感...' },
  { code: 'ko', name: 'Koreys tili (한국어)', flag: '🇰🇷', voiceCode: 'ko-KR', placeholder: 'Masalan: 끈기, 성공, 열정...' },
  { code: 'ja', name: 'Yapon tili (日本語)', flag: '🇯🇵', voiceCode: 'ja-JP', placeholder: 'Masalan: 継続, 成功, 情熱...' }
];

export const INITIAL_DICTIONARY_ENTRIES = [
  {
    word: 'resilient',
    language: 'en',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective (sifat)',
    meaning: 'Able to withstand or recover quickly from difficult conditions; adaptable and strong.',
    meaningUz: "Qiyinchiliklarga bardoshli, qayishqoq, sinovlardan so'ng tez o'ziga keluvchi, sabotli.",
    meaningRu: 'Устойчивый, стойкий, жизнерадостный, способный быстро восстанавливаться.',
    examples: [
      {
        text: 'She proved to be resilient in the face of unexpected academic challenges.',
        translation: "U kutilmagan o'qish qiyinchiliklari oldida o'zining bardoshli va sabotli ekanini ko'rsatdi."
      },
      {
        text: 'The resilient team completed the research despite tight deadlines.',
        translation: "Bardoshli jamoa qat'iy muddatlarga qaramay tadqiqotni muvaffaqiyatli yakunladi."
      }
    ],
    synonyms: ['tenacious', 'tough', 'adaptable', 'buoyant', 'flexible', 'robust'],
    antonyms: ['fragile', 'vulnerable', 'weak', 'sensitive'],
    etymology: "Lotincha 'resilire' (orqaga sakramoq, qaytmoq) so'zidan kelib chiqqan. Qiyinchilikdan keyin asl holiga qaytishni ifodalaydi.",
    mnemonicTip: "Esda saqlash: 'Re' (qaytadan) + 'Silent' bo'lmasdan harakat qilish -> Qiyinchilikka taslim bo'lmaydigan inson!",
    category: 'IELTS / Advanced Vocabulary'
  },
  {
    word: 'serendipity',
    language: 'en',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    partOfSpeech: 'noun (ot)',
    meaning: 'The occurrence and development of events by chance in a happy or beneficial way.',
    meaningUz: "Kutilmagan baxtli tasodif, tasodifiy yoqimli va foydali kashfiyot.",
    meaningRu: 'Счастливая случайность, интуитивная прозорливость, приятная неожиданность.',
    examples: [
      {
        text: 'Finding my favorite foreign language book in that old bookstore was pure serendipity.',
        translation: "Eski kitob do'konida sevimli chet tili kitobimni topib olishim sof baxtli tasodif edi."
      }
    ],
    synonyms: ['fluke', 'happy accident', 'providence', 'good fortune', 'coincidence'],
    antonyms: ['misfortune', 'bad luck', 'calculated result'],
    etymology: "Horace Walpole tomonidan 1754-yilda 'The Three Princes of Serendip' ertagi asosida yaratilgan.",
    mnemonicTip: "Esda saqlash: 'Seren' (xotirjam) + 'dip' (suvga sho'ng'ib marvarid topgandek tasodifiy sovg'a)!",
    category: 'Literature & Culture'
  },
  {
    word: 'diligent',
    language: 'en',
    phonetic: '/ˈdɪl.ɪ.dʒənt/',
    partOfSpeech: 'adjective (sifat)',
    meaning: 'Having or showing care and conscientiousness in one’s work or duties.',
    meaningUz: "Tirishqoq, g'ayratli, o'z ishiga mas'uliyatli va puxta yondashuvchi.",
    meaningRu: 'Прилежный, старательный, усердный, добросовестный.',
    examples: [
      {
        text: 'The diligent student reviewed vocabulary flashcards every single morning.',
        translation: "Tirishqoq o'quvchi har kuni ertalab lug'at kartochkalarini takrorlab bordi."
      }
    ],
    synonyms: ['assiduous', 'hardworking', 'meticulous', 'dedicated', 'industrious'],
    antonyms: ['lazy', 'negligent', 'careless', 'indifferent'],
    etymology: "Lotincha 'diligere' (qadrlamoq, sevib bajarmoq) fe'lidan olingan.",
    mnemonicTip: "Esda saqlash: 'Dili' (qalbi bilan) intiluvchi -> chin yurakdan tirishqoq o'quvchi!",
    category: 'Education & Character'
  },
  {
    word: 'sabot',
    language: 'uz',
    phonetic: '[sa-bot]',
    partOfSpeech: 'ot (noun)',
    meaning: "Maqsad yo'lidagi qat'iyat, chidamlilik, sobitqadamlik va qat'iy iroda.",
    meaningUz: "Boshlangan ishni oxirigacha yetkazishdagi sabr-toqat va mustahkam iroda.",
    meaningRu: 'Стойкость, упорство, непоколебимость, выдержка.',
    examples: [
      {
        text: "Til o'rganishda eng muhim xususiyat — bu kundalik sabot va intizomdir.",
        translation: "In language learning, the most crucial trait is daily perseverance and discipline."
      }
    ],
    synonyms: ['qatʼiyat', 'chidamlilik', 'matonat', 'bardosh', 'sobitlik'],
    antonyms: ['boʻshanglik', 'irodasizlik', 'sabrsizlik'],
    etymology: "Arabcha 'ثبات' (sobitlik, mustahkam turish) so'zidan kirib kelgan.",
    mnemonicTip: "Sabotli inson - to'siqlarga qaramay o'z so'zida va maqsadida sobit turuvchi shaxs.",
    category: 'Xarakter va Fazilatlar'
  },
  {
    word: 'вдохновение',
    language: 'ru',
    phonetic: '[vdəxnɐˈvʲenʲɪje]',
    partOfSpeech: 'существительное (noun)',
    meaning: 'Состояние творческого подъема, прилив творческих сил и ярких идей.',
    meaningUz: "Ilhom, ijodiy ko'tarinkilik, yangi g'oyalar va kuch-g'ayrat manbai.",
    meaningRu: 'Прилив творческих сил, энтузиазм, воодушевление.',
    examples: [
      {
        text: 'Успехи учеников стали для учителя главным источником вдохновения.',
        translation: "O'quvchilarning yutuqlari o'qituvchi uchun asosiy ilhom manbaiga aylandi."
      }
    ],
    synonyms: ['муза', 'воодушевление', 'подъем', 'энтузиазм', 'озарение'],
    antonyms: ['апатия', 'уныние', 'безразличие'],
    etymology: "Slavyancha 'вдохнуть' (ichga nafas olmoq, ruh bag'ishlamoq) o'zagidan.",
    mnemonicTip: "Yurakka toza havo va yangi g'oya 'nafas' bo'lib kirishi -> Ilhom!",
    category: 'Ijod va Rivojlanish'
  },
  {
    word: 'Ausdauer',
    language: 'de',
    phonetic: '[ˈaʊ̯sˌdaʊ̯ɐ]',
    partOfSpeech: 'Substantiv (femininum)',
    meaning: 'Fähigkeit, eine Anstrengung über längere Zeit durchzuhalten; Beharrlichkeit.',
    meaningUz: "Chidamlilik, bardosh, uzoq vaqt davomida qunt bilan harakat qilish qobiliyati.",
    meaningRu: 'Выносливость, терпение, настойчивость, упорство.',
    examples: [
      {
        text: 'Mit viel Ausdauer beherrschte er die deutsche Grammatik in sechs Monaten.',
        translation: "Katta chidamlilik va tirishqoqlik bilan u olti oyda nemis tili grammatikasini o'zlashtirdi."
      }
    ],
    synonyms: ['Beharrlichkeit', 'Geduld', 'Kondition', 'Zähigkeit'],
    antonyms: ['Ungeduld', 'Schwäche', 'Aufgabe'],
    etymology: "Nemischa 'ausdauern' (bardosh bermoq, oxirigacha chidamoq) so'zidan.",
    mnemonicTip: "Dauer (davomiylik) + Aus (oxirigacha) = Oxirigacha davom ettirish bardoshi!",
    category: 'German Vocabulary B1-B2'
  },
  {
    word: 'azim',
    language: 'tr',
    phonetic: '[a-zim]',
    partOfSpeech: 'İsim (noun)',
    meaning: 'Bir işteki engelleri yenme kararlılığı, sebat, sarsılmaz irade.',
    meaningUz: "Qat'iy qaror, maqsad yo'lidagi to'siqlarni yengish irodasi va g'ayrati.",
    meaningRu: 'Решимость, непоколебимая воля, настойчивость.',
    examples: [
      {
        text: 'Öğrencilerin öğrenme azmi her türlü zorluğu aşmaya yeterlidir.',
        translation: "O'quvchilarning o'rganish azm-u shijoati har qanday qiyinchilikni yengishga yetadi."
      }
    ],
    synonyms: ['kararlılık', 'sebat', 'gayret', 'çaba'],
    antonyms: ['kararsızlık', 'yılgınlık', 'tembellik'],
    etymology: "Arabcha 'عزم' (qat'iy niyat, bel bog'lash) so'zidan o'tgan.",
    mnemonicTip: "Aziz maqsad sari shijoat bilan bel bog'lash!",
    category: 'Turkish Language Essentials'
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'std-101',
    name: 'Jasurbek Aliyev',
    group: 'IELTS Mastery (B2-C1)',
    level: 'B2',
    phone: '+998 90 123-45-67',
    avatar: '👨‍🎓',
    color: '#3b82f6',
    enrolledDate: '2026-01-15',
    attendance: {
      '2026-08-17': 'present',
      '2026-08-16': 'present',
      '2026-08-15': 'present',
      '2026-08-14': 'late',
      '2026-08-13': 'present'
    },
    grades: [
      { 
        id: 'gr-1', 
        subject: 'IELTS Mock Test #1', 
        score: 68, 
        maxScore: 80, 
        percentage: 85,
        gradeLetter: 'A',
        bandScore: '7.5 Band (C1)',
        sections: [
          { name: 'Reading', score: 17, maxScore: 20, percentage: 85 },
          { name: 'Listening', score: 18, maxScore: 20, percentage: 90 },
          { name: 'Writing', score: 16, maxScore: 20, percentage: 80 },
          { name: 'Speaking', score: 17, maxScore: 20, percentage: 85 }
        ],
        date: '2026-08-16', 
        note: "Listening va Reading a'lo darajada. Speaking bo'yicha ravonlik yuqori." 
      },
      { 
        id: 'gr-2', 
        subject: 'Grammar & Vocabulary Check', 
        score: 45, 
        maxScore: 50, 
        percentage: 90,
        gradeLetter: 'A+',
        bandScore: '8.0 Band (C1)',
        sections: [
          { name: 'Vocabulary', score: 23, maxScore: 25, percentage: 92 },
          { name: 'Grammar', score: 22, maxScore: 25, percentage: 88 }
        ],
        date: '2026-08-14', 
        note: 'Conditionals va Inversion mavzusi mukammal.' 
      }
    ],
    vocabCount: 42,
    badge: '🏆 Leksikon Qiroli'
  },
  {
    id: 'std-102',
    name: 'Madinabonu Karimova',
    group: 'IELTS Mastery (B2-C1)',
    level: 'C1',
    phone: '+998 93 765-43-21',
    avatar: '👩‍🎓',
    color: '#ec4899',
    enrolledDate: '2026-01-10',
    attendance: {
      '2026-08-17': 'present',
      '2026-08-16': 'present',
      '2026-08-15': 'present',
      '2026-08-14': 'present',
      '2026-08-13': 'present'
    },
    grades: [
      { 
        id: 'gr-4', 
        subject: 'IELTS Complete Mock Test', 
        score: 75, 
        maxScore: 80, 
        percentage: 94,
        gradeLetter: 'A+',
        bandScore: '8.5 Band (C2)',
        sections: [
          { name: 'Reading', score: 19, maxScore: 20, percentage: 95 },
          { name: 'Listening', score: 20, maxScore: 20, percentage: 100 },
          { name: 'Writing', score: 18, maxScore: 20, percentage: 90 },
          { name: 'Speaking', score: 18, maxScore: 20, percentage: 90 }
        ],
        date: '2026-08-16', 
        note: 'Mutlaq yetakchi, barcha bo\'limlarda teng yuqori mahorat!' 
      }
    ],
    vocabCount: 65,
    badge: '⭐ Mutlaq Chempion'
  },
  {
    id: 'std-103',
    name: 'Sardorbek Rahimov',
    group: 'General English (B1)',
    level: 'B1',
    phone: '+998 97 333-22-11',
    avatar: '👨‍💻',
    color: '#10b981',
    enrolledDate: '2026-02-01',
    attendance: {
      '2026-08-17': 'present',
      '2026-08-16': 'absent',
      '2026-08-15': 'present',
      '2026-08-14': 'present',
      '2026-08-13': 'excused'
    },
    grades: [
      { 
        id: 'gr-6', 
        subject: 'Midterm Language Exam', 
        score: 47, 
        maxScore: 80, 
        percentage: 59,
        gradeLetter: 'C',
        bandScore: '5.5 Band (B1)',
        sections: [
          { name: 'Reading', score: 13, maxScore: 20, percentage: 65 },
          { name: 'Listening', score: 10, maxScore: 20, percentage: 50 },
          { name: 'Vocabulary', score: 14, maxScore: 20, percentage: 70 },
          { name: 'Grammar', score: 10, maxScore: 20, percentage: 50 }
        ],
        date: '2026-08-15', 
        note: 'Reading 13/20 (65%), Listening 10/20 (50%). Tinglab tushunish ustida ko\'proq ishlash zarur.' 
      }
    ],
    vocabCount: 28,
    badge: '🚀 O\'sishda davom etmoqda'
  },
  {
    id: 'std-104',
    name: 'Dildora Usmonova',
    group: 'General English (B1)',
    level: 'B1',
    phone: '+998 99 444-55-66',
    avatar: '👩‍🔬',
    color: '#8b5cf6',
    enrolledDate: '2026-02-05',
    attendance: {
      '2026-08-17': 'present',
      '2026-08-16': 'present',
      '2026-08-15': 'late',
      '2026-08-14': 'present',
      '2026-08-13': 'present'
    },
    grades: [
      { 
        id: 'gr-8', 
        subject: 'Weekly Progress Test', 
        score: 51, 
        maxScore: 60, 
        percentage: 85,
        gradeLetter: 'A',
        bandScore: '7.0 Band (B2)',
        sections: [
          { name: 'Reading', score: 18, maxScore: 20, percentage: 90 },
          { name: 'Listening', score: 16, maxScore: 20, percentage: 80 },
          { name: 'Vocabulary', score: 17, maxScore: 20, percentage: 85 }
        ],
        date: '2026-08-15', 
        note: 'So\'z boyligi va matnni tushunish sezilarli darajada kengaygan.' 
      }
    ],
    vocabCount: 35,
    badge: '💡 Faol O\'rganuvchi'
  },
  {
    id: 'std-105',
    name: 'Bekzod Xolmatov',
    group: 'Beginner Intensive (A1-A2)',
    level: 'A2',
    phone: '+998 91 888-99-00',
    avatar: '👨‍🎨',
    color: '#f59e0b',
    enrolledDate: '2026-03-01',
    attendance: {
      '2026-08-17': 'absent',
      '2026-08-16': 'present',
      '2026-08-15': 'absent',
      '2026-08-14': 'excused',
      '2026-08-13': 'present'
    },
    grades: [
      { 
        id: 'gr-10', 
        subject: 'Elementary Skills Test', 
        score: 29, 
        maxScore: 50, 
        percentage: 58,
        gradeLetter: 'C',
        bandScore: '4.5 Band (A2)',
        sections: [
          { name: 'Reading', score: 12, maxScore: 20, percentage: 60 },
          { name: 'Listening', score: 8, maxScore: 15, percentage: 53 },
          { name: 'Vocabulary', score: 9, maxScore: 15, percentage: 60 }
        ],
        date: '2026-08-14', 
        note: 'Davomatni yaxshilash va kundalik audio mashqlarni bajarish zarur.' 
      }
    ],
    vocabCount: 15,
    badge: '⚠️ Qo\'shimcha dars kerak'
  },
  {
    id: 'std-106',
    name: 'Zilola Saidova',
    group: 'Beginner Intensive (A1-A2)',
    level: 'A2',
    phone: '+998 94 555-11-22',
    avatar: '👩‍🏫',
    color: '#06b6d4',
    enrolledDate: '2026-03-05',
    attendance: {
      '2026-08-17': 'present',
      '2026-08-16': 'present',
      '2026-08-15': 'present',
      '2026-08-14': 'present',
      '2026-08-13': 'present'
    },
    grades: [
      { 
        id: 'gr-11', 
        subject: 'Basic Skills Check', 
        score: 46, 
        maxScore: 50, 
        percentage: 92,
        gradeLetter: 'A+',
        bandScore: '7.5 Band (B2)',
        sections: [
          { name: 'Reading', score: 19, maxScore: 20, percentage: 95 },
          { name: 'Listening', score: 14, maxScore: 15, percentage: 93 },
          { name: 'Vocabulary', score: 13, maxScore: 15, percentage: 87 }
        ],
        date: '2026-08-14', 
        note: 'Intizomli va har bir bo\'limda puxta tayyorgarlik ko\'rgan.' 
      }
    ],
    vocabCount: 38,
    badge: '🌟 Intizom Namoyandasi'
  }
];

export const AI_AGENTS = [
  {
    id: 'tutor-agent',
    name: 'Prof. Azamat (Til Ustozi)',
    role: 'Bosh Til & Grammatika Ustozi',
    avatar: '🎓',
    themeColor: '#3b82f6',
    description: "So'zlarning ma'nosi, chuqur kontekst, grammatika qoidalari va to'g'ri jumlalar tuzish bo'yicha super ekspert.",
    specialties: ["So'z ma'nolari va kontekst", "Grammatik tahlil", "Xatolarni to'g'rilash", "Muloqot amaliyoti"],
    systemGreeting: "Salom! Men sizning til ustozi agentingizman. Har qanday so'z ma'nosini so'rang, murakkab jumlalarni tushuntirib beraman yoki til o'rganish bo'yicha yo'l-yo'riq ko'rsataman!"
  },
  {
    id: 'lexicon-agent',
    name: 'Leksikon & So\'z Tahlilchisi',
    role: 'Etimologiya va Mnemonika Agenti',
    avatar: '⚡',
    themeColor: '#8b5cf6',
    description: "So'zning kelib chiqishi, assotsiatsiyalar, xotirada tez saqlab qolish sirlari va sinonimlar xaritasi bo'yicha mutaxassis.",
    specialties: ["Etimologik ildizlar", "Xotira kalitlari (Mnemonika)", "Sinonim / Antonimlar tahlili", "Frazeologizmlar"],
    systemGreeting: "Xush kelibsiz! Men so'zlarning yashirin sirlarini ochib beruvchi Leksikon agentiman. Qaysi so'zni unutilmas tarzda xotirangizga muhrlamoqchisiz?"
  },
  {
    id: 'evaluation-agent',
    name: 'Baholash & Tahlil Agenti',
    role: 'O\'quvchilar Tahlili va Maslahatchi',
    avatar: '📊',
    themeColor: '#10b981',
    description: "O'quvchilarning davomati, baholari, o'sish dinamikasi va kamchiliklarini chuqur tahlil qilib, o'qituvchiga individual tavsiyalar beradi.",
    specialties: ["Davomat & Baholar tahlili", "Zaif tomonlarni aniqlash", "Individual o'quv rejasi", "Guruh ko'rsatkichlari hisoboti"],
    systemGreeting: "Assalomu alaykum! Men o'quv markazingizning tahliliy agentiman. O'quvchilarning davomati va baholarini bir tugma bilan to'liq tahlil qilib berishim mumkin."
  },
  {
    id: 'quizmaster-agent',
    name: 'Kviz & Test Generator Agenti',
    role: 'Interaktiv Sinovlar va Mashqlar',
    avatar: '🎯',
    themeColor: '#f59e0b',
    description: "O'rganilgan so'zlar va mavzular asosida darhol 4 xil variantli testlar, bo'sh o'rinlarni to'ldirish va tezkor viktorinalar tuzib beradi.",
    specialties: ["Avtomatik Kviz generatsiyasi", "Moslashtirilgan testlar", "Interaktiv javob tahlili", "Daraja bo'yicha savollar"],
    systemGreeting: "Salom! Men Kvizmasterman. Bugungi so'zlar yoki o'quvchilar darajasiga mos ajoyib testlar tuzishga tayyorman. Boshlaymizmi?"
  }
];

export const GROUPS_LIST = [
  'Barcha guruhlar',
  'IELTS Mastery (B2-C1)',
  'General English (B1)',
  'Beginner Intensive (A1-A2)',
  'Individual Darslar'
];

export const TEST_TEMPLATES = [
  {
    id: 'standard-exam',
    title: '📚 4 Asosiy Ko\'nikma Testi (Reading, Listening, Writing, Speaking)',
    sections: [
      { name: 'Reading', score: 13, maxScore: 20, icon: '📖' },
      { name: 'Listening', score: 10, maxScore: 20, icon: '🎧' },
      { name: 'Writing', score: 15, maxScore: 20, icon: '✍️' },
      { name: 'Speaking', score: 14, maxScore: 20, icon: '🗣️' }
    ]
  },
  {
    id: 'ielts-mock',
    title: '🎯 IELTS Mock Exam (40 talik savollar shkalasi)',
    sections: [
      { name: 'Reading', score: 28, maxScore: 40, icon: '📖' },
      { name: 'Listening', score: 30, maxScore: 40, icon: '🎧' },
      { name: 'Writing', score: 26, maxScore: 40, icon: '✍️' },
      { name: 'Speaking', score: 28, maxScore: 40, icon: '🗣️' }
    ]
  },
  {
    id: 'vocab-grammar',
    title: '⚡ Lug\'at va Grammatika Nazorati',
    sections: [
      { name: 'Reading', score: 15, maxScore: 20, icon: '📖' },
      { name: 'Vocabulary', score: 18, maxScore: 20, icon: '💡' },
      { name: 'Grammar', score: 17, maxScore: 20, icon: '📝' }
    ]
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr-superadmin',
    username: 'superadmin',
    password: '1234',
    name: 'Jahongir Olimov',
    role: 'superadmin',
    roleLabel: 'Bosh Admin (Super Admin)',
    roleTitle: 'Tizim Asoschisi & Bosh Administrator',
    avatar: '👑',
    email: 'superadmin@edulingua.uz',
    phone: '+998 71 100-00-01',
    badge: 'Bosh Admin 👑',
    department: 'Boshqaruv & Bosh Arxitektura',
    since: '2020'
  },
  {
    id: 'usr-director',
    username: 'director',
    password: '1234',
    name: 'Dr. Rustam Karimov',
    role: 'director',
    roleLabel: 'Direktor (Headmaster)',
    roleTitle: 'O\'quv Markaz Bosh Direktori',
    avatar: '🏛️',
    email: 'director@edulingua.uz',
    phone: '+998 71 200-11-00',
    badge: 'Rahbariyat',
    department: 'Boshqaruv va Strategiya',
    since: '2022'
  },
  {
    id: 'usr-admin',
    username: 'admin',
    password: '1234',
    name: 'Madina Rahimova',
    role: 'admin',
    roleLabel: 'Administrator (Admin)',
    roleTitle: 'Tizim va Xodimlar Boshqaruvchisi',
    avatar: '⚙️',
    email: 'admin@edulingua.uz',
    phone: '+998 90 999-00-11',
    badge: 'Tizim Nazorati',
    department: 'Ma\'muriyat & Moliya',
    since: '2023'
  },
  {
    id: 'usr-teacher',
    username: 'teacher',
    password: '1234',
    name: 'Azizbek Toshmatov',
    role: 'teacher',
    roleLabel: 'O\'qituvchi (Instructor)',
    roleTitle: 'Katta Til Ustozi (IELTS Senior Instructor)',
    avatar: '👨‍🏫',
    email: 'teacher@edulingua.uz',
    phone: '+998 93 111-22-33',
    badge: 'IELTS 8.5 Band',
    department: 'Chet Tillari Kafedrasi',
    since: '2024'
  },
  {
    id: 'usr-std-101',
    username: 'student',
    password: '1234',
    name: 'Jasurbek Aliyev',
    role: 'student',
    roleLabel: 'O\'quvchi (Student)',
    roleTitle: 'IELTS Mastery Talabasi',
    avatar: '👨‍🎓',
    email: 'jasurbek@edulingua.uz',
    phone: '+998 90 123-45-67',
    studentId: 'std-101',
    badge: 'Top O\'quvchi ⭐',
    group: 'IELTS Mastery (B2-C1)',
    level: 'B2',
    since: '2026'
  },
  {
    id: 'usr-std-102',
    username: 'madina',
    password: '1234',
    name: 'Madinabonu Karimova',
    role: 'student',
    roleLabel: 'O\'quvchi (Student)',
    roleTitle: 'IELTS Mastery Talabasi',
    avatar: '👩‍🎓',
    email: 'madina@edulingua.uz',
    phone: '+998 93 765-43-21',
    studentId: 'std-102',
    badge: '⭐ Mutlaq Chempion',
    group: 'IELTS Mastery (B2-C1)',
    level: 'C1',
    since: '2026'
  },
  {
    id: 'usr-std-103',
    username: 'sardor',
    password: '1234',
    name: 'Sardorbek Rahimov',
    role: 'student',
    roleLabel: 'O\'quvchi (Student)',
    roleTitle: 'General English Talabasi',
    avatar: '👨‍💻',
    email: 'sardor@edulingua.uz',
    phone: '+998 97 333-22-11',
    studentId: 'std-103',
    badge: '🚀 O\'sishda davom etmoqda',
    group: 'General English (B1)',
    level: 'B1',
    since: '2026'
  },
  {
    id: 'usr-std-104',
    username: 'dildora',
    password: '1234',
    name: 'Dildora Usmonova',
    role: 'student',
    roleLabel: 'O\'quvchi (Student)',
    roleTitle: 'General English Talabasi',
    avatar: '👩‍🔬',
    email: 'dildora@edulingua.uz',
    phone: '+998 99 444-55-66',
    studentId: 'std-104',
    badge: '💡 Faol O\'rganuvchi',
    group: 'General English (B1)',
    level: 'B1',
    since: '2026'
  },
  {
    id: 'usr-std-105',
    username: 'bekzod',
    password: '1234',
    name: 'Bekzod Xolmatov',
    role: 'student',
    roleLabel: 'O\'quvchi (Student)',
    roleTitle: 'Beginner Intensive Talabasi',
    avatar: '👨‍🎨',
    email: 'bekzod@edulingua.uz',
    phone: '+998 91 888-99-00',
    studentId: 'std-105',
    badge: '⚠️ Qo\'shimcha dars kerak',
    group: 'Beginner Intensive (A1-A2)',
    level: 'A2',
    since: '2026'
  },
  {
    id: 'usr-std-106',
    username: 'zilola',
    password: '1234',
    name: 'Zilola Saidova',
    role: 'student',
    roleLabel: 'O\'quvchi (Student)',
    roleTitle: 'Beginner Intensive Talabasi',
    avatar: '👩‍🏫',
    email: 'zilola@edulingua.uz',
    phone: '+998 94 555-11-22',
    studentId: 'std-106',
    badge: '🌟 Intizom Namoyandasi',
    group: 'Beginner Intensive (A1-A2)',
    level: 'A2',
    since: '2026'
  }
];

// ==========================================
// DIRECTOR SUITE DATA (Staff KPIs, Finance, Analytics)
// ==========================================
export const DIRECTOR_DATA = {
  kpis: {
    totalStudents: 156,
    activeTeachers: 12,
    activeGroups: 14,
    monthlyRevenue: 68400000,
    collectedRevenue: 59200000,
    pendingPayments: 9200000,
    overallAttendanceRate: 94.6,
    averageExamScore: 86.8,
    retentionRate: 97.2,
    growthRate: '+18.4%'
  },
  teachersList: [
    {
      id: 't-1',
      name: 'Azizbek Toshmatov',
      role: 'IELTS Senior Instructor',
      groupsCount: 3,
      studentsCount: 38,
      avgScore: 88.5,
      attendanceRate: 96.2,
      kpiScore: 96,
      avatar: '👨‍🏫',
      status: 'A\'lo',
      awardBadge: '🏆 Oy Ustozi'
    },
    {
      id: 't-2',
      name: 'Nigora Umarova',
      role: 'General English & CEFR',
      groupsCount: 4,
      studentsCount: 44,
      avgScore: 84.2,
      attendanceRate: 93.8,
      kpiScore: 92,
      avatar: '👩‍🏫',
      status: 'Yuqori',
      awardBadge: '⭐ Metodik Lider'
    },
    {
      id: 't-3',
      name: 'Shahnoza Ergasheva',
      role: 'Kids & Beginner Intensive',
      groupsCount: 4,
      studentsCount: 46,
      avgScore: 89.0,
      attendanceRate: 95.0,
      kpiScore: 94,
      avatar: '👩‍🔬',
      status: 'A\'lo',
      awardBadge: '💡 Faol Yangilikchi'
    },
    {
      id: 't-4',
      name: 'Bobur Mirzayev',
      role: 'Nemis va Fransuz Tili',
      groupsCount: 3,
      studentsCount: 28,
      avgScore: 82.0,
      attendanceRate: 91.5,
      kpiScore: 88,
      avatar: '👨‍💻',
      status: 'Yaxshi',
      awardBadge: '🚀 Rivojlanayotgan'
    }
  ],
  financialMonths: [
    { month: 'Mart', plan: 55000000, fact: 56200000, students: 130 },
    { month: 'Aprel', plan: 58000000, fact: 59800000, students: 138 },
    { month: 'May', plan: 62000000, fact: 63100000, students: 145 },
    { month: 'Iyun', plan: 65000000, fact: 64900000, students: 150 },
    { month: 'Iyul', plan: 66000000, fact: 67200000, students: 152 },
    { month: 'Avgust', plan: 70000000, fact: 68400000, students: 156 }
  ],
  directorAiTips: [
    {
      id: 'tip-1',
      title: 'IELTS Mastery guruhini kengaytirish',
      description: 'So\'nggi oylik testlarda B2-C1 darajadagi o\'quvchilar soni 28% oshdi. Yangi haftaning toq kunlariga yana 1 ta IELTS guruhi ochish tavsiya etiladi.',
      priority: 'Yuqori',
      impact: '+12,000,000 UZS/oy'
    },
    {
      id: 'tip-2',
      title: 'O\'qituvchilar KPI rag\'batlantirish mexanizmi',
      description: 'Azizbek Toshmatov va Shahnoza Ergashevalarning davomati va o\'quvchilar o\'zlashtirishi 94% dan oshdi. Ular uchun 15% oylik bonus ajratish taklif qilinadi.',
      priority: 'O\'rta',
      impact: 'Xodimlar sadoqatini 98% ga yetkazadi'
    },
    {
      id: 'tip-3',
      title: 'To\'lovlar intizomini avtomatlashtirish',
      description: 'Hozirda 9,200,000 UZS kutilayotgan to\'lov mavjud. Admin modulidagi avtomatik SMS eslatma tizimi orqali to\'lovlarni 3 kun ichida 95% ga yig\'ish mumkin.',
      priority: 'Yuqori',
      impact: 'Kassa kutilmasini 95% ga tushiradi'
    }
  ]
};

// ==========================================
// ADMIN SUITE DATA (Groups, Timetable, SMS Logs, Audit)
// ==========================================
export const ADMIN_DATA = {
  managedGroups: [
    {
      id: 'grp-1',
      name: 'IELTS Mastery (B2-C1)',
      teacher: 'Azizbek Toshmatov',
      days: 'Dush - Chor - Juma',
      time: '14:00 - 16:00',
      room: 'Auditoriya 101 (Smart Board)',
      capacity: 15,
      enrolled: 14,
      fee: '650,000 UZS',
      status: 'Faol'
    },
    {
      id: 'grp-2',
      name: 'General English (B1)',
      teacher: 'Nigora Umarova',
      days: 'Sesh - Pay - Shanba',
      time: '10:00 - 12:00',
      room: 'Auditoriya 102 (Linguaphone)',
      capacity: 15,
      enrolled: 15,
      fee: '550,000 UZS',
      status: 'To\'liq'
    },
    {
      id: 'grp-3',
      name: 'Beginner Intensive (A1-A2)',
      teacher: 'Shahnoza Ergasheva',
      days: 'Dush - Chor - Juma',
      time: '16:30 - 18:30',
      room: 'Auditoriya 103 (Multimedia)',
      capacity: 16,
      enrolled: 12,
      fee: '480,000 UZS',
      status: 'Qabul davom etmoqda'
    },
    {
      id: 'grp-4',
      name: 'Individual IELTS Speaking Pro',
      teacher: 'Azizbek Toshmatov',
      days: 'Har kuni moslashuvchan',
      time: '18:30 - 19:30',
      room: 'VIP Xona 201',
      capacity: 4,
      enrolled: 4,
      fee: '1,200,000 UZS',
      status: 'Faol'
    }
  ],
  broadcastTemplates: [
    {
      id: 'tpl-1',
      title: 'Imtihon Eslatmasi',
      text: 'Hurmatli o\'quvchi va ota-onalar! Ertaga soat 14:00 da oylik nazorat imtihoni (Mock Exam) bo\'lib o\'tadi. Kechikmasdan kelishingizni so\'raymiz.'
    },
    {
      id: 'tpl-2',
      title: 'Oylik To\'lov Eslatmasi',
      text: 'Hurmatli o\'quvchi! Keyingi oylik darslar to\'lovini oyning 20-sanasigacha to\'lashingizni so\'raymiz. To\'lovni Payme, Click yoki kassa orqali amalga oshirishingiz mumkin.'
    },
    {
      id: 'tpl-3',
      title: 'Yangi Master-Klass E\'loni',
      text: 'Diqqat! Shanba kuni soat 16:00 da chet ellik ekspert ishtirokida "IELTS Speaking 8.0 sirlari" mavzusida bepul seminar tashkil etiladi. Barcha taklif etiladi!'
    }
  ],
  systemLogs: [
    {
      id: 'log-1',
      user: 'Dr. Rustam Karimov (Direktor)',
      action: 'Oylik moliya hisoboti ko\'rildi va tasdiqlandi',
      timestamp: '2026-08-17 15:45',
      ip: '192.168.1.10'
    },
    {
      id: 'log-2',
      user: 'Azizbek Toshmatov (O\'qituvchi)',
      action: 'IELTS Mastery guruhi davomati va 4 ta baho kiritildi',
      timestamp: '2026-08-17 14:30',
      ip: '192.168.1.14'
    },
    {
      id: 'log-3',
      user: 'Madina Rahimova (Admin)',
      action: 'Yangi o\'quvchi (Zilola Saidova) guruhga biriktirildi',
      timestamp: '2026-08-17 11:15',
      ip: '192.168.1.12'
    },
    {
      id: 'log-4',
      user: 'Jasurbek Aliyev (O\'quvchi)',
      action: 'Lug\'at flashcards va test topshirdi (92% natija)',
      timestamp: '2026-08-17 09:20',
      ip: '178.218.201.44'
    }
  ]
};

// ==========================================
// STUDENT PORTAL SPECIFIC DATA (Flashcards, Quizzes, Tasks)
// ==========================================
export const STUDENT_PORTAL_DATA = {
  flashcards: [
    {
      id: 'fc-1',
      word: 'Resilient',
      phonetic: '/rɪˈzɪl.jənt/',
      translation: 'Bardoshli, qiyinchilikda sinmaydigan',
      example: 'She proved to be resilient in the face of academic tests.',
      category: 'Advanced IELTS',
      mastered: true
    },
    {
      id: 'fc-2',
      word: 'Serendipity',
      phonetic: '/ˌser.ənˈdɪp.ə.ti/',
      translation: 'Kutilmagan baxtli tasodif',
      example: 'Finding the right vocabulary book was sheer serendipity.',
      category: 'C1 Vocabulary',
      mastered: false
    },
    {
      id: 'fc-3',
      word: 'Diligent',
      phonetic: '/ˈdɪl.ɪ.dʒənt/',
      translation: 'Tirishqoq, qunt bilan o\'rganuvchi',
      example: 'Diligent practice produces outstanding academic scores.',
      category: 'General B2',
      mastered: true
    },
    {
      id: 'fc-4',
      word: 'Perseverance',
      phonetic: '/ˌpɜː.sɪˈvɪə.rəns/',
      translation: 'Matonat, sabot, maqsad sari sobitlik',
      example: 'Success requires both natural skill and relentless perseverance.',
      category: 'IELTS Essays',
      mastered: false
    },
    {
      id: 'fc-5',
      word: 'Substantial',
      phonetic: '/səbˈstæn.ʃəl/',
      translation: 'Katta miqdordagi, salmoqli, muhim',
      example: 'The student made a substantial improvement in IELTS writing.',
      category: 'Academic Writing',
      mastered: true
    }
  ],
  studentQuizQuestions: [
    {
      id: 'q-1',
      question: 'Quyidagi so\'zlardan qaysi biri "qiyinchiliklarga bardoshli va tez o\'ziga keluvchi" ma\'nosini bildiradi?',
      options: ['Resilient', 'Fragile', 'Vulnerable', 'Careless'],
      correctIndex: 0,
      explanation: 'Resilient — able to recover quickly from difficult conditions.'
    },
    {
      id: 'q-2',
      question: '"Serendipity" so\'zining eng to\'g\'ri sinonimi qaysi?',
      options: ['Misfortune', 'Happy accident / Good fortune', 'Careful calculation', 'Hard work'],
      correctIndex: 1,
      explanation: 'Serendipity kutilmagan baxtli tasodifni anglatadi.'
    },
    {
      id: 'q-3',
      question: 'Which word describes a person who shows persistent care and hard work in their duties?',
      options: ['Diligent', 'Idle', 'Negligent', 'Stubborn'],
      correctIndex: 0,
      explanation: 'Diligent — tirishqoq, mehnatsevar va o\'z ishiga puxta inson.'
    }
  ],
  studentTasks: [
    {
      id: 'st-1',
      title: 'IELTS Writing Task 2 insho yozish (300 so\'z)',
      deadline: 'Ertaga, 18:00',
      subject: 'IELTS Writing',
      completed: false,
      priority: 'high'
    },
    {
      id: 'st-2',
      title: '5 ta yangi akademik so\'zni audio talaffuz qilish',
      deadline: 'Bugun, 21:00',
      subject: 'Vocabulary',
      completed: true,
      priority: 'medium'
    },
    {
      id: 'st-3',
      title: 'Listening Section 3 & 4 podcast tahlili',
      deadline: '19-Avgust',
      subject: 'IELTS Listening',
      completed: false,
      priority: 'medium'
    }
  ]
};

export const INITIAL_TODOS = [
  {
    id: 'td-1',
    text: "IELTS Writing Task 2 mavzularini ko'rib chiqish va insho tayyorlash",
    category: 'Dars',
    priority: 'high',
    completed: false,
    createdAt: '2026-08-20',
    timeEst: '45 daqiqa'
  },
  {
    id: 'td-2',
    text: "20 ta yangi akademik so'zni Flashcard orqali takrorlash",
    category: "Lug'at",
    priority: 'medium',
    completed: true,
    createdAt: '2026-08-20',
    timeEst: '20 daqiqa'
  },
  {
    id: 'td-3',
    text: 'Speaking Club savollarini AI Agent yordamida generatsiya qilish',
    category: 'AI Agent',
    priority: 'medium',
    completed: false,
    createdAt: '2026-08-20',
    timeEst: '15 daqiqa'
  },
  {
    id: 'td-4',
    text: "Barcha guruhlar bo'yicha kunlik davomatni to'liq belgilash",
    category: 'Davomat',
    priority: 'high',
    completed: false,
    createdAt: '2026-08-20',
    timeEst: '10 daqiqa'
  }
];
