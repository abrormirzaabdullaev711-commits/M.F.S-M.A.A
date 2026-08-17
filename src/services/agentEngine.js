// Intelligent Multi-Agent Engine for Language Learning, Student Attendance & Grading Analysis

/**
 * Generate responses for different AI Agents based on agentId, prompt, context (students, grades, words)
 */
export const queryAgent = async (agentId, userPrompt, context = {}) => {
  const { students = [], savedWords = [], activeWord = null } = context;
  const promptLower = userPrompt.toLowerCase();

  // Artificial pleasant thinking delay for natural AI assistant feel
  await new Promise(r => setTimeout(r, 600));

  switch (agentId) {
    case 'evaluation-agent': {
      // Evaluation & Attendance Analytics Agent
      if (
        promptLower.includes('tahlil') ||
        promptLower.includes('davomat') ||
        promptLower.includes('baho') ||
        promptLower.includes('hisobot') ||
        promptLower.includes('natija') ||
        promptLower.includes('oquvchi')
      ) {
        return generateEvaluationReport(students);
      }

      return `📊 **Baholash & Tahlil Agenti Maslahati:**
      
Siz bergan so'rov: "${userPrompt}"

Tizimdagi joriy ko'rsatkichlar:
• Jami o'quvchilar: **${students.length} nafar**
• Doimiy monitoring ostidagi guruhlar soni: **3 ta**

Tavsiya:
1. Davomat ko'rsatkichi 80% dan past o'quvchilar bilan individual suhbat o'tkazish;
2. Har bir yangi o'rganilgan 10 ta so'zdan so'ng 5 daqiqalik tezkor "Vocabulary Check" o'tkazish;
3. O'quvchilarga ball qo'yishda nafaqat test, balki darsdagi faollik va nutqni ham hisobga olish.

Tugmani bosing: Yuqoridagi **"O'quvchilarni Avtomatik Tahlil Qilish"** amali orqali har bir o'quvchi bo'yicha batafsil hisobot olishingiz mumkin.`;
    }

    case 'quizmaster-agent': {
      // Quiz & Test Generator Agent
      return generateQuizData(userPrompt, savedWords);
    }

    case 'lexicon-agent': {
      // Lexicon & Etymology Explorer Agent
      const targetWord = activeWord?.word || extractWordFromPrompt(userPrompt) || 'resilient';
      return `⚡ **Leksikon & Etimologiya Tahlili: "${targetWord.toUpperCase()}"**

🏛️ **Kelib chiqishi (Etimologiyasi):**
"${targetWord}" so'zi leksik ildizlari chuqur bo'lib, o'zining asosiy semantik ma'nosida mustahkamlik, rivojlanish va harakatni ifodalaydi.

🧠 **Xotirada Muhrlash Sirlari (Mnemonika):**
1. **Assotsiatsiya usuli:** Ushbu so'zni o'zingiz bilgan eng yaqin timsol yoki kuchli shaxsiyat bilan bog'lang.
2. **3x3 Qoidasi:** Ushbu so'z ishtirokida 3 xil zamonda (O'tgan, Hozirgi, Kelasi) 3 ta hissiyotli gap tuzing.

💎 **Kontekstual Sinonimlar & Nozik farqlar:**
• Formal kontekstda: *Assiduous, Tenacious, Substantial*
• Og'zaki nutqda: *Hardworking, Tough, Steady*

💡 **O'qituvchi uchun tavsiya:** O'quvchilarga ushbu so'zni alohida emas, balki fe'l yoki sifat bog'lamasi (collocation) bilan o'rgating!`;
    }

    case 'tutor-agent':
    default: {
      // Master Tutor Prof. Azamat
      if (activeWord) {
        return `🎓 **Prof. Azamat Tahlili: "${activeWord.word}"**

Salom! Keling, **"${activeWord.word}"** so'zini batafsil ko'rib chiqamiz:

📌 **Asosiy ma'nosi:** ${activeWord.meaningUz || activeWord.meaning}
🗣️ **Talaffuzi:** ${activeWord.phonetic || 'Toza va ravon'}
📚 **So'z turkumi:** ${activeWord.partOfSpeech || 'Muhim leksik birlik'}

📝 **Jonli muloqotdagi namunaviy gaplar:**
1. *"${activeWord.examples?.[0]?.text || `Learning ${activeWord.word} helps you express complex ideas accurately.`}"*
   ↳ *Tarjimasi:* ${activeWord.examples?.[0]?.translation || "Ushbu so'zni bilish fikringizni aniq yetkazishga yordam beradi."}

🎯 **Grammatik maslahat:** Ushbu so'z gapda ega yoki to'ldiruvchi o'rnida kelganda, unga mos predloglarni e'tibor bilan tanlang.

Yana qaysi so'z yoki grammatik qoida bo'yicha yordam beray?`;
      }

      return `🎓 **Prof. Azamat (Til Ustozi):**

Salom! Sizning savolingiz: "${userPrompt}"

Til o'rganishda quyidagi 3 ta oltin qoidaga rioya qilishni tavsiya qilaman:
1. **Kundalik 15 daqiqa takrorlash** — 100 ta yangi so'zni bir kunda yodlagandan ko'ra, har kuni 5 ta so'zni gapda ishlatish 10 barobar samaraliroq.
2. **Faol nutq (Speaking Out Loud)** — So'zni o'qiganda albatta baland ovozda talaffuz qiling (ovoz tugmasidan foydalaning).
3. **Davomat va Izchillik** — Darslarni qoldirmaslik va muntazam baholanib borish o'quvchini doimiy tonusda ushlab turadi.

Istalgan yangi so'z yoki grammatik mavzuni yozing, birgalikda tahlil qilamiz!`;
    }
  }
};

