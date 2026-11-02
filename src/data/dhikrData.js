/**
 * Authentic Dhikr and Morning/Evening Adhkar Data Model
 * Verified Islamic texts with authenticated Hadith & Quran references.
 */

export const DAILY_DHIKR_ITEMS = [
  {
    id: "subhanallah",
    shortCode: "Sub",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    target: 33,
    category: "tasbih",
    reference: "Sahih Muslim 597",
    session: "general",
  },
  {
    id: "alhamdulillah",
    shortCode: "Alh",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    target: 33,
    category: "tahmid",
    reference: "Sahih Muslim 597",
    session: "general",
  },
  {
    id: "allahuakbar",
    shortCode: "All",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    target: 33,
    category: "takbir",
    reference: "Sahih Muslim 597",
    session: "general",
  },
  {
    id: "lailahaillallah",
    shortCode: "Tahlil",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah",
    translation: "There is no deity worthy of worship except Allah",
    target: 100,
    category: "tahlil",
    reference: "Sahih al-Bukhari 6403, Sahih Muslim 2691",
    session: "general",
    note: "The best remembrance and foundational declaration of faith (Tawhid).",
  },
];

export const MORNING_EVENING_ADHKAR = [
  {
    id: "ayat_al_kursi",
    title: "Ayat al-Kursi",
    arabicTitle: "آيَةُ الْكُرْسِيِّ",
    reference: "Quran 2:255",
    target: 1,
    sessions: ["morning", "evening"],
    note: "Recited for divine protection morning and evening (Al-Hakim 1/562, Sahih at-Targhib 655).",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration:
      "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatuw-wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi-shay'im-min 'ilmihi illa bima sha'. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adheem.",
    translation:
      "Allah! There is no deity worthy of worship except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
  },
  {
    id: "surah_al_ikhlas",
    title: "Surah Al-Ikhlas",
    arabicTitle: "سُورَةُ الإِخْلَاصِ",
    reference: "Quran 112:1-4 (Sunan Abi Dawud 5082, Jami' at-Tirmidhi 3575)",
    target: 3,
    sessions: ["morning", "evening"],
    note: "Recited 3 times in morning and evening as part of the Mu'awwidhat for comprehensive sufficiency.",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
    transliteration:
      "Bismillahir-Rahmanir-Rahim. Qul Huwa-llahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.",
    translation:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful. Say, 'He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.'",
  },
  {
    id: "surah_al_falaq",
    title: "Surah Al-Falaq",
    arabicTitle: "سُورَةُ الْفَلَقِ",
    reference: "Quran 113:1-5 (Sunan Abi Dawud 5082, Jami' at-Tirmidhi 3575)",
    target: 3,
    sessions: ["morning", "evening"],
    note: "Recited 3 times morning and evening seeking refuge from the evils of created things.",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    transliteration:
      "Bismillahir-Rahmanir-Rahim. Qul a'udhu bi-Rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
    translation:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful. Say, 'I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.'",
  },
  {
    id: "surah_an_nas",
    title: "Surah An-Nas",
    arabicTitle: "سُورَةُ النَّاسِ",
    reference: "Quran 114:1-6 (Sunan Abi Dawud 5082, Jami' at-Tirmidhi 3575)",
    target: 3,
    sessions: ["morning", "evening"],
    note: "Recited 3 times morning and evening seeking refuge in the King of Mankind from whispers.",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    transliteration:
      "Bismillahir-Rahmanir-Rahim. Qul a'udhu bi-Rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fee sudoorin-nas. Minal-jinnati wan-nas.",
    translation:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful. Say, 'I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers into the breasts of mankind, from among the jinn and mankind.'",
  },
  {
    id: "sayyidul_istighfar",
    title: "Sayyidul Istighfar",
    arabicTitle: "سَيِّدُ الاسْتِغْفَارِ",
    reference: "Sahih al-Bukhari 6306",
    target: 1,
    sessions: ["morning", "evening"],
    note: "The supreme supplication for seeking forgiveness. Verbatim authentic text from Sahih al-Bukhari.",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u laka bidhanbi faghfir li fa'innahu la yaghfirudh-dhunuba illa Ant.",
    translation:
      "O Allah, You are my Lord; there is no deity worthy of worship except You. You created me and I am Your servant, and I abide by Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You Your blessing upon me, and I acknowledge to You my sin, so forgive me, for none can forgive sins except You.",
  },
];