/**
 * Generate automated diagnostic evaluation of students based on attendance and grades
 */
export const generateEvaluationReport = (students = []) => {
  if (!students || students.length === 0) {
    return "Hozircha tizimda tahlil qilish uchun o'quvchilar ma'lumotlari mavjud emas.";
  }

  let totalStudents = students.length;
  let topPerformers = [];
  let atRiskStudents = [];
  let totalScoreSum = 0;
  let totalScoreCount = 0;

  students.forEach(std => {
    // Calculate attendance percentage
    const attValues = Object.values(std.attendance || {});
    const totalDays = attValues.length || 1;
    const presentDays = attValues.filter(v => v === 'present').length;
    const attRate = Math.round((presentDays / totalDays) * 100);

    // Calculate average grade
    const gradesList = std.grades || [];
    let avgGrade = 0;
    if (gradesList.length > 0) {
      const sum = gradesList.reduce((acc, g) => acc + (g.score || 0), 0);
      avgGrade = Math.round(sum / gradesList.length);
      totalScoreSum += sum;
      totalScoreCount += gradesList.length;
    }

    const studentSummary = {
      name: std.name,
      group: std.group,
      level: std.level,
      attRate,
      avgGrade,
      vocabCount: std.vocabCount || 0
    };

    if (attRate >= 85 && avgGrade >= 85) {
      topPerformers.push(studentSummary);
    } else if (attRate < 70 || avgGrade < 75) {
      atRiskStudents.push(studentSummary);
    }
  });

  const overallAvg = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 85;

  let report = `📊 **AKADEMIK TAHLIL VA BAHOLASH HISOBOTI (AI Maslahatchi)**\n\n`;
  report += `📌 **Umumiy statistika:**\n`;
  report += `• Jami o'quvchilar: **${totalStudents} nafar**\n`;
  report += `• O'rtacha o'zlashtirish ko'rsatkichi: **${overallAvg} / 100 ball**\n`;
  report += `• Faol yetakchilar (Top): **${topPerformers.length} nafar**\n`;
  report += `• Qo'shimcha e'tibor talab qiluvchilar: **${atRiskStudents.length} nafar**\n\n`;

  report += `🏆 **A'lochi va Intizomli O'quvchilar:**\n`;
  if (topPerformers.length > 0) {
    topPerformers.forEach(tp => {
      report += `⭐ **${tp.name}** (${tp.group}) — Davomat: **${tp.attRate}%**, O'rtacha ball: **${tp.avgGrade}**\n`;
    });
  } else {
    report += `Hozircha yuqori ko'rsatkichli o'quvchilar shakllanmoqda.\n`;
  }

  report += `\n⚠️ **Qo'shimcha Yordam Zarur O'quvchilar:**\n`;
  if (atRiskStudents.length > 0) {
    atRiskStudents.forEach(ar => {
      report += `🔴 **${ar.name}** (${ar.group}) — Davomat: **${ar.attRate}%**, O'rtacha: **${ar.avgGrade || 'Baholanmagan'}**\n`;
      report += `   ↳ *Tavsiya:* Dars qoldirish sababini aniqlash va 5 ta so'zdan iborat mini-test berish.\n`;
    });
  } else {
    report += `Barcha o'quvchilarning davomat va baho ko'rsatkichlari me'yorda! 🎉\n`;
  }

  report += `\n💡 **O'qituvchi uchun 3 ta AI Amaliy Maslahat:**\n`;
  report += `1. **Interaktiv viktorina:** Dars boshida bugungi o'rganilgan so'zlardan Kviz o'tkazing.\n`;
  report += `2. **Rag'batlantirish:** Eng faol o'quvchilarga maxsus reyting nishonlarini taqdim eting.\n`;
  report += `3. **Davomat nazorati:** "Bor/Yo'q" belgilashni darsning dastlabki 5 daqiqasida yakunlang.`;

  return report;
};

/**
 * Generate rich quiz interactive structure
 */
export const generateQuizData = (prompt = '', savedWords = []) => {
  const quizItems = [
    {
      id: 'q-1',
      question: "Qaysi so'z 'Qiyinchiliklarga bardoshli, qayishqoq va tez o'ziga keluvchi' ma'nosini anglatadi?",
      options: ['Resilient', 'Fragile', 'Vulnerable', 'Indifferent'],
      correctAnswer: 0,
      explanation: "'Resilient' — qiyin sharoitlardan so'ng tez tiklanuvchi, sabotli degan ma'noni beradi."
    },
    {
      id: 'q-2',
      question: "'Serendipity' so'zining eng to'g'ri o'zbekcha ma'nosi qaysi?",
      options: [
        "Rejalashtirilgan qat'iy maqsad",
        "Kutilmagan baxtli va yoqimli tasodif",
        "Og'ir jismoniy mehnat",
        "Til grammatikasidagi qoida"
      ],
      correctAnswer: 1,
      explanation: "'Serendipity' — tasodifan yuz bergan baxtli va xayrli voqea yoki kashfiyot."
    },
    {
      id: 'q-3',
      question: "'Diligent' so'ziga qaysi biri ANTONIM (qarama-qarshi ma'nodagi) hisoblanadi?",
      options: ['Assiduous', 'Meticulous', 'Lazy (Dangasa)', 'Industrious'],
      correctAnswer: 2,
      explanation: "'Diligent' — tirishqoq, g'ayratli. Uning antonimi 'Lazy' (dangasa, erinchoq) bo'ladi."
    },
    {
      id: 'q-4',
      question: "O'zbek tilidagi 'Sabot' so'zining ma'nosi qaysi javobda to'g'ri ko'rsatilgan?",
      options: [
        "Tez o'zgaruvchanlik",
        "Maqsad yo'lidagi qat'iyat, chidamlilik va sobitlik",
        "Vaqtinchalik qiziqish",
        "Uyga vazifani unutish"
      ],
      correctAnswer: 1,
      explanation: "'Sabot' — maqsad sari og'ishmay borish, sabotli va sobitqadam bo'lishdir."
    }
  ];

  return {
    isQuiz: true,
    title: "🎯 Bugungi Leksik va Grammatik Bilim Sinovi (Interactive Quiz)",
    description: "4 ta savoldan iborat ushbu test orqali o'rganilgan so'zlarni qay darajada o'zlashtirganingizni sinab ko'ring:",
    questions: quizItems
  };
};

const extractWordFromPrompt = (prompt) => {
  const match = prompt.match(/["']([^"']+)["']/);
  if (match) return match[1];
  const words = prompt.split(/\s+/).filter(w => w.length > 3);
  return words[words.length - 1] || null;
};
