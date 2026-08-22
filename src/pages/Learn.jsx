import React, { useState, useMemo, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
// import SalahData from './salahData'
import { VideoLesson } from "./VideoLesson";  
import {
  Search,
  Droplet,
  Waves,
  Landmark,
  Moon,
  Heart,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ListOrdered,
  Clock,
  BookOpen,
  Volume2,
  Info,
  Play,
  Pause,
  Repeat,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  ThumbsUp,
  Video,
  PlayCircle,
  Trophy,
  BookMarked,
  Star,
  GraduationCap,
  Map,
  Scale,
  Palette,
  Users,
  MessageCircle,
  Flame,
  Download,
  MapPin,
  CalendarDays,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sun,
  Sparkles,
  Shield,
  Compass,
  Calendar,
} from "lucide-react";

// --- Custom Hook for Local Storage ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

// --- The 22 Academy Categories ---
const CATEGORIES = [
  {
    id: "wudu-basics",
    title: "Guide On Wudu",
    icon: Droplet,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    id: "salah-academy",
    title: "Salah Academy",
    icon: Landmark,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    title: "Hajj & Umrah",
    icon: Map,
    color: "text-stone-500",
    bg: "bg-stone-100",
  },
  {
    title: "Dhikr Academy",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-100",
  },
  {
    title: "Quran Academy",
    icon: BookOpen,
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
  {
    title: "Tajweed Academy",
    icon: Palette,
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-100",
  },
  {
    title: "Hadith Academy",
    icon: FileText,
    color: "text-indigo-500",
    bg: "bg-indigo-100",
  },
  {
    title: "Ramadan Academy",
    icon: Moon,
    color: "text-purple-500",
    bg: "bg-purple-100",
  },
  {
    title: "Zakat Academy",
    icon: Scale,
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    title: "All Duas",
    icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
  { title: "Stories", icon: Users, color: "text-cyan-600", bg: "bg-cyan-100" },
  {
    title: "Seerah",
    icon: BookMarked,
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
  {
    title: "Aqeedah",
    icon: Shield,
    color: "text-slate-700",
    bg: "bg-slate-200",
  },
  {
    title: "Fiqh",
    icon: Landmark,
    color: "text-indigo-700",
    bg: "bg-indigo-200",
  },
  {
    title: "Islamic History",
    icon: Compass,
    color: "text-amber-700",
    bg: "bg-amber-200",
  },
  {
    title: "99 Names Of Allah",
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-100",
  },
  {
    title: "Kids Corner",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-100",
  },
  {
    title: "Learn Arabic",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Mosque Etiquette",
    icon: Landmark,
    color: "text-emerald-700",
    bg: "bg-emerald-200",
  },
  {
    title: "Islamic Manners",
    icon: Users,
    color: "text-pink-500",
    bg: "bg-pink-100",
  },
  {
    title: "Character Building",
    icon: Heart,
    color: "text-rose-400",
    bg: "bg-rose-100",
  },
  {
    title: "Islamic Calendar",
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-200",
  },
];

// --- Gamified Roadmap ---
const ROADMAP = [
  {
    level: "Beginner",
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    modules: [
      { id: "wudu-basics", title: "Wudu (Ablution)", icon: "💧" },
      { id: "salah-fajr-fard", title: "Fajr Prayer", icon: "🌅" },
      { id: "basic-duas", title: "Daily Du'as", icon: "🤲" },
    ],
  },
  {
    level: "Intermediate",
    color: "text-amber-500",
    bg: "bg-amber-500",
    modules: [
      { id: "ghusl-basics", title: "Ghusl (Full Bath)", icon: "🚿" },
      { id: "ramadan-basics", title: "Ramadan Fasting", icon: "🌙" },
    ],
  },
  {
    level: "Advanced",
    color: "text-rose-500",
    bg: "bg-rose-500",
    modules: [{ id: "hajj-umrah-guide", title: "Hajj & Umrah", icon: "🕋" }],
  },
];

// --- Massively Expanded Academy Database ---
const MOCK_TOPICS = {
  "Guide On Wudu": [
    {
      id: "wudu-1",
      title: "Intention (Niyyah) & Bismillah",
      desc: "Make the intention in your heart to perform Wudu and say Bismillah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Saying Bismillah",
          text: "Make the intention (Niyyah) in your heart to purify yourself for prayer. Then, say Bismillah before beginning to wash.",
          arabic: "بِسۡمِ ٱللَّهِ",
          transliteration: "Bismillaah.",
          translation: "In the Name of Allah.",
          reference: "Abu Dawud 1/16, Ibn Majah 1/136",
        },
      ],
    },
    {
      id: "wudu-2",
      title: "Washing the Hands",
      desc: "Wash both hands up to the wrists three times.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Washing to the Wrists",
          text: "Wash your right hand up to the wrist three times, ensuring water reaches between the fingers. Repeat with your left hand three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
      ],
    },
    {
      id: "wudu-3",
      title: "Rinsing the Mouth",
      desc: "Take water into your mouth and rinse it out three times.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Madmadah",
          text: "Take water into your mouth using your right hand, swirl it around thoroughly, and spit it out. Do this three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
      ],
    },
    {
      id: "wudu-4",
      title: "Sniffing Water into the Nose",
      desc: "Sniff water into your nostrils and blow it out three times.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Istinshaq and Istinthar",
          text: "Sniff water into your nostrils using your right hand (Istinshaq) and blow it out using your left hand (Istinthar). Do this three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
      ],
    },
    {
      id: "wudu-5",
      title: "Washing the Face",
      desc: "Wash your entire face three times.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Washing the Face",
          text: "Wash your face completely from the hairline down to the chin, and from the lobe of the right ear to the lobe of the left ear. Do this three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
      ],
    },
    {
      id: "wudu-6",
      title: "Washing the Arms",
      desc: "Wash both arms up to and including the elbows three times.",
      time: "2 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Right Arm",
          text: "Wash your right arm completely, starting from the fingertips up to and including the elbow. Do this three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
        {
          title: "Left Arm",
          text: "Wash your left arm completely, starting from the fingertips up to and including the elbow. Do this three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
      ],
    },
    {
      id: "wudu-7",
      title: "Wiping the Head (Masah)",
      desc: "Wipe over your head with wet hands one time.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Wiping the Head",
          text: "Wet your hands and wipe them over your head, starting from the front hairline, sliding them back to the nape of the neck, and then bringing them back to the front. Do this once.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 185",
        },
      ],
    },
    {
      id: "wudu-8",
      title: "Wiping the Ears",
      desc: "Wipe the inside and outside of your ears one time.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Wiping the Ears",
          text: "Using the same water from wiping your head, insert your index fingers into the curves of your ears while using your thumbs to wipe the back of your ears. Do this once.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Abu Dawud 1/36",
        },
      ],
    },
    {
      id: "wudu-9",
      title: "Washing the Feet",
      desc: "Wash both feet up to and including the ankles three times.",
      time: "2 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Right Foot",
          text: "Wash your right foot thoroughly up to and including the ankle, making sure to clean between the toes with your pinky finger. Do this three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
        {
          title: "Left Foot",
          text: "Wash your left foot thoroughly up to and including the ankle, making sure to clean between the toes with your pinky finger. Do this three times.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Sahih al-Bukhari 164",
        },
      ],
    },
    {
      id: "wudu-10",
      title: "Supplication after Wudu",
      desc: "Recite the supplication for completing the ablution.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Testimony of Faith",
          text: "Look towards the sky and recite the Shahadah.",
          arabic:
            "أَشۡهَدُ أَنۡ لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُۥ وَأَشۡهَدُ أَنَّ مُحَمَّدًا عَبۡدُهُۥ وَرَسُولُهُۥ",
          transliteration:
            "Ash-hadu 'an laa 'ilaaha 'illallaahu wahdahu laa shareeka lahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation:
            "I bear witness that none has the right to be worshipped but Allah alone, Who has no partner; and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Muslim 1/209",
        },
        {
          title: "Prayer for Purification",
          text: "Then add this supplication.",
          arabic:
            "أَللَّٰهُمَّ ٱجۡعَلۡنِى مِنَ ٱلتَّوَّابِينَ وَٱجۡعَلۡنِى مِنَ ٱلۡمُتَطَهِّرِينَ",
          transliteration:
            "Allaahummaj'alnee minat-tawwaabeena waj'alnee minal-mutatahhireen.",
          translation:
            "O Allah, make me among those who turn to You in repentance, and make me among those who are purified.",
          reference: "At-Tirmithi 1/78",
        },
      ],
    },
    {
      id: "tayammum-basics",
      title: "Tayammum (Dry Ablution)",
      desc: "How to purify yourself when water is unavailable.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      evidence: {
        quran:
          "5:6 - '...But if you are ill or on a journey... and you find no water, then seek clean earth and wipe over your faces and hands with it.'",
        hadith:
          "Bukhari - 'The earth has been made for me (and for my followers) a place for praying and a thing to perform Tayammum.'",
      },
      steps: [
        {
          title: "Intention & Bismillah",
          text: "Intend in your heart to perform Tayammum to remove impurity. Say Bismillah.",
        },
        {
          title: "Strike the Earth",
          text: "Strike clean earth, dust, or stone lightly with the palms of both hands once. Blow off any excess dust.",
        },
        {
          title: "Wipe Face and Hands",
          text: "Wipe your face completely with your hands, and then wipe the back of your right hand with your left palm, and the back of your left hand with your right palm.",
        },
      ],
    },
  ],

  "Salah Academy": [
    {
      id: "fajr-sunnah-detailed",
      title: "Fajr 2 Rak'ahs Sunnah (Fully Detailed)",
      desc: "A 'Rak'ah' is one complete unit of prayer consisting of standing, bowing, and two prostrations. Fajr Sunnah consists of exactly two of these units. Below is every single physical movement and word spoken from start to finish.",
      time: "5 min",
      stepsCount: 20,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir (Starting the Prayer)",
          text: "Stand straight facing the Qiblah (Mecca). Make the intention in your heart to pray the 2 Rak'ahs of Fajr Sunnah. Raise your hands to your ears or shoulders and say this to officially begin:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam (Standing) & Sana",
          text: "Place your right hand over your left hand on your chest. Look down at the place where your forehead will touch the ground. Recite this opening supplication silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Still standing, seek refuge from Satan and recite the Bismillah silently before reading the Quran.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98, Sahih Muslim 399",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Still standing, recite the opening chapter of the Quran. This is mandatory. Say 'Ameen' at the very end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting Surah Al-Kafirun",
          text: "It is a highly recommended practice (Sunnah) to recite this specific chapter in the first Rak'ah of the Fajr Sunnah prayer.",
          arabic: "قُلْ يَا أَيُّهَا الْكَافِرُونَ. لَا أَعْبُدُ مَا تَعْبُدُونَ. وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ. وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ. وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ. لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
          transliteration: "Qul yaa 'ayyuhal-kaafiroon. Laa 'a'budu maa ta'budoon. Wa laa 'antum 'aabidoona maa 'a'bud. Wa laa 'anaa 'aabidum-maa 'abadtum. Wa laa 'antum 'aabidoona maa 'a'bud. Lakum deenukum wa liya deen.",
          translation: "Say, \"O disbelievers, I do not worship what you worship. Nor are you worshippers of what I worship. Nor will I be a worshipper of what you worship. Nor will you be worshippers of what I worship. For you is your religion, and for me is my religion.\"",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar' and bend at the waist so your back is flat and parallel to the floor. Place your hands firmly on your knees. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising from Bowing)",
          text: "Stand back up completely straight. While you are rising, say the first sentence. When you are standing fully upright, say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: First Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down to the floor. Seven parts of your body must touch the ground: your forehead (and nose), both palms, both knees, and the toes of both feet. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Jalsa (Sitting between Prostrations)",
          text: "Say 'Allaahu Akbar' and sit up. Rest your body on your left foot and keep your right foot propped up with the toes facing forward. Place your hands on your thighs and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down for a second prostration exactly like the first one. Say this three times. (This completes the First Rak'ah!).",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for the 2nd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. This begins your second Rak'ah (unit). Recite Bismillah and Surah Al-Fatihah again.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Reciting Surah Al-Ikhlas",
          text: "It is a highly recommended practice (Sunnah) to recite this specific chapter in the second Rak'ah of the Fajr Sunnah prayer.",
          arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          transliteration: "Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          translation: "Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 13: Ruku (Bowing) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 14: I'tidal (Rising) - 2nd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 15: First Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 16: Jalsa (Sitting) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 17: Second Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 18: Tashahhud (The Final Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 19: As-Salawat (Sending Blessings)",
          text: "Remain sitting and immediately follow the Tashahhud by sending blessings upon the Prophet Muhammad and Ibrahim.",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 20: Tasleem (Concluding the Prayer)",
          text: "To officially end your prayer, turn your head to look over your right shoulder and say the phrase. Then turn your head to look over your left shoulder and say it one more time.",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "fajr-fard-detailed",
      title: "Fajr 2 Rak'ahs Fard (Fully Detailed)",
      desc: "The obligatory (Fard) Fajr prayer consists of 2 Rak'ahs. The physical movements are identical to the Sunnah, but the intention changes and the recitation of the Quran is done aloud if praying in congregation or leading.",
      time: "5 min",
      stepsCount: 20,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir (Starting the Prayer)",
          text: "Stand straight facing the Qiblah. Make the intention in your heart to pray the 2 Rak'ahs of Fajr Fard (Obligatory). Raise your hands to your ears or shoulders and say this to officially begin:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam (Standing) & Sana",
          text: "Place your right hand over your left hand on your chest. Look down at the place where your forehead will touch the ground. Recite this opening supplication silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Still standing, seek refuge from Satan and recite the Bismillah silently before reading the Quran.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98, Sahih Muslim 399",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Still standing, recite the opening chapter of the Quran. If you are leading or praying alone, recite this aloud. Say 'Ameen' at the very end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting Another Surah (e.g., Al-Falaq)",
          text: "Recite any other chapter from the Quran. For the Fajr Fard, longer recitations are generally preferred. As an example, Surah Al-Falaq:",
          arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ. مِنْ شَرِّ مَا خَلَقَ. وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ. وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ. وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
          transliteration: "Qul 'a'oothu birabbil-falaq. Min sharri maa khalaq. Wa min sharri ghaasiqin 'ithaa waqab. Wa min sharrin-naffaathaati fil-'uqad. Wa min sharri haasidin 'ithaa hasad.",
          translation: "Say: I seek refuge with the Lord of the daybreak. From the evil of what He has created. And from the evil of the darkening (night) as it comes with its darkness. And from the evil of those who practice witchcraft when they blow in the knots. And from the evil of the envier when he envies.",
          reference: "Sahih Muslim 759",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar' and bend at the waist so your back is flat and parallel to the floor. Place your hands firmly on your knees. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising from Bowing)",
          text: "Stand back up completely straight. While you are rising, say the first sentence. When you are standing fully upright, say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: First Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down to the floor. Seven parts of your body must touch the ground: your forehead (and nose), both palms, both knees, and the toes of both feet. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Jalsa (Sitting between Prostrations)",
          text: "Say 'Allaahu Akbar' and sit up. Rest your body on your left foot and keep your right foot propped up with the toes facing forward. Place your hands on your thighs and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down for a second prostration exactly like the first one. Say this three times. (This completes the First Rak'ah!).",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for the 2nd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. This begins your second Rak'ah. Recite Bismillah and Surah Al-Fatihah again (aloud if applicable).",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Reciting Another Surah (e.g., An-Nas)",
          text: "Recite another chapter from the Quran. As an example, Surah An-Nas:",
          arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ. مَلِكِ النَّاسِ. إِلَٰهِ النَّاسِ. مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ. الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ. مِنَ الْجِنَّةِ وَالنَّاسِ",
          transliteration: "Qul 'a'oothu birabbin-naas. Malikin-naas. 'Ilaahin-naas. Min sharril-waswaasil-khannaas. Allathee yuwaswisu fee sudoorin-naas. Minal-jinnati wannaas.",
          translation: "Say: I seek refuge with the Lord of mankind. The King of mankind. The God of mankind. From the evil of the whisperer who withdraws. Who whispers in the breasts of mankind. Of jinns and men.",
          reference: "Sahih Muslim 759",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 13: Ruku (Bowing) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 14: I'tidal (Rising) - 2nd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 15: First Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 16: Jalsa (Sitting) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 17: Second Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 18: Tashahhud (The Final Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 19: As-Salawat (Sending Blessings)",
          text: "Remain sitting and immediately follow the Tashahhud by sending blessings upon the Prophet Muhammad and Ibrahim.",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 20: Tasleem (Concluding the Prayer)",
          text: "To officially end your prayer, turn your head to look over your right shoulder and say the phrase. Then turn your head to look over your left shoulder and say it one more time.",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "dhuhr-4-sunnah-detailed",
      title: "Dhuhr 4 Rak'ahs Sunnah (Fully Detailed)",
      desc: "Before the obligatory Dhuhr prayer, it is a highly emphasized Sunnah (Mu'akkadah) to pray 4 Rak'ahs. In this 4-Rak'ah prayer, an additional Surah is recited after Al-Fatihah in all four Rak'ahs. All recitation is done silently.",
      time: "10 min",
      stepsCount: 35,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir (Starting the Prayer)",
          text: "Stand straight facing the Qiblah. Make the intention in your heart to pray the 4 Rak'ahs of Dhuhr Sunnah. Raise your hands to your ears or shoulders and say this to officially begin:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam (Standing) & Sana",
          text: "Place your right hand over your left hand on your chest. Look down at the place where your forehead will touch the ground. Recite this opening supplication silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Still standing, seek refuge from Satan and recite the Bismillah silently before reading the Quran.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98, Sahih Muslim 399",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Still standing, recite the opening chapter of the Quran silently. This is mandatory. Say 'Ameen' at the very end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting Another Surah (e.g., Al-Asr)",
          text: "Recite another chapter from the Quran silently. As an example, Surah Al-Asr:",
          arabic: "وَالْعَصْرِ. إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ. إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
          transliteration: "Wal-'asr. Innal-'insaana lafee khusr. Illal-latheena aamanoo wa 'amilus-saalihaati wa tawaasaw bil-haqqi wa tawaasaw bis-sabr.",
          translation: "By time, indeed, mankind is in loss, Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar' and bend at the waist so your back is flat and parallel to the floor. Place your hands firmly on your knees. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising from Bowing)",
          text: "Stand back up completely straight. While you are rising, say the first sentence. When you are standing fully upright, say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: First Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down to the floor. Seven parts of your body must touch the ground: your forehead (and nose), both palms, both knees, and the toes of both feet. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Jalsa (Sitting between Prostrations)",
          text: "Say 'Allaahu Akbar' and sit up. Rest your body on your left foot and keep your right foot propped up with the toes facing forward. Place your hands on your thighs and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down for a second prostration exactly like the first one. Say this three times. (This completes the First Rak'ah!).",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for the 2nd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. This begins your second Rak'ah. Recite Bismillah and Surah Al-Fatihah silently.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Reciting Another Surah (e.g., Al-Kauthar)",
          text: "Recite another chapter from the Quran. As an example, Surah Al-Kauthar:",
          arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ. فَصَلِّ لِرَبِّكَ وَانْحَرْ. إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
          transliteration: "Innaa 'a'taynaakal-kawthar. Fasalli lirabbika wanhar. Inna shaani'aka huwal-'abtar.",
          translation: "Indeed, We have granted you, [O Muhammad], al-Kawthar. So pray to your Lord and sacrifice [to Him alone]. Indeed, your enemy is the one cut off.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 13: Ruku (Bowing) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 14: I'tidal (Rising) - 2nd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 15: First Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 16: Jalsa (Sitting) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 17: Second Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 18: First Tashahhud (Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up yet. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud. After this, you will stand up for the 3rd Rak'ah.",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 19: Standing for the 3rd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. This begins your 3rd Rak'ah. Recite Bismillah and Surah Al-Fatihah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 20: Reciting Another Surah (e.g., Al-Kafirun)",
          text: "Because this is a Sunnah prayer, you must recite an additional Surah in the 3rd Rak'ah. As an example, Surah Al-Kafirun:",
          arabic: "قُلْ يَا أَيُّهَا الْكَافِرُونَ. لَا أَعْبُدُ مَا تَعْبُدُونَ. وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ. وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ. وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ. لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
          transliteration: "Qul yaa 'ayyuhal-kaafiroon. Laa 'a'budu maa ta'budoon. Wa laa 'antum 'aabidoona maa 'a'bud. Wa laa 'anaa 'aabidum-maa 'abadtum. Wa laa 'antum 'aabidoona maa 'a'bud. Lakum deenukum wa liya deen.",
          translation: "Say, 'O disbelievers, I do not worship what you worship. Nor are you worshippers of what I worship. Nor will I be a worshipper of what you worship. Nor will you be worshippers of what I worship. For you is your religion, and for me is my religion.'",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 21: Ruku (Bowing) - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 22: I'tidal (Rising) - 3rd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 23: First Sujood - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 24: Jalsa (Sitting) - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 25: Second Sujood - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 26: Standing for the 4th Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. This begins your 4th and final Rak'ah. Recite Bismillah and Surah Al-Fatihah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 27: Reciting Another Surah (e.g., Al-Ikhlas)",
          text: "As this is a Sunnah prayer, recite an additional Surah in the 4th Rak'ah. As an example, Surah Al-Ikhlas:",
          arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          transliteration: "Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          translation: "Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 28: Ruku (Bowing) - 4th Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 29: I'tidal (Rising) - 4th Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 30: First Sujood - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 31: Jalsa (Sitting) - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 32: Second Sujood - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 33: Tashahhud (The Final Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 34: As-Salawat (Sending Blessings)",
          text: "Remain sitting and immediately follow the Tashahhud by sending blessings upon the Prophet Muhammad and Ibrahim.",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 35: Tasleem (Concluding the Prayer)",
          text: "To officially end your prayer, turn your head to look over your right shoulder and say the phrase. Then turn your head to look over your left shoulder and say it one more time.",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "dhuhr-4-fard-detailed",
      title: "Dhuhr 4 Rak'ahs Fard (Fully Detailed)",
      desc: "The obligatory (Fard) Dhuhr prayer consists of 4 Rak'ahs. In a Fard prayer, an additional Surah is ONLY recited in the first two Rak'ahs. The 3rd and 4th Rak'ahs only contain Al-Fatihah. For Dhuhr, all recitation is done silently, even in congregation.",
      time: "10 min",
      stepsCount: 33,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir (Starting the Prayer)",
          text: "Stand straight facing the Qiblah. Make the intention in your heart to pray the 4 Rak'ahs of Dhuhr Fard (Obligatory). Raise your hands to your ears or shoulders and say this to officially begin:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam (Standing) & Sana",
          text: "Place your right hand over your left hand on your chest. Look down at the place where your forehead will touch the ground. Recite this opening supplication silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Still standing, seek refuge from Satan and recite the Bismillah silently before reading the Quran.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98, Sahih Muslim 399",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Still standing, recite the opening chapter of the Quran silently. Say 'Ameen' at the very end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting Another Surah (e.g., Al-Fil)",
          text: "Recite another chapter from the Quran. As an example, Surah Al-Fil:",
          arabic: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ. أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ. وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ. تَرْمِيهِمْ بِحِجَارَةٍ مِنْ سِجِّيلٍ. فَجَعَلَهُمْ كَعَصْفٍ مَأْكُولٍ",
          transliteration: "Alam tara kayfa fa'ala rabbuka bi ashaabil-feel. Alam yaj'al kaydahum fee tadleel. Wa arsala 'alayhim tayran abaabeel. Tarmeehim bihijaaratim min sijjeel. Faja'alahum ka'asfim ma'kool.",
          translation: "Have you not considered, [O Muhammad], how your Lord dealt with the companions of the elephant? Did He not make their plan into ruin? And He sent against them birds in flocks, Striking them with stones of hard clay, And He made them like eaten straw.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar' and bend at the waist so your back is flat and parallel to the floor. Place your hands firmly on your knees. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising from Bowing)",
          text: "Stand back up completely straight. While you are rising, say the first sentence. When you are standing fully upright, say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: First Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Jalsa (Sitting between Prostrations)",
          text: "Say 'Allaahu Akbar' and sit up. Rest your body on your left foot and keep your right foot propped up with the toes facing forward. Place your hands on your thighs and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down for a second prostration. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for the 2nd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. Recite Bismillah and Surah Al-Fatihah silently.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Reciting Another Surah (e.g., Quraysh)",
          text: "Recite another chapter from the Quran. As an example, Surah Quraysh:",
          arabic: "لِإِيلَافِ قُرَيْشٍ. إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ. فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ. الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ",
          transliteration: "Li'eelaafi quraysh. Eelaafihim rihlatash-shitaa'i wassayf. Falya'budoo rabba haathal-bayt. Allathee at'amahum min joo'in wa aamanahum min khawf.",
          translation: "For the accustomed security of the Quraysh - Their accustomed security [in] the caravan of winter and summer - Let them worship the Lord of this House, Who has fed them, [saving them] from hunger and made them safe, [saving them] from fear.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 13: Ruku (Bowing) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 14: I'tidal (Rising) - 2nd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 15: First Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 16: Jalsa (Sitting) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 17: Second Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 18: First Tashahhud (Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up yet. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud. After this, you will stand up for the 3rd Rak'ah.",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 19: Standing for the 3rd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. For the 3rd Rak'ah of a FARD prayer, you ONLY recite Surah Al-Fatihah. Do not add another Surah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 20: Ruku (Bowing) - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 21: I'tidal (Rising) - 3rd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 22: First Sujood - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 23: Jalsa (Sitting) - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 24: Second Sujood - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 25: Standing for the 4th Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. For the 4th Rak'ah of a FARD prayer, you ONLY recite Surah Al-Fatihah. Do not add another Surah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 26: Ruku (Bowing) - 4th Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 27: I'tidal (Rising) - 4th Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 28: First Sujood - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 29: Jalsa (Sitting) - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 30: Second Sujood - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 31: Tashahhud (The Final Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 32: As-Salawat (Sending Blessings)",
          text: "Remain sitting and immediately follow the Tashahhud by sending blessings upon the Prophet Muhammad and Ibrahim.",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 33: Tasleem (Concluding the Prayer)",
          text: "To officially end your prayer, turn your head to look over your right shoulder and say the phrase. Then turn your head to look over your left shoulder and say it one more time.",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "dhuhr-2-sunnah-detailed",
      title: "Dhuhr 2 Rak'ahs Sunnah (Fully Detailed)",
      desc: "After the obligatory 4 Rak'ahs of Dhuhr, it is a highly emphasized Sunnah (Mu'akkadah) to pray 2 Rak'ahs. The physical movements are identical to the Fajr Sunnah prayer.",
      time: "5 min",
      stepsCount: 20,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir (Starting the Prayer)",
          text: "Stand straight facing the Qiblah. Make the intention in your heart to pray the 2 Rak'ahs of Dhuhr Sunnah. Raise your hands to your ears or shoulders and say this to officially begin:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam (Standing) & Sana",
          text: "Place your right hand over your left hand on your chest. Look down at the place where your forehead will touch the ground. Recite this opening supplication silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Still standing, seek refuge from Satan and recite the Bismillah silently before reading the Quran.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98, Sahih Muslim 399",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Still standing, recite the opening chapter of the Quran silently. Say 'Ameen' at the very end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting Another Surah (e.g., Al-Falaq)",
          text: "Recite another chapter from the Quran. As an example, Surah Al-Falaq:",
          arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ. مِنْ شَرِّ مَا خَلَقَ. وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ. وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ. وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
          transliteration: "Qul 'a'oothu birabbil-falaq. Min sharri maa khalaq. Wa min sharri ghaasiqin 'ithaa waqab. Wa min sharrin-naffaathaati fil-'uqad. Wa min sharri haasidin 'ithaa hasad.",
          translation: "Say: I seek refuge with the Lord of the daybreak. From the evil of what He has created. And from the evil of the darkening (night) as it comes with its darkness. And from the evil of those who practice witchcraft when they blow in the knots. And from the evil of the envier when he envies.",
          reference: "Sahih Muslim 759",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar' and bend at the waist so your back is flat and parallel to the floor. Place your hands firmly on your knees. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising from Bowing)",
          text: "Stand back up completely straight. While you are rising, say the first sentence. When you are standing fully upright, say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: First Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Jalsa (Sitting between Prostrations)",
          text: "Say 'Allaahu Akbar' and sit up. Rest your body on your left foot and keep your right foot propped up with the toes facing forward. Place your hands on your thighs and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down for a second prostration exactly like the first one. Say this three times. (This completes the First Rak'ah!).",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for the 2nd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. This begins your second Rak'ah. Recite Bismillah and Surah Al-Fatihah again.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Reciting Another Surah (e.g., An-Nas)",
          text: "Recite another chapter from the Quran. As an example, Surah An-Nas:",
          arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ. مَلِكِ النَّاسِ. إِلَٰهِ النَّاسِ. مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ. الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ. مِنَ الْجِنَّةِ وَالنَّاسِ",
          transliteration: "Qul 'a'oothu birabbin-naas. Malikin-naas. 'Ilaahin-naas. Min sharril-waswaasil-khannaas. Allathee yuwaswisu fee sudoorin-naas. Minal-jinnati wannaas.",
          translation: "Say: I seek refuge with the Lord of mankind. The King of mankind. The God of mankind. From the evil of the whisperer who withdraws. Who whispers in the breasts of mankind. Of jinns and men.",
          reference: "Sahih Muslim 759",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 13: Ruku (Bowing) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 14: I'tidal (Rising) - 2nd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 15: First Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 16: Jalsa (Sitting) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 17: Second Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 18: Tashahhud (The Final Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 19: As-Salawat (Sending Blessings)",
          text: "Remain sitting and immediately follow the Tashahhud by sending blessings upon the Prophet Muhammad and Ibrahim.",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 20: Tasleem (Concluding the Prayer)",
          text: "To officially end your prayer, turn your head to look over your right shoulder and say the phrase. Then turn your head to look over your left shoulder and say it one more time.",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "dhuhr-2-nafl-detailed",
      title: "Dhuhr 2 Rak'ahs Nafl (Fully Detailed)",
      desc: "After the 2 Rak'ahs of Sunnah, it is optional and rewarding to pray 2 additional Rak'ahs of Nafl (voluntary) prayer. The structure is identical to a standard 2-Rak'ah prayer.",
      time: "5 min",
      stepsCount: 20,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir (Starting the Prayer)",
          text: "Stand straight facing the Qiblah. Make the intention in your heart to pray the 2 Rak'ahs of Nafl prayer for Dhuhr. Raise your hands to your ears or shoulders and say this to officially begin:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam (Standing) & Sana",
          text: "Place your right hand over your left hand on your chest. Look down at the place where your forehead will touch the ground. Recite this opening supplication silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Still standing, seek refuge from Satan and recite the Bismillah silently before reading the Quran.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98, Sahih Muslim 399",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Still standing, recite the opening chapter of the Quran silently. Say 'Ameen' at the very end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting Another Surah (e.g., An-Nasr)",
          text: "Recite another chapter from the Quran. As an example, Surah An-Nasr:",
          arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ. وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا. فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا",
          transliteration: "Ithaa jaa'a nasrullaahi wal-fath. Wa ra'aytan-naasa yadkhuloona fee deenillaahi afwaajaa. Fasabbih bihamdi rabbika wastaghfirh. Innahoo kaana tawwaabaa.",
          translation: "When the victory of Allah has come and the conquest, And you see the people entering into the religion of Allah in multitudes, Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar' and bend at the waist so your back is flat and parallel to the floor. Place your hands firmly on your knees. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising from Bowing)",
          text: "Stand back up completely straight. While you are rising, say the first sentence. When you are standing fully upright, say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: First Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Jalsa (Sitting between Prostrations)",
          text: "Say 'Allaahu Akbar' and sit up. Rest your body on your left foot and keep your right foot propped up with the toes facing forward. Place your hands on your thighs and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down for a second prostration exactly like the first one. Say this three times. (This completes the First Rak'ah!).",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for the 2nd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. This begins your second Rak'ah. Recite Bismillah and Surah Al-Fatihah again.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Reciting Another Surah (e.g., Al-Masad)",
          text: "Recite another chapter from the Quran. As an example, Surah Al-Masad:",
          arabic: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ. مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ. سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ. وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ. فِي جِيدِهَا حَبْلٌ مِنْ مَسَدٍ",
          transliteration: "Tabbat yadaa abee lahabiw-watabb. Maa aghnaa 'anhu maaluhu wa maa kasab. Sayaslaa naaran thaata lahab. Wamra'atuhu hammaalatal-hatab. Fee jeedihaa hablum mim masad.",
          translation: "May the hands of Abu Lahab be ruined, and ruined is he. His wealth will not avail him or that which he gained. He will [enter to] burn in a Fire of [blazing] flame. And his wife [as well] - the carrier of firewood. Around her neck is a rope of [twisted] fiber.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 13: Ruku (Bowing) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 14: I'tidal (Rising) - 2nd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 15: First Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 16: Jalsa (Sitting) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 17: Second Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 18: Tashahhud (The Final Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 19: As-Salawat (Sending Blessings)",
          text: "Remain sitting and immediately follow the Tashahhud by sending blessings upon the Prophet Muhammad and Ibrahim.",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 20: Tasleem (Concluding the Prayer)",
          text: "To officially end your prayer, turn your head to look over your right shoulder and say the phrase. Then turn your head to look over your left shoulder and say it one more time.",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "asr-4-fard-detailed",
      title: "Asr 4 Rak'ahs Fard (Fully Detailed)",
      desc: "The obligatory (Fard) Asr prayer consists of 4 Rak'ahs. In a Fard prayer, an additional Surah is ONLY recited in the first two Rak'ahs. The 3rd and 4th Rak'ahs only contain Al-Fatihah. For Asr, all recitation is done silently.",
      time: "10 min",
      stepsCount: 33,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir (Starting the Prayer)",
          text: "Stand straight facing the Qiblah. Make the intention in your heart to pray the 4 Rak'ahs of Asr Fard (Obligatory). Raise your hands to your ears or shoulders and say this to officially begin:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam (Standing) & Sana",
          text: "Place your right hand over your left hand on your chest. Look down at the place where your forehead will touch the ground. Recite this opening supplication silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Still standing, seek refuge from Satan and recite the Bismillah silently before reading the Quran.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98, Sahih Muslim 399",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Still standing, recite the opening chapter of the Quran silently. Say 'Ameen' at the very end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting Another Surah (e.g., Al-Asr)",
          text: "Recite another chapter from the Quran. As an example, Surah Al-Asr:",
          arabic: "وَالْعَصْرِ. إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ. إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
          transliteration: "Wal-'asr. Innal-'insaana lafee khusr. Illal-latheena aamanoo wa 'amilus-saalihaati wa tawaasaw bil-haqqi wa tawaasaw bis-sabr.",
          translation: "By time, indeed, mankind is in loss, Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar' and bend at the waist so your back is flat and parallel to the floor. Place your hands firmly on your knees. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising from Bowing)",
          text: "Stand back up completely straight. While you are rising, say the first sentence. When you are standing fully upright, say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: First Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Jalsa (Sitting between Prostrations)",
          text: "Say 'Allaahu Akbar' and sit up. Rest your body on your left foot and keep your right foot propped up with the toes facing forward. Place your hands on your thighs and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood (Prostration)",
          text: "Say 'Allaahu Akbar' and go down for a second prostration. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for the 2nd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. Recite Bismillah and Surah Al-Fatihah silently.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Reciting Another Surah (e.g., Al-Ikhlas)",
          text: "Recite another chapter from the Quran. As an example, Surah Al-Ikhlas:",
          arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          transliteration: "Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          translation: "Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
          reference: "Sahih Muslim 726",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 13: Ruku (Bowing) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 14: I'tidal (Rising) - 2nd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 15: First Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 16: Jalsa (Sitting) - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 17: Second Sujood - 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 18: First Tashahhud (Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up yet. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud. After this, you will stand up for the 3rd Rak'ah.",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 19: Standing for the 3rd Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. For the 3rd Rak'ah of a FARD prayer, you ONLY recite Surah Al-Fatihah. Do not add another Surah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 20: Ruku (Bowing) - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 21: I'tidal (Rising) - 3rd Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 22: First Sujood - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 23: Jalsa (Sitting) - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 24: Second Sujood - 3rd Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 25: Standing for the 4th Rak'ah & Fatihah",
          text: "Say 'Allaahu Akbar' as you rise from the floor and stand all the way back up. For the 4th Rak'ah of a FARD prayer, you ONLY recite Surah Al-Fatihah. Do not add another Surah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen... (Continue to the end of Al-Fatihah)",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds... (Continue to the end)",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 26: Ruku (Bowing) - 4th Rak'ah",
          text: "Say 'Allaahu Akbar', bend at the waist, place your hands on your knees, and say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 27: I'tidal (Rising) - 4th Rak'ah",
          text: "Stand back up straight. While rising say the first sentence, and when fully upright say the second sentence.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 28: First Sujood - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate to the floor. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 29: Jalsa (Sitting) - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and sit up, resting your hands on your thighs. Say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 30: Second Sujood - 4th Rak'ah",
          text: "Say 'Allaahu Akbar' and prostrate again. Say this three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 31: Tashahhud (The Final Sitting)",
          text: "Say 'Allaahu Akbar' and sit up. Do not stand up. Rest your hands on your knees, point your right index finger forward, and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 32: As-Salawat (Sending Blessings)",
          text: "Remain sitting and immediately follow the Tashahhud by sending blessings upon the Prophet Muhammad and Ibrahim.",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 33: Tasleem (Concluding the Prayer)",
          text: "To officially end your prayer, turn your head to look over your right shoulder and say the phrase. Then turn your head to look over your left shoulder and say it one more time.",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "maghrib-3-fard-detailed",
      title: "Maghrib 3 Rak'ahs Fard (Fully Detailed)",
      desc: "The Maghrib Fard prayer consists of 3 Rak'ahs. The recitation in the first two Rak'ahs is performed audibly (out loud) if leading or praying alone, while the 3rd Rak'ah is performed silently. An additional Surah is recited only in the first two Rak'ahs.",
      time: "7-10 min",
      stepsCount: 25,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir",
          text: "Stand facing the Qiblah. Make the intention to pray the 3 Rak'ahs of Maghrib Fard. Raise hands to your ears/shoulders and say:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam & Sana",
          text: "Place right hand over left on the chest. Recite the opening supplication (Sana) silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Reciting Al-Fatihah (Audibly)",
          text: "Recite 'Audhu Billahi', 'Bismillah', then Al-Fatihah out loud.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Another Surah (Audibly)",
          text: "Recite another short Surah out loud (e.g., Surah Al-Ikhlas).",
          arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          transliteration: "Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar', bow, and say 3 times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 6: I'tidal",
          text: "Rise and say:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 7: First Sujood",
          text: "Prostrate and say 3 times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 8: Jalsa",
          text: "Sit up briefly and say:",
          arabic: "رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee.",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 9: Second Sujood",
          text: "Prostrate and say 3 times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 10: Second Rak'ah - Al-Fatihah",
          text: "Rise for the 2nd Rak'ah. Recite Al-Fatihah out loud.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen...",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 11: Second Rak'ah - Another Surah",
          text: "Recite another short Surah out loud.",
          arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ. فَصَلِّ لِرَبِّكَ وَانْحَرْ. إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
          transliteration: "Inna a'tainakal-kauthar. Fasalli lirabbika wanhar. Inna shaniaka huwal-abtar.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Ruku",
          text: "Perform Ruku as before (Step 5).",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 13: I'tidal",
          text: "Rise and say (Step 6):",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 14: Two Sujood",
          text: "Perform two Sujood with sitting in between as before (Steps 7-9).",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 15: First Tashahhud",
          text: "Sit after the 2nd Rak'ah. Recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 16: Third Rak'ah - Al-Fatihah",
          text: "Rise for the 3rd Rak'ah. Recite Al-Fatihah SILENTLY.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen...",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 17: Ruku",
          text: "Perform Ruku as before.",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 18: I'tidal",
          text: "Rise and say:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 19: Two Sujood",
          text: "Perform two Sujood with sitting in between.",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 20: Final Sitting (Tashahhud)",
          text: "Sit for the final time. Recite the Tashahhud (as in Step 15).",
          arabic: "التَّحِيَّاتُ لِلَّهِ...",
          transliteration: "At-tahiyyaatu lillaahi...",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 21: As-Salawat",
          text: "Recite the Salawat (blessings upon the Prophet):",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 22: Dua",
          text: "Optional: Recite a short Quranic Dua, e.g.:",
          arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 23: Tasleem Right",
          text: "Turn head to the right and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          animationLoop: "/assets/animations/tasleem.json"
        },
        {
          title: "Step 24: Tasleem Left",
          text: "Turn head to the left and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          animationLoop: "/assets/animations/tasleem.json"
        },
        {
          title: "Step 25: Closing",
          text: "The prayer is complete. You may now perform any personal supplications.",
          animationLoop: "/assets/animations/tashahhud.json"
        }
      ]
    },
    {
      id: "maghrib-sunnah-muakkadah-detailed",
      title: "2 Rak'ahs Sunnah Mu'akkadah after Maghrib (Fully Detailed)",
      desc: "This is an emphasized (Mu'akkadah) Sunnah prayer performed after the 3 Fard Rak'ahs of Maghrib. All recitation in these two Rak'ahs is performed silently.",
      time: "3-5 min",
      stepsCount: 18,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention",
          text: "Stand facing the Qiblah. Make the intention in your heart: 'I intend to perform 2 Rak'ahs of Sunnah prayer for Maghrib'.",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Takbir",
          text: "Raise your hands to your ears/shoulders and say:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 3: Sana",
          text: "Place right hand over left on the chest. Recite silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Al-Fatihah",
          text: "Recite silently:",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Another Surah",
          text: "Recite any short Surah silently (e.g., Al-Kafirun).",
          arabic: "قُلْ يَا أَيُّهَا الْكَافِرُونَ. لَا أَعْبُدُ مَا تَعْبُدُونَ. وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ. وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ. وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ. لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
          transliteration: "Qul yaa ayyuhal-kaafiroon. Laa 'a'budu maa ta'budoon. Wa laa antum 'aabidoona maa 'a'bud. Wa laa ana 'aabidum-maa 'abadtum. Wa laa antum 'aabidoona maa 'a'bud. Lakum deenukum wa liya deen.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku",
          text: "Bow and say 3 times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal",
          text: "Rise and say:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: Two Sujood",
          text: "Perform two prostrations with sitting in between, saying 'Subhaana Rabbiyal-'A'laa' 3 times in each.",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Second Rak'ah - Al-Fatihah",
          text: "Rise for the 2nd Rak'ah. Recite Al-Fatihah silently.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 10: Second Rak'ah - Another Surah",
          text: "Recite another short Surah silently (e.g., Al-Ikhlas).",
          arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          transliteration: "Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 11: Ruku & I'tidal",
          text: "Perform Ruku and I'tidal as in Steps 6-7.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 12: Two Sujood",
          text: "Perform two prostrations as in Step 8.",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 13: Final Sitting (Tashahhud)",
          text: "Sit and recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 14: As-Salawat",
          text: "Recite the Salawat (blessings upon the Prophet):",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 15: Final Dua",
          text: "Optional: Recite a short Quranic Dua.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 16: Tasleem Right",
          text: "Turn head right and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          animationLoop: "/assets/animations/tasleem.json"
        },
        {
          title: "Step 17: Tasleem Left",
          text: "Turn head left and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          animationLoop: "/assets/animations/tasleem.json"
        },
        {
          title: "Step 18: Completion",
          text: "The Sunnah prayer is now complete.",
          animationLoop: "/assets/animations/tashahhud.json"
        }
      ]
    },
    {
      id: "isha-4-fard-detailed",
      title: "Isha 4 Rak'ahs Fard (Fully Detailed)",
      desc: "The Isha Fard prayer consists of 4 Rak'ahs. The recitation in the first two Rak'ahs is performed audibly (out loud) if leading or praying alone, while the 3rd and 4th Rak'ahs are performed silently. An additional Surah is recited only in the first two Rak'ahs.",
      time: "10-12 min",
      stepsCount: 33,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention & Takbir",
          text: "Stand facing the Qiblah. Make the intention for 4 Rak'ahs of Isha Fard. Raise hands and say:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Qiyam & Sana",
          text: "Place right hand over left on the chest. Recite the opening supplication (Sana) silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Reciting Al-Fatihah (Audibly)",
          text: "Recite 'Audhu Billahi', 'Bismillah', then Al-Fatihah out loud.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Another Surah (Audibly)",
          text: "Recite any short Surah from the Quran out loud.",
          arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          transliteration: "Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar', bow, and say 3 times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 6: I'tidal",
          text: "Rise and say:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Steps 7-9: First Two Sujood & Jalsa",
          text: "Perform two prostrations with sitting in between, saying 'Subhaana Rabbiyal-'A'laa' 3 times in each Sujood.",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Steps 10-15: Second Rak'ah",
          text: "Rise for the 2nd Rak'ah. Recite Al-Fatihah and another Surah out loud. Perform Ruku, I'tidal, and two Sujood.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 16: First Tashahhud",
          text: "Sit after the 2nd Rak'ah. Recite the Tashahhud:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 17: Standing for 3rd Rak'ah",
          text: "Rise for the 3rd Rak'ah. IMPORTANT: Recite Al-Fatihah ONLY and do it SILENTLY.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Steps 18-21: Ruku & Sujood (3rd Rak'ah)",
          text: "Perform Ruku, I'tidal, and two Sujood as before.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 22: Standing for 4th Rak'ah",
          text: "Rise for the 4th Rak'ah. Recite Al-Fatihah ONLY and do it SILENTLY.",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Steps 23-26: Ruku & Sujood (4th Rak'ah)",
          text: "Perform Ruku, I'tidal, and two Sujood as before.",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 27: Final Tashahhud",
          text: "Sit for the final time. Recite the Tashahhud.",
          arabic: "التَّحِيَّاتُ لِلَّهِ...",
          transliteration: "At-tahiyyaatu lillaahi...",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 28: As-Salawat",
          text: "Recite the Salawat (blessings upon the Prophet):",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 29: Dua",
          text: "Optional: Recite a short Dua (e.g., Rabbana atina fid-dunya hasanatan...).",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 30: Tasleem Right",
          text: "Turn head right and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          animationLoop: "/assets/animations/tasleem.json"
        },
        {
          title: "Step 31: Tasleem Left",
          text: "Turn head left and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "isha-sunnah-after",
      title: "Isha 2 Rak'ahs Sunnah Mu'akkadah (After Fard)",
      desc: "The 2 Rak'ahs Sunnah Mu'akkadah are performed immediately after the 4 Rak'ahs of Isha Fard. These are prayed silently, meaning you recite everything in a whisper that only you can hear.",
      time: "8 min",
      stepsCount: 16,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention (Niyyah) & Takbir",
          text: "Stand upright facing the Qiblah. Make the intention in your heart: 'I am performing 2 Rak'ahs Sunnah Mu'akkadah for Isha.' Raise your hands to your ears/shoulders and say:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Sana (Opening Supplication)",
          text: "Place your right hand over your left on your chest. Look down at your prostration spot and recite the Sana silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Before reciting the Quran, say the following silently:",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Recite Surah Al-Fatihah silently and say 'Ameen' at the end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting a Surah",
          text: "Recite any other Surah or at least three verses of the Quran. For example, Surah Al-Kawthar:",
          arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ. فَصَلِّ لِرَبِّكَ وَانْحَرْ. إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
          transliteration: "Innaa a'taynaakal-kawthar. Fasalli li-Rabbika wan-har. Inna shaani'aka huwal-abtar.",
          translation: "Indeed, We have granted you, [O Muhammad], al-Kawthar. So pray to your Lord and sacrifice [to Him alone]. Indeed, your enemy is the one cut off.",
          reference: "Quran 108:1-3",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar', bow down with hands on knees, keep back flat, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising)",
          text: "Stand up straight, saying while rising and when upright:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: Sujood (Prostration)",
          text: "Say 'Allaahu Akbar', go to the floor, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Sitting between Prostrations",
          text: "Say 'Allaahu Akbar', sit up briefly, and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood",
          text: "Say 'Allaahu Akbar', go down for the second prostration, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and stand up. Recite Bismillah, Al-Fatihah, and another Surah as you did in the first Rak'ah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi Rabbil 'aalameen...",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful...",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Ruku & Sujood (2nd Rak'ah)",
          text: "Complete your Ruku, I'tidal, and two Sujoods for the second Rak'ah just as you did in the first.",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ / سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'Adheem / Subhaana Rabbiyal-'A'laa",
          translation: "Glory to my Lord, the Exalted / Glory to my Lord, the Most High",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 13: Tashahhud (Final Sitting)",
          text: "Say 'Allaahu Akbar', sit up, place hands on knees, raise right index finger, and recite:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah... I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 14: As-Salawat (Durood)",
          text: "Immediately continue with the blessings upon the Prophet:",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad... as You have bestowed Your favor on Ibrahim... O Allah, bless Muhammad... as You have blessed Ibrahim...",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 15: Final Dua",
          text: "Recite a short Dua from the Quran or Sunnah before ending the prayer.",
          arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration: "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-'aakhirati hasanatan wa qinaa 'athaaban-naar.",
          translation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
          reference: "Quran 2:201",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 16: Tasleem",
          text: "Turn your head to the right and say, then turn to the left and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "isha-witr-3",
      title: "Isha 3 Rak'ahs Witr (Highly Recommended/Wajib)",
      desc: "The Witr prayer is performed after the Sunnah and Nafl prayers of Isha. It is the final prayer of the night. In the 3rd Rak'ah, after reciting Surah Al-Fatihah and another Surah, you pause to recite the Dua Qunut before bowing.",
      time: "10 min",
      stepsCount: 22,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention (Niyyah) & Takbir",
          text: "Stand upright facing the Qiblah. Make the intention in your heart: 'I am performing 3 Rak'ahs of Witr Wajib.' Raise your hands to your ears/shoulders and say:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Sana (Opening Supplication)",
          text: "Place your right hand over your left on your chest. Look down at your prostration spot and recite the Sana silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Before reciting the Quran, say the following silently:",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Recite Surah Al-Fatihah silently and say 'Ameen' at the end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting a Surah",
          text: "Recite any other Surah from the Quran. For example, Surah Al-A'la:",
          arabic: "سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى",
          transliteration: "Sabbi-hisma Rabbikal-A'laa...",
          translation: "Exalt the name of your Lord, the Most High...",
          reference: "Quran 87:1",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar', bow down with hands on knees, keep back flat, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising)",
          text: "Stand up straight, saying while rising and when upright:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: Sujood (Prostration)",
          text: "Say 'Allaahu Akbar', go to the floor, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Sitting between Prostrations",
          text: "Say 'Allaahu Akbar', sit up briefly, and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood",
          text: "Say 'Allaahu Akbar', go down for the second prostration, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and stand up. Recite Bismillah, Al-Fatihah, and another Surah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi...",
          translation: "In the name of Allah, the Entirely Merciful...",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Ruku & Sujood (2nd Rak'ah)",
          text: "Complete your Ruku, I'tidal, and two Sujoods as you did in the first.",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ / سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'Adheem / Subhaana Rabbiyal-'A'laa",
          translation: "Glory to my Lord, the Exalted / Glory to my Lord, the Most High",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 13: First Tashahhud",
          text: "Sit up and recite only the Tashahhud (Attahiyat). Then stand up for the 3rd Rak'ah.",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah... I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 14: Standing for 3rd Rak'ah",
          text: "Say 'Allaahu Akbar', stand up. Recite Bismillah, Al-Fatihah, and another Surah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi...",
          translation: "In the name of Allah, the Entirely Merciful...",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 15: Dua Qunut (Preparation)",
          text: "Before going to Ruku, say 'Allaahu Akbar' while raising your hands to your ears, then fold them again on your chest.",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sunan Ibn Majah 1182",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 16: Dua Qunut (Full Recitation)",
          text: "Recite the Dua Qunut silently:",
          arabic: "اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَنَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ. اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَى وَنَحْفِدُ وَنَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ",
          transliteration: "Allaahumma innaa nasta'eenuka wa nastaghfiruka wa nu'minu bika wa natawakkalu 'alayka wa nuthnee 'alaykal-khayra wa nashkuruka wa laa nakfuruka wa nakhl'u wa natruku man-yafjuruka. Allaahumma iyyaaka na'budu wa laka nusallee wa nasjudu wa ilayka nas'aa wa nahfidu wa narjoo rahmataka wa nakhshaa 'athaabaka inna 'athaabaka bil-kuffaari mulhiq.",
          translation: "O Allah, we seek Your help, ask Your forgiveness, believe in You, and rely upon You. We praise You in the best way, thank You, and do not disbelieve in You. We distance ourselves and forsake those who disobey You. O Allah, You alone we worship, to You we pray and prostrate, for You we strive, and we look forward to Your mercy and fear Your punishment. Surely, Your punishment will reach the disbelievers.",
          reference: "Sunan al-Bayhaqi 3212",
          animationLoop: "/assets/animations/dua-qunut.json"
        },
        {
          title: "Step 17: Ruku (3rd Rak'ah)",
          text: "Say 'Allaahu Akbar', bow down, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 18: I'tidal (3rd Rak'ah)",
          text: "Stand up straight, saying while rising and when upright:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 19: Sujood (3rd Rak'ah)",
          text: "Perform two prostrations, saying in each:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 20: Final Tashahhud",
          text: "Sit up and recite the full Tashahhud (Attahiyat).",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ...",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu...",
          translation: "All greetings of humility are for Allah...",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 21: As-Salawat (Durood)",
          text: "Recite the blessings upon the Prophet (Durood-e-Ibrahim):",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad... as You have bestowed Your favor on Ibrahim... O Allah, bless Muhammad... as You have blessed Ibrahim...",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 22: Tasleem",
          text: "Turn your head to the right and say, then turn to the left and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    },
    {
      id: "isha-nafl-after-witr",
      title: "2 Rak'ahs Nafl (Optional After Witr)",
      desc: "Some choose to perform an additional two Rak'ahs of Nafl after the Witr prayer, though this is optional. These are prayed silently and independently, just like any other 2-Rak'ah Nafl prayer.",
      time: "6 min",
      stepsCount: 16,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1: Intention (Niyyah) & Takbir",
          text: "Stand upright facing the Qiblah. Make the intention in your heart: 'I am performing 2 Rak'ahs of Nafl prayer.' Raise your hands to your ears/shoulders and say:",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Sahih al-Bukhari 735",
          animationLoop: "/assets/animations/takbir.json"
        },
        {
          title: "Step 2: Sana (Opening Supplication)",
          text: "Place your right hand over your left on your chest. Look down at your prostration spot and recite the Sana silently:",
          arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
          transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aalaa jadduka, wa laa 'ilaaha ghayruka.",
          translation: "Glory is to You, O Allah, and praise. Blessed is Your Name and Exalted is Your Majesty. There is none worthy of worship but You.",
          reference: "Abu Dawud 775",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 3: Seeking Refuge & Bismillah",
          text: "Before reciting the Quran, say the following silently:",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          transliteration: "A'oothu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem.",
          translation: "I seek refuge in Allah from the outcast Satan. In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Quran 16:98",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 4: Reciting Surah Al-Fatihah",
          text: "Recite Surah Al-Fatihah silently and say 'Ameen' at the end.",
          arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa lyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen. (Ameen)",
          translation: "[All] praise is [due] to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray. (Amen)",
          reference: "Sahih al-Bukhari 756",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 5: Reciting a Surah",
          text: "Recite any other Surah of your choice. For example, Surah Al-Ikhlas:",
          arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
          transliteration: "Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          translation: "Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
          reference: "Quran 112:1-4",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 6: Ruku (Bowing)",
          text: "Say 'Allaahu Akbar', bow down with hands on knees, keep back flat, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory to my Lord, the Exalted.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 7: I'tidal (Rising)",
          text: "Stand up straight, saying while rising and when upright:",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ. رَبَّنَا وَلَكَ الْحَمْدُ",
          transliteration: "Sami'allaahu liman hamidah. Rabbanaa wa lakal-hamd.",
          translation: "Allah listens to the one who praises Him. Our Lord, and to You belongs all praise.",
          reference: "Sahih al-Bukhari 795",
          animationLoop: "/assets/animations/itidal.json"
        },
        {
          title: "Step 8: Sujood (Prostration)",
          text: "Say 'Allaahu Akbar', go to the floor, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 9: Sitting between Prostrations",
          text: "Say 'Allaahu Akbar', sit up briefly, and say:",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "Lord, forgive me. Lord, forgive me.",
          reference: "Abu Dawud 874",
          animationLoop: "/assets/animations/jalsa.json"
        },
        {
          title: "Step 10: Second Sujood",
          text: "Say 'Allaahu Akbar', go down for the second prostration, and say three times:",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'A'laa.",
          translation: "Glory to my Lord, the Most High.",
          reference: "Sahih al-Bukhari 828",
          animationLoop: "/assets/animations/sujood.json"
        },
        {
          title: "Step 11: Standing for 2nd Rak'ah",
          text: "Say 'Allaahu Akbar' and stand up. Recite Bismillah, Al-Fatihah, and another Surah.",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ...",
          transliteration: "Bismillaahir-Rahmaanir-Raheem. Alhamdu lillaahi...",
          translation: "In the name of Allah, the Entirely Merciful...",
          reference: "Sahih Muslim 451",
          animationLoop: "/assets/animations/qiyam.json"
        },
        {
          title: "Step 12: Ruku & Sujood (2nd Rak'ah)",
          text: "Complete your Ruku, I'tidal, and two Sujoods for the second Rak'ah just as you did in the first.",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ / سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-'Adheem / Subhaana Rabbiyal-'A'laa",
          translation: "Glory to my Lord, the Exalted / Glory to my Lord, the Most High",
          reference: "Sahih Muslim 772",
          animationLoop: "/assets/animations/ruku.json"
        },
        {
          title: "Step 13: Tashahhud (Final Sitting)",
          text: "Say 'Allaahu Akbar', sit up, place hands on knees, raise right index finger, and recite:",
          arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaatu, as-salaamu 'alayka 'ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu, as-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu 'an laa 'ilaaha 'illallaahu wa 'ash-hadu 'anna Muhammadan 'abduhu wa Rasooluhu.",
          translation: "All greetings of humility are for Allah... I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.",
          reference: "Sahih al-Bukhari 831",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 14: As-Salawat (Durood)",
          text: "Immediately continue with the blessings upon the Prophet:",
          arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration: "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation: "O Allah, bestow Your favor on Muhammad... as You have bestowed Your favor on Ibrahim... O Allah, bless Muhammad... as You have blessed Ibrahim...",
          reference: "Sahih al-Bukhari 3370",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 15: Final Dua",
          text: "Recite a short Dua from the Quran or Sunnah before ending the prayer.",
          arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration: "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-'aakhirati hasanatan wa qinaa 'athaaban-naar.",
          translation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
          reference: "Quran 2:201",
          animationLoop: "/assets/animations/tashahhud.json"
        },
        {
          title: "Step 16: Tasleem",
          text: "Turn your head to the right and say, then turn to the left and say:",
          arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
          transliteration: "As-salaamu 'alaykum wa rahmatullaah.",
          translation: "Peace and the mercy of Allah be upon you.",
          reference: "Sahih Muslim 581",
          animationLoop: "/assets/animations/tasleem.json"
        }
      ]
    }
  ],

  "Hajj & Umrah": [
    {
      id: "umrah-detailed-guide",
      title: "How to Perform Umrah (Step-by-Step)",
      desc: "A comprehensive, interactive guide on performing the lesser pilgrimage (Umrah) with scholarly nuance, step checklists, and visual aids.",
      disclaimer:
        "This guide follows mainstream Sunni methodology. Certain secondary conditions and etiquettes may differ slightly across the Hanafi, Maliki, Shafi'i, and Hanbali schools of jurisprudence.",
      estimatedDuration: {
        reading: "15 min",
        actual: "2 to 4 hours (depending on crowd density)",
      },
      difficulty: "beginner",
      recommendedFor: ["First-time pilgrims", "Families", "Solo travelers"],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Fiqh Advisory Board",
      requiredItems: [
        "Valid Passport & Visa",
        "Nusuk App Permit (active)",
        "Ihram Garments (2 white unstitched sheets for men; modest clothing for women)",
        "Comfortable walking sandals (leaving ankles/top of foot exposed for men)",
        "Unscented soap and pocket tissues",
        "Small drawstring bag for footwear",
        "Digital or physical Tasbeeh / Dua book",
      ],
      commonMistakes: [
        "Passing the Miqat without entering the state of Ihram or making the intention.",
        "Pushing, shoving, or harming others to kiss or touch the Black Stone (Hajr al-Aswad).",
        "Men jogging (Raml) during all seven circuits of Tawaf instead of only the first three.",
        "Reciting collective, loud, synchronized Duas in unison that disturb other worshippers.",
        "Cutting only a single hair strand instead of trimming evenly across the head (Taqsir).",
      ],
      emergencyNotes: [
        {
          q: "What if I lose count of my Tawaf or Sa'i circuits?",
          a: "Build upon the lower, certain number. For example, if you doubt whether you are on circuit 3 or 4, assume it is 3 and continue.",
        },
        {
          q: "What if my Wudu breaks during Tawaf?",
          a: "Tawaf requires ritual purity (Wudu) according to the majority of scholars. You must calmly exit, perform Wudu, and return. Depending on your school of thought, you either resume from the circuit where you stopped or restart the Tawaf.",
        },
        {
          q: "What if my Wudu breaks during Sa'i?",
          a: "Wudu is highly recommended (Sunnah) for Sa'i, but not mandatory. You may continue and complete your Sa'i without re-doing Wudu.",
        },
        {
          q: "What if I get separated from my group?",
          a: "Do not panic. Proceed to a designated landmark (e.g., a specific numbered gate of Masjid al-Haram) or approach official Haram security personnel who can assist you.",
        },
      ],
      scholarlyDifferences:
        "While the Shafi'i, Maliki, and Hanbali schools consider Wudu mandatory for Tawaf, the Hanafi school views it as an obligatory duty (Wajib) where performing Tawaf without it incurs a penalty (Dam/sacrifice) but does not completely invalidate the Tawaf.",
      completionChecklist: [
        {
          id: "c-1",
          label: "Perform Ghusl & Wear Ihram at/before Miqat",
          optional: false,
        },
        {
          id: "c-2",
          label: "Make Intention & Recite Talbiyah",
          optional: false,
        },
        {
          id: "c-3",
          label: "Enter Masjid al-Haram with Right Foot & Dua",
          optional: false,
        },
        {
          id: "c-4",
          label: "Perform 7 Circuits of Tawaf (Counter-Clockwise)",
          optional: false,
        },
        {
          id: "c-5",
          label: "Pray 2 Rak'ahs behind Maqam Ibrahim",
          optional: false,
        },
        {
          id: "c-6",
          label: "Drink Zamzam & Make Supplication",
          optional: true,
        },
        {
          id: "c-7",
          label: "Perform 7 Trips of Sa'i (Safa to Marwah)",
          optional: false,
        },
        {
          id: "c-8",
          label: "Shave Head (Halq) or Trim Evenly (Taqsir)",
          optional: false,
        },
      ],
      steps: [
        {
          id: "umrah-s1",
          title: "Step 1: Preparation & Ihram at the Miqat",
          location: "At Miqat boundary (or flight departure airport)",
          text: "Before crossing the Miqat boundary, it is Sunnah to perform Ghusl (ritual bath), trim nails, and groom body hair. Men put on two unstitched white sheets (Izar and Rida). Women wear modest, loose Islamic clothing of any respectful color. Once ready, make the formal intention for Umrah and begin reciting the Talbiyah.",
          visualAid:
            "✈️ Airport / Hotel ➔ 🛑 MIQAT BOUNDARY (Enter Ihram here) ➔ 🕋 Makkah",
          arabic: "اللَّهُمَّ لَبَّيْكَ عُمْرَةً",
          transliteration: "Allaahumma labbayka 'Umratan.",
          translation: "O Allah, here I am to perform Umrah.",
          references: ["Sahih al-Bukhari 1561", "Sahih Muslim 1184"],
          tips: [
            "If flying into Jeddah or Taif, put on your Ihram garments before boarding or during the flight before the pilot announces the Miqat crossing.",
          ],
          notes:
            "It is permissible for men to apply non-alcoholic scent to their body (not the garments) before making the intention, but strictly forbidden afterward.",
          scholarlyDifferences:
            "If a pilgrim fears they may be prevented from completing Umrah due to illness or visa issues, they should add the conditional stipulation (Ishtirat): 'O Allah, my place of exiting Ihram is wherever You prevent me.'",
          commonMistakes: [
            "Delaying Ihram until arriving at the hotel inside Makkah when crossing the Miqat by air.",
          ],
        },
        {
          id: "umrah-s2",
          title: "Step 2: The Talbiyah (Chant of the Pilgrim)",
          location: "From Miqat until reaching the Kaaba",
          text: "Once the intention is made, constantly recite the Talbiyah. According to mainstream consensus, men should raise their voices moderately, while women recite softly so that only they or those immediately adjacent can hear. Continue this until you reach the Black Stone to begin Tawaf.",
          visualAid:
            "🗣️ Recite continuously: Walking, riding, resting, arriving.",
          arabic:
            "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
          transliteration:
            "Labbayk Allaahumma labbayk, labbayk laa shareeka laka labbayk. Innal-hamda wan-ni'mata laka wal-mulk, laa shareeka lak.",
          translation:
            "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and grace is Yours, and the dominion. You have no partner.",
          references: ["Sahih al-Bukhari 1549", "Sahih Muslim 1184"],
          tips: [
            "Use this time for internal reflection; avoid idle chatter or excessive phone usage.",
          ],
          notes:
            "The Talbiyah is the unique badge of the pilgrim, symbolizing utter response and submission to Allah's call.",
          scholarlyDifferences:
            "The Hanafi school considers reciting Talbiyah at least once alongside the intention as mandatory for entering Ihram.",
          commonMistakes: [
            "Reciting in a disruptive, shouting manner or chanting in loud, synchronized group choruses.",
          ],
        },
        {
          id: "umrah-s3",
          title: "Step 3: Entering Masjid al-Haram",
          location: "Gates of Masjid al-Haram, Makkah",
          text: "Enter the sacred mosque with your right foot first with humility and reverence. Men should now perform Idtiba (uncovering the right shoulder by placing the middle of the upper Ihram towel under the right armpit and tossing the ends over the left shoulder). Recite the Prophetic entrance supplication.",
          visualAid:
            "🚶‍♂️ Right Foot First ➔ 🤲 Recite Entrance Dua ➔ 👘 Men uncover right shoulder (Idtiba)",
          arabic:
            "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
          transliteration:
            "Bismillaahi, was-salaatu was-salaamu 'alaa Rasoolillaahi, Allaahummaftah lee abwaaba rahmatika.",
          translation:
            "In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, open the gates of Your mercy for me.",
          references: ["Sahih Muslim 713", "Sunan Ibn Majah 771"],
          tips: [
            "Keep your shoes in a secure drawstring bag with you so you do not lose them after completing the rituals.",
          ],
          notes:
            "Do not pray Tahiyyat al-Masjid (greeting the mosque) when arriving for Umrah; your immediate greeting to Masjid al-Haram is to begin Tawaf.",
          scholarlyDifferences:
            "Idtiba is only performed during a Tawaf that is followed by Sa'i. Once Tawaf is done, men must cover both shoulders again.",
          commonMistakes: [
            "Keeping the right shoulder uncovered during regular Salah or throughout the entire trip.",
          ],
        },
        {
          id: "umrah-s4",
          title: "Step 4: Tawaf (Circling the Kaaba)",
          location: "Mataf (Courtyard around the Kaaba)",
          text: "Stop reciting Talbiyah. Approach the Black Stone corner to begin. Ensure the Kaaba is on your left. You will complete 7 counter-clockwise circuits. For men, it is Sunnah to jog at a brisk, purposeful pace (Raml) during the first 3 circuits and walk normally for the remaining 4. When walking between the Yemeni Corner and the Black Stone, recite the prescribed Quranic supplication.",
          visualAid:
            "  ┌─── Yemeni Corner (Touch if possible, do not kiss)\n  │      ↑\n  │    KAABA   ───► Black Stone (Start/End: Point & Say Allahu Akbar)\n  │      ↓\n  └─── Counter-Clockwise (7 Total Circuits)",
          arabic:
            "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration:
            "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa 'adhaaban-naar.",
          translation:
            "Our Lord, grant us the good things in this world and the good things in the next life, and save us from the punishment of the Fire.",
          references: ["Sahih al-Bukhari 1613", "Sunan Abi Dawud 1892"],
          tips: [
            "Do not fight the crowd to touch the Black Stone. Simply raising your right hand, pointing toward it from afar, and saying 'Allahu Akbar' is the established Sunnah when crowded.",
          ],
          notes:
            "You may recite any personal Duas, Quran, or Dhikr during Tawaf; there are no mandatory specific Duas for each individual circuit.",
          scholarlyDifferences:
            "Passing through the Hijr Ismail (the semi-circular wall attached to the Kaaba) invalidates that circuit, as it is historically part of the Kaaba itself.",
          commonMistakes: [
            "Kissing the Yemeni corner or touching the walls/cloth of the Kaaba seeking blessings (Tabarruk) without authentic basis.",
          ],
        },
        {
          id: "umrah-s5",
          title: "Step 5: Maqam Ibrahim (Station of Abraham)",
          text: "After completing 7 circuits, cover your right shoulder completely. Proceed toward Maqam Ibrahim. It is Sunnah to recite the verse below while approaching. If space permits without obstructing traffic, pray 2 short Rak'ahs behind the Maqam (or anywhere in the mosque if crowded). In the 1st Rak'ah, recite Surah Al-Kafirun, and in the 2nd, Surah Al-Ikhlas.",
          location: "Behind Maqam Ibrahim (or anywhere in Masjid al-Haram)",
          visualAid:
            "🕋 Kaaba ➔ 📍 Maqam Ibrahim ➔ 🧎‍♂️ Pray 2 Rak'ahs behind it (or further back)",
          arabic: "وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى",
          transliteration: "Wattakhithoo min maqaami Ibraaheema musallan.",
          translation: "And take the Station of Abraham as a place of prayer.",
          references: ["Quran 2:125", "Sahih Muslim 1218"],
          tips: [
            "Do not stand directly behind Maqam Ibrahim if it causes a bottleneck or forces guards to move you; praying anywhere in the Haram fulfills the Sunnah.",
          ],
          notes:
            "These two Rak'ahs are considered a strong Sunnah (Sunnah Mu'akkadah) by the majority, and Wajib by the Hanafi school.",
          scholarlyDifferences:
            "If a prayer time is called immediately after Tawaf, praying the obligatory congregation prayer suffices for these two Rak'ahs according to several scholars.",
          commonMistakes: [
            "Stopping abruptly in the middle of the moving Mataf crowd to perform this prayer.",
          ],
        },
        {
          id: "umrah-s6",
          title: "Step 6: Zamzam & Sa'i (Safa and Marwah)",
          location: "Masa'a (Gallery between Mount Safa and Mount Marwah)",
          text: "It is a blessed practice to drink Zamzam water and supplicate before proceeding to Mount Safa. At Safa, face the Kaaba, raise your hands, and recite the praise of Allah. Walk toward Marwah. Men should run briskly between the green indicator lights. Arriving at Marwah completes 1 trip. Returning to Safa is trip 2. Complete 7 trips, finishing at Mount Marwah.",
          visualAid:
            "🟢 [Men Run Here] 🟢\n▲ 1, 3, 5, 7          ▲ 2, 4, 6\nSAFA ────────────────────────► MARWAH\n     ◄────────────────────────\n(Start at Safa ➔ Finish 7th trip at Marwah)",
          arabic:
            "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ ۖ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ",
          transliteration:
            "Innas-safaa wal-marwata min sha'aa'irillaah. Abda'u bimaa bada'allaahu bihi.",
          translation:
            "Indeed, as-Safa and al-Marwah are among the symbols of Allah. I begin with that which Allah began with.",
          references: ["Quran 2:158", "Sahih Muslim 1218"],
          tips: [
            "Wudu is highly recommended for Sa'i, but if it breaks during the walk, you may continue validly without re-performing Wudu.",
          ],
          notes:
            "The recitation of starting with Safa ('Abda'u bimaa...') is only spoken once when approaching Safa for the very first trip.",
          scholarlyDifferences:
            "The majority of scholars hold that Sa'i is an essential pillar/obligation of Umrah that cannot be omitted.",
          commonMistakes: [
            "Counting a round trip (Safa to Marwah and back to Safa) as 1 circuit instead of 2.",
          ],
        },
        {
          id: "umrah-s7",
          title: "Step 7: Halq or Taqsir (Shaving/Trimming Hair)",
          location: "Barbershops around Haram or at hotel",
          text: "To conclude Umrah and exit Ihram, men should shave their heads completely (Halq—which is most virtuous) or trim their hair evenly all over (Taqsir). Women gather their hair together and cut a small portion equal to the length of a fingertip. Upon doing this, your Umrah is complete, and all Ihram restrictions are lifted!",
          visualAid:
            "✂️ Men: Shave completely (preferred) or trim evenly across entire head.\n💇‍♀️ Women: Gather hair at the back and cut 1-2 cm (fingertip length).",
          arabic: "اللَّهُمَّ اغْفِرْ لِلْمُحَلِّقِينَ",
          transliteration: "Allaahummaghfir lil-muhalliqeen.",
          translation:
            "O Allah, forgive those who shave their heads. (The Prophet ﷺ prayed for those who shaved three times, and once for those who trimmed).",
          references: ["Sahih al-Bukhari 1727", "Sahih Muslim 1301"],
          tips: [
            "Use licensed barbershops outside the Haram courtyard for hygienic and safe shaving with clean blades.",
          ],
          notes:
            "You must trim or shave hair from all areas of the head, not just clipping a few strands from one side.",
          scholarlyDifferences:
            "If a man has no hair (bald), it is Sunnah according to the majority (and mandatory in some schools) to pass a razor safely over the scalp.",
          commonMistakes: [
            "Women uncovering their hair in public viewing areas to cut it; this should be done privately in a restroom or hotel room.",
          ],
        },
      ],
    },
    {
      id: "hajj-tamattu-guide",
      title: "Hajj Masterclass (Hajj al-Tamattu')",
      desc: "Hajj al-Tamattu' is the most widely practiced form of pilgrimage. It involves performing Umrah first, exiting Ihram, and re-entering Ihram on the 8th of Dhul-Hijjah for Hajj.",
      disclaimer:
        "This masterclass outlines the mainstream Sunni sequence of Hajj rituals. Concessions exist for the elderly, ill, and women, which are detailed in scholarly literature.",
      estimatedDuration: {
        reading: "30 min",
        actual: "5 to 6 Days (8th to 12th/13th Dhul-Hijjah)",
      },
      difficulty: "advanced",
      recommendedFor: ["All Hajj pilgrims", "Group leaders"],
      requiresGuide: true,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Fiqh Advisory Board",
      requiredItems: [
        "Hajj Visa & Official Identification Wristband/Card",
        "2 Sets of Ihram sheets (for men)",
        "Sleeping sleeping bag or lightweight camp mat for Muzdalifah",
        "Pebble collection pouch",
        "Unscented sunblock, lip balm, and toiletries",
        "Comfortable, pre-worn walking footwear",
        "Electrolyte sachets & prescribed medications",
      ],
      commonMistakes: [
        "Leaving the boundaries of Arafah before the sun has completely set on the 9th day.",
        "Throwing shoes, large rocks, or angrily cursing at the Jamarat pillars.",
        "Wasting the precious afternoon hours of Arafah in casual socializing, sleeping, or food lines.",
        "Failing to spend the required portion of the night in Mina during the days of Tashreeq.",
      ],
      emergencyNotes: [
        {
          q: "What if I fall ill and cannot physically reach Arafah on the 9th?",
          a: "Standing in Arafah is the absolute core pillar of Hajj ('Hajj is Arafah'). Even if brought for a moment in an ambulance or wheelchair between Dhuhr on the 9th and Fajr of the 10th, the Hajj is valid. Missing it entirely invalidates the Hajj.",
        },
        {
          q: "What if crowds prevent me from stoning Jamarat al-Aqabah on the 10th morning?",
          a: "Scholarly consensus permits delaying the stoning until the afternoon, evening, or night of the 10th to avoid extreme crowd crushes or harm.",
        },
        {
          q: "What if an elderly or sick person cannot perform stoning at all?",
          a: "It is established Fiqh that a valid proxy (someone performing Hajj who stones for themselves first) can throw pebbles on behalf of the weak, elderly, ill, or pregnant women.",
        },
      ],
      scholarlyDifferences:
        "Regarding the overnight stay in Muzdalifah: The Shafi'i and Hanbali schools allow the weak, elderly, and women (and those accompanying them) to depart Muzdalifah for Mina after midnight/moon-set, whereas others recommend staying until just before dawn.",
      isSpecialGuide: true,
      heroImage:
        "https://images.unsplash.com/photo-1565552643954-b4bf0b4c1aa5?auto=format&fit=crop&q=80&w=1000",
      timeline: [
        {
          day: "Day 8 (Tarwiyah)",
          title: "Enter Ihram & Proceed to Mina",
          desc: "Bathe, put on Ihram from Makkah accommodation, make intention for Hajj, and travel to Mina. Pray Dhuhr, Asr, Maghrib, Isha, and Fajr (of 9th) there, shortening 4-Rak'ah prayers to 2 without combining.",
        },
        {
          day: "Day 9 ('Arafah)",
          title: "The Greatest Day: Standing at Arafah",
          desc: "After sunrise, move to Arafah. Pray Dhuhr & Asr combined and shortened behind the Imam or in tents. Spend the entire afternoon until sunset in intense, tearful supplication, facing the Qiblah.",
        },
        {
          day: "Night 9 (Muzdalifah)",
          title: "Overnight under the Stars",
          desc: "Depart Arafah calmly after sunset without praying Maghrib. Upon arrival in Muzdalifah, combine Maghrib (3 Rak'ahs) and Isha (shortened to 2 Rak'ahs). Collect pebble stones and rest.",
        },
        {
          day: "Day 10 (An-Nahr)",
          title: "The Day of Sacrifice & Eid",
          desc: "After Fajr, return to Mina. Stone the largest pillar (Jamarat al-Aqabah) with 7 pebbles. Slaughter the sacrificial animal (Hadi), shave/trim hair, and proceed to Makkah for Tawaf al-Ifadah.",
        },
        {
          day: "Days 11-13 (Tashreeq)",
          title: "Stoning the Three Pillars in Mina",
          desc: "Stay overnight in Mina. Each afternoon after Dhuhr time begins, stone all three pillars (Small, Middle, Large) with 7 pebbles each (21 daily). Make long Dua after the first two.",
        },
        {
          day: "Departure",
          title: "Tawaf al-Wida (Farewell Tawaf)",
          desc: "Perform the final 7 circuits of Tawaf around the Kaaba just before departing Makkah for your home country. No Sa'i or Ihram required.",
        },
      ],
      completionChecklist: [
        {
          id: "h-1",
          label: "Day 8: Enter Ihram & Stay overnight in Mina",
          optional: false,
        },
        {
          id: "h-2",
          label: "Day 9: Stand in Arafah until sunset (CORE PILLAR)",
          optional: false,
        },
        {
          id: "h-3",
          label: "Night 9: Stay overnight & pray in Muzdalifah",
          optional: false,
        },
        {
          id: "h-4",
          label: "Day 10: Stone Jamarat al-Aqabah (7 pebbles)",
          optional: false,
        },
        {
          id: "h-5",
          label: "Day 10: Offer Animal Sacrifice (Hadi)",
          optional: false,
        },
        {
          id: "h-6",
          label: "Day 10: Shave Head (Halq) or Trim (Taqsir)",
          optional: false,
        },
        {
          id: "h-7",
          label: "Day 10: Perform Tawaf al-Ifadah & Sa'i (CORE PILLAR)",
          optional: false,
        },
        {
          id: "h-8",
          label:
            "Days 11-12/13: Stay overnight in Mina & Stone all 3 pillars daily",
          optional: false,
        },
        {
          id: "h-9",
          label: "Departure: Perform Tawaf al-Wida (Farewell Tawaf)",
          optional: false,
        },
      ],
      steps: [
        {
          id: "hajj-s1",
          title: "Step 1: The 8th Day - Tarwiyah in Mina",
          location: "Makkah hotel to Mina Tent City",
          text: "On the morning of the 8th of Dhul-Hijjah, perform Ghusl, put on your Ihram garments at your residence in Makkah, and declare the intention for Hajj. Proceed to Mina. You will remain here for the day and night, performing five prayers: Dhuhr, Asr, Maghrib, Isha, and Fajr of the 9th day. Shorten Dhuhr, Asr, and Isha to 2 Rak'ahs, but perform them at their normal times without combining.",
          visualAid:
            "🏨 Makkah Hotel (Enter Ihram) ➔ ⛺ MINA TENT CITY (Pray 5 prayers shortened, not combined)",
          arabic: "اللَّهُمَّ لَبَّيْكَ حَجًّا",
          transliteration: "Allaahumma labbayka Hajjan.",
          translation: "O Allah, here I am to perform Hajj.",
          references: ["Sahih al-Bukhari 1561", "Sahih Muslim 1218"],
          tips: [
            "Use your time in the Mina tent to rest, hydrate, and prepare mentally and spiritually for the monumental Day of Arafah.",
          ],
          notes:
            "Going to Mina on the 8th day is a highly established Sunnah; if a pilgrim is taken directly to Arafah by their tour group due to logistics, their Hajj remains valid.",
          scholarlyDifferences:
            "All four Sunni schools agree that shortening prayers in Mina on the 8th is Sunnah for travelers and pilgrims alike.",
        },
        {
          id: "hajj-s2",
          title: "Step 2: The 9th Day - Standing at Arafah",
          location: "Plains of Arafah",
          text: "After sunrise on the 9th, move from Mina to Arafah. This standing (Wuquf) is the supreme pillar of Hajj. Listen to the Khutbah and pray Dhuhr and Asr combined and shortened (2 Rak'ahs each) at Dhuhr time. Spend the entire afternoon until sunset standing or sitting, facing the Qiblah, raising your hands in humble supplication, Dhikr, and repentance.",
          visualAid:
            "⛺ Mina ➔ ⛰️ PLAINS OF ARAFAH (Combine Dhuhr/Asr ➔ Intense Dua until Sunset)",
          arabic:
            "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
          transliteration:
            "Laa ilaaha illallaahu wahdahu laa shareeka lahu, lahul-mulku, wa lahul-hamdu, wa Huwa 'alaa kulli shay'in Qadeer.",
          translation:
            "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. (The best Dua on the Day of Arafah).",
          references: ["Sunan At-Tirmidhi 3585", "Sahih Muslim 1218"],
          tips: [
            "Ensure you are physically within the marked boundaries of Arafah; staying outside the boundary boards invalidates the Hajj.",
          ],
          notes:
            "You do not need to climb Jabal ar-Rahmah (the Mount of Mercy); standing anywhere within the boundaries of Arafah completely fulfills the obligation.",
          scholarlyDifferences:
            "If a person departs Arafah before sunset without returning, the Hanafi, Maliki, and Hanbali schools require a compensatory blood sacrifice (Dam), though the Hajj is valid.",
        },
        {
          id: "hajj-s3",
          title: "Step 3: The Night of the 9th - Muzdalifah",
          location: "Open plains of Muzdalifah",
          text: "Immediately after the sun sets completely, depart Arafah for Muzdalifah with calmness and dignity. Do not pray Maghrib in Arafah. Upon arriving in Muzdalifah, pray Maghrib (3 Rak'ahs) and Isha (shortened to 2 Rak'ahs) combined with one Adhan and two Iqamahs. Rest and sleep under the open sky. Collect pebble stones (about the size of a chickpea) for the stoning rituals.",
          visualAid:
            "⛰️ Arafah (Depart after sunset) ➔ 🌌 MUZDALIFAH (Combine Maghrib/Isha ➔ Sleep ➔ Collect Pebbles)",
          arabic:
            "فَإِذَا أَفَضْتُمْ مِنْ عَرَفَاتٍ فَاذْكُرُوا اللَّهَ عِنْدَ الْمَشْعَرِ الْحَرَامِ",
          transliteration:
            "Fa'idhaa afadtum min 'Arafaatin fadhkurullaha 'indal-mash'aril-haraam.",
          translation:
            "But when you depart from 'Arafat, remember Allah at al-Mash'ar al-Haram (Muzdalifah).",
          references: ["Quran 2:198", "Sahih Muslim 1218"],
          tips: [
            "Collect around 49 to 70 pebbles here so you do not have to search for stones in the crowded camp of Mina later.",
          ],
          notes:
            "Pray Fajr at the earliest primary time in Muzdalifah, stand making Dua until the sky brightens, and depart for Mina just before sunrise.",
          scholarlyDifferences:
            "The Shafi'i and Hanbali schools permit women, the elderly, and the infirm to leave Muzdalifah after midnight to avoid morning crowd congestion.",
        },
        {
          id: "hajj-s4",
          title: "Step 4: The 10th Day - Stoning Jamarat al-Aqabah",
          location: "Jamarat Complex, Mina",
          text: "On the morning of Eid (10th Dhul-Hijjah), proceed to Mina's Jamarat complex. Today, you only stone the largest pillar (Jamarat al-Aqabah, the one closest to Makkah). Throw 7 pebbles individually into the basin, saying 'Allahu Akbar' with each throw. Stop reciting the Talbiyah with the throw of the first pebble.",
          visualAid:
            "🪨 Throw 7 Pebbles ONE BY ONE at Large Pillar (Jamarat al-Aqabah):\n[Pebble 1: Allahu Akbar] ➔ [Pebble 2: Allahu Akbar] ➔ ... ➔ [Pebble 7: Allahu Akbar]",
          arabic: "اللَّهُ أَكْبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          references: ["Sahih al-Bukhari 1754", "Sahih Muslim 1218"],
          tips: [
            "Ensure the pebble lands inside the walled basin around the pillar; hitting the pillar itself is not necessary as long as the stone drops into the basin.",
          ],
          notes:
            "Use smooth, small pebbles (size of a bean or chickpea); throwing large rocks or shoes is an extreme innovation and forbidden.",
          scholarlyDifferences:
            "If a pebble bounces out of the basin, it does not count; throw a replacement pebble from your backup supply.",
        },
        {
          id: "hajj-s5",
          title: "Step 5: The 10th Day - Sacrifice, Shave, and Tawaf",
          location: "Mina / Makkah",
          text: "After stoning, execute the animal sacrifice (Hadi)—most pilgrims do this via official electronic coupon systems. Next, men shave their heads completely (Halq) or trim evenly (Taqsir), and women cut a fingertip's length. You now enter primary partial exit from Ihram (Tahallul al-Asghar), where normal clothes and scents are lawful, but marital intimacy remains forbidden. Travel to Makkah to perform Tawaf al-Ifadah (the mandatory Hajj Tawaf) and Sa'i. Upon completion, full exit from Ihram (Tahallul al-Akbar) is achieved.",
          visualAid:
            "1️⃣ Stone Pillar ➔ 2️⃣ Sacrifice (Coupon) ➔ 3️⃣ Shave/Trim Hair [Partial Ihram Exit] ➔ 4️⃣ Tawaf al-Ifadah & Sa'i in Makkah [Full Ihram Exit]",
          arabic:
            "ثُمَّ لْيَقْضُوا تَفَثَهُمْ وَلْيُوفُوا نُذُورَهُمْ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ",
          transliteration:
            "Thummal-yaqdoo tafathahum walyoofoo nudhoorahum walyattawwafoo bil-baytil-'ateeq.",
          translation:
            "Then let them end their untidiness and fulfill their vows and perform Tawaf around the ancient House.",
          references: ["Quran 22:29", "Sahih al-Bukhari 1721"],
          tips: [
            "Do not rush to perform Tawaf al-Ifadah on the 10th morning if you are exhausted; it can validly be performed over the following days of Tashreeq.",
          ],
          notes:
            "The order of rituals on the 10th (Stoning, Sacrifice, Shaving, Tawaf) is Sunnah, but the Prophet ﷺ stated there is no harm or sin if a pilgrim alters the sequence due to difficulty.",
          scholarlyDifferences:
            "The Hanafi school holds that strictly maintaining the order of Stoning, Sacrifice, and Shaving is obligatory, whereas the majority consider it recommended.",
        },
        {
          id: "hajj-s6",
          title: "Step 6: Days 11, 12, 13 - Ayyam at-Tashreeq",
          location: "Jamarat Complex & Tent City, Mina",
          text: "Return to Mina to spend the nights of the 11th and 12th (and optionally the 13th). On each afternoon after Dhuhr time begins, proceed to stone all three pillars. Start with the Smallest Pillar (al-Sughra), then the Middle Pillar (al-Wusta), and finish with the Largest Pillar (al-Aqabah). Throw 7 pebbles at each (21 total daily). After the Small and Middle pillars, step aside, face the Qiblah, and make long supplications. Do not make Dua after the Large pillar.",
          visualAid:
            "Daily Afternoon Stoning Sequence (21 Pebbles Total):\n1️⃣ Small Pillar (7 stones) ➔ 🤲 Step aside & make long Dua\n2️⃣ Middle Pillar (7 stones) ➔ 🤲 Step aside & make long Dua\n3️⃣ Large Pillar (7 stones) ➔ 🚶‍♂️ Depart immediately without stopping for Dua",
          arabic:
            "وَاذْكُرُوا اللَّهَ فِي أَيَّامٍ مَعْدُودَاتٍ ۚ فَمَنْ تَعَجَّلَ فِي يَوْمَيْنِ فَلَا إِثْمَ عَلَيْهِ وَمَنْ تَأَخَّرَ فَلَا إِثْمَ عَلَيْهِ",
          transliteration:
            "Wadhkurullaha fee ayyaamin ma'doodaatin. Faman ta'ajjala fee yawmayni falaa ithma 'alayhi wa man ta'akhkhara falaa ithma 'alayh.",
          translation:
            "And remember Allah during [specific] numbered days. Then whoever hastens [his departure] in two days - there is no sin upon him; and whoever delays [until the third] - there is no sin upon him.",
          references: ["Quran 2:203", "Sahih al-Bukhari 1751"],
          tips: [
            "If you choose to leave Mina after two days (hastening on the 12th), you must depart the boundaries of Mina before sunset on the 12th.",
          ],
          notes:
            "Stoning on the days of Tashreeq must be done after Dhuhr time (太阳 transition); stoning in the morning before Dhuhr is invalid according to the vast majority of scholars.",
          scholarlyDifferences:
            "Due to severe crowd pressures in modern times, several contemporary fiqh councils allow stoning during the evening and night hours of these days.",
        },
        {
          id: "hajj-s7",
          title: "Step 7: Tawaf al-Wida (Farewell Tawaf)",
          location: "Masjid al-Haram, Makkah",
          text: "When you have completed all Mina rituals and are ready to depart Makkah for your home country or Madinah, perform Tawaf al-Wida (Farewell Tawaf). This consists of 7 circuits around the Kaaba without Ihram garments and without Sa'i afterward. Pray 2 Rak'ahs behind Maqam Ibrahim. This must be your final major engagement in Makkah.",
          visualAid:
            "🧳 Pack Bags & Conclude Stay ➔ 🕋 Perform 7 Circuits of Farewell Tawaf ➔ 🚗 Depart Makkah immediately",
          arabic:
            "لَا يَنْفِرَنَّ أَحَدٌ حَتَّى يَكُونَ آخِرُ عَهْدِهِ بِالْبَيْتِ",
          transliteration:
            "Laa yanfiranna ahadun hattaa yakoona aakhiru 'ahdihi bil-bayt.",
          translation:
            "None of you should depart until he makes his last act Tawaf of the House.",
          references: ["Sahih Muslim 1327", "Sahih al-Bukhari 1755"],
          tips: [
            "Do not go shopping or dining after Tawaf al-Wida; buying quick provisions or waiting for your travel bus is permissible.",
          ],
          notes:
            "Women experiencing menstruation or post-natal bleeding are completely excused from Tawaf al-Wida and may depart Makkah without any penalty or sacrifice.",
          scholarlyDifferences:
            "The Maliki school views Tawaf al-Wida as a highly recommended Sunnah, while the Hanafi, Shafi'i, and Hanbali schools categorize it as an obligatory duty (Wajib) requiring a blood sacrifice if omitted without valid excuse.",
        },
      ],
    },
    {
      id: "ihram-rules-restrictions",
      title: "The Rules & Prohibitions of Ihram",
      desc: "Ihram is a sacred spiritual and physical threshold. Master the boundaries, etiquettes, and strict prohibitions applied once intention and Talbiyah are combined.",
      disclaimer:
        "If a prohibited act is committed out of true forgetfulness, sleep, or compulsion, mainstream Sunni consensus holds that there is no sin or penalty upon the pilgrim.",
      estimatedDuration: {
        reading: "12 min",
        actual: "Applicable throughout the entire Ihram state",
      },
      difficulty: "beginner",
      recommendedFor: ["All pilgrims", "First-time travelers"],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Fiqh Advisory Board",
      requiredItems: [
        "Unscented liquid soap or bar",
        "Unscented deodorant or petroleum jelly (for chafing prevention)",
        "Safety pins or Ihram belt (to secure the bottom sheet)",
        "Unscented wet wipes",
      ],
      commonMistakes: [
        "Using scented hotel soaps, shampoos, or wet wipes after declaring Ihram intention.",
        "Men wearing stitched boxer shorts or underwear beneath their Ihram towel.",
        "Covering the head or face with blankets or towels while sleeping in Ihram (for men).",
        "Engaging in heated arguments, political debates, or aggressive shoving in crowds.",
      ],
      emergencyNotes: [
        {
          q: "What if I accidentally use scented soap or wear a stitched shirt out of forgetfulness?",
          a: "Remove the stitched item or wash off the scent immediately upon remembering. By mainstream consensus, there is no penalty or sacrifice required for genuine forgetfulness or ignorance.",
        },
        {
          q: "What if I am forced to wear stitched clothes or cover my head due to severe illness or cold?",
          a: "You may do so, but you must pay a compensation (Fidyah) by choosing one of three options: fast for 3 days, feed 6 poor people, or slaughter a sheep in Makkah.",
        },
      ],
      scholarlyDifferences:
        "Regarding men's footwear: The Hanafi school requires footwear that leaves the top instep bone of the foot exposed. The Hanbali and Shafi'i schools permit open-toed sandals and allow cutting regular shoes below the ankle if sandals are unavailable.",
      sunnahs: [
        "Perform Ghusl (thorough ritual bath) before donning Ihram garments.",
        "Trim nails, shape mustache, and remove underarm and pubic hair before Ihram.",
        "Apply fine perfume to the body and scalp before making the formal intention.",
        "Pray two Rak'ahs of Sunnah or an obligatory prayer before declaring intention.",
      ],
      mistakes: [
        "Believing that changing into a fresh, clean set of Ihram towels is forbidden.",
        "Believing that using an umbrella or sitting under a tent roof violates head-covering rules.",
        "Women believing they must wear specific colors like white or green (any modest color is lawful).",
      ],
      completionChecklist: [
        {
          id: "ir-1",
          label: "No trimming, pulling, or shaving hair from body",
          optional: false,
        },
        {
          id: "ir-2",
          label: "No clipping fingernails or toenails",
          optional: false,
        },
        {
          id: "ir-3",
          label: "No perfumes, scents, or scented hygiene products",
          optional: false,
        },
        {
          id: "ir-4",
          label: "No tailored/stitched garments or underwear (for men)",
          optional: false,
        },
        {
          id: "ir-5",
          label: "No caps, hats, or direct head coverings (for men)",
          optional: false,
        },
        {
          id: "ir-6",
          label: "No face veils (Niqab) touching skin or gloves (for women)",
          optional: false,
        },
        {
          id: "ir-7",
          label: "No hunting land animals or cutting Haram vegetation",
          optional: false,
        },
        {
          id: "ir-8",
          label: "No marital intimacy, foreplay, or marriage proposals",
          optional: false,
        },
      ],
      steps: [
        {
          id: "ihram-r1",
          title: "Rule 1: Preservation of Hair & Nails",
          text: "A pilgrim in Ihram is prohibited from clipping, cutting, shaving, or intentionally plucking hair from any part of the body, as well as clipping fingernails or toenails. If a nail tears painfully or a hair falls out naturally during washing without deliberate pulling, there is no sin or penalty.",
          arabic:
            "وَلَا تَحْلِقُوا رُءُوسَكُمْ حَتَّىٰ يَبْلُغَ الْهَدْيُ مَحِلَّهُ",
          transliteration:
            "Wa laa tahliqoo ru'oosakum hattaa yablughal-hadyu mahillah.",
          translation:
            "And do not shave your heads until the sacrificial animal has reached its place of slaughter.",
          references: ["Quran 2:196", "Sahih al-Bukhari 1814"],
          tips: [
            "Clip all nails and groom thoroughly at home or at the airport before entering Ihram.",
          ],
          notes:
            "Gently scratching the scalp during washing is permissible as long as you do not vigorously pull hair out.",
        },
        {
          id: "ihram-r2",
          title: "Rule 2: Complete Avoidance of Scents & Perfumes",
          text: "It is strictly forbidden to apply perfume, cologne, scented oils, or to use scented soaps, shampoos, detergents, and scented wet wipes. You must also avoid intentionally smelling perfumes or touching scented cloths (like the perfumed coverings of the Kaaba). Unscented hygiene products are fully permissible.",
          arabic: "وَلَا تَمَسُّوا طِيبًا",
          transliteration: "Wa laa tamassoo teeban.",
          translation: "And do not touch (apply) any perfume.",
          references: ["Sahih al-Bukhari 1838", "Sahih Muslim 1177"],
          tips: [
            "Buy dedicated unscented baby wipes and unscented bar soaps before traveling.",
          ],
          notes:
            "If scent remains on your skin from *before* you made the intention, it is harmless and does not affect your Ihram.",
        },
        {
          id: "ihram-r3",
          title: "Rule 3: Garment Restrictions for Men",
          text: "Men are prohibited from wearing clothing tailored or stitched to fit the limbs or torso—this includes shirts, trousers, underwear, boxer shorts, vests, and socks. They must wear unstitched sheets (Izar and Rida). Men are also prohibited from covering their heads with caps, turbans, or cloths resting directly on the head. Using an umbrella or standing under a roof is lawful.",
          arabic:
            "لَا يَلْبَسُ الْمُحْرِمُ الْقَمِيصَ وَلَا الْعِمَامَةَ وَلَا السَّرَاوِيلَ وَلَا الْبُرْنُسَ وَلَا الْخِفَافَ",
          transliteration:
            "Laa yalbasul-muhrimul-qameesa wa lal-'imaamata wa las-saraaweela wa lal-burnusa wa lal-khifaaf.",
          translation:
            "The Muhrim (pilgrim in Ihram) should not wear a shirt, nor a turban, nor trousers, nor hooded cloaks, nor leather socks.",
          references: ["Sahih al-Bukhari 1542", "Sahih Muslim 1177"],
          tips: [
            "Invest in a heavy-duty Ihram belt or safety pins to keep the lower towel securely fastened around your waist.",
          ],
          notes:
            "Wearing a watch, glasses, rings, earpieces, or a money belt/pouch is unanimously permitted.",
        },
        {
          id: "ihram-r4",
          title: "Rule 4: Garment Rules for Women",
          text: "Women in Ihram wear normal, modest Islamic clothing of any color that fulfills Hijab requirements. They are specifically prohibited from wearing gloves and from wearing the tailored face veil (Niqab) that is tied or stitched to fit the face. If passing through crowds of non-Mahram men, women may draw a head-covering or shawl down over their faces.",
          arabic:
            "لَا تَنْتَقِبُ الْمَرْأَةُ الْمُحْرِمَةُ وَلَا تَلْبَسُ الْقُفَّازَيْنِ",
          transliteration:
            "Laa tantaqibul-mar'atul-muhrimatu wa laa talbasul-quffaazayn.",
          translation:
            "A woman in Ihram should not wear a Niqab (tied face veil) nor wear gloves.",
          references: ["Sahih al-Bukhari 1838", "Sunan Abi Dawud 1827"],
          tips: [
            "Choose breathable, lightweight cotton clothing to avoid heat exhaustion during long walking rituals.",
          ],
          notes:
            "There is no requirement for women to wear white; black or other modest colors are standard and acceptable.",
        },
        {
          id: "ihram-r5",
          title: "Rule 5: Sanctity of Behavior, Life & Environment",
          text: "Ihram enforces universal peace. It is strictly forbidden to engage in sexual intimacy, kissing, touching with desire, foreplay, or marriage proposals. Furthermore, arguing, cursing, fighting, or abusing others is forbidden. Pilgrims must also not hunt land animals or cut, uproot, or damage the living trees and plants within the sacred sanctuary (Haram) of Makkah.",
          arabic:
            "فَمَنْ فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ",
          transliteration:
            "Faman farada feehinnal-hajja falaa rafatha wa laa fusooqa wa laa jidaala fil-hajj.",
          translation:
            "So whoever has made Hajj obligatory upon himself therein, there is to be for him no sexual relations and no disobedience and no disputing during Hajj.",
          references: ["Quran 2:197", "Sahih al-Bukhari 1814"],
          tips: [
            "When tested by crowd pushing or rude behavior, simply lower your gaze, smile, and say 'Salam' (Peace).",
          ],
          notes:
            "Killing harmful pests that pose danger (such as scorpions, rats, rabid dogs, or mosquitoes) is permitted in Ihram.",
        },
      ],
    },
    {
      id: "hajj-umrah-essential-duas",
      title: "Essential Duas for Tawaf & Sa'i",
      desc: "A curated compendium of authentic supplications reported from Prophet Muhammad ﷺ during Tawaf and Sa'i rituals.",
      disclaimer:
        "Aside from the specific supplications between the Yemeni corner and Black Stone, and atop Safa/Marwah, there are no fixed, mandatory Duas for each round of Tawaf.",
      estimatedDuration: {
        reading: "15 min",
        actual: "Recited throughout Tawaf and Sa'i",
      },
      difficulty: "beginner",
      recommendedFor: [
        "All pilgrims",
        "Those wanting authentic Sunnah prayers",
      ],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Fiqh Advisory Board",
      requiredItems: ["Pocket Dua booklet or Tawfiq App Offline Mode"],
      summaryTable: [
        {
          pos: "Black Stone Start",
          arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
          mean: "In the name of Allah, Allah is the Greatest",
        },
        {
          pos: "Yemeni Corner to Black Stone",
          arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً...",
          mean: "Our Lord, grant us good in this world & Hereafter...",
        },
        {
          pos: "Approaching Mount Safa",
          arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ...",
          mean: "Indeed, Safa and Marwah are among Allah's symbols...",
        },
        {
          pos: "Atop Safa & Marwah",
          arabic: "اللَّهُ أَكْبَرُ (٣x) لَا إِلَهَ إِلَّا اللَّهُ...",
          mean: "Allah is Great (3x). None has the right to be worshipped...",
        },
      ],
      completionChecklist: [
        {
          id: "ed-1",
          label: "Memorize or bookmark Black Stone Takbir",
          optional: false,
        },
        {
          id: "ed-2",
          label: "Memorize Quranic Yemeni Corner Dua (Rabbana aatina)",
          optional: false,
        },
        {
          id: "ed-3",
          label: "Review Mount Safa entrance verse",
          optional: false,
        },
        {
          id: "ed-4",
          label: "Practice 3x Dhikr formula for Safa and Marwah peaks",
          optional: false,
        },
      ],
      steps: [
        {
          id: "duas-s1",
          title: "1. At the Black Stone (Hajr al-Aswad)",
          location: "Start/End line of each Tawaf circuit",
          text: "At the start of every circuit of Tawaf, face or point your right hand toward the Black Stone and declare the name and greatness of Allah.",
          visualAid:
            "👉 Point Right Palm toward Black Stone ➔ Say: Bismillahi wallahu Akbar",
          arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
          transliteration: "Bismillaahi, wallaahu Akbar.",
          translation: "In the name of Allah, and Allah is the Most Great.",
          references: ["Sahih al-Bukhari 1613", "Sunan At-Tirmidhi 859"],
          tips: [
            "Do not kiss your hand after pointing from afar; simply point and recite.",
          ],
          notes:
            "If you are able to physically touch or kiss the stone without pushing others, say 'Allahu Akbar'.",
        },
        {
          id: "duas-s2",
          title: "2. Between Yemeni Corner & Black Stone",
          location: "Final corridor of each Tawaf circuit",
          text: "During every circuit, as you walk between the third corner (Rukn al-Yamani) and the fourth corner (Black Stone), constantly recite this comprehensive Quranic supplication.",
          visualAid:
            "🚶‍♂️ Walking from Yemeni Corner ➔ Black Stone:\nRecite: Rabbana aatina fid-dunya hasanah...",
          arabic:
            "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration:
            "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa 'adhaaban-naar.",
          translation:
            "Our Lord, grant us the good things in this world and the good things in the next life, and save us from the punishment of the Fire.",
          references: ["Quran 2:201", "Sunan Abi Dawud 1892"],
          tips: [
            "This is the only fixed Sunnah supplication tied to a specific location during Tawaf.",
          ],
          notes:
            "If you pass close to the Yemeni corner, touch it with your right hand or both hands without kissing it or kissing your hands. If far, do not point to it.",
        },
        {
          id: "duas-s3",
          title: "3. Approaching Mount Safa for Sa'i",
          location: "Foot of Mount Safa (Before Trip 1)",
          text: "When approaching Mount Safa to commence your Sa'i after completing Tawaf and praying at Maqam Ibrahim, recite this Quranic verse once.",
          visualAid:
            "🚶‍♂️ Approaching Safa rocks ➔ Recite: Innas-safaa wal-marwata...",
          arabic:
            "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ ۖ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ",
          transliteration:
            "Innas-safaa wal-marwata min sha'aa'irillaah. Abda'u bimaa bada'allaahu bihi.",
          translation:
            "Indeed, as-Safa and al-Marwah are among the symbols of Allah. I begin with that which Allah began with.",
          references: ["Quran 2:158", "Sahih Muslim 1218"],
          tips: [
            "Do not repeat this verse when approaching Marwah or on subsequent trips; it is Sunnah only at the very initiation at Safa.",
          ],
          notes:
            "This establishes that our rituals are directly anchored in divine scripture.",
        },
        {
          id: "duas-s4",
          title: "4. Standing atop Safa and Marwah",
          location: "On the rocks/elevation of Safa and Marwah",
          text: "When standing on Mount Safa and Mount Marwah, turn to face the Kaaba, raise your hands in supplication, and recite the formula below three times. Between each of the three recitations, make extensive personal Dua for whatever you desire.",
          visualAid:
            "🤲 Face Kaaba ➔ Recite Dhikr Formula ➔ Make Personal Dua ➔ Recite Formula ➔ Make Dua ➔ Recite Formula",
          arabic:
            "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ. لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ",
          transliteration:
            "Allaahu Akbar, Allaahu Akbar, Allaahu Akbar. Laa ilaaha illallaahu wahdahu laa shareeka lahu, lahul-mulku, wa lahul-hamdu, wa Huwa 'alaa kulli shay'in Qadeer. Laa ilaaha illallaahu wahdahu, anjaza wa'dahu, wa nasara 'abdahu, wa hazamal-ahzaaba wahdahu.",
          translation:
            "Allah is the Most Great (3x). None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. None has the right to be worshipped but Allah alone. He fulfilled His promise, aided His slave, and defeated the confederates alone.",
          references: ["Sahih Muslim 1218", "Sunan An-Nasa'i 2973"],
          tips: [
            "Take your time here; standing on Safa and Marwah is one of the greatest moments where supplications are answered.",
          ],
          notes:
            "You repeat this entire three-fold Dhikr and Dua sequence at both Safa and Marwah on every trip (14 times total across the 7 trips).",
        },
      ],
    },
    {
      id: "hajj-preparation-checklist",
      title: "Pre-Travel & Nusuk Preparation Guide",
      desc: "A step-by-step administrative, physical, and spiritual launchpad to ensure you are fully prepared before departing for Makkah.",
      disclaimer:
        "Visa regulations and digital platform requirements (Nusuk/Taif) change frequently; always verify latest guidelines with official Ministry of Hajj announcements.",
      estimatedDuration: {
        reading: "10 min",
        actual: "1 to 3 months prior to departure",
      },
      difficulty: "beginner",
      recommendedFor: ["All travelers", "Group organizers"],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Operations & Fiqh Team",
      requiredItems: [
        "Passport valid for at least 6 months",
        "Meningitis & standard required vaccination certificates",
        "Unlocked smartphone with e-SIM or local SIM capability",
        "Nusuk App installed and verified",
        "Sturdy, broken-in walking sandals",
        "Money belt or secure anti-theft neck pouch",
      ],
      commonMistakes: [
        "Buying brand-new sandals and wearing them for the first time during Umrah, causing severe blisters.",
        "Forgetting to download offline maps and electronic PDF copies of visas/passports.",
        "Waiting until arriving at the Miqat or Jeddah airport to figure out how to wear Ihram towels.",
        "Neglecting cardiovascular physical conditioning before undertaking 15km+ daily walking.",
      ],
      emergencyNotes: [
        {
          q: "What if my Nusuk permit expires or is cancelled due to flight delays?",
          a: "You can re-book a slot directly within the Nusuk app once inside Saudi Arabia; Haram authorities often assist travelers with valid visas if technical app glitches occur.",
        },
        {
          q: "What if I lose my physical passport or wallet while in Makkah?",
          a: "Immediately contact your country's consulate/embassy in Jeddah and report to your tour group leader. Always store backup photocopies and cloud files of all ID documents.",
        },
      ],
      scholarlyDifferences:
        "None applicable; this is an administrative and practical preparation guide.",
      completionChecklist: [
        {
          id: "pc-1",
          label: "Complete required medical vaccinations",
          optional: false,
        },
        {
          id: "pc-2",
          label: "Install & create account on official Nusuk App",
          optional: false,
        },
        {
          id: "pc-3",
          label:
            "Settle outstanding debts and seek forgiveness from family/friends",
          optional: false,
        },
        {
          id: "pc-4",
          label:
            "Walk 3 to 5 kilometers daily for 3 weeks prior to build stamina",
          optional: false,
        },
        {
          id: "pc-5",
          label: "Pack unscented hygiene kit and 2 sets of Ihram (for men)",
          optional: false,
        },
        {
          id: "pc-6",
          label: "Setup international roaming or Saudi e-SIM data plan",
          optional: false,
        },
      ],
      steps: [
        {
          id: "prep-s1",
          title: "Step 1: Spiritual & Interpersonal Clearance",
          text: "True preparation begins in the heart. Before embarking on the journey of a lifetime, repent sincerely from past sins, write or update your Islamic will (Wasiyyah), settle all outstanding financial debts, and reach out to family, friends, and colleagues to seek their forgiveness and clear any interpersonal grievances.",
          tips: [
            "Travel with wealth earned through strictly Halal means, as pilgrimages funded by unlawful income risk rejection.",
          ],
          notes:
            "A clean heart and clear conscience allow you to focus 100% on worship once you arrive in the Holy lands.",
        },
        {
          id: "prep-s2",
          title: "Step 2: Digital Setup (Nusuk & Connectivity)",
          text: "Saudi Arabia utilizes digital infrastructure for crowd management. Download the official 'Nusuk' app before departure. Create your profile using your visa and passport details. Use Nusuk to book your permit for Umrah and your time slot for praying in the Rawdah (Masjid an-Nabawi, Madinah). Ensure your phone is unlocked and ready for an e-SIM or local SIM card.",
          tips: [
            "Take screenshots of your Nusuk QR codes; cellular data can occasionally lag in dense crowds around Haram gates.",
          ],
          notes:
            "Without an active permit on Nusuk, security guards may prevent entry to the Rawdah in Madinah.",
        },
        {
          id: "prep-s3",
          title: "Step 3: Physical Conditioning & Footwear",
          text: "Hajj and Umrah are highly demanding physical rituals. A standard Umrah involves 10 to 15 kilometers of walking on hard marble, while Hajj requires walking tens of kilometers across several days. Begin walking 3 to 5 kilometers daily at least one month before departure. Purchase quality, supportive sandals and wear them regularly before the trip to break them in.",
          tips: [
            "Do not wear brand-new shoes for Tawaf or Sa'i; blisters are the number one physical complaint among pilgrims.",
          ],
          notes:
            "For men, ensure your walking sandals leave the ankle and top instep bone exposed to comply with Ihram rules.",
        },
        {
          id: "prep-s4",
          title: "Step 4: Strategic Packing & Essentials",
          text: "Pack light, smart, and specific. Essentials include: Two sets of Ihram sheets (men), modest cotton clothing (women), unscented bar soaps, unscented wet wipes, petroleum jelly (Vaseline) or anti-chafing balm, a lightweight string backpack for shoes, sunglasses, a power bank, universal power adapters, and personal prescription medications in original packaging.",
          tips: [
            "Pack one set of Ihram in your carry-on cabin luggage in case your checked suitcase is delayed by the airline.",
          ],
          notes:
            "Bring a small pair of safety scissors or nail clippers in your *checked* luggage to use for exiting Ihram.",
        },
      ],
    },
    {
      id: "women-specific-hajj-umrah",
      title: "Women-Specific Hajj & Umrah Guide",
      desc: "An essential fiqh and practical reference tailored specifically for women, covering attire, menstruation rulings, crowd safety, and ritual accommodations.",
      disclaimer:
        "This guide outlines mainstream Sunni consensus. Rulings regarding menstruation and Tawaf exceptions have detailed scholarly variations across schools.",
      estimatedDuration: {
        reading: "15 min",
        actual: "Applicable throughout pilgrimage",
      },
      difficulty: "intermediate",
      recommendedFor: ["Female pilgrims", "Mahrams and group leaders"],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Fiqh Advisory Board",
      requiredItems: [
        "Lightweight, non-transparent cotton abayas/hijabs",
        "Small scissors (for Taqsir hair cutting)",
        "Sanitary products and prescribed medical delay pills (if consulted with physician)",
        "Unscented wet wipes and toiletries",
      ],
      commonMistakes: [
        "Believing a woman must wear white or green clothing in Ihram.",
        "Uncovering the hair in open, public Haram areas to cut a strand for exiting Ihram.",
        "Entering Masjid al-Haram to perform Tawaf while in a state of active menstruation.",
        "Jogging (Raml) during Tawaf or running between green lights in Sa'i (these are Sunnah exclusively for men).",
      ],
      emergencyNotes: [
        {
          q: "What if my menstrual period begins before I enter Ihram at the Miqat?",
          a: "You must still bathe (Ghusl), put on your clothes, make the intention, and enter Ihram! A menstruating woman performs all rituals of Hajj and Umrah (including Arafah, Muzdalifah, and Dhikr) EXCEPT entering the mosque and performing Tawaf around the Kaaba until she becomes pure.",
        },
        {
          q: "What if my tour group is leaving Makkah and I am still menstruating before I can perform Tawaf al-Ifadah?",
          a: "Tawaf al-Ifadah is a mandatory pillar of Hajj. In cases of extreme necessity where staying behind or returning later is impossible, scholars of the Shafi'i, Hanbali, and Ibn Taymiyyah schools allow binding the area securely and performing Tawaf out of necessity without invalidating the Hajj.",
        },
      ],
      scholarlyDifferences:
        "Regarding women traveling without a male guardian (Mahram): The Hanafi and Hanbali schools require a Mahram for travel. The Maliki and Shafi'i schools (and official Saudi visa policy) allow women to travel for obligatory Hajj/Umrah within a safe, reliable group of women or companions.",
      completionChecklist: [
        {
          id: "wg-1",
          label:
            "Consult physician regarding cycle-delaying medication (optional)",
          optional: true,
        },
        {
          id: "wg-2",
          label:
            "Ensure Ihram attire has no stitched face veil (Niqab) or gloves",
          optional: false,
        },
        {
          id: "wg-3",
          label: "Walk normally during Tawaf and Sa'i (no jogging)",
          optional: false,
        },
        {
          id: "wg-4",
          label: "Perform hair trimming (Taqsir) in privacy of hotel/restroom",
          optional: false,
        },
      ],
      steps: [
        {
          id: "women-s1",
          title: "Step 1: Attire and Ihram Rules for Women",
          text: "Unlike men, women do not wear special unstitched white towels. A woman's Ihram is her normal, modest Islamic clothing of any respectful color (black, navy, beige, white, etc.). The clothing must be loose and non-transparent. The only strict dress prohibitions in Ihram are wearing gloves and wearing a face veil (Niqab) that is sewn or tied to fit the face.",
          tips: [
            "If passing through dense crowds of men, a woman may drape a shawl or scarf from above her head down over her face, provided it is not a tailored Niqab.",
          ],
          notes:
            "Pins, brooches, comfortable closed walking shoes, and socks are all completely permissible for women in Ihram.",
        },
        {
          id: "women-s2",
          title: "Step 2: Managing Menstruation & Purity Rulings",
          text: "A woman experiencing menstruation (Hayd) or post-natal bleeding enters Ihram normally at the Miqat after performing Ghusl. She recites Talbiyah and performs every single act of Hajj and Umrah (standing at Arafah, sleeping in Muzdalifah, stoning Jamarat, making Dua) EXCEPT performing Tawaf around the Kaaba and praying Salah. She must wait until her cycle ends, perform Ghusl, and then complete her Tawaf and Sa'i.",
          tips: [
            "Many female pilgrims consult their doctors weeks before travel to take medically approved hormone tablets that temporarily delay menstruation during their Hajj/Umrah dates.",
          ],
          notes:
            "If menstruation begins *after* completing Tawaf, she can validly proceed to perform Sa'i between Safa and Marwah, as ritual Wudu/purity is not mandatory for Sa'i.",
        },
        {
          id: "women-s3",
          title: "Step 3: Conduct During Tawaf and Sa'i",
          text: "Women walk at a normal, dignified pace throughout the entirety of Tawaf and Sa'i. The practices of Idtiba (uncovering one shoulder), Raml (brisk jogging in Tawaf), and running between the green marker lights during Sa'i are Sunnah exclusively for men. Women should avoid pushing into intense male crowds near the Black Stone or Maqam Ibrahim.",
          tips: [
            "Choose the upper levels or roof of the Haram for Tawaf if you desire a calmer, less congested environment with more personal space.",
          ],
          notes:
            "A woman's prayer and Tawaf are equally rewarded whether performed close to the Kaaba or at the outer perimeters of the mosque.",
        },
        {
          id: "women-s4",
          title: "Step 4: Exiting Ihram (Taqsir in Privacy)",
          text: "To exit Ihram, a woman gathers the ends of her hair together and cuts a portion equal to the length of a fingertip (approx. 1 to 2 centimeters). If her hair is layered, she should snip a small amount from the end of each layer. This must be done in privacy (hotel room or closed restroom), not openly in the Haram viewing areas.",
          tips: [
            "Keep a small pair of blunt-tip safety scissors in your handbag or hotel room specifically for this moment.",
          ],
          notes:
            "Shaving the head (Halq) is strictly forbidden for women; trimming (Taqsir) is the only prescribed method.",
        },
      ],
    },
    {
      id: "madinah-ziyarah-etiquette",
      title: "Madinah & Ziyarah Etiquette Guide",
      desc: "A spiritual and practical manual for visiting the Illuminated City of Madinah, the Prophet's Mosque (Masjid an-Nabawi), the Rawdah, and historical sites.",
      disclaimer:
        "Visiting Madinah is a profound spiritual journey and Sunnah, but it is NOT a mandatory ritual or fiqh pillar of Hajj or Umrah.",
      estimatedDuration: {
        reading: "12 min",
        actual: "Recommended stay: 3 to 5 days",
      },
      difficulty: "beginner",
      recommendedFor: [
        "All travelers",
        "Those visiting Madinah before/after Makkah",
      ],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Research & History Team",
      requiredItems: [
        "Nusuk App Rawdah Prayer Permit (Mandatory for Rawdah entry)",
        "Modest, clean clothing for visiting the Prophet's Mosque",
        "Comfortable walking shoes for historical site tours",
      ],
      commonMistakes: [
        "Believing that visiting Madinah is an obligatory condition for the validity of Hajj or Umrah.",
        "Raising voices, shouting, or arguing inside Masjid an-Nabawi near the resting place of Prophet Muhammad ﷺ.",
        "Wiping hands on the brass grilles or walls of the Prophet's burial chamber seeking blessings (Tabarruk).",
        "Making supplication (Dua) while facing the grave; supplications should be directed toward the Qiblah.",
      ],
      emergencyNotes: [
        {
          q: "What if I miss my scheduled Nusuk time slot for the Rawdah?",
          a: "Permit slots are strictly regulated by automated barcode scanners. If missed, check the app frequently for cancellations to book a new slot, particularly during late-night or early-morning hours.",
        },
      ],
      scholarlyDifferences:
        "Regarding praying 40 consecutive prayers in Masjid an-Nabawi: While a well-known Hadith mentions freedom from Hellfire for 40 prayers here, many Hadith scholars grade its chain as weak. Regardless, multiplying prayers in this sacred mosque carries immense reward.",
      completionChecklist: [
        {
          id: "mz-1",
          label: "Enter Masjid an-Nabawi with right foot & entrance Dua",
          optional: false,
        },
        {
          id: "mz-2",
          label:
            "Send respectful Salam upon Prophet Muhammad ﷺ, Abu Bakr, and Umar",
          optional: false,
        },
        {
          id: "mz-3",
          label: "Pray inside the Rawdah ash-Sharifah (via Nusuk permit)",
          optional: false,
        },
        {
          id: "mz-4",
          label:
            "Visit Masjid Quba on Saturday morning (or any day) and pray 2 Rak'ahs",
          optional: false,
        },
        {
          id: "mz-5",
          label: "Visit Baqi Cemetery and Mount Uhud martyrs",
          optional: true,
        },
      ],
      steps: [
        {
          id: "madinah-s1",
          title: "Step 1: Entering Masjid an-Nabawi & Greeting the Prophet ﷺ",
          text: "Enter the Prophet's Mosque with your right foot, reciting the standard mosque entrance supplication. Proceed toward the burial chamber (at the front left of the original mosque). Stand respectfully with lowered voice and tranquility before the brass grille. Convey greetings of peace: 'As-Salaamu 'alayka ya Rasoolallah' (Peace be upon you, O Messenger of Allah). Then step slightly right to greet Caliph Abu Bakr (RA), and step right again to greet Caliph Umar (RA).",
          visualAid:
            "🚶‍♂️ Enter Mosque ➔ 🛑 Stand respectfully before Grave Grille:\n[1. Greet Prophet ﷺ] ➔ Step Right ➔ [2. Greet Abu Bakr] ➔ Step Right ➔ [3. Greet Umar]",
          arabic:
            "السَّلَامُ عَلَيْكَ يَا رَسُولَ اللَّهِ، وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
          transliteration:
            "As-salaamu 'alayka yaa Rasoolallaah, wa rahmatullaahi wa barakaatuh.",
          translation:
            "Peace be upon you, O Messenger of Allah, and the mercy of Allah and His blessings.",
          references: ["Sunan Abi Dawud 2041", "Muwatta Malik"],
          tips: [
            "Maintain utmost spiritual decorum; Allah commanded the companions not to raise their voices above the voice of the Prophet ﷺ.",
          ],
          notes:
            "When making personal Dua for yourself or your family after sending greetings, turn around to face the Qiblah (Kaaba), rather than facing the grave.",
        },
        {
          id: "madinah-s2",
          title: "Step 2: Praying in the Rawdah ash-Sharifah",
          text: "The Rawdah is the sacred area situated between the Prophet's house (grave) and his pulpit (Minbar), distinguished by green carpets. The Prophet ﷺ declared this space to be 'a garden from the gardens of Paradise.' Book your entry slot via the Nusuk app. When inside, pray two Rak'ahs of Nafl (voluntary) prayer and engage in intense supplication and remembrance.",
          visualAid:
            "🟢 THE RAWDAH (Green Carpets: Between Pulpit and Grave) 🟢\nPray 2 Rak'ahs ➔ Make intense Dua (One of the Gardens of Paradise)",
          arabic:
            "مَا بَيْنَ بَيْتِي وَمِنْبَرِي رَوْضَةٌ مِنْ رِيَاضِ الْجَنَّةِ",
          transliteration:
            "Maa bayna baytee wa minbaree rawdatun min riyaadil-jannah.",
          translation:
            "What is between my house and my pulpit is a garden from the gardens of Paradise.",
          references: ["Sahih al-Bukhari 1196", "Sahih Muslim 1391"],
          tips: [
            "Do not push or rush others inside the Rawdah; praying with calmness in a corner is better than harming others for a central spot.",
          ],
          notes:
            "Due to high demand, time inside the Rawdah is limited by Haram security to allow all pilgrims a chance to visit.",
        },
        {
          id: "madinah-s3",
          title: "Step 3: Visiting Masjid Quba (The Reward of Umrah)",
          text: "Masjid Quba is the very first mosque built in Islamic history, located on the outskirts of Madinah. It is an established Sunnah to perform Wudu at your hotel or home and travel to Masjid Quba (traditionally on Saturday mornings, though any day is virtuous) to pray two Rak'ahs. The Prophet ﷺ stated that doing so carries the exact spiritual reward of performing an Umrah!",
          visualAid:
            "🚿 Perform Wudu at Hotel ➔ 🚗 Travel to Masjid Quba ➔ 🧎‍♂️ Pray 2 Rak'ahs = [Reward of 1 Umrah]",
          arabic:
            "مَنْ تَطَهَّرَ فِي بَيْتِهِ ثُمَّ أَتَى مَسْجِدَ قُبَاءٍ فَصَلَّى فِيهِ صَلَاةً كَانَ لَهُ كَأَجْرِ عُمْرَةٍ",
          transliteration:
            "Man tatahhara fee baytihi thumma ataa masjida Qubaa'in fasallaa feehi salaatan kaana lahu ka'ajri 'Umrah.",
          translation:
            "Whoever purifies himself in his house, then comes to the mosque of Quba and prays in it, he will have a reward like that of an Umrah.",
          references: ["Sunan Ibn Majah 1412", "Sunan An-Nasa'i 699"],
          tips: [
            "Many modern pilgrims take a scenic walk along the newly developed pedestrian 'Quba Avenue' connecting Masjid an-Nabawi directly to Masjid Quba.",
          ],
          notes:
            "Ensure your Wudu is completed *before* leaving for the mosque to literally fulfill the wording of the Hadith.",
        },
        {
          id: "madinah-s4",
          title: "Step 4: Ziyarah to Baqi Cemetery & Mount Uhud",
          text: "It is Sunnah for men to visit Jannat al-Baqi (the cemetery adjacent to Masjid an-Nabawi where over 10,000 companions, wives, and daughters of the Prophet ﷺ rest) and the martyrs of Mount Uhud (including Hamzah ibn Abi Talib RA). Stand quietly, reflect upon the reality of the Hereafter, and recite the Prophetic supplication for the deceased.",
          arabic:
            "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ",
          transliteration:
            "As-salaamu 'alaykum ahlad-diyaari minal-mu'mineena wal-muslimeena, wa innaa in shaa'Allaahu bikum laahiqoon.",
          translation:
            "Peace be upon you, inhabitants of the dwellings, believers and Muslims. Indeed we will, Allah willing, join you.",
          references: ["Sahih Muslim 975", "Sunan An-Nasa'i 2040"],
          tips: [
            "Baqi cemetery is typically opened for public visitation immediately after the Fajr and Asr obligatory prayers.",
          ],
          notes:
            "When visiting graves, strictly avoid wailing, tying threads to fences, or asking the deceased for worldly help or intercession.",
        },
      ],
    },
    {
      id: "elderly-wheelchair-guide",
      title: "Elderly & Wheelchair Accessibility Guide",
      desc: "A specialized operational and fiqh roadmap for elderly pilgrims, individuals with mobility challenges, and their caregivers navigating Hajj and Umrah.",
      disclaimer:
        "Islamic jurisprudence is built upon ease. Where physical inability exists, authentic fiqh accommodations and proxy permissions apply.",
      estimatedDuration: {
        reading: "10 min",
        actual: "Applicable during all physical movement",
      },
      difficulty: "beginner",
      recommendedFor: [
        "Elderly pilgrims",
        "Wheelchair users",
        "Caregivers and family members",
      ],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Operations & Fiqh Team",
      requiredItems: [
        "Lightweight, collapsible manual wheelchair (or Haram electric cart rental)",
        "Medical documentation and sufficient prescription supplies",
        "Unscented sun umbrella and portable misting fan",
        "Emergency contact wristband worn by the pilgrim at all times",
      ],
      commonMistakes: [
        "Attempting to push manual wheelchairs into the dense ground-floor Mataf crowd during peak hours.",
        "Caregivers performing Sa'i while pushing a wheelchair without intending their own Umrah simultaneously.",
        "Exhausting elderly pilgrims by attempting voluntary (Nafl) Tawafs during intense afternoon heat.",
      ],
      emergencyNotes: [
        {
          q: "What if an elderly pilgrim cannot perform Tawaf or Sa'i even in a wheelchair due to severe fatigue?",
          a: "You may utilize official Haram electric golf carts (available on mezzanine/roof levels) which allow sitting comfortably while a driver or automated system navigates the circuits.",
        },
        {
          q: "What if an infirm pilgrim cannot throw pebbles at the Jamarat in Mina?",
          a: "It is unanimous across all Sunni schools that a family member or caregiver can act as a proxy (Wakil). The proxy stands at the basin, throws 7 pebbles for themselves first, and then immediately throws 7 pebbles on behalf of the infirm person.",
        },
      ],
      scholarlyDifferences:
        "Regarding performing Tawaf in a wheelchair or cart without strict necessity: While walking is Sunnah and preferred for the able-bodied, the majority of scholars hold that Tawaf performed while riding or sitting is valid even without illness, drawing from the Prophet ﷺ performing Tawaf on his camel during Hajj.",
      completionChecklist: [
        {
          id: "ew-1",
          label:
            "Locate dedicated wheelchair ramps and elevators upon Haram arrival",
          optional: false,
        },
        {
          id: "ew-2",
          label:
            "Utilize upper/mezzanine levels or electric carts for Tawaf & Sa'i",
          optional: false,
        },
        {
          id: "ew-3",
          label: "Appoint able-bodied proxy for Jamarat stoning (for Hajj)",
          optional: true,
        },
        {
          id: "ew-4",
          label:
            "Ensure caregiver and seated pilgrim both make distinct ritual intentions",
          optional: false,
        },
      ],
      steps: [
        {
          id: "elderly-s1",
          title: "Step 1: Wheelchair Navigation in Masjid al-Haram",
          text: "Masjid al-Haram is equipped with comprehensive accessibility infrastructure. Manual wheelchairs are not permitted in the crowded ground-floor Mataf immediately surrounding the Kaaba. Instead, proceed to the dedicated wheelchair bridges on the mezzanine, first floor, or roof levels. You can bring your own manual wheelchair or rent official government-regulated manual and electric golf carts on-site.",
          tips: [
            "Electric carts can be pre-booked or rented via kiosks near the Ajyad and Shabika bridge entrances.",
          ],
          notes:
            "When pushing a wheelchair during Tawaf, ensure you keep the Kaaba to your left across the wider upper-level radius.",
        },
        {
          id: "elderly-s2",
          title: "Step 2: Dual Intentions for Caregivers",
          text: "If a caregiver is pushing a wheelchair-bound pilgrim during Umrah or Hajj, both the caregiver and the seated pilgrim can accomplish their rituals simultaneously! The caregiver simply makes their own intention for Tawaf/Sa'i while walking and pushing, while the seated pilgrim makes their own independent intention while riding.",
          tips: [
            "Establish a clear communication signal between caregiver and rider to track circuit counts accurately.",
          ],
          notes:
            "The reward of the caregiver is immense; assisting a weak Muslim in completing their pilgrimage carries double spiritual merit.",
        },
        {
          id: "elderly-s3",
          title: "Step 3: Jamarat Proxy Stoning (Al-Niyabah)",
          text: "During Hajj, the Jamarat stoning in Mina involves massive crowds and walking distances that can be hazardous for the elderly or infirm. Fiqh explicitly allows appointing a proxy. The able-bodied caregiver goes to the Jamarat, throws 7 pebbles for their own ritual, and then stands at the same pillar and throws 7 pebbles on behalf of the elderly or sick pilgrim.",
          visualAid:
            "🪨 PROXY STONING SEQUENCE AT EACH PILLAR:\n[1. Throw 7 Pebbles for Yourself] ➔ [2. Immediately Throw 7 Pebbles for Elderly/Ill Person]",
          arabic:
            "يُسَرِّعُ عَنِ الْعَاجِزِ وَالْمَرِيضِ وَالْكَبِيرِ فِي رَمْيِ الْجَمَرَاتِ",
          transliteration:
            "Yusarri'u 'anil-'aajizi wal-mareedhi wal-kabeeri fee ramyil-jamaraat.",
          translation:
            "Stoning the Jamarat is expedited (or performed via proxy) on behalf of the weak, the ill, and the elderly.",
          references: ["Sunan Ibn Majah 3038", "Fiqh Consensus"],
          tips: [
            "You do not need to leave the pillar and return; you can throw all 14 pebbles (7 for self, 7 for proxy) in one standing.",
          ],
          notes:
            "The proxy must be someone who is already performing Hajj for themselves during that same season.",
        },
        {
          id: "elderly-s4",
          title: "Step 4: Heat Management and Rest Concessions",
          text: "The Arabian heat can cause rapid dehydration and fatigue. Elderly pilgrims should utilize the Shari'ah concessions (Rukhsah): perform optional rituals only during cooler evening or night hours, shorten stay durations in intense sun, and drink Zamzam and electrolyte fluids continuously. Remember that Islam prioritizes human health and safety above voluntary ritual exertion.",
          tips: [
            "Keep a digital copy of all medical prescriptions on your smartphone in case you need to visit a Haram health clinic.",
          ],
          notes:
            "Free, world-class government medical clinics are located inside and immediately outside all major Haram complexes.",
        },
      ],
    },
    {
      id: "hajj-umrah-glossary",
      title: "Hajj & Umrah Fiqh Glossary",
      desc: "A definitive reference dictionary explaining the essential Arabic terminology, ritual names, and geographical landmarks encountered during pilgrimage.",
      disclaimer:
        "Understanding these foundational terms ensures confident navigation of ritual instructions and scholarly texts.",
      estimatedDuration: {
        reading: "15 min",
        actual: "Reference tool",
      },
      difficulty: "beginner",
      recommendedFor: ["All pilgrims", "Students of knowledge"],
      requiresGuide: false,
      offlineAvailable: true,
      lastReviewed: "2026-07-20",
      reviewedBy: "Tawfiq Research Team",
      requiredItems: ["None"],
      commonMistakes: [
        "Confusing 'Halq' (shaving head) with 'Taqsir' (trimming hair).",
        "Confusing 'Mataf' (open circling courtyard) with 'Masa'a' (walking gallery between Safa and Marwah).",
      ],
      emergencyNotes: [],
      scholarlyDifferences:
        "Terminology is standardized across all major Sunni schools of jurisprudence.",
      isSpecialGuide: true,
      glossaryTerms: [
        {
          term: "Miqat",
          arabic: "ميقات",
          def: "The designated geographical boundary lines surrounding Makkah which a pilgrim intending Hajj or Umrah cannot cross without being in the state of Ihram.",
        },
        {
          term: "Ihram",
          arabic: "إحرام",
          def: "The sacred state of spiritual purity and ritual consecration entered by combining intention (Niyyah) and reciting Talbiyah, accompanied by specific garment and behavior rules.",
        },
        {
          term: "Izar & Rida",
          arabic: "إزار ورداء",
          def: "The two unstitched white cloth sheets worn by men in Ihram. The Izar is wrapped around the waist and lower body; the Rida is draped over the upper torso.",
        },
        {
          term: "Talbiyah",
          arabic: "تلبية",
          def: "The devotional chant recited continuously by pilgrims from the Miqat until commencing Tawaf ('Labbayk Allahumma Labbayk...').",
        },
        {
          term: "Idtiba",
          arabic: "اضطباع",
          def: "The act of uncovering the right shoulder for men during Tawaf by placing the middle of the upper Ihram towel under the right armpit and tossing ends over the left shoulder.",
        },
        {
          term: "Raml",
          arabic: "رَمْل",
          def: "The brisk, purposeful jogging or hastening pace practiced by men during the first three circuits of Tawaf.",
        },
        {
          term: "Tawaf",
          arabic: "طواف",
          def: "The devotional act of circling the Kaaba seven times counter-clockwise, beginning and ending at the corner of the Black Stone.",
        },
        {
          term: "Mataf",
          arabic: "مطاف",
          def: "The open white marble courtyard immediately surrounding the Kaaba where Tawaf is performed.",
        },
        {
          term: "Maqam Ibrahim",
          arabic: "مقام إبراهيم",
          def: "The glass and metal enclosure housing the stone imprinted with the footprints of Prophet Ibrahim (AS) from when he built the Kaaba; praying 2 Rak'ahs behind it is Sunnah.",
        },
        {
          term: "Hijr Ismail (Al-Hateem)",
          arabic: "حجر إسماعيل",
          def: "The low, semi-circular marble wall attached to the Kaaba. It is historically part of the Kaaba itself, so Tawaf must be performed around its outside perimeter.",
        },
        {
          term: "Sa'i",
          arabic: "سَعْي",
          def: "The ritual walking and hastening back and forth seven times between the hills of Safa and Marwah, commemorating the struggle of Hajar (AS).",
        },
        {
          term: "Masa'a",
          arabic: "مسعى",
          def: "The enclosed, multi-level gallery corridor connecting Mount Safa and Mount Marwah where Sa'i is executed.",
        },
        {
          term: "Halq",
          arabic: "حَلْق",
          def: "The complete shaving of the head with a razor for men to conclude Umrah or Hajj rituals (carries triple the spiritual reward of trimming).",
        },
        {
          term: "Taqsir",
          arabic: "تقصير",
          def: "The trimming or cutting of the hair all over the head for men, or cutting a fingertip's length for women, to exit the state of Ihram.",
        },
        {
          term: "Hadi",
          arabic: "هَدْي",
          def: "The sacrificial livestock animal (sheep, goat, cow, or camel) offered in Mina during Hajj al-Tamattu' or Hajj al-Qiran.",
        },
        {
          term: "Fidyah",
          arabic: "فِدْيَة",
          def: "The religious compensation (in the form of fasting, charity, or sacrifice) required when a pilgrim is forced to violate an Ihram restriction due to illness or necessity.",
        },
        {
          term: "Dam",
          arabic: "دَم",
          def: "A blood sacrifice (slaughtering a sheep/goat in Makkah and distributing meat to the poor) incurred due to omitting a Wajib (mandatory duty) of Hajj/Umrah or committing a major violation.",
        },
        {
          term: "Tarwiyah",
          arabic: "يَوْم التَّرْوِيَة",
          def: "The 8th day of Dhul-Hijjah when pilgrims travel to Mina to spend the day and night in prayer before moving to Arafah.",
        },
        {
          term: "Wuquf",
          arabic: "وُقُوف",
          def: "The standing in supplication and prayer on the plains of Arafah on the 9th of Dhul-Hijjah—the absolute core pillar of Hajj.",
        },
        {
          term: "Jamarat",
          arabic: "جَمَرَات",
          def: "The three stone pillars in Mina (Al-Sughra, Al-Wusta, Al-Aqabah) at which pilgrims cast pebbles to reject Satan and commemorate Prophet Ibrahim's obedience.",
        },
        {
          term: "Ayyam at-Tashreeq",
          arabic: "أَيَّام التَّشْرِيق",
          def: "The 11th, 12th, and 13th days of Dhul-Hijjah spent in Mina for stoning the Jamarat and remembering Allah.",
        },
        {
          term: "Tawaf al-Ifadah",
          arabic: "طواف الإفاضة",
          def: "The mandatory Hajj Tawaf performed after returning from Arafah/Muzdalifah on or after the 10th of Dhul-Hijjah; a core pillar of Hajj.",
        },
        {
          term: "Tawaf al-Wida",
          arabic: "طواف الوداع",
          def: "The Farewell Tawaf performed as the very last ritual before a pilgrim departs Makkah for their home country.",
        },
      ],
      steps: [],
    },
  ],
 "Dhikr Academy": [
    {
      id: "understanding-what-is-dhikr",
      category: "Understanding Dhikr",
      title: "What is Dhikr?",
      desc: "Discover the true essence of remembrance and why it is the lifeblood of the believer.",
      time: "5 min",
      stepsCount: 5,
      metadata: {
        difficulty: "Beginner",
        quranCount: 3,
        hadithCount: 2,
        hasAudio: false,
        includes: ["Introduction", "Evidence", "Virtues", "Reflection"]
      },
      steps: [
        {
          section: "Introduction",
          title: "More Than Words",
          text: "Dhikr is commonly translated as 'remembrance'. However, it is not merely moving the lips. It is the conscious alignment of the heart, mind, and tongue in recognizing Allah's constant presence in your life."
        },
        {
          section: "Evidence",
          title: "The Command to Remember",
          text: "Dhikr is one of the most emphasized acts of worship in Islam.",
          quran: [
            "33:41 - 'O you who have believed, remember Allah with much remembrance.'",
            "13:28 - 'Unquestionably, by the remembrance of Allah hearts are assured.'"
          ]
        },
        {
          section: "Virtues",
          title: "The Living vs. The Dead",
          text: "The Prophet ﷺ compared the one who remembers Allah to the living, and the one who does not to the dead (Sahih al-Bukhari). It breathes life into a spiritually dead heart."
        },
        {
          section: "Common Mistakes",
          title: "Mindless Repetition",
          text: "A common pitfall is reciting adhkar at lightning speed just to hit a number, without the heart being present. 10 mindful repetitions are better than 100 heedless ones."
        },
        {
          section: "Summary & Reflection",
          title: "Your Current State",
          text: "Pause and ask yourself: When was the last time you remembered Allah outside of formal prayer? Was your heart present?"
        }
      ]
    },
    {
      id: "individual-subhanallah",
      category: "Individual Dhikr",
      title: "SubhanAllah",
      desc: "Internalize the weight and power of declaring Allah's absolute perfection.",
      time: "10 min",
      stepsCount: 9,
      metadata: {
        difficulty: "Beginner",
        quranCount: 2,
        hadithCount: 5,
        hasAudio: true,
        includes: ["Meaning", "Evidence", "Reflection", "Practice"]
      },
      steps: [
        {
          section: "Meaning",
          title: "What is SubhanAllah?",
          text: "Understand the exact definition and root of the word.",
          arabic: "سُبْحَانَ اللَّهِ",
          transliteration: "SubhanAllah",
          translation: "Glory be to Allah",
          root: "Sa-Ba-Ha (س-ب-ح) - To float, swim, or be far removed from impurity."
        },
        {
          section: "Pronunciation",
          title: "Listen and Repeat",
          text: "Ensure you are pronouncing the letters correctly to preserve the meaning.",
          audioUrl: "/audio/subhanallah.mp3"
        },
        {
          section: "Quran Evidence",
          title: "In the Book of Allah",
          text: "Allah commands us to declare His perfection.",
          quran: [
            "20:130 - '...and exalt [Allah] with praise of your Lord before the rising of the sun and before its setting...'"
          ]
        },
        {
          section: "Hadith Evidence",
          title: "Prophetic Usage",
          text: "How the Prophet ﷺ utilized this specific dhikr.",
          hadith: [
            "Sahih Muslim - The Prophet ﷺ said: 'SubhanAllah fills half the scale...'"
          ]
        },
        {
          section: "Rewards & Virtues",
          title: "The Weight of the Words",
          text: "Saying 'SubhanAllah wa bihamdihi' 100 times a day wipes away minor sins, even if they are like the foam of the sea."
        },
        {
          section: "When to Recite",
          title: "Sunnah Timings",
          text: "When should you make this remembrance?",
          points: [
            "33 times after every obligatory Salah",
            "100 times in the morning and evening",
            "When witnessing something astonishing or beautiful"
          ]
        },
        {
          section: "Reflection",
          title: "Connecting to the Heart",
          text: "We often say SubhanAllah out of habit. Today, pause and reflect on one thing you saw that was perfectly created—a cloud, a leaf, or your own heartbeat."
        },
        {
          section: "Practice Session",
          title: "Guided Dhikr",
          text: "Let's put this into practice right now. Recite 'SubhanAllah' with focus 33 times.",
          interactiveCounter: 33
        },
        {
          section: "Daily Challenge",
          title: "Your Goal for Today",
          text: "Look at the sky at least once today and say SubhanAllah while actively thinking about Allah's flawless creation."
        }
      ]
    },
    {
      id: "individual-alhamdulillah",
      category: "Individual Dhikr",
      title: "Alhamdulillah",
      desc: "Cultivate true gratitude and recognize that all praise belongs to Allah.",
      time: "8 min",
      stepsCount: 5,
      metadata: {
        difficulty: "Beginner",
        quranCount: 3,
        hadithCount: 4,
        hasAudio: true,
        includes: ["Meaning", "Virtues", "Reflection"]
      },
      steps: [
        {
          section: "Meaning",
          title: "What is Alhamdulillah?",
          text: "It is an expression of both praise (hamd) and gratitude (shukr).",
          arabic: "ٱلْحَمْدُ لِلَّٰهِ",
          transliteration: "Alhamdulillah",
          translation: "All praise and gratitude belong to Allah"
        },
        {
          section: "Quran Evidence",
          title: "The Opening of the Quran",
          text: "It is the very first phrase of the Quran after the Basmalah.",
          quran: [
            "1:2 - '[All] praise is [due] to Allah, Lord of the worlds.'"
          ]
        },
        {
          section: "Virtues",
          title: "Filling the Scale",
          text: "While SubhanAllah fills half the scale, Alhamdulillah fills the entire scale of good deeds (Sahih Muslim)."
        },
        {
          section: "When to Recite",
          title: "Daily Application",
          points: [
            "After waking up",
            "After eating or drinking",
            "When sneezing",
            "33 times after Salah"
          ]
        },
        {
          section: "Reflection",
          title: "Finding the Hidden Blessings",
          text: "Name three things you have right now that you did not explicitly ask for today, but Allah provided anyway."
        }
      ]
    },
    {
      id: "individual-allahu-akbar",
      category: "Individual Dhikr",
      title: "Allahu Akbar",
      desc: "Realize that Allah is greater than anything competing for your attention.",
      time: "8 min",
      stepsCount: 5,
      metadata: {
        difficulty: "Beginner",
        quranCount: 2,
        hadithCount: 3,
        hasAudio: true,
        includes: ["Meaning", "Virtues", "Reflection", "Practice"]
      },
      steps: [
        {
          section: "Meaning",
          title: "What is Allahu Akbar?",
          text: "Often translated as 'God is great', it actually means 'Allah is Greater'. Greater than your worries, your tasks, and your fears.",
          arabic: "ٱللَّٰهُ أَكْبَرُ",
          transliteration: "Allahu Akbar",
          translation: "Allah is the Greatest"
        },
        {
          section: "Hadith Evidence",
          title: "The Call to Focus",
          text: "It is the phrase that initiates our Salah, detaching us from the world.",
          hadith: [
            "Bukhari - The Prophet ﷺ would say Allahu Akbar when ascending a hill or elevation."
          ]
        },
        {
          section: "Reflection",
          title: "Priorities",
          text: "When you hear the Adhan (which begins with Allahu Akbar), what is the first thing you feel? Is it a rush to finish your work, or a realization that the Creator is calling you?"
        },
        {
          section: "Practice Session",
          title: "Guided Dhikr",
          text: "Recite 'Allahu Akbar' 34 times, internalizing that He is greater than your current struggles.",
          interactiveCounter: 34
        },
        {
          section: "Daily Challenge",
          title: "Ascension",
          text: "Say Allahu Akbar the next time you walk up a flight of stairs or drive up a steep hill today, reviving a forgotten Sunnah."
        }
      ]
    },
    {
      id: "individual-la-ilaha-illallah",
      category: "Individual Dhikr",
      title: "La ilaha illallah",
      desc: "The pinnacle of remembrance and the heaviest phrase on the scales.",
      time: "12 min",
      stepsCount: 5,
      metadata: {
        difficulty: "Beginner",
        quranCount: 4,
        hadithCount: 6,
        hasAudio: true,
        includes: ["Meaning", "Evidence", "Virtues", "Practice"]
      },
      steps: [
        {
          section: "Meaning",
          title: "The Ultimate Truth",
          text: "This is the statement of Tawheed (Oneness of God). It is the condition for entering Islam.",
          arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
          transliteration: "La ilaha illallah",
          translation: "There is no deity worthy of worship except Allah"
        },
        {
          section: "Virtues",
          title: "The Best of Dhikr",
          text: "The Prophet ﷺ said, 'The best remembrance is La ilaha illallah' (Tirmidhi).",
          hadith: [
            "Sahih Muslim - He whose last words are 'La ilaha illallah' will enter Paradise."
          ]
        },
        {
          section: "Reflection",
          title: "Hidden Idols",
          text: "While we do not worship statues, we often let money, status, or desires dictate our lives. Reaffirming this phrase breaks those hidden idols."
        },
        {
          section: "Practice Session",
          title: "Daily Renewal",
          text: "Recite the full phrase 'La ilaha illallah, wahdahu la sharika lah...' 100 times to receive the reward of freeing 10 slaves.",
          interactiveCounter: 100
        },
        {
          section: "Daily Challenge",
          title: "Morning Renewal",
          text: "Make this the very first thing you say when your feet touch the ground tomorrow morning."
        }
      ]
    },
    {
      id: "individual-astaghfirullah",
      category: "Individual Dhikr",
      title: "Astaghfirullah",
      desc: "Unlock closed doors and erase your burdens through constant seeking of forgiveness.",
      time: "9 min",
      stepsCount: 5,
      metadata: {
        difficulty: "Beginner",
        quranCount: 5,
        hadithCount: 4,
        hasAudio: true,
        includes: ["Meaning", "Virtues", "Reflection", "Practice"]
      },
      steps: [
        {
          section: "Meaning",
          title: "Seeking the Cover",
          text: "The root 'Gha-Fa-Ra' means to cover or shield. You are asking Allah not just to forgive the sin, but to cover its spiritual consequences.",
          arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
          transliteration: "Astaghfirullah",
          translation: "I seek forgiveness from Allah"
        },
        {
          section: "Quran Evidence",
          title: "The Rain Bringer",
          text: "Istighfar brings worldly provisions as well as spiritual cleansing.",
          quran: [
            "71:10-12 - 'Ask forgiveness of your Lord. Indeed, He is ever a Perpetual Forgiver. He will send [rain from] the sky upon you in showers...'"
          ]
        },
        {
          section: "Virtues",
          title: "The Prophet's Habit",
          text: "Even though all his past and future sins were forgiven, the Prophet ﷺ sought forgiveness 100 times a day (Muslim)."
        },
        {
          section: "Reflection",
          title: "Lightening the Load",
          text: "Sins are heavy. They cause anxiety and block out joy. When you say Astaghfirullah, imagine taking a heavy rock out of your backpack."
        },
        {
          section: "Practice Session",
          title: "Following the Sunnah",
          text: "Recite Astaghfirullah 70 times right now with a present and remorseful heart.",
          interactiveCounter: 70
        }
      ]
    },
    {
      id: "daily-morning-adhkar",
      category: "Daily Dhikr",
      title: "Morning Adhkar",
      desc: "Fortify your day with the authentic morning remembrances of the Prophet ﷺ.",
      time: "15 min",
      stepsCount: 4,
      metadata: {
        difficulty: "Intermediate",
        quranCount: 4,
        hadithCount: 8,
        hasAudio: true,
        includes: ["Recitation", "Translation", "Practice"]
      },
      steps: [
        {
          section: "Introduction",
          title: "Spiritual Armor",
          text: "The morning adhkar are meant to be recited between Fajr and Sunrise. They act as a spiritual shield for your day."
        },
        {
          section: "Protection",
          title: "Ayat al-Kursi",
          text: "Recite this once to be protected from Shaytan until the evening.",
          arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
          transliteration: "Allahu la ilaha illa Huwa...",
          translation: "Allah - there is no deity except Him..."
        },
        {
          section: "The 3 Quls",
          title: "Ultimate Refuge",
          text: "Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas 3 times each. The Prophet ﷺ said they will suffice you against everything."
        },
        {
          section: "Forgiveness",
          title: "Sayyid al-Istighfar",
          text: "The chief of forgiveness. Whoever says it during the day with firm faith in it, and dies on that day before the evening, will be from the people of Paradise.",
          arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ...",
          transliteration: "Allahumma anta Rabbi la ilaha illa Anta...",
          translation: "O Allah, You are my Lord, there is none worthy of worship but You..."
        }
      ]
    },
    {
      id: "daily-evening-adhkar",
      category: "Daily Dhikr",
      title: "Evening Adhkar",
      desc: "Close your day under the protection and mercy of Allah.",
      time: "15 min",
      stepsCount: 3,
      metadata: {
        difficulty: "Intermediate",
        quranCount: 4,
        hadithCount: 7,
        hasAudio: true,
        includes: ["Recitation", "Translation", "Practice"]
      },
      steps: [
        {
          section: "Introduction",
          title: "The Night Shield",
          text: "Recited between Asr and Maghrib, the evening adhkar transition you from the chaos of the day into the peace of the night."
        },
        {
          section: "Protection",
          title: "The 3 Quls",
          text: "Just as in the morning, reciting Surah Al-Ikhlas, Al-Falaq, and An-Nas 3 times each provides unmatched protection for the night."
        },
        {
          section: "Gratitude & Refuge",
          title: "Evening Supplication",
          text: "Acknowledge that the night has arrived by Allah's permission.",
          arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...",
          transliteration: "Amsayna wa amsal-mulku lillah...",
          translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty..."
        }
      ]
    },
    {
      id: "daily-routine",
      category: "Daily Dhikr",
      title: "Building a Daily Routine",
      desc: "Learn how to naturally weave the remembrance of Allah into your busy modern life.",
      time: "7 min",
      stepsCount: 4,
      metadata: {
        difficulty: "Beginner",
        quranCount: 0,
        hadithCount: 2,
        hasAudio: false,
        includes: ["Advice", "Strategy", "Reflection"]
      },
      steps: [
        {
          section: "Strategy",
          title: "Habit Stacking",
          text: "Don't try to add 30 minutes of Dhikr out of nowhere. Stack it onto existing habits. Recite your morning adhkar during your commute, or say Alhamdulillah right after you finish your morning coffee."
        },
        {
          section: "Consistency",
          title: "Small but Continuous",
          text: "The Prophet ﷺ said, 'The most beloved of deeds to Allah are those that are most consistent, even if it is small' (Bukhari). Do not burn out."
        },
        {
          section: "Recovery",
          title: "When You Miss a Day",
          text: "If you miss your morning adhkar, do not abandon them entirely. Say them when you remember. Shaytan wants you to feel 'all or nothing'."
        },
        {
          section: "Reflection",
          title: "Designing Your Day",
          text: "Identify two 'dead zones' in your day (e.g., waiting in line, washing dishes) where your hands are busy but your tongue is free. Claim those moments for Dhikr."
        }
      ]
    }
  ],
  "Quran Academy": [
    {
      id: "quran-intro",
      title: "Introduction to the Quran",
      desc: "Understanding the final revelation to mankind.",
      time: "5 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "What is the Quran?",
          text: "The literal, uncreated word of Allah revealed to Prophet Muhammad ﷺ through Angel Jibril over 23 years.",
        },
        {
          title: "Structure",
          text: "It contains 114 Surahs (chapters) and over 6,000 Ayahs (verses).",
        },
        {
          title: "Makki vs Madani",
          text: "Makki Surahs focus on faith and the afterlife. Madani Surahs focus on laws, society, and family.",
        },
        {
          title: "Preservation",
          text: "Allah promised to protect it from alteration. It has remained completely unchanged for over 1400 years.",
        },
      ],
    },
  ],
  "Tajweed Academy": [
    {
      id: "tajweed-makharij",
      title: "Makharij (Points of Articulation)",
      desc: "Learn exactly where Arabic letters originate from in the throat and mouth.",
      time: "8 min",
      stepsCount: 5,
      difficulty: "intermediate",
      steps: [
        {
          title: "The Empty Space (Al-Jawf)",
          text: "The empty space in the mouth and throat. The 3 madd (elongated) letters originate here: Alif, Waw, Yaa.",
        },
        {
          title: "The Throat (Al-Halq)",
          text: "Produces 6 letters. Deep throat (Hamzah, Haa), Middle throat (Ayn, Haa), Top of throat (Ghayn, Khaa).",
        },
        {
          title: "The Tongue (Al-Lisan)",
          text: "The most active organ, producing 18 letters from various parts of the tongue touching the palate or teeth.",
        },
        {
          title: "The Lips (Ash-Shafatain)",
          text: "Produces 4 letters: Baa, Meem, Waw (un-lengthened), and Faa.",
        },
        {
          title: "The Nasal Cavity (Al-Khayshoom)",
          text: "Produces the Ghunnah (nasal sound) for letters Meem and Noon.",
        },
      ],
    },
  ],
  "Hadith Academy": [
    {
      id: "hadith-intro",
      title: "What is Hadith?",
      desc: "Understanding the sayings and actions of Prophet Muhammad ﷺ.",
      time: "4 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "Definition",
          text: "A Hadith is a recorded report of the words, actions, or silent approvals of Prophet Muhammad ﷺ.",
        },
        {
          title: "Matn vs Isnad",
          text: "Matn is the actual text/saying. Isnad is the chain of narrators who passed down the saying.",
        },
        {
          title: "Grading (Sahih)",
          text: "Sahih means authentic. It has an unbroken chain of highly reliable narrators.",
        },
        {
          title: "Grading (Da'if)",
          text: "Da'if means weak. There is a flaw in the chain or the memory of a narrator is questionable. Weak hadith are not used for establishing Islamic law.",
        },
      ],
    },
  ],
  "Ramadan Academy": [
    {
      id: "ramadan-basics",
      title: "Fasting Basics",
      desc: "Rules and etiquettes of fasting in Ramadan.",
      time: "5 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "Intention",
          text: "You must intend to fast before the time of Fajr begins.",
        },
        {
          title: "Suhoor",
          text: "The pre-dawn meal. It is highly recommended to eat Suhoor, even if just dates and water.",
        },
        {
          title: "What breaks a fast?",
          text: "Intentional eating, drinking, smoking, or marital relations between dawn (Fajr) and sunset (Maghrib).",
        },
        {
          title: "Iftar",
          text: "Breaking the fast at sunset. It is Sunnah to break it quickly with dates and water.",
        },
      ],
    },
  ],
  "Zakat Academy": [
    {
      id: "zakat-intro",
      title: "Understanding Zakat",
      desc: "The obligatory charity upon wealth.",
      time: "5 min",
      stepsCount: 4,
      difficulty: "intermediate",
      steps: [
        {
          title: "What is Zakat?",
          text: "The 3rd pillar of Islam. It purifies your wealth by giving a specific portion (2.5%) to the needy.",
        },
        {
          title: "The Nisab",
          text: "The minimum threshold of wealth you must own for a full lunar year before Zakat becomes obligatory. Usually calculated based on the current price of 85 grams of gold or 595 grams of silver.",
        },
        {
          title: "Who pays it?",
          text: "Any sane, adult Muslim whose wealth meets or exceeds the Nisab for a full year.",
        },
        {
          title: "Who receives it?",
          text: "The poor, the needy, those in debt, travelers in need, and those whose hearts are to be reconciled.",
        },
      ],
    },
  ],
  "All Duas": [
    {
      id: "dua-waking-up",
      title: "When Waking Up",
      desc: "Supplication to recite immediately after waking from sleep.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite Upon Waking",
          text: "Recite this dua immediately after waking up.",
          arabic:
            "أَلۡحَمۡدُ لِلَّهِ ٱلَّذِىٓ أَحۡيَانَا بَعۡدَ مَآ أَمَاتَنَا وَإِلَيهِ ٱلنُّشُورُ",
          transliteration:
            "Alhamdu lillaahil-lathee 'ahyaanaa ba'da maa 'amaatanaa wa'ilayhin-nushoor",
          translation:
            "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.",
        },
      ],
    },

    {
      id: "dua-wearing-garment",
      title: "When Wearing a Garment",
      desc: "Thank Allah after putting on any clothing.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "Recite after wearing your clothes.",
          arabic:
            "أَلۡحَمۡدُ لِلَّهِ ٱلَّذِى كَسَانِى هَٰذَا (الثَّوبَ) وَرَزَقَنِيهِ مِنۡ غَيرِ حَولٍ مِنِّى وَلَا قُوَّةٍ",
          transliteration:
            "Alhamdu lillaahil-lathee kasaanee haathaa (ath-thawba) wa razaqaneehi min ghayri hawlim-minnee wa laa quwwatin",
          translation:
            "All praise is for Allah who has clothed me with this garment and provided it for me without any power or strength from myself.",
        },
      ],
    },

    {
      id: "dua-new-garment",
      title: "When Wearing a New Garment",
      desc: "Supplication when wearing newly purchased clothing.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "Recite after wearing a new garment.",
          arabic:
            "أَللَّٰهُمَّ لَكَ ٱلۡحَمۡدُ أَنۡتَ كَسَوتَنِيهِ أَسۡأَلُكَ مِنۡ خَيرِهِ وَخَيرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنۡ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
          transliteration:
            "Allaahumma lakal-hamdu Anta kasawtaneehi, as'aluka min khayrihi wa khayri maa suni'a lahu, wa a'oothu bika min sharrihi wa sharri maa suni'a lahu.",
          translation:
            "O Allah, for You is all praise. You have clothed me with it. I ask You for its goodness and the goodness for which it was made, and I seek refuge in You from its evil and the evil for which it was made.",
        },
      ],
    },

    {
      id: "dua-new-garment-greeting",
      title: "To Someone Wearing a New Garment",
      desc: "Supplication to say for someone wearing new clothes.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Say",
          text: "Congratulate the person with this dua.",
          arabic: "إِلۡبَسۡ جَدِيدًا وَعِشۡ حَمِيدًا وَمُتۡ شَهِيدًا",
          transliteration:
            "Ilbas jadeedan, wa 'ish hameedan, wa mut shaheedan.",
          translation:
            "Wear it anew, live a praiseworthy life, and die as a martyr.",
        },
      ],
    },

    {
      id: "dua-before-undressing",
      title: "Before Undressing",
      desc: "Mention Allah before removing your clothes.",
      time: "30 sec",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Say",
          text: "Recite before removing your clothes.",
          arabic: "بِسۡمِ ٱللَّهِ",
          transliteration: "Bismillaahi",
          translation: "In the Name of Allah.",
        },
      ],
    },

    {
      id: "dua-before-toilet",
      title: "Before Entering the Toilet",
      desc: "Seek Allah's protection before entering the restroom.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Begin",
          text: "Say before entering.",
          arabic: "بِسۡمِ ٱللَّهِ",
          transliteration: "Bismillaahi",
          translation: "In the Name of Allah.",
        },
        {
          title: "Protection",
          text: "Seek Allah's protection.",
          arabic:
            "أَللَّٰهُمَّ إِنِّىٓ أَعُوذُ بِكَ مِنَ ٱلۡخُبۡثِ وَالۡخَبَائِثِ",
          transliteration:
            "Allaahumma 'innee 'a'oothu bika minal-khubthi walkhabaa'ith.",
          translation:
            "O Allah, I seek protection in You from the male and female unclean spirits.",
        },
      ],
    },

    {
      id: "dua-after-toilet",
      title: "After Leaving the Toilet",
      desc: "Seek Allah's forgiveness after leaving the restroom.",
      time: "30 sec",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Say",
          text: "Recite after leaving.",
          arabic: "غُفۡرَانَكَ",
          transliteration: "Ghufraanaka",
          translation: "I seek Your forgiveness.",
        },
      ],
    },

    {
      id: "dua-before-wudu",
      title: "Before Starting Wudu",
      desc: "Mention Allah before beginning ablution.",
      time: "30 sec",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Say",
          text: "Recite before performing wudu.",
          arabic: "بِسۡمِ ٱللَّهِ",
          transliteration: "Bismillaahi",
          translation: "In the Name of Allah.",
        },
      ],
    },

    {
      id: "dua-after-wudu",
      title: "After Completing Wudu",
      desc: "Supplication after finishing ablution.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "Say after completing wudu.",
          arabic:
            "أَشۡهَدُ أَنۡ لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُ وَأَشۡهَدُ أَنَّ مُحَمَّدًا عَبۡدُهُۥ وَرَسُولُهُۥ",
          transliteration:
            "Ash-hadu an laa ilaaha illallaahu wahdahu laa shareeka lahu wa ash-hadu anna Muhammadan abduhu wa Rasooluhu.",
          translation:
            "I bear witness that none has the right to be worshipped except Allah alone with no partner, and I bear witness that Muhammad is His servant and Messenger.",
        },
      ],
    },

    {
      id: "dua-leaving-home",
      title: "When Leaving the Home",
      desc: "Place your trust in Allah before leaving your home.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "Say before stepping outside.",
          arabic:
            "بِسۡمِ ٱللَّهِ تَوَكَّلۡتُ عَلَى ٱللَّهِ وَلَا حَولَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
          transliteration:
            "Bismillaahi, tawakkaltu 'alallaahi, wa laa hawla wa laa quwwata illaa billaah.",
          translation:
            "In the Name of Allah. I place my trust in Allah. There is no might and no power except through Allah.",
        },
      ],
    },
    {
      id: "dua-entering-home",
      title: "Upon Entering the Home",
      desc: "Supplication to recite when entering your home.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "Say this dua when entering your home.",
          arabic:
            "بِسۡمِ ٱللَّهِ وَلَجۡنَا وَبِسۡمِ ٱللَّهِ خَرَجۡنَا وَعَلَى ٱللَّهِ رَبِّنَا تَوَكَّلۡنَا",
          transliteration:
            "Bismillaahi walajnaa, wa bismillaahi kharajnaa, wa 'alaa Rabbinaa tawakkalnaa.",
          translation:
            "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we place our trust.",
        },
        {
          title: "Then Say",
          text: "Greet those inside the home.",
          arabic: "السَّلَامُ عَلَيْكُمْ",
          transliteration: "As-Salaamu 'Alaykum",
          translation: "Peace be upon you.",
        },
      ],
    },

    {
      id: "dua-going-to-mosque",
      title: "Going to the Mosque",
      desc: "Supplication while going to the mosque seeking Allah's light.",
      time: "2 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "Main Dua",
          text: "Recite this while going to the mosque.",
          arabic:
            "أَللَّٰهُمَّ ٱجۡعَلۡ فِى قَلۡبِى نُورًا وَفِى لِسَانِى نُورًا وَفِى سَمۡعِى نُورًا وَفِى بَصَرِى نُورًا وَمِنۡ فَوقِى نُورًا وَمِنۡ تَحۡتِى نُورًا وَعَنۡ يَمِينِى نُورًا وَعَنۡ شِمَالِى نُورًا وَمِنۡ أَمَامِى نُورًا وَمِنۡ خَلۡفِى نُورًا وَاجۡعَلۡ فِى نَفۡسِى نُورًا",
          transliteration:
            "Allaahummaj'al fee qalbee nooran, wa fee lisaaanee nooran, wa fee sam'ee nooran, wa fee basaree nooran, wa min fawqee nooran, wa min tahtee nooran, wa 'an yameenee nooran, wa 'an shimaalee nooran, wa min amaamee nooran, wa min khalfee nooran, waj'al fee nafsee nooran.",
          translation:
            "O Allah, place light in my heart, tongue, hearing, sight, above me, below me, to my right, to my left, before me, behind me and within myself.",
        },
        {
          title: "Ask for More Light",
          text: "Continue with this supplication.",
          arabic:
            "وَأَعۡظِمۡ لِى نُورًا وَعَظِّمۡ لِى نُورًا وَاجۡعَلۡ لِى نُورًا وَاجۡعَلۡنِى نُورًا",
          transliteration:
            "Wa a'dhim lee nooran, wa 'adhdhim lee nooran, waj'al lee nooran, waj'alnee nooran.",
          translation:
            "Magnify my light, increase my light, make for me light and make me a light.",
        },
        {
          title: "Additional Dua",
          text: "Continue asking Allah for light.",
          arabic: "أَللَّٰهُمَّ أَعۡطِنِى نُورًا",
          transliteration: "Allaahumma a'tinee nooran.",
          translation: "O Allah, grant me light.",
        },
        {
          title: "Final Supplication",
          text: "Finish with this dua.",
          arabic: "وَزِدۡنِى نُورًا وَهَبۡ لِى نُورًا عَلَى نُورٍ",
          transliteration: "Wa zidnee nooran, wa hab lee nooran 'alaa noor.",
          translation: "Increase me in light and grant me light upon light.",
        },
      ],
    },

    {
      id: "dua-entering-mosque",
      title: "Upon Entering the Mosque",
      desc: "Supplication to recite before entering the mosque.",
      time: "1 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "Seek Refuge",
          text: "Seek Allah's protection.",
          arabic:
            "أَعُوذُ بِاللَّهِ ٱلۡعَظِيمِ وَبِوَجۡهِهِ ٱلۡكَرِيمِ وَسُلۡطَانِهِ ٱلۡقَدِيمِ مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
          transliteration:
            "A'oothu billaahil-'Adheem, wa bi-Wajhihil-Kareem, wa Sultaanihil-Qadeem, minash-Shaytaanir-Rajeem.",
          translation:
            "I seek refuge in Almighty Allah, by His Noble Face and Eternal Authority from Satan the outcast.",
        },
        {
          title: "Say Bismillah",
          text: "Mention Allah's name.",
          arabic: "بِسۡمِ ٱللَّهِ",
          transliteration: "Bismillaahi",
          translation: "In the Name of Allah.",
        },
        {
          title: "Send Salawat",
          text: "Send blessings upon the Prophet ﷺ.",
          arabic: "وَالصَّلَاةُ وَالسَّلَامُ عَلَىٰ رَسُولِ ٱللَّهِ",
          transliteration: "Wassalaatu wassalaamu 'alaa Rasoolillaahi.",
          translation: "Peace and blessings be upon the Messenger of Allah.",
        },
        {
          title: "Ask for Mercy",
          text: "Recite this dua.",
          arabic: "أَللَّٰهُمَّ ٱفۡتَحۡ لِىٓ أَبۡوَابَ رَحۡمَتِكَ",
          transliteration: "Allaahummaftah lee abwaaba rahmatika.",
          translation: "O Allah, open for me the doors of Your mercy.",
        },
      ],
    },

    {
      id: "dua-leaving-mosque",
      title: "Upon Leaving the Mosque",
      desc: "Supplication to recite when leaving the mosque.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "Leave with your left foot first and recite this dua.",
          arabic:
            "بِسۡمِ ٱللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَىٰ رَسُولِ ٱللَّهِ أَللَّٰهُمَّ إِنِّىٓ أَسۡأَلُكَ مِنۡ فَضۡلِكَ أَللَّٰهُمَّ ٱعۡصِمۡنِى مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
          transliteration:
            "Bismillaahi wassalaatu wassalaamu 'alaa Rasoolillaahi, Allaahumma innee as'aluka min fadhlika, Allaahumma'simnee minash-Shaytaanir-rajeem.",
          translation:
            "In the Name of Allah, peace and blessings be upon the Messenger of Allah. O Allah, I ask You for Your bounty. O Allah, protect me from Satan the outcast.",
        },
      ],
    },

    {
      id: "dua-hearing-adhan",
      title: "Upon Hearing the Adhan",
      desc: "Supplications and responses while listening to the call to prayer.",
      time: "3 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "Repeat the Adhan",
          text: "Repeat every phrase after the Mu'adhdhin except Hayya 'alas-Salah and Hayya 'alal-Falah.",
        },
        {
          title: "Instead Say",
          text: "When the Mu'adhdhin says 'Hayya alas-Salah' and 'Hayya alal-Falah', recite:",
          arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
          transliteration: "Laa hawla wa laa quwwata illaa billaah.",
          translation: "There is no might and no power except with Allah.",
        },
        {
          title: "Declaration of Faith",
          text: "After the Adhan finishes.",
          arabic:
            "وَأَنَا أَشۡهَدُ أَنۡ لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُ...",
          transliteration:
            "Wa anaa ash-hadu an laa ilaaha illallaahu wahdahu laa shareeka lahu...",
          translation:
            "I bear witness that none has the right to be worshipped except Allah alone...",
        },
        {
          title: "Dua After Adhan",
          text: "Ask Allah to grant the Prophet ﷺ Al-Waseelah.",
          arabic: "أَللَّٰهُمَّ رَبَّ هَٰذِهِ ٱلدَّعۡوَةِ ٱلتَّامَّةِ...",
          transliteration: "Allaahumma Rabba haathihid-da'watit-taammati...",
          translation:
            "O Allah, Lord of this perfect call and established prayer, grant Muhammad the highest station and excellence.",
        },
      ],
    },
    {
      id: "dua-start-prayer-1",
      title: "At the Start of the Prayer",
      desc: "Opening supplication recited after Takbiratul Ihram before Surah Al-Fatihah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Opening Supplication",
          text: "Recite this dua after beginning the prayer and before reciting Surah Al-Fatihah.",
          arabic:
            "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ",
          transliteration:
            "Allaahumma baa'id baynee wa bayna khataayaaya kamaa baa'adta baynal-mashriqi wal-maghribi. Allaahumma naqqinee min khataayaaya kamaa yunaqqath-thawbul-'abyadhu minad-danasi. Allaahumma aghsilnee min khataayaaya bil-maa'i wath-thalji wal-barad.",
          translation:
            "O Allah, separate me from my sins as You have separated the East from the West. O Allah, cleanse me of my sins as a white garment is cleansed of dirt. O Allah, wash away my sins with water, snow and hail.",
          reference: "Sahih al-Bukhari 744, Sahih Muslim 598",
        },
      ],
    },
    {
      id: "dua-rukoo-1",
      title: "While in Rukoo",
      desc: "Supplication to recite while bowing in prayer.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite in Rukoo",
          text: "Say this three times while in the bowing position.",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory be to my Lord, the Most Great.",
          reference:
            "Abu Dawud 870, Ibn Majah 897, An-Nasa'i 1107, At-Tirmidhi 262",
        },
      ],
    },

    {
      id: "dua-rising-from-rukoo-1",
      title: "Upon Rising from Rukoo",
      desc: "Supplication recited when rising from the bowing position.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Rise from Rukoo",
          text: "Recite this while standing up from rukoo.",
          arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ",
          transliteration: "Sami'allaahu liman hamidah.",
          translation: "Allah hears whoever praises Him.",
          reference: "Sahih al-Bukhari",
        },
      ],
    },
    {
      id: "dua-sujood-1",
      title: "Whilst Prostrating (Sujood)",
      desc: "Supplication to recite while in prostration.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite in Sujood",
          text: "Say this three times while prostrating.",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-A'laa.",
          translation: "Glory be to my Lord, the Most High.",
          reference: "Abu Dawud, Ibn Majah, An-Nasa'i, At-Tirmidhi, Ahmad",
        },
      ],
    },
    {
      id: "dua-between-prostrations-1",
      title: "Between Two Prostrations",
      desc: "Supplication recited while sitting between the two prostrations.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite Between Sujood",
          text: "Recite this while sitting between the two prostrations.",
          arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "My Lord, forgive me. My Lord, forgive me.",
          reference: "Abu Dawud 850, Ibn Majah 898",
        },
      ],
    },
    {
      id: "dua-sujood-tilawah-1",
      title: "Prostration Due to Quran Recitation",
      desc: "Supplication recited during the prostration of Quran recitation (Sujood At-Tilawah).",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite During Sujood At-Tilawah",
          text: "Recite this while making the prostration of Quran recitation.",
          arabic:
            "سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ وَشَقَّ سَمْعَهُ وَبَصَرَهُ بِحَوْلِهِ وَقُوَّتِهِ فَتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ",
          transliteration:
            "Sajada wajhiya lillathee khalaqahu, wa shaqqa sam'ahu wa basarahu bihawlihi wa quwwatihi. Fatabaarakallaahu ahsanul-khaaliqeen.",
          translation:
            "My face has prostrated to the One Who created it and gave it hearing and sight by His might and power. Blessed is Allah, the Best of creators.",
          reference: "At-Tirmidhi 580, Ahmad 24072, Al-Hakim",
        },
      ],
    },
    {
      id: "dua-tashahhud-1",
      title: "The Tashahhud",
      desc: "The testimony recited while sitting during the prayer.",
      time: "2 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Recite the Tashahhud",
          text: "Recite this while sitting in the Tashahhud position.",
          arabic:
            "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
          transliteration:
            "Attahiyyaatu lillaahi wassalawaatu wattayyibaatu. Assalaamu 'alayka ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuhu. Assalaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ashhadu an laa ilaaha illallaahu wa ashhadu anna Muhammadan 'abduhu wa Rasooluhu.",
          translation:
            "All greetings, prayers and pure words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that none has the right to be worshipped except Allah, and I bear witness that Muhammad is His servant and Messenger.",
          reference: "Sahih al-Bukhari, Sahih Muslim",
        },
      ],
    },
    {
      id: "dua-23-1",
      title: "Prayers upon the Prophet after tashahhud #1",
      desc: "Supplication to bestow favor and blessings upon the Prophet Muhammad.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Salawat",
          text: "Recite this after the tashahhud.",
          arabic:
            "أَللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيتَ عَلَىٰ إِبۡرَاهِيمَ وَعَلَىٰ آلِ إِبۡرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ أَللَّٰهُمَّ بَارِكۡ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكۡتَ عَلَىٰ إِبۡرَاهِيمَ وَعَلَىٰ آلِ إِبۡرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
          transliteration:
            "Allaahumma salli 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa sallayta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammadin wa 'alaa 'aali Muhammadin, kamaa baarakta 'alaa 'Ibraaheema wa 'alaa 'aali 'Ibraaheema, 'innaka Hameedun Majeed.",
          translation:
            "O Allah, bestow Your favor on Muhammad and on the family of Muhammad as You have bestowed Your favor on Ibrahim and on the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You have blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
          reference: "Al-Bukhari, from Al-Asqalani, Fathul-Bari 6/408",
        },
      ],
    },
    {
      id: "dua-24-1",
      title:
        "Protection from punishment of the grave, trials of life, death & Dajjal",
      desc: "Seeking refuge in Allah from various trials and punishments.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Refuge",
          text: "Recite this to seek protection.",
          arabic:
            "أَللَّٰهُمَّ إِنِّى أَعُوذُ بِكَ مِنۡ عَذَابِ ٱلۡقَبۡرِ وَمِنۡ عَذَابِ جَهَنَّمَ وَمِنۡ فِتۡنَةِ ٱلۡمَحۡيَا وَالۡمَمَاتِ وَمِنۡ شَرِّ فِتۡنَةِ ٱلۡمَسِيحِ ٱلدَّجَّالِ",
          transliteration:
            "Allaahumma 'innee 'a'oothu bika min l'athaabil-qabri, wa min 'athaabi jahannama, wa min fitnatil-mahyaa walmamaati, wa min sharri fitnatil-maseehid-dajjaal.",
          translation:
            "O Allah, I seek refuge in You from the punishment of the grave, and from the punishment of Hell-fire, and from the trials of life and death, and from the evil of the trial of the False Messiah.",
          reference: "Al-Bukhari 2/102, Muslim 1/412",
        },
      ],
    },
    {
      id: "dua-25-1",
      title: "Dua after salaam #1",
      desc: "Supplications to be recited immediately after concluding the prayer.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Forgiveness",
          text: "Say three times.",
          arabic: "أَسۡتَغۡفِرُ ٱللَّهَ",
          transliteration: "'Astaghfirullaaha",
          translation: "I ask Allaah for forgiveness.",
          reference: "Muslim 1/414",
        },
        {
          title: "Supplication of Peace",
          text: "Then say this dua.",
          arabic:
            "أَللَّٰهُمَّ أَنۡتَ ٱلسَّلَامُ وَمِنۡكَ ٱلسَّلَامُ تَبَارَكۡتَ يَا ذَا ٱلۡجَلَالِ وَالۡإِكۡرَامِ",
          transliteration:
            "Allaahumma 'Antas-Salaamu wa minkas-salaamu, tabaarakta yaa Thal-Jalaali wal-'Ikraam",
          translation:
            "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.",
          reference: "Muslim 1/414",
        },
      ],
    },
    {
      id: "dua-26",
      title: "Istikharah (Seeking Allah's help in making a decision)",
      desc: "A prayer for guidance in all of our concerns.",
      time: "3 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Dua of Istikharah",
          text: "Pray two supererogatory units (naafilah) of prayer and after which supplicate with this dua.",
          arabic:
            "أَللَّٰهُمَّ إِنِّى أَسۡتَخِيرُكَ بِعِلۡمِكَ وَأَسۡتَقۡدِرُكَ بِقُدۡرَتِكَ وَأَسۡأَلُكَ مِنۡ فَضۡلِكَ ٱلعَظِيمِ فَإِنَّكَ تَقۡدِرُ وَلَا أَقۡدِرُ وَتَعۡلَمُ وَلَا أَعۡلَمُ وَأَنۡتَ عَلَّامُ ٱلۡغُيُوبِ أَللَّٰهُمَّ إِنۡ كُنۡتَ تَعۡلَمُ أَنَّ هَٰذَا ٱلۡأَمۡرَ (وَيُسَمِّى حَاجَتَهُ) خَيرٌ لِى فِى دِينِى وَمَعَاشِى وَعَاقِبَةِ أَمۡرِى فَاقۡدُرۡهُ لِى وَيَسِّرۡهُ لِى ثُمَّ بَارِكۡ لِى فِيهِ وَإِنۡ كُنۡتَ تَعۡلَمُ أَنَّ هَٰذَا ٱلۡأَمۡرَ شَرٌّ لِى فِى دِينِى وَمَعَاشِى وَعَاقِبَةِ أَمۡرِى فَاصۡرِفۡهُ عَنِّى وَاصۡرِفۡنِى عَنۡهُ وَاقۡدُرۡ لِىَ ٱلۡخَيرَ حَيثُ كَانَ ثُمَّ أَرۡضِنِى بِهِ",
          transliteration:
            "Allaahumma 'innee 'astakheeruka bi'ilmika, wa 'astaqdiruka biqudratika, wa 'as'aluka min fadhtikal-'Adheemi, fa'innaka taqdiru wa laa 'aqdiru, wa ta'lamu, wa laa 'a'lamu, wa 'Anta 'Allaamul-Ghuyoobi, Allaahumma 'in kunta ta'lamu 'anna haathal-'amra- [then mention the thing to be decided] Khayrun lee fee deenee wa ma'aashee wa 'aaqibati 'amree - [or say] 'Aajilihi wa 'aajilihi - Faqdurhu lee wa yassirhu lee thumma baarik lee feehi, wa 'in kunta ta'lamu 'anna haathal-'amra sharrun lee fee deenee wa ma'aashee wa 'aaqibati 'amree - [or say] 'Aajilihi wa 'aajilihi - Fasrifhu 'annee wasrifnee 'anhu waqdur liyal-khayra haythu kaana thumma 'ardhinee bihi.",
          translation:
            "O Allah, I seek the counsel of Your Knowledge, and I seek the help of Your Omnipotence, and I beseech You for Your Magnificent Grace. Surely, You are Capable and I am not. You know and I know not, and You are the Knower of the unseen. O Allah, if You know that this matter [then mention the thing to be decided] is good for me in my religion and in my life and for my welfare in the life to come, - [or say: in this life and the afterlife] - then ordain it for me and make it easy for me, then bless me in it. And if You know that this matter is bad for me in my religion and in my life and for my welfare in the life to come, - [or say: in this life and the afterlife] - then distance it from me, and distance me from it, and ordain for me what is good wherever it may be, and help me to be content with it.",
          reference: "Al-Bukhari 7/162",
        },
      ],
    },
    {
      id: "dua-27-1",
      title: "Excellence of dua in the morning & evening",
      desc: "The reward and virtue of remembering Allah during the morning and evening.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Virtue of Remembrance",
          text: "Anas (RA) said that he heard the Prophet (SAW) say: 'That I sit with people remembering Almighty Allah from the morning (Fajr) prayer until sunrise is more beloved to me than freeing four slaves from among the Children of Isma'il. That I sit with people remembering Allah from the afternoon ('Asr) prayer until the sun sets is more beloved to me than freeing four slaves from among the Children of Isma'il.'",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Abu Dawud (no. 3667), Sahih Abu Dawud 2/698",
        },
      ],
    },
    {
      id: "dua-28-1",
      title: "Last three Surahs of the Quran",
      desc: "To be recited upon retiring to bed every night. Blow lightly into cupped hands, recite, and wipe the body three times.",
      time: "3 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "Surah Al-Ikhlas",
          text: "Recite Surah Al-Ikhlas.",
          arabic:
            "﷽ قُلۡ هُوَ ٱللَّهُ أَحَدٌ‌ ۚ‏ أَللَّٰهُ ٱلصَّمَدُ‌ ۚ‏ لَمۡ يَلِدۡ ۙوَلَمۡ يُولَدۡ ۙ‏ وَلَمۡ يَكُنۡ لَّهُۥ كُفُوًا أَحَدٌ",
          transliteration:
            "Bismillaahir-Rahmaanir-Raheem. Qul Huwallaahu 'Ahad. Allaahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan 'ahad.",
          translation:
            "With the Name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah (the) One. The Self-Sufficient Master, Whom all creatures need, He begets not nor was He begotten, and there is none equal to Him",
          reference: "Al-Bukhari, Fathul Bari 9/62, Muslim 4/ 1723",
        },
        {
          title: "Surah Al-Falaq",
          text: "Recite Surah Al-Falaq.",
          arabic:
            "﷽ قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِۙ‏ مِنۡ شَرِّ مَا خَلَقَۙ‏ وَمِنۡ شَرِّ غَاسِقٍ إِذَا وَقَبَۙ‏ وَمِنۡ شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلۡعُقَدِۙ‏ وَمِنۡ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
          transliteration:
            "Bismillaahir-Rahmaanir-Raheem. Qul 'a'oothu birabbil-falaq. Min sharri maa khalaq. Wa min sharri ghaasiqin 'ithaa waqab. Wa min sharrin-naffaathaati fil-'uqad. Wa min sharri haasidin 'ithaa hasad.",
          translation:
            "With the Name of Allah, the Most Gracious, the Most Merciful. Say: I seek refuge with (Allah) the Lord of the daybreak, from the evil of what He has created, and from the evil of the darkening (night) as it comes with its darkness, and from the evil of those who practice witchcraft when they blow in the knots, and from the evil of the envier when he envies.",
          reference: "Al-Bukhari, Fathul Bari 9/62, Muslim 4/ 1723",
        },
        {
          title: "Surah An-Nas",
          text: "Recite Surah An-Nas.",
          arabic:
            "﷽ قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِۙ‏ مَلِكِ ٱلنَّاسِۙ‏ إِلَٰهِ ٱلنَّاسِۙ‏ مِنۡ شَرِّ ٱلۡوَسۡوَاسِ ۙ ٱلۡخَـنَّاسِ ۙ‏ ٱلَّذِىۡ يُوَسۡوِسُ فِى صُدُورِ ٱلنَّاسِۙ‏ مِنَ ٱلۡجِنَّةِ وَالنَّاسِ",
          transliteration:
            "Bismillaahir-Rahmaanir-Raheem. Qul 'a'oothu birabbin-naas. Malikin-naas. 'Ilaahin-naas. Min sharril-waswaasil-khannaas. Allathee yuwaswisu fee sudoorin-naas. Minal-jinnati wannaas.",
          translation:
            "With the Name of Allah, the Most Gracious, the Most Merciful. Say: I seek refuge with (Allah) the Lord of mankind, the King of mankind, the God of mankind, from the evil of the whisperer who withdraws, who whispers in the breasts of mankind, of jinns and men.",
          reference: "Al-Bukhari, Fathul Bari 9/62, Muslim 4/ 1723",
        },
      ],
    },
    {
      id: "dua-29",
      title: "When turning over during the night",
      desc: "Supplication to say if you wake up and turn over in your sleep.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Remembrance of Allah",
          text: "Recite this upon turning over at night.",
          arabic:
            "لَآ إِلَٰهَ إِلَّا ٱللَّهُ ٱلۡوَاحِدُ ٱلۡقَهَّارُ رَبُّ ٱلسَّمَاوَاتِ وَالۡأَرۡضِ وَمَا بَينَهُمَا ٱلۡعَزِيزُ ٱلۡغَفَّارُ",
          transliteration:
            "Laa 'ilaaha 'illallaahul-Waahidul-Qahhaaru, Rabbus-samaawaati wal'ardhi wa maa baynahumal-'Azeezul-Ghaffaaru.",
          translation:
            "There is none worthy of worship but Allah, the One, the Victorious, Lord of the heavens and the earth and all that is between them, the All-Mighty, the All-Forgiving.",
          reference: "Imam Dhahabi 1/540, Nasai No. 202",
        },
      ],
    },
    {
      id: "dua-30",
      title: "Upon experiencing fear or unrest during sleep",
      desc: "Seeking protection through the Perfect Words of Allah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Protection",
          text: "Recite this if experiencing fear while sleeping.",
          arabic:
            "أَعُوذُ بِكَلِمَاتِ ٱللَّهِ ٱلتَّامَّاتِ مِنۡ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنۡ هَمَزَاتِ ٱلشَّيَاطِينِ وَأَنۡ يَحۡضُرُونِ",
          transliteration:
            "A'oothu bikalimaatil-laahit-taammaati min ghadhabihi wa 'iqaabihi, wa sharri 'ibaadihi, wa min hamazaatish-shayaateeni wa 'an yahdhuroon.",
          translation:
            "I seek refuge in the Perfect Words of Allah from His anger and His punishment, from the evil of His slaves and from the taunts of devils and from their presence.",
          reference: "Abu Dawud 4/12, Sahih At-Tirmithi 3/171",
        },
      ],
    },
    {
      id: "dua-31",
      title: "Upon seeing a good or a bad dream",
      desc: "Steps to take after waking up from an unpleasant dream.",
      time: "1 min",
      stepsCount: 5,
      difficulty: "beginner",
      steps: [
        {
          title: "Step 1",
          text: "Spit to your left (three times).",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Muslim 4/1 772, 3",
        },
        {
          title: "Step 2",
          text: "Seek refuge in Allah from the Devil and from the evil of what you have seen (three times).",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "",
        },
        {
          title: "Step 3",
          text: "Do not speak about it to anyone.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "",
        },
        {
          title: "Step 4",
          text: "Turn over on your other side.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "",
        },
        {
          title: "Step 5",
          text: "Get up and pray if you desire to do so.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "",
        },
      ],
    },
    {
      id: "dua-32-1",
      title: "Dua Qunut in Witr prayer #1",
      desc: "Supplication for guidance, strength, and protection recited during the Witr prayer.",
      time: "2 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Dua Qunut",
          text: "Recite this during the Qunut of Witr.",
          arabic:
            "أَللَّٰهُمَّ ٱهۡدِنِى فِيمَنۡ هَدَيتَ وَعَافِنِى فِيمَنۡ عَافَيتَ وَتَوَلَّنِى فِيمَنۡ تَوَلَّيتَ وَبَارِكۡ لِى فِيمَا أَعۡطَيتَ وَقِنِى شَرَّ مَا قَضَيتَ فَإِنَّكَ تَقۡضِى وَلَا يُقۡضَىٰ عَلَيكَ إِنَّهُۥ لَا يَذِلُّ مَنۡ وَالَيتَ (وَلَا يَعِزُّ مَنۡ عَادَيتَ) تَبَارَكۡتَ رَبَّنا وَتَعَالَيتَ",
          transliteration:
            "Allaahum-mahdinee feeman hadayta, wa 'aafinee feeman 'aafayta, wa tawallanee feeman tawallayta, wa baarik lee feemaa 'a'atayta, wa qinee sharra maa qadhayta, fa'innaka taqdhee wa laa yuqdhaa 'alayka, 'innahu laa yathillu man waalayta, [wa laa ya 'izzu man 'aadayta] , tabaarakta Rabbanaa wa ta'aalayta.",
          translation:
            "O Allah, guide me with those whom You have guided, and strengthen me with those whom You have given strength. Take me to Your care with those whom You have taken to Your care. Bless me in what You have given me. Protect me from the evil You have ordained. Surely, You command and are not commanded, and none whom You have committed to Your care shall be humiliated [and none whom You have taken as an enemy shall taste glory]. You are Blessed, Our Lord, and Exalted.",
          reference: "Abu Dawud, Ibn Majah, An-Nasa'i, At-Tirmithi",
        },
      ],
    },
    {
      id: "dua-33",
      title: "After salaam of the Witr prayer",
      desc: "Remembrances to say after completing the Witr prayer.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Glorifying the King",
          text: "Say this three times.",
          arabic: "سُبۡحَانَ ٱلۡمَلِكِ ٱلۡقُدُّوسِ",
          transliteration: "Subhaanal-Malikil-Quddoosi.",
          translation: "Glory is to the King, the Holy.",
          reference: "An-Nasa'i 3/244",
        },
        {
          title: "Raising the Voice",
          text: "Raise and extend the voice on the third time and add this.",
          arabic: "رَبِّ ٱلۡمَلَائِكَةِ وَالرُّوحِ",
          transliteration: "Rabbil-malaa'ikati warroohi.",
          translation: "Lord of the angels and the Spirit.",
          reference: "Abu Dawud 2/87",
        },
      ],
    },
    {
      id: "dua-34-1",
      title: "Anxiety and sorrow #1",
      desc: "A supplication asking Allah to make the Quran the spring of the heart and reliever of distress.",
      time: "2 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Reliever of Distress",
          text: "Recite this when experiencing anxiety or sorrow.",
          arabic:
            "أَللَّٰهُمَّ إِنِّى عَبۡدُكَ إِبۡنُ عَبۡدِكَ إِبۡنُ أَمَتِكَ نَاصِيَتِى بِيَدِكَ مَاضٍ فِىِّ حُكۡمُكَ عَدۡلٌ فِىِّ قَضَاؤُكَ أَسۡأَلُكَ بِكُلِّ إِسۡمٍ هُوَ لَكَ سَمَّيتَ بِهِۦ نَفۡسَكَ أَو أَنۡزَلۡتَهُۥ فِى كِتَابِكَ أَو عَلَّمۡتَهُۥ أَحَدًا مِنۡ خَلۡقِكَ أَوِ ٱسۡتَأۡثَرۡتَ بِهِۦ فِى عِلۡمِ ٱلۡغَيبِ عِنۡدَكَ أَنۡ تَجۡعَلَ ٱلۡقُرۡءَانَ رَبِيعَ قَلۡبِى وَنُورَ صَدۡرِى وَجَلَآءَ حُزۡنِى وَذَهَابَ هَمِّى",
          transliteration:
            "Allaahumma 'innee 'abduka, ibnu 'abdika, ibnu 'amatika, naasiyatee biyadika, maadhin fiyya hukmuka, 'adlun fiyya qadhaa'uka, 'as'aluka bikulli ismin huwa laka, sammayta bihi nafsaka, 'aw 'anzaltahu fee kitaabika, 'aw 'allamtahu 'ahadan min khalqika, 'awista'tharta bihi fee 'ilmil-ghaybi 'indaka, 'an taj'alal-Qur'aana rabee'a qalbee, wa noora sadree, wa jalaa'a huznee, wa thahaaba hammee.",
          translation:
            "O Allah, I am Your slave and the son of Your male slave and the son of your female slave. My forehead is in Your Hand (i.e. you have control over me). Your Judgment upon me is assured and Your Decree concerning me is just. I ask You by every Name that You have named Yourself with, revealed in Your Book, taught any one of Your creation or kept unto Yourself in the knowledge of the unseen that is with You, to make the Qur'an the spring of my heart, and the light of my chest, the banisher of my sadness and the reliever of my distress.",
          reference: "Ahmad 1/391",
        },
      ],
    },
    {
      id: "dua-35-1",
      title: "When in distress #1",
      desc: "Declaring the Oneness of Allah and His Lordship over the Magnificent Throne.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Dua of Distress",
          text: "Recite this when in a state of distress.",
          arabic:
            "لَآ إِلَٰهَ إِلَّا ٱللَّهُ ٱلۡعَظِيمُ ٱلۡحَلِيمُ لَآ إِلَٰهَ إِلَّا ٱللَّهُ رَبُّ ٱلۡعَرۡشِ ٱلۡعَظِيمِ لَآ إِلَٰهَ إِلَّا ٱللَّهُ رَبُّ ٱلسَّمَاوَاتِ وَرَبُّ ٱلۡأَرۡضِ وَرَبُّ ٱلۡعَرۡشِ ٱلۡكَرِيمِ",
          transliteration:
            "Laa 'ilaaha 'illallaahul-'Adheemul-Haleem, laa 'ilaaha 'illallaahu Rabbul-'Arshil-'Adheem, laa 'ilaaha 'illallaahu Rabbus-samaawaati wa Rabbul-'ardhi wa Rabbul-'Arshil-Kareem.",
          translation:
            "There is none worthy of worship but Allah the Mighty, the Forbearing. There is none worthy of worship but Allah, Lord of the Magnificent Throne. There is none worthy of worship but Allah, Lord of the heavens and Lord of the earth, and Lord of the Noble Throne.",
          reference: "Al-Bukhari 8/154, Muslim 4/2092",
        },
      ],
    },
    {
      id: "dua-36-1",
      title: "Upon encountering an enemy or those of authority #1",
      desc: "Seeking Allah's restraint against enemies and refuge from their evil.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Against Enemies",
          text: "Recite this when facing opposition.",
          arabic:
            "أَللَّٰهُمَّ إِنَّا نَجۡعَلُكَ فِى نُحُورِهِم وَنَعُوذُ بِكَ مِنۡ شُرُورِهِمۡ",
          transliteration:
            "Allaahumma 'innaa naj'aluka fee nuhoorihim wa na'oothu bika min shuroorihim.",
          translation:
            "O Allah, we ask You to restrain them by their necks and we seek refuge in You from their evil.",
          reference: "Abu Dawud 2/89",
        },
      ],
    },
    {
      id: "dua-37-1",
      title: "Dua against the oppression of rulers #1",
      desc: "Seeking the support of the Lord of the Seven Heavens against an oppressor.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from Oppression",
          text: "Say this to seek support against an abusive person (inserting their name where indicated).",
          arabic:
            "أَللَّٰهُمَّ رَبَّ ٱلسَّمَاوَاتِ ٱلسَّبۡعِ وَرَبَّ ٱلۡعَرۡشِ ٱلۡعَظِيمِ كُنۡ لِى جَارًا مِنۡ فُلَانِ بۡنِ فُلَانٍ وَأَحۡزَابِهِ مِنۡ خَلَآئِقِكَ أَنۡ يَفۡرُطَ عَلَىَّ أَحَدٌ مِنۡهُمۡ أَو يَطۡغَىٰ عَزَّ جَارُكَ وَجَلَّ ثَنَاؤُكَ وَلَآ إِلَٰهَ إِلَّآ أَنۡتَ",
          transliteration:
            "Allaahumma Rabbas-samaawaatis-sab'i, wa Rabbal-'Arshil-'Adheem, kun lee jaaran min (name of the person), wa 'ahzaabihi min khalaa'iqika, 'an yafruta 'alayya 'ahadun minhum 'aw yatghaa, 'azzajaaruka, wajalla thanaa'uka, wa laa 'ilaaha 'illaa 'Anta.",
          translation:
            "O Allah, Lord of the Seven heavens, Lord of the Magnificent Throne, be for me a support against (say the person's name) and his helpers from among your creatures, lest any of them abuse me or do me wrong. Mighty is Your patronage and glorious are Your praises. There is none worthy of worship but You.",
          reference: "Bukhari, Al Adab Al Mufrad No. 712",
        },
      ],
    },
    {
      id: "dua-38",
      title: "Dua made against an enemy",
      desc: "Calling upon the Revealer of the Book to defeat opposing groups.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Defeat of the Enemy",
          text: "Recite this against an enemy.",
          arabic:
            "أَللَّٰهُمَّ مُنۡزِلَ ٱلۡكِتَابِ سَرِيعَ ٱلۡحِسَابِ إِهۡزِمِ ٱلۡأَحۡزَابَ أَللَّٰهُمَّ ٱهۡزِمۡهُمۡ وَزَلۡزِلۡهُمۡ",
          transliteration:
            "Allaahumma munzilal-kitaabi, saree'al-hisaabi, ihzimil-'ahzaaba, Allaahumma ihzimhum wa zalzilhum.",
          translation:
            "Allah, Revealer of the Book, Swift to account, defeat the groups (of disbelievers). O Allah, defeat them and shake them.",
          reference: "Muslim 3/1362",
        },
      ],
    },
    {
      id: "dua-39",
      title: "What to say when in fear of people",
      desc: "Asking Allah for sufficiency and protection.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Sufficiency from Allah",
          text: "Recite this when afraid of people.",
          arabic: "أَللَّٰهُمَّ ٱكۡفِنِيهِمۡ بِمَا شِئۡتَ",
          transliteration: "Allaahummak-fineehim bimaa shi'ta.",
          translation:
            "O Allah, suffice (i.e. protect) me against them however You wish.",
          reference: "Muslim 4/2300",
        },
      ],
    },
    {
      id: "dua-40-1",
      title: "If afflicted with doubt in his faith #1",
      desc: "Steps to take if experiencing doubts in faith.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Seek Refuge",
          text: "He should seek refuge in Allah and renounce that which is causing such doubt.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
          transliteration: "'A'oothu billaahi minash-Shaytaanir-rajeem.",
          translation: "I seek refuge in Allah from Satan the outcast.",
          reference: "Al Bukhaaree with al-Fath 6/336",
        },
        {
          title: "Affirm Belief",
          text: "He should say this affirmation.",
          arabic: "ءَامَنۡتُ بِاللَّهِ وَرُسُلِهِ",
          transliteration: "'Aamantu billaahi wa Rusulihi.",
          translation: "I believe in Allah and His Messenger.",
          reference: "Muslim 1/119, 120",
        },
      ],
    },
    {
      id: "dua-41-2",
      title: "Settling a debt #2",
      desc: "Seeking refuge from negative states of being, including being overcome by debt.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Refuge from Debt",
          text: "Recite this to seek aid with debts.",
          arabic:
            "أَللَّٰهُمَّ إِنِّى أَعُوذُ بِكَ مِنَ ٱلۡهَمِّ وَالۡحَزَنِ وَالۡعَجۡزِ وَالۡكَسَلِ وَالۡبُخۡلِ وَالۡجُبۡنِ وَضَلَعِ ٱلدَّينِ وَغَلَبَةِ ٱلرِّجَالِ",
          transliteration:
            "Allaahumma 'innee 'a'oothu bika minal-hammi walhazani, wal'ajzi walkasali, walbukhli waljubni, wa dhala'id-dayni wa ghalabatir-rijaali.",
          translation:
            "O Allah, I seek refuge in You from grief and sadness, from weakness and from laziness, from miserliness and from cowardice, from being overcome by debt and from being overpowered by men (i.e. other people).",
          reference: "Al-Bukhaaree 7/157",
        },
      ],
    },
    {
      id: "dua-42",
      title: "If afflicted by whisperings in prayer or recitation",
      desc: "Seeking refuge from the devil named Khanzab who causes confusion in prayer.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection during Prayer",
          text: "If you sense his presence then seek refuge in Allah from him and spit on your left side three times.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
          transliteration: "'A'oothu billaahi minash-Shaytaanir-rajeem.",
          translation: "I seek refuge in Allah from Satan the outcast.",
          reference: "Muslim 4/1729",
        },
      ],
    },
    {
      id: "dua-43",
      title: "When one's affairs have become difficult",
      desc: "Asking Allah to turn difficulty into ease.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Dua for Ease",
          text: "Recite this when affairs become hard.",
          arabic:
            "أَللَّٰهُمَّ لَا سَهۡلَ إِلَّا مَا جَعَلۡتَهُ سَهۡلاً وَأَنۡتَ تَجۡعَلُ ٱلۡحَزۡنَ إِذَا شِئۡتَ سَهۡلاً",
          transliteration:
            "Allaahumma laa sahla illaa maa ja'altahu sahlan wa Anta taj'alul-hazna 'ithaa shi'ta sahlan.",
          translation:
            "O Allah, there is no ease other than what You make easy. If You please You ease sorrow.",
          reference: "Ibn Hibban Sahih (no. 2427)",
        },
      ],
    },
    {
      id: "dua-44",
      title: "Upon committing a sin",
      desc: "The steps to take for seeking forgiveness after falling into sin.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Repentance",
          text: "Any servant who commits a sin and as a result, performs ablution, prays two units of prayer [i.e., two rakats] and then seeks Allaah's forgiveness, Allaah would forgive him.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Abu Dawud 2/86, At-Tirmithi 2/257",
        },
      ],
    },
    {
      id: "dua-45",
      title: "For expelling the devil and his whisperings",
      desc: "Various acts and supplications to keep Satan away.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Refuge",
          text: "Seek refuge from him through the Adhaan, Quran recitation, and authentic words of remembrance.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
          transliteration: "'A'oothu billaahi minash-Shaytaanir-rajeem.",
          translation: "I seek refuge in Allah from Satan the outcast.",
          reference: "Abu Dawud 1/206, Muslim 1/291",
        },
      ],
    },
    {
      id: "dua-46",
      title: "When stricken with a mishap or overtaken by an affair",
      desc: "Accepting the decree of Allah rather than dwelling on 'if only'.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Accepting the Decree",
          text: "If a mishap should happen to befall you then do not say: If only I had acted... Rather, say this.",
          arabic: "قَدَرُ ٱللَّهِ وَمَا شَآءَ فَعَلَ",
          transliteration: "Qadarullaahi wa maa shaa'afa'ala.",
          translation:
            "It is the Decree of Allah and He does whatever He wills.",
          reference: "Muslim 4/2052",
        },
        {
          title: "Trust in Allah",
          text: "If a matter should overtake you then say this.",
          arabic: "حَسۡبُنَا ٱللَّهُ وَنِعۡمَ ٱلۡوَكِيلُ",
          transliteration: "Hasbunallaahu wa ni'amal-wakeel.",
          translation:
            "Allaah is sufficient for me, and how fine a trustee (He is).",
          reference: "Abu Daawud",
        },
      ],
    },
    {
      id: "dua-47",
      title: "Congratulations on the occasion of a birth",
      desc: "The greeting provided to a new parent, and the parent's reply.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "To the New Parent",
          text: "Say this to congratulate the new parent.",
          arabic:
            "بَارَكَ ٱللَّهُ لَكَ فِى ٱلۡمَوهُوبِ لَكَ وَشَكَرۡتَ ٱلۡوَاهِبَ وَبَلَغَ أَشُدَّهُ وَرُزِقۡتَ بِرَّهُ",
          transliteration:
            "Baarakallaahu laka fil-mawhoobi laka, wa shakartal-waahiba, wa balagha 'ashuddahu, wa ruziqta birrahu.",
          translation:
            "May Allah bless you with His gift to you, and may you (the new parent) give thanks, may the child reach the maturity of years, and may you be granted its righteousness.",
          reference: "Hasan Al basri Rahimullah, Tuhfatul maodud",
        },
        {
          title: "Reply of the Parents",
          text: "The parent should reply with this.",
          arabic:
            "بَارَكَ ٱللَّهُ لَكَ وَبَارَكَ عَلَيكَ وَجَزَاكَ ٱللَّهُ خَيرًا وَرَزَقَكَ ٱللَّهُ مِثۡلَهُ وَأَجۡزَلَ ثَوَابَكَ",
          transliteration:
            "Baarakallahu laka wa baaraka 'alayka, wa jazaakallaahu khayran, wa razaqakallaahu mithlahu, wa 'ajzala thawaabaka.",
          translation:
            "May Allah bless you, and shower His blessings upon you, and may Allah reward you well and bestow upon you its like and reward you abundantly.",
          reference: "An-Nawawi Al-Azkar Page. 349",
        },
      ],
    },
    {
      id: "dua-48",
      title: "Placing children under Allaah's protection",
      desc: "Supplication to commend children to Allah's protection.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection for Children",
          text: "Recite this to seek protection for children.",
          arabic:
            "أُعِيذُكُمَا بِكَلِمَاتِ ٱللَّهِ ٱلتَّامَّةِ مِنۡ كُلِّ شَيطَانٍ وَّهَامَّةٍ وَمِنۡ كُلِّ عَينٍ لَامَّةٍ",
          transliteration:
            "U'eethukumaa bikalimaatil-laahit-taammati min kulli shaytaanin wa haammatin, wa min kulli 'aynin laammatin.",
          translation:
            "I seek protection for you in the Perfect Words of Allah from every devil and every beast, and from every envious blameworthy eye.",
          reference: "Al-Bukhari 4/119",
        },
      ],
    },
    {
      id: "dua-49",
      title: "Excellence of visiting the sick",
      desc: "The reward and virtue of visiting a sick Muslim brother.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Virtue of Visiting",
          text: "Alee ibn Abee Taalib (radhi-yAllaahu 'anhu) related that he heard the Messenger of Allaah (sal-Allaahu 'alayhe wa sallam) say: 'If a man calls on his sick Muslim brother, it is as if he walks reaping the fruits of Paradise until he sits, and when he sits he is showered in mercy, and if this was in the morning, seventy thousand angels send prayers upon him until the evening, and if this was in the evening, seventy thousand angels send prayers upon him until the morning.'",
          arabic: "",
          transliteration: "",
          translation: "",
          reference:
            "At-Tirmithi, Ibn Majah, Ahmad. Sahih Ibn Majah 1/244, Sahih At-Tirmithi 1/286",
        },
      ],
    },
    {
      id: "dua-50-1",
      title: "When visiting the sick #1",
      desc: "Supplication to be said when entering upon a sick person.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Supplication for the Sick",
          text: "Recite this upon visiting someone who is ill.",
          arabic: "لَا بَأۡسَ طَهُورٌ إِنۡ شَآءَ ٱللَّهُ",
          transliteration: "Laa ba'sa tahoorun 'inshaa'Allaah.",
          translation:
            "Do not worry, it will be a purification (for you), Allah willing.",
          reference: "Al-Bukhari, cf. Al-Asqalani Fathul-Bari 10/118",
        },
      ],
    },
    {
      id: "dua-51-1",
      title: "When the sick have renounced all hope of life #1",
      desc: "Supplication for one who has given up hope of living.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Mercy and Forgiveness",
          text: "Recite this when hope for life is lost.",
          arabic:
            "أَللَّٰهُمَّ ٱغۡفِرۡ لِى وَارۡحَمۡنِى وَأَلۡحِقۡنِى بِالرَّفِيقِ ٱلۡأَعۡلَىٰ",
          transliteration:
            "Allaahum-maghfir lee warhamnee wa 'alhiqnee bir-rafeeqil-'a'laa.",
          translation:
            "O Allah, forgive me and have mercy upon me and join me with the highest companions (in Paradise).",
          reference: "Al-Bukhari 7/10, Muslim 4/1893",
        },
      ],
    },
    {
      id: "dua-52",
      title: "Instruction for the one nearing death",
      desc: "The final words to be encouraged for someone approaching death.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "The Final Words",
          text: "He whose last words are this will enter Paradise.",
          arabic: "لَآ إِلَٰهَ إِلَّا ٱللَّهُ",
          transliteration: "Laa 'ilaaha 'illallaahu.",
          translation: "There is none worthy of worship but Allah.",
          reference: "Abu Dawud 3/190, Sahihul-Jami' As-Saghir 5/432",
        },
      ],
    },
    {
      id: "dua-53",
      title: "Dua for one afflicted by a calamity",
      desc: "Supplication asking Allah to grant better in place of a calamity.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Patience in Calamity",
          text: "Recite this when struck by a calamity.",
          arabic:
            "إِنَّا لِلَّهِ وَإِنَّا إِلَيهِ رَاجِعُونَ أَللَّٰهُمَّ أَجُرۡنِى فِى مُصِيبَتِى وَأَخۡلِفۡ لِى خَيرًا مِّنۡهَا",
          transliteration:
            "Innaa lillaahi wa 'innaa 'ilayhi raaji'oon, Allaahumma'-jurni fee museebatee wa 'akhliflee khayran minhaa.",
          translation:
            "We are from Allah and unto Him we return. O Allah take me out of my plight and bring to me after it something better.",
          reference: "Muslim 2/632",
        },
      ],
    },
    {
      id: "dua-54",
      title: "When closing the eyes of the deceased",
      desc: "Supplication asking for forgiveness and elevation for the deceased.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Prayer for the Deceased",
          text: "Say this while closing the eyes of the deceased, substituting their name.",
          arabic:
            "أَللَّٰهُمَّ ٱغۡفِرۡ لِفُلَانٍ (بِإِسۡمِهِ) وَارۡفَعۡ دَرَجَتَهُ فِى ٱلۡمَهۡدِيِّينَ وَاخۡلُفۡهُ فِى عَقِبِهِ فِى ٱلۡغَابِرِينَ وَاغۡفِرۡ لَنَا وَلَهُ يَا رَبَّ ٱلۡعَالَمِينَ وَافۡسَحۡ لَهُ فِى قَبۡرِهِ وَنَوِّرۡ لَهُ فِيهِ",
          transliteration:
            "Allaahummaghfir li (name of the person) warfa' darajatahu fil-mahdiyyeena, wakhlufhu fee 'aqibihi fil-ghaabireena, waghfir-lanaa wa lahu yaa Rabbal-'aalameena, wafsah lahu fee qabrihi wa nawwir lahu feehi",
          translation:
            "O Allah, forgive [name of the person] and elevate his station among those who are guided. Send him along the path of those who came before, and forgive us and him, O Lord of the worlds. Enlarge for him his grave and shed light upon him in it.",
          reference: "Muslim 2/634",
        },
      ],
    },
    {
      id: "dua-55-1",
      title: "Dua for the deceased at the funeral prayer #1",
      desc: "A comprehensive supplication for the deceased during Janazah.",
      time: "2 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Funeral Supplication",
          text: "Recite this during the funeral prayer for the deceased.",
          arabic:
            "أَللَّٰهُمَّ ٱغۡفِرۡ لَهُۥ وَارۡحَمۡهُۥ وَعَافِهِۦ وَاعۡفُ عَنۡهُ وَأَكۡرِمۡ نُزُلَهُۥ وَوَسِّعۡ مُدۡخَلَهُۥ وَاغۡسِلۡهُ بِالۡمَآءِ وَالثَّلۡجِ وَالۡبَرَدِ وَنَقِّهِۦ مِنَ ٱلۡخَطَايَا كَمَا نَقَّيتَ ٱلثَّوبَ ٱلۡأَبۡيَضَ مِنَ ٱلدَّنَسِ وَأَبۡدِلۡهُ دَارًا خَيرًا مِّنۡ دَارِهِۦ وَأَهۡلًا خَيرًا مِّنۡ أَهۡلِهِۦ وَزَوجًا خَيرًا مِّنۡ زَوجِهِۦ وَأَدۡخِلۡهُ ٱلۡجَنَّةَ وَأَعِذۡهُ مِنۡ عَذَابِ ٱلۡقَبۡرِ [وَعَذَابِ ٱلنَّارِ]",
          transliteration:
            "Allaahum-maghfir lahu warhamhu, wa 'aafihi, wa'fu 'anhu, wa 'akrim nuzulahu, wa wassi' mudkhalahu, waghsilhu bilmaa'i waththalji walbaradi, wa naqqihi minal-khataayaa kamaa naqqaytath-thawbal-'abyadha minad-danasi, wa 'abdilhu daaran khayran min daarihi, wa 'ahlan khayran min 'ahlihi, wa zawjan khayran min zawjihi, wa 'adkhilhul-jannata, wa 'a'ithhu min 'athaabil-qabri [wa 'athaabin-naar].",
          translation:
            "O Allah, forgive him and have mercy on him and give him strength and pardon him. Be generous to him and cause his entrance to be wide and wash him with water and snow and hail. Cleanse him of his transgressions as white cloth is cleansed of stains. Give him an abode better than his home, and a family better than his family and a wife better than his wife. Take him into Paradise and protect him from the punishment of the grave [and from the punishment of Hell-fire].",
          reference: "Muslim 2/663",
        },
      ],
    },
    {
      id: "dua-56-1",
      title: "Dua for a deceased child at the funeral prayer #1",
      desc: "A brief supplication for a child during the funeral prayer.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Supplication for a Child",
          text: "Recite this for a deceased child.",
          arabic: "أَللَّٰهُمَّ أَعِذۡهُ مِنۡ عَذَابِ ٱلۡقَبۡرِ",
          transliteration: "Allaahumma 'a'ith-hu min 'athaabil-qabri",
          translation: "O Allah, protect him from the torment of the grave.",
          reference: "Malik al Muatta 1/288, Ibn Abi Saibah 3/217, Baihaqi 4/9",
        },
      ],
    },
    {
      id: "dua-57-1",
      title: "Condolence #1",
      desc: "Words to offer condolences and encourage patience.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Offering Condolences",
          text: "Say this to the bereaved.",
          arabic:
            "إِنَّ لِلَّهِ مَآ أَخَذَ وَلَهُ مَآ أَعۡطَىٰ وَكُلُّ شَيءٍ عِنۡدَهُۥ بِأَجَلٍ مُسَمًّى فَلۡتَصۡبِرۡ وَلۡتَحۡتَسِبۡ",
          transliteration:
            "Inna lillaahi maa 'akhatha, wa lahu maa 'a'taa, wa kullu shay'in 'indahu bi'ajalin musamman... fal tasir waltahsib",
          translation:
            "Surely, Allah takes what is His, and what He gives is His, and to all things He has appointed a time... so have patience and be rewarded.",
          reference: "Al-Bukhari 2/80, Muslim 2/636",
        },
      ],
    },
    {
      id: "dua-58-1",
      title: "When placing the deceased in the grave",
      desc: "The words to be spoken while laying the deceased in the grave.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Upon the Sunnah",
          text: "Say this while placing the body in the grave.",
          arabic: "بِسۡمِ ٱللَّهِ وَعَلَى سُنَّةِ رَسُولِ ٱللَّهِ",
          transliteration: "Bismillaahi wa 'alaa sunnati Rasoolillaahi.",
          translation:
            "With the Name of Allah and according to the Sunnah of the Messenger of Allah.",
          reference: "Abu Dawud 3/314",
        },
      ],
    },
    {
      id: "dua-59-1",
      title: "After burying the deceased",
      desc: "Supplication to ask for forgiveness and strength for the deceased after burial.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Asking for Strength",
          text: "The Prophet (SAW) used to stop after burying the dead and tell the people to pray for their brother.",
          arabic: "أَللَّٰهُمَّ ٱغۡفِرۡ لَهُ أَللَّٰهُمَّ ثَبِّتۡهُ",
          transliteration: "Allaahum-maghfir lahu Allaahumma thabbithu.",
          translation: "O Allah, forgive him. O Allah, strengthen him.",
          reference: "Abu Dawud 3/315, Al-Hakim 1/370",
        },
      ],
    },
    {
      id: "dua-61-1",
      title: "During a wind storm #1",
      desc: "Seeking the good of the wind and refuge from its evil.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Prayer in the Wind",
          text: "Recite this during a strong wind storm.",
          arabic:
            "أَللَّٰهُمَّ إِنِّى أَسۡأَلُكَ خَيرَهَا وَأَعُوذُ بِكَ مِنۡ شَرِّهَا",
          transliteration:
            "Allaahumma 'innee 'as'aluka khayrahaa, wa 'a'oothu bika min sharrihaa.",
          translation:
            "O Allah, I ask You for the good of it and seek refuge in You against its evil.",
          reference: "Abu Dawud 4/326, Ibn Majah 2/1228",
        },
      ],
    },
    {
      id: "dua-62",
      title: "Upon hearing thunder",
      desc: "Glorifying Allah when thunder is heard.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Glorifying the Creator",
          text: "Recite this upon hearing thunder.",
          arabic:
            "سُبۡحَانَ ٱلَّذِى يُسَبِّحُ ٱلرَّعۡدُ بِحَمۡدِهِ وَالۡمَلَائِكَةُ مِنۡ خِيفَتِهِ",
          transliteration:
            "Subhaanal-lathee yusabbihur-ra'du bihamdihi walmalaa'ikatu min kheefatihi.",
          translation:
            "Glory is to Him Whom thunder and angels glorify due to fear of Him.",
          reference: "Al-Muwatta' 2/992",
        },
      ],
    },
    {
      id: "dua-63-1",
      title: "Dua asking for rainfall #1",
      desc: "A prayer requesting beneficial and wholesome rain.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Asking for Rain",
          text: "Recite this to request rain.",
          arabic:
            "أَللَّٰهُمَّ ٱسۡقِنَا غَيثاً مُغِيثاً مَرِيئًا مَرِيعًا نَافِعًا غَيرَ ضَارٍّ عَاجِلًا غَيرَ ءَاجِلٍ",
          transliteration:
            "Allaahumma 'asqinaa ghaythan mugheethan maree'an maree'an, naafi'an ghayradhaarrin, 'aajilan ghayra 'aajilin.",
          translation:
            "O Allah, send upon us helpful, wholesome and healthy rain, beneficial not harmful rain, now, not later.",
          reference: "Abu Dawud 1/303",
        },
      ],
    },
    {
      id: "dua-64",
      title: "When it rains",
      desc: "A brief supplication for beneficial rain clouds.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "During the Rain",
          text: "Say this while it is raining.",
          arabic: "أَللَّٰهُمَّ صَيِّبًا نَافِعًا",
          transliteration: "Allaahumma sayyiban naafi'an",
          translation: "O Allah, (bring) beneficial rain clouds.",
          reference: "Al-Bukhari, Fathul-Bari 2/518",
        },
      ],
    },
    {
      id: "dua-65",
      title: "After rainfall",
      desc: "Acknowledging the bounty and mercy of Allah after it rains.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Gratitude for Rain",
          text: "Say this after the rain has stopped.",
          arabic: "مُطِرۡنَا بِفَضۡلِ ٱللَّهِ وَرَحۡمَتِهِ",
          transliteration: "Mutirnaa bifadhlillaahi wa rahmatihi.",
          translation: "It has rained by the bounty of Allah and His mercy.",
          reference: "Al-Bukhari 1/205, Muslim 1/83",
        },
      ],
    },
    {
      id: "dua-66",
      title: "Asking for clear skies",
      desc: "Supplication to redirect excessive rain away from living areas.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Redirecting the Rain",
          text: "Recite this when there is too much rain.",
          arabic:
            "أَللَّٰهُمَّ حَوَالَينَا وَلَا عَلَينَا أَللَّٰهُمَّ عَلَىٰ ٱلۡآكَامِ وَالظِّرَابِ وَبُطُونِ ٱلۡأَودِيَةِ وَمَنَابِتِ ٱلشَّجَرِ",
          transliteration:
            "Allaahumma hawaalaynaa wa laa 'alaynaa. Allaahumma 'alal-'aakaami wadh-dhiraabi, wa butoonil-'awdiyati, wa manaabitish-shajari.",
          translation:
            "O Allah, let it pass us and not fall upon us, but upon the hills and mountains, and the center of the valleys, and upon the forested lands.",
          reference: "Al-Bukhari 1/224, Muslim 1/614",
        },
      ],
    },
    {
      id: "dua-67",
      title: "Upon sighting the crescent moon",
      desc: "Prayer for peace, faith, and security upon seeing the new moon.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Welcoming the New Moon",
          text: "Recite this when the new crescent moon is sighted.",
          arabic:
            "أَللَّٰهُ أَكۡبَرُ أَللَّٰهُمَّ أَهِلَّهُۥ عَلَينَا بِالۡأَمۡنِ وَالۡإِيمَانِ وَالسَّلَامَةِ وَالۡإِسۡلَامِ وَالتَّوفِيقِ لِمَا تُحِبُّ رَبَّنَا وَتَرۡضَىٰ رَبُّنَا وَرَبُّكَ ٱللَّهُ",
          transliteration:
            "Allaahu 'Akbar, Allaahumma 'ahillahu 'alayna bil'amni wal'eemaani, wassalaamati wal-'Islaami, wattawfeeqi limaa tuhibbu Rabbanaa wa tardhaa, Rabbunaa wa Rabbukallaahu.",
          translation:
            "Allah is the Most Great. O Allah, bring us the new moon with security and Faith, with peace and in Islam, and in harmony with what our Lord loves and what pleases Him. Our Lord and your Lord is Allah.",
          reference: "At-Tirmithi 5/504, Ad-Darimi 1/336",
        },
      ],
    },
    {
      id: "dua-68-1",
      title: "Upon breaking fast (Iftar) #1",
      desc: "Supplication confirming the reward and relief upon breaking the fast.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Breaking the Fast",
          text: "Recite this when breaking your fast.",
          arabic:
            "ذَهَبَ ٱلظَّمَأُ وَابۡتَلَّتِ ٱلۡعُرُوقُ وَثَبَتَ ٱلۡأَجۡرُ إِنۡ شَآءَ ٱللَّهُ",
          transliteration:
            "Thahabadh-dhama'u wabtallatil-'urooqu, wa thabatal-'ajru 'inshaa'Allaah.",
          translation:
            "The thirst is gone, the veins are moistened and the reward is confirmed, if Allah wills.",
          reference: "Abu Dawud 2/306",
        },
      ],
    },
    {
      id: "dua-69-1",
      title: "Dua before eating #1",
      desc: "Remembering Allah before partaking in a meal.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Starting the Meal",
          text: "When you are about to eat, you should say this.",
          arabic: "بِسۡمِ ٱللَّهِ",
          transliteration: "Bismillaah.",
          translation: "In the Name of Allah.",
          reference: "Abu Dawud 3/347, At-Tirmithi 4/288",
        },
        {
          title: "If Forgotten",
          text: "If you forget to say it before starting, then you should say this when you remember.",
          arabic: "بِسۡمِ ٱللَّهِ فِى أَوَّلِهِ وَءَاخِرِهِ",
          transliteration: "Bismillaahifee 'awwalihi wa 'aakhirihi.",
          translation: "In the Name of Allah, in the beginning and in the end.",
          reference: "Abu Dawud 3/347, At-Tirmithi 4/288",
        },
      ],
    },
    {
      id: "dua-70-1",
      title: "Upon completing the meal #1",
      desc: "Praising Allah for providing sustenance.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Gratitude for Food",
          text: "Recite this upon finishing your meal.",
          arabic:
            "أَلۡحَمۡدُ لِلَّهِ ٱلَّذِى أَطۡعَمَنِى هَٰذَا وَرَزَقَنِيهِ مِنۡ غَيرِ حَولٍ مِّنِّى وَلَا قُوَّةٍ",
          transliteration:
            "Alhamdu lillaahil-lathee 'at'amanee haathaa, wa razaqaneehi, min ghayri hawlin minnee wa laa quwwatin.",
          translation:
            "Praise is to Allah Who has given me this food and sustained me with it though I was unable to do it and powerless.",
          reference: "At-Tirmithi, Abu Dawud, and Ibn Majah",
        },
      ],
    },
    {
      id: "dua-71",
      title: "Dua by the guest for the host",
      desc: "Supplication asking for blessings and mercy upon the host.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Prayer for the Host",
          text: "Recite this for someone who hosts you.",
          arabic:
            "أَللَّٰهُمَّ بَارِكۡ لَهُمۡ فِيمَا رَزَقۡتَهُمۡ وَاغۡفِرۡ لَهُمۡ وَارۡحَمۡهُمۡ",
          transliteration:
            "Allaahumma baarik lahum feemaa razaqtahum, waghfir lahum warhamhum.",
          translation:
            "O Allah, bless them in what You have provided for them, and forgive them and have mercy on them.",
          reference: "Muslim 3/1615",
        },
      ],
    },
    {
      id: "dua-72",
      title: "To one offering a drink or to one who intended to do that",
      desc: "Praying for sustenance for the one who provides a drink.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Prayer for the Provider",
          text: "Say this to someone who gives you something to drink.",
          arabic:
            "أَللَّٰهُمَّ أَطۡعِمۡ مَنۡ أَطۡعَمَنِى وَاسۡقِ مَنۡ سَقَانِي",
          transliteration:
            "Allaahumma 'at'im man 'at'amanee wasqi man saqaanee.",
          translation:
            "O Allah, feed the one who has fed me and drink to the one who has given me drink.",
          reference: "Muslim 3/126",
        },
      ],
    },
    {
      id: "dua-73",
      title: "When breaking fast in someone's home",
      desc: "Supplication for a host when breaking the fast with them.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Dua for Iftar Host",
          text: "Recite this for the host who provided your Iftar.",
          arabic:
            "أَفۡطَرَ عِنۡدَكُمُ ٱلصَّائِمُونَ وَأَكَلَ طَعَامَكُمُ ٱلۡأَبۡرَارُ وَصَلَّتۡ عَلَيكُمُ ٱلۡمَلَائِكَةُ",
          transliteration:
            "Aftara 'indakumus-saa'imoona, wa 'akala ta'aamakumul-'abraaru, wa sallat 'alaykumul-malaa'ikatu.",
          translation:
            "With you, those who are fasting have broken their fast, you have fed those who are righteous, and the angels recite their prayers upon you.",
          reference: "Abu Dawud 3/367, Ibn Majah 1/556",
        },
      ],
    },
    {
      id: "dua-74",
      title: "By one fasting when presented with food",
      desc: "Etiquette for someone who is fasting but invited to a meal.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Supplicating for the Host",
          text: "If you are invited [to a meal] then answer. If you happen to be fasting, then supplicate [for those present] and if you are not fasting, then eat.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Muslim 2/1054",
        },
      ],
    },
    {
      id: "dua-75",
      title: "When insulted while fasting",
      desc: "The response of a fasting person when insulted or provoked.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Maintaining the Fast",
          text: "Say this if insulted or provoked while fasting.",
          arabic: "إِنِّى صَائِمٌ إِنِّى صَائِمٌ",
          transliteration: "'Inneesaa'imun, 'innee saa'imun.",
          translation: "I am fasting. I am fasting.",
          reference: "Al-Bukhari, Fathul-Bari 6/181, Muslim 4/2208",
        },
      ],
    },
    {
      id: "dua-76",
      title: "Upon seeing the early or premature fruit",
      desc: "Seeking blessings in provisions and in the town.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Blessings in Provisions",
          text: "Recite this upon seeing early fruit.",
          arabic:
            "أَللَّٰهُمَّ بَارِكۡ لَنَا فِى ثَمَرِنَا وَبَارِكۡ لَنَا فِى مَدِينَتِنَا وَبَارِكۡ لَنَا فِى صَاعِنَا وَبَارِكۡ لَنَا فِى مُدِّنَا",
          transliteration:
            "Allahumma baarik lanaa fee thamarinaa, wa baarik lanaa fee madeenatinaa wa baarik lanaa fee saa'inaa, wa baarik lanaa fee muddinaa.",
          translation:
            "O Allah, bless us in our dates and bless us in our town, bless us in our Sa' and in our Mudd.",
          reference: "Muslim 2/1000",
        },
      ],
    },
    {
      id: "dua-77",
      title: "Upon sneezing",
      desc: "The sequence of supplications when someone sneezes.",
      time: "1 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The One Who Sneezes",
          text: "When one of you sneezes he should say this.",
          arabic: "أَلۡحَمۡدُ لِلَّهِ",
          transliteration: "Alhamdu lillaah",
          translation: "All praises and thanks are to Allah.",
          reference: "Al-Bukhari 7/125",
        },
        {
          title: "The Companion's Reply",
          text: "His brother or companion should say this to him.",
          arabic: "يَرۡحَمُكَ ٱللَّهُ",
          transliteration: "Yarhamukallaah",
          translation: "May Allah have mercy upon you.",
          reference: "Al-Bukhari 7/125",
        },
        {
          title: "The Return Reply",
          text: "The one who sneezed replies back with this.",
          arabic: "يَهۡدِيكُمُ ٱللَّهُ وَيُصۡلِحُ بَالَكُمۡ",
          transliteration: "Yahdeekumul-laahu wa yuslihu baalakum.",
          translation: "May Allah guide you and set your affairs in order.",
          reference: "Al-Bukhari 7/125",
        },
      ],
    },
    {
      id: "dua-78",
      title: "What is said to a kaafir when he sneezes",
      desc: "The appropriate supplication for a non-Muslim when they sneeze.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Prayer for Guidance",
          text: "Say this if a non-Muslim sneezes.",
          arabic: "يَهۡدِيكُمُ ٱللَّهُ وَيُصۡلِحُ بَالَكُمۡ",
          transliteration: "Yahdeekumullaahu wa yuslihu baalakum.",
          translation: "May Allah guide you and set your affairs in order.",
          reference: "Al-Bukhaaree with Al-Fath 10/88 and Muslim 3/1595",
        },
      ],
    },
    {
      id: "dua-79",
      title: "Congratulating the newlywed",
      desc: "Supplication to bless the newly married couple.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Blessing the Marriage",
          text: "Recite this to congratulate newlyweds.",
          arabic:
            "بَارَكَ ٱللَّهُ لَكَ وَبَارَكَ عَلَيكَ وَجَمَعَ بَينَكُمَا فِى خَيرٍ",
          transliteration:
            "Baarakallaahu laka, wa baaraka 'alayka, wa jama'a baynakumaa fee khayrin.",
          translation:
            "May Allah bless you, and shower His blessings upon you, and join you together in goodness.",
          reference: "Abu Dawud, Ibn Majah and At-Tirmithi",
        },
      ],
    },
    {
      id: "dua-80",
      title: "On the wedding night or when buying an animal",
      desc: "Supplication seeking the goodness of a new spouse or an animal.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Goodness",
          text: "Recite this on the wedding night or when acquiring an animal.",
          arabic:
            "أَللَّٰهُمَّ إِنِّى أَسۡأَلُكَ خَيرَهَا وَخَيرَ مَا جَبَلۡتَهَا عَلَيهِ وَأَعُوذُ بِكَ مِنۡ شَرِّهَا وَشَرِّ مَا جَبَلۡتَهَا عَلَيهِ",
          transliteration:
            "Allaahumma 'innee 'as'aluka khayrahaa wa khayra majabaltahaa 'alayhi wa 'a'oothu bika min sharrihaa wa sharri maajabaltahaa 'alayhi.",
          translation:
            "O Allah, I ask You for the goodness of her and the goodness upon which You have created her, and I seek refuge in You from the evil of her and from the evil upon which You have created her.",
          reference: "Abu Dawud 2/248 and Ibn Majah 1/617",
        },
      ],
    },
    {
      id: "dua-81",
      title: "Before sexual intercourse",
      desc: "Supplication to protect oneself and potential offspring from the Devil.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from the Devil",
          text: "Recite this before intimacy.",
          arabic:
            "بِسۡمِ ٱللَّهِ أَللَّٰهُمَّ جَنِّبۡنَا ٱلشَّيطَانَ وَجَنِّبِ ٱلشَّيطَانَ مَا رَزَقۡتَنَا",
          transliteration:
            "Bismillaah. Allaahumma jannibnash-Shaytaana, wa jannibish-Shaytaana maa razaqtanaa.",
          translation:
            "With the Name of Allah. O Allah, keep the Devil away from us and keep the Devil away from that which You provide for us.",
          reference: "Al-Bukhari 6/141, Muslim 2/1028",
        },
      ],
    },
    {
      id: "dua-82",
      title: "When angry",
      desc: "Seeking refuge in Allah from Satan when feeling angry.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Refuge",
          text: "Recite this when you are angry.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
          transliteration: "'A'oothu billaahi minash-Shaytaanir-rajeem.",
          translation: "I seek refuge in Allah from Satan the outcast.",
          reference: "Al-Bukhari 7/99, Muslim 4/2015",
        },
      ],
    },
    {
      id: "dua-84-1",
      title: "Dua said at a sitting or gathering etc.",
      desc: "Supplication for forgiveness to be said repeatedly during a gathering.",
      time: "2 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Forgiveness",
          text: "It would be counted that at any one sitting, the Messenger of Allaah (SAW) before getting up would say this one hundred times.",
          arabic:
            "رَبِّ ٱغۡفِرۡ لِى وَتُبۡ عَلَىَّ إِنَّكَ أَنۡتَ ٱلتَّوَّابُ ٱلۡغَفُورُ",
          transliteration:
            "Rabbighfir lee wa tub 'alayya 'innaka 'Antat-Tawwaabul-Ghafoor.",
          translation:
            "My Lord, forgive me and accept my repentance, You are the Ever-Relenting, the All-Forgiving.",
          reference: "Sahih Ibn Majah 2/321, Sahih At-Tirmithi 3/153",
        },
      ],
    },
    {
      id: "dua-85",
      title: "Dua at the end of a sitting/gathering [Kaffaratul Majlis]",
      desc: "Supplication to expiate for anything said during a gathering.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Expiation of the Gathering",
          text: "Say this before concluding any gathering, reciting of Qur'an, or prayer.",
          arabic:
            "سُبۡحَانَكَ ٱللَّهُمَّ وَبِحَمۡدِكَ أَشۡهَدُ أَنۡ لَآ إِلَٰهَ إِلَّآ أَنۡتَ أَسۡتَغۡفِرُكَ وَأَتُوبُ إِلَيكَ",
          transliteration:
            "Subhaanaka Allaahumma wa bihamdika, 'ash-hadu 'an laa 'ilaaha 'illaa 'Anta, 'astaghfiruka wa 'atoobu 'ilayka.",
          translation:
            "Glory is to You, O Allah, and praise is to You. I bear witness that there is none worthy of worship but You. I seek Your forgiveness and repent to You.",
          reference: "Abu Dawud, Ibn Majah, At-Tirmithi and An-Nasa'i",
        },
      ],
    },
    {
      id: "dua-87",
      title: "To one who does you a favour",
      desc: "Supplication to thank and ask Allah to reward someone who has done you a favor.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Praying for Reward",
          text: "If someone does you a favour then you say this.",
          arabic: "جَزَاكَ ٱللَّهُ خَيراً",
          transliteration: "Jazaakallaahu khayran.",
          translation: "May Allah reward you with good.",
          reference: "At-Tirmithi (no. 2035)",
        },
      ],
    },
    {
      id: "dua-88",
      title: "Protection from the Dajjal",
      desc: "Actions to protect oneself from the False Messiah.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Memorize Surat Al-Kahf",
          text: "Whoever memorizes ten 'Ayat (Verses) from the beginning of Surat Al-Kahf, will be protected from the False Messiah.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Muslim 1/555",
        },
        {
          title: "Seeking Protection in Prayer",
          text: "One can also say in every prayer after the final Tashahhud before ending the prayer, seeking the protection of Allah from the trials of the False Messiah.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Refer to Dua 24.1",
        },
      ],
    },
    {
      id: "dua-89",
      title: "To one who pronounces his love for you, for Allah’s sake",
      desc: "Response to someone who says they love you for the sake of Allah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Returning the Love",
          text: "Say this to the one who expresses love for Allah's sake.",
          arabic: "أَحَبَّكَ ٱلَّذِى أَحۡبَبۡتَنِى لَهُ",
          transliteration: "'Ahabbakal-lathee 'ahbabtanee lahu.",
          translation: "May He for Whose sake you love me, love you.",
          reference: "Abu Dawud 4/333",
        },
      ],
    },
    {
      id: "dua-90",
      title: "To one who has offered you some of his wealth",
      desc: "A prayer of blessing for someone who offers their wealth to you.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Blessing their Wealth",
          text: "Say this to someone who offers you their property.",
          arabic: "بَارَكَ ٱللَّهُ لَكَ فِى أَهۡلِكَ وَمَالِكَ",
          transliteration: "Baarakallaahu laka fee 'ahlika wa maalika.",
          translation: "May Allah bless you in your family and your property.",
          reference: "Al-Bukhari, Fathul-BAri 4/88",
        },
      ],
    },
    {
      id: "dua-91",
      title: "To the debtor when his debt is settled",
      desc: "A supplication to bless the person who repays their debt.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Upon Settling Debt",
          text: "Say this to a debtor who repays you.",
          arabic:
            "بَارَكَ ٱللَّهُ لَكَ فِى أَهۡلِكَ وَمَالِكَ إِنَّمَا جَزَآءُ ٱلسَّلَفِ أَلۡحَمۡدُ وَالۡأَدَآءُ",
          transliteration:
            "Baarakallaahu laka fee 'ahlika wa maalika, 'innamaa jazaa'us-salafil-hamdu wal'adaa'.",
          translation:
            "May Allah bless you in your family and your wealth, surely the reward for a loan is praise and returning (what was borrowed).",
          reference: "An-Nasa'i, Ibn Majah 2/809",
        },
      ],
    },
    {
      id: "dua-92",
      title: "For fear of shirk",
      desc: "Seeking refuge in Allah from associating partners with Him knowingly and unknowingly.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from Shirk",
          text: "Recite this to seek protection from shirk.",
          arabic:
            "أَللَّٰهُمَّ إِنِّى أَعُوذُ بِكَ أَنۡ أُشۡرِكَ بِكَ وَأَنَا أَعۡلَمُ وَأَسۡتَغۡفِرُكَ لِمَا لَا أَعۡلَمُ",
          transliteration:
            "Allaahumma 'innee 'a'oothu bika 'an 'ushrika bika wa 'anaa 'a'lamu, wa 'astaghfiruka limaa laa 'a'lamu.",
          translation:
            "O Allah, I seek refuge in You lest I associate anything with You knowingly, and I seek Your forgiveness for what I know not.",
          reference: "Ahmad 4/403",
        },
      ],
    },
    {
      id: "dua-93",
      title: "Dua to one who says 'May Allaah bless you'",
      desc: "How to respond when someone invokes Allah's blessings upon you.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "To a Group",
          text: "If someone says 'May Allaah bless you all', return their supplication by saying this.",
          arabic: "وَ فِيهِمۡ بَارَكَ ٱللَّهُ",
          transliteration: "wa feehim barakAllahu",
          translation: "and may Allaah bless them.",
          reference: "Ibn As-Sunni",
        },
        {
          title: "To an Individual",
          text: "If someone says it to you individually, reply with this.",
          arabic: "وَ فِيكَ بَارَكَ ٱللَّهُ",
          transliteration: "wa feeka barakAllahu",
          translation: "and May Allah bless you.",
          reference: "Ibn As-Sunni",
        },
      ],
    },
    {
      id: "dua-94",
      title: "Forbiddance of ascribing things to omens",
      desc: "Supplication to affirm that all omens and goodness come from Allah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Rejecting Omens",
          text: "Recite this to reject false portents and omens.",
          arabic:
            "أَللَّٰهُمَّ لَا طَيرَ إِلَّا طَيرُكَ وَلَا خَيرَ إِلَّا خَيرُكَ وَلَآ إِلَٰهَ غَيرُكَ",
          transliteration:
            "Allaahumma laa tayra 'illaa tayruka, wa laa khayra 'illaa khayruka, wa laa 'ilaaha ghayruka.",
          translation:
            "O Allah there is no portent other than Your portent, no goodness other than Your goodness, and none worthy of worship other than You.",
          reference: "Ahmad 2/220, Ibn As-Sunni (no. 292)",
        },
      ],
    },
    {
      id: "dua-95",
      title: "When mounting an animal or any means of transport",
      desc: "Dua recited upon boarding a vehicle or mounting an animal for travel.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Mounting Transport",
          text: "Recite this once you have mounted your means of transport.",
          arabic:
            "بِسۡمِ ٱللَّهِ وَالۡحَمۡدُ لِلَّهِ سُبۡحَانَ ٱلَّذِى سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقۡرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنۡقَلِبُونَ أَلۡحَمۡدُ لِلَّهِ أَلۡحَمۡدُ لِلَّهِ أَلۡحَمۡدُ لِلَّهِ أَللَّهُ أَكۡبَرُ أَللَّهُ أَكۡبَرُ أَللَّهُ أَكۡبَرُ سُبۡحَانَكَ ٱللَّهُمَّ إِنِّى ظَلَمۡتُ نَفۡسِى فَاغۡفِرۡ لِى فَإِنَّهُۥ لَا يَغۡفِرُ ٱلذُّنُوبَ إِلَّآ أَنۡتَ",
          transliteration:
            "Bismillaah, Alhamdu lillaah. Subhaanal-lathee sakhkhara lanaa haathaa wa maa kunnaa lahu muqrineen. Wa 'innaa 'ilaa Rabbinaa lamunqaliboon. Alhamdu lillaah, alhamdu lillaah, alhamdu lillaah, Allaahu 'Akbar, Allaahu 'Akbar, Allaahu 'Akbar, subhaanakal-laahumma 'innee dhalamtu nafsee faghfir lee, fa'innahu laa yaghfiruth-thunooba 'illaa 'Anta.",
          translation:
            "With the Name of Allah. Praise is to Allah. Glory is to Him Who has provided this for us though we could never have had it by our efforts. Surely, unto our Lord we are returning. Praise is to Allah. Praise is to Allah. Praise is to Allah. Allah is the Most Great. Allah is the Most Great. Allah is the Most Great. Glory is to You. O Allah, I have wronged my own soul. Forgive me, for surely none forgives sins but You.",
          reference: "Abu Dawud 3/34, At-Tirmithi 5/501",
        },
      ],
    },
    {
      id: "dua-96",
      title: "Dua for travel",
      desc: "A comprehensive supplication made when embarking on a journey and upon returning.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "Starting the Journey",
          text: "Say this three times.",
          arabic: "أَللَّٰهُ أَكۡبَرُ",
          transliteration: "Allaahu 'Akbar",
          translation: "Allah is the Most Great.",
          reference: "Muslim 2/978",
        },
        {
          title: "The Travel Supplication",
          text: "Then say this dua.",
          arabic:
            "سُبۡحَانَ ٱلَّذِى سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقۡرِنِينَ وَإِنَّآ إِلَىٰ رَبِّنَا لَمُنۡقَلِبُونَ أَللَّٰهُمَّ إِنَّا نَسۡأَلُكَ فِى سَفَرِنَا هَٰذَا ٱلۡبِرَّ وَالتَّقۡوَىٰ وَمِنَ ٱلۡعَمَلِ مَا تَرۡضَىٰ أَللَّٰهُمَّ هَوِّنۡ عَلَينَا سَفَرَنَا هَٰذَا وَاطۡوِ عَنَّا بُعۡدَهُ أَللَّٰهُمَّ أَنۡتَ ٱلصَّاحِبُ فِى ٱلسَّفَرِ وَالۡخَلِيفَةُ فِى ٱلۡأَهۡلِ أَللَّٰهُمَّ إِنِّىٓ أَعُوذُ بِكَ مِنۡ وَعۡثَاءِ ٱلسَّفَرِ وَكَءَابَةِ ٱلۡمَنۡظَرِ وَسُوءِ ٱلۡمُنۡقَلَبِ فِى ٱلۡمَالِ وَالۡأَهۡلِ",
          transliteration:
            "Subhaanal-lathee sakhkhara lanaa haathaa wa maa kunnaa lahu muqrineen. Wa 'innaa 'ilaa Rabbinaa lamunqaliboon. Allaahumma 'innaa nas'aluka fee safarinaa haathal-birrawattaqwaa, waminal-'amalimaa tardhaa, Allaahumma hawwin 'alaynaa safaranaa haathaa watwi 'annaa bu'dahu, Allaahumma 'Antas-saahibu fis-safari, walkhaleefatu fil-'ahli, Allaahumma 'innee 'a'oothu bika min wa'thaa'is-safari, wa ka'aabanl-mandhari, wa soo'il-munqalabi fil-maaliwal'ahli.",
          translation:
            "Glory is to Him Who has provided this for us though we could never have had it by our efforts. Surely, unto our Lord we are returning. O Allah, we ask You on this our journey for goodness and piety, and for works that are pleasing to You. O Allah, lighten this journey for us and make its distance easy for us. O Allah, You are our Companion on the road and the One in Whose care we leave our family. O Allah, I seek refuge in You from this journey's hardships, and from the wicked sights in store and from finding our family and property in misfortune upon returning.",
          reference: "Muslim 2/978",
        },
        {
          title: "Upon Returning",
          text: "Upon returning recite the same sequence again, adding this at the end.",
          arabic: "ءَايِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
          transliteration:
            "Aa'iboona, taa'iboona, 'aabidoona, Lirabbinaa haamidoon.",
          translation:
            "We return repentant to our Lord, worshipping our Lord, and praising our Lord.",
          reference: "Muslim 2/978",
        },
      ],
    },
    {
      id: "dua-97",
      title: "Upon entering a town or village",
      desc: "Seeking the goodness of a town and refuge from its evil upon entry.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Entering a New Place",
          text: "Recite this upon arriving in a new town or village.",
          arabic:
            "أَللَّٰهُمَّ رَبَّ ٱلسَّمَاوَاتِ ٱلسَّبۡعِ وَمَا أَظۡلَلۡنَ وَرَبَّ ٱلۡأَرَضِينَ ٱلسَّبۡعِ وَمَا أَقۡلَلۡنَ وَرَبَّ ٱلشَّيَاطِينِ وَمَا أَضۡلَلۡنَ وَرَبَّ ٱلرِّيَاحِ وَمَا ذَرَينَ أَسۡأَلُكَ خَيرَ هَٰذِهِ ٱلۡقَرۡيَةِ وَخَيرَ أَهۡلِهَا وَخَيرَ مَا فِيهَا وَأَعُوذُ بِكَ مِنۡ شَرِّهَا وَشَرِّ أَهۡلِهَا وَشَرِّ مَا فِيهَا",
          transliteration:
            "Allaahumma Rabbas-samaawaatis-sab'i wa maa 'adhlalna, wa Rabbal-'aradheenas-sab'i wa maa 'aqlalna, wa Rabbash-shayaateeni wa maa 'adhlalna, wa Rabbar-riyaahi wa maa tharayna. 'As'aluka khayra haathihil-qaryati wa khayra 'ahlihaa, wa khayra maafeehaa, wa 'a'oothu bika min sharrihaa, wa sharri 'ahlihaa, wa shard maa feehaa.",
          translation:
            "O Allah, Lord of the seven heavens and all they overshadow, Lord of the seven worlds and all they uphold, Lord of the devils and all they lead astray, Lord of the winds and all they scatter. I ask You for the goodness of this town and for the goodness of its people, and for the goodness it contains. I seek refuge in You from its evil, from the evil of its people and from the evil it contains.",
          reference: "Al-Hakim 2/100, Ibn As-Sunni (no. 524)",
        },
      ],
    },
    {
      id: "dua-98-1",
      title: "When entering the market",
      desc: "Declaring the oneness of Allah and His dominion upon entering a marketplace.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Entering the Market",
          text: "Recite this upon entering a market.",
          arabic:
            "لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُۥ لَهُ ٱلۡمُلۡكُ وَلَهُ ٱلۡحَمۡدُ يُحۡيِى وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ ٱلۡخَيرُ وَهُوَ عَلَىٰ كُلِّ شَيءٍ قَدِيرٌ",
          transliteration:
            "Laa 'ilaaha 'illallaahu wahdahu laa shareeka lahu, lahul-mulku wa lahul-hamdu, yuhyee wa yumeetu, wa Huwa hayyun laa yamootu, biyadihil-khayru, wa Huwa 'alaa kulli shay'in Qadeer.",
          translation:
            "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise. He brings life and He causes death, and He is living and does not die. In His Hand is all good, and He is Able to do all things.",
          reference: "At-Tirmithi 5/291, Al-Hakim 1/538",
        },
      ],
    },
    {
      id: "dua-99",
      title: "When the mounted animal (or mean of transport) stumbles",
      desc: "Brief supplication when transport falters.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "When Transport Stumbles",
          text: "Say this if your means of transport stumbles or falters.",
          arabic: "بِسۡمِ ٱللَّهِ",
          transliteration: "Bismillaahi.",
          translation: "With the Name of Allah.",
          reference: "Abu Dawud 4/296",
        },
      ],
    },
    {
      id: "dua-100",
      title: "Dua of the traveller for the resident",
      desc: "The supplication a traveler leaves for those staying behind.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "For the Resident",
          text: "Recite this to the residents you are leaving behind.",
          arabic: "أَسۡتَودِعُكُمُ ٱللَّهَ ٱلَّذِى لَا تَضِيعُ وَدَائِعُهُ",
          transliteration:
            "'Astawdi'ukumul-laahal-lathee laa tadhee'u wadaa'i'uhu.",
          translation:
            "I leave you in the care of Allah, as nothing is lost that is in His care.",
          reference: "Ahmad 2/403, Ibn Majah 2/943",
        },
      ],
    },
    {
      id: "dua-101-1",
      title: "Dua of the resident for the traveller #1",
      desc: "The supplication those staying behind give to a traveler.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "For the Traveler",
          text: "Recite this to the one who is departing on a journey.",
          arabic:
            "أَسۡتَودِعُ ٱللَّهَ دِينَكَ وَأَمَانَتَكَ وَخَوَاتِيمَ عَمَلِكَ",
          transliteration:
            "'Astawdi'ullaaha deenaka, wa 'amaanataka, wa khawaateema 'amalika.",
          translation:
            "I leave your religion in the care of Allah, as well as your safety, and the last of your deeds.",
          reference: "Ahmad 2/7, At-Tirmithi 5/499",
        },
      ],
    },
    {
      id: "dua-102",
      title: "Dua while ascending or descending",
      desc: "Remembrance of Allah while going up or down during a journey.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "When Ascending",
          text: "While ascending, say this.",
          arabic: "أَللَّٰهُ أَكۡبَرُ",
          transliteration: "Allaahu 'Akbar",
          translation: "Allah is the Most Great",
          reference: "Al-Bukhari, Fathul-Bari 6/135",
        },
        {
          title: "When Descending",
          text: "And when descending, say this.",
          arabic: "سُبۡحَانَ ٱللَّهِ",
          transliteration: "Subhaanallaah",
          translation: "Glory is to Allah.",
          reference: "Al-Bukhari, Fathul-Bari 6/135",
        },
      ],
    },
    {
      id: "dua-103",
      title: "Prayer of the traveller as dawn approaches",
      desc: "Supplication for protection and favor during the early morning hours of travel.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Traveling at Dawn",
          text: "Recite this as dawn approaches during travel.",
          arabic:
            "سَمَّعَ سَامِعٌ بِحَمۡدِ ٱللَّهِ وَحُسۡنِ بَلَائِهِ عَلَينَا رَبَّنَا صَاحِبۡنَا وَأَفۡضِلۡ عَلَينَا عَائِذًا بِاللَّهِ مِنَ ٱلنَّارِ",
          transliteration:
            "Sami'a saami'un bihamdillaahi wa husni balaa'ihi 'alaynaa. Rabbanaa saahibnaa, wa 'afdhil 'alaynaa 'aa'ithan billaahi minan-naar.",
          translation:
            "He Who listens has heard that we praise Allah for the good things He gives us. Our Lord, be with us and bestow Your favor upon us. I seek the protection of Allah from the Fire.",
          reference: "Muslim 4/2086",
        },
      ],
    },
    {
      id: "dua-104",
      title: "Stopping or lodging somewhere",
      desc: "Seeking refuge in the Perfect Words of Allah when stopping to rest or lodge.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Upon Lodging",
          text: "Recite this when you stop or make lodging somewhere.",
          arabic:
            "أَعُوذُ بِكَلِمَاتِ ٱللَّهِ ٱلتَّامَّاتِ مِنۡ شَرِّ مَا خَلَقَ",
          transliteration:
            "'A'oothu bikalimaatil-laahit-taammaati min sharri maa khalaq.",
          translation:
            "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
          reference: "Muslim 4/2080",
        },
      ],
    },
    {
      id: "dua-105",
      title: "While returning from travel",
      desc: "Supplication to say at every high point when returning from a journey.",
      time: "2 min",
      stepsCount: 2,
      difficulty: "intermediate",
      steps: [
        {
          title: "Takbir at High Points",
          text: "Say this three times at every high point.",
          arabic: "أَللَّٰهُ أَكۡبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allaah is the greatest",
          reference: "Bukhari 7/163, Muslim 2/980",
        },
        {
          title: "Declaration of Return",
          text: "And then say this supplication.",
          arabic:
            "لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُۥ لَهُ ٱلۡمُلۡكُ وَلَهُ ٱلۡحَمۡدُ وَهُوَ عَلَى كُلِّ شَيءٍ قَدِيرٌ ءَايِبُونَ تَآئِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ صَدَقَ ٱللَّهُ وَعۡدَهُۥ وَنَصَرَ عَبۡدَهُۥ وَهَزَمَ ٱلۡأَحۡزَابَ وَحۡدَهُۥ",
          transliteration:
            "Laa 'ilaaha 'illallaahu wahdahu laa shareeka lahu, lahul-mulku, wa lahul-hamdu, wa Huwa 'alaa kulli shay 'in Qadeer, 'aa'iboona, taa'iboona, 'aabidoona, lirabbinaa haamidoona, sadaqallaahu wa'dahu, wa nasara 'abdahu, wa hazamal-'ahzaaba wahdahu.",
          translation:
            "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. We return repentant to our Lord, worshipping our Lord, and praising our Lord. He fulfilled His Promise, He aided His slave, and He alone defeated the Confederates.",
          reference: "Bukhari 7/163, Muslim 2/980",
        },
      ],
    },
    {
      id: "dua-107-1",
      title: "Excellence of sending prayers upon the Prophet",
      desc: "The virtues and rewards of sending salawat upon the Prophet Muhammad (SAW).",
      time: "2 min",
      stepsCount: 5,
      difficulty: "beginner",
      steps: [
        {
          title: "Tenfold Reward",
          text: 'The Prophet (sal-Allaahu \'alayhe wa sallam) said: "Whoever sends a prayer upon me, Allaah sends ten upon him."',
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Muslim 1/288 No. 384",
        },
        {
          title: "Prayers Reach Him",
          text: 'He (sal-Allaahu \'alayhe wa sallam) also said: "Do not take my grave as a place of habitual ceremony. Send prayers upon me, for verily your prayers reach me wherever you are."',
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Abu Dawud 2/218, Ahmed 2/367",
        },
        {
          title: "The Miser",
          text: 'He (sal-Allaahu \'alayhe wa sallam) also said: "The miser is one whom when I am mentioned to him, fails to send prayers upon me."',
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "At-Tirmithi 5/551",
        },
        {
          title: "Angels Convey Salaam",
          text: "He (sal-Allaahu 'alayhe wa sallam) said: 'Allaah has Angels who roam the earth and convey salaam to me from my ummah.'",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "An-Nasa'i, Al-Hakim 2/421",
        },
        {
          title: "Returning Salaam",
          text: "He (sal-Allaahu 'alayhe wa sallam) also said: ''Whenever someone sends salaam upon me, Allaah returns my soul to me so that I may return salaam to that person.\"",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Abu Dawud (no. 2041)",
        },
      ],
    },
    {
      id: "dua-108",
      title: "Excellence of spreading the Islamic greeting",
      desc: "The virtues of spreading salaam amongst the people.",
      time: "1 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "Spreading Salaam",
          text: 'The Messenger of Allaah (sal-Allaahu \'alayhe wa sallam) said: "You shall not enter paradise until you believe, and you shall not believe until you love one another. Shall I not inform you of something, if you were to act upon it, you will indeed achieve mutual love for one another? Spread salaam amongst yourselves."',
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Muslim 1/74 No. 54, Ahmed 1430",
        },
        {
          title: "Three Characteristics",
          text: "'Ammaar (radhi-yAllaahu 'anhu) said: \"Three characteristics, whoever combines them, has completed his faith: to be sincerely just, to spread greetings to all people and to spend [charitably] out of the little you have.\"",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Al-Bukhari, Fathul-Bari 1/82",
        },
        {
          title: "The Best of Islam",
          text: "'Abdullaah Ibn 'Amr (radhi-yAllaahu 'anhu) reported that a man asked The Prophet (sal-Allaahu 'alayhe wa sallam): \"Which Islaam is the best?\". He replied: Feed [the poor], and greet those whom you know as well as those whom you do not.\"",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Fathul-Bari 1/55, Muslim 1/65",
        },
      ],
    },
    {
      id: "dua-109",
      title: "Returning a greeting to a kaafir",
      desc: "How to respond when the People of the Book greet you.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Returning the Greeting",
          text: "When the people of the Book greet you, reply by saying this.",
          arabic: "وَعَلَيكُمۡ",
          transliteration: "Wa 'alaykum",
          translation: "And upon you.",
          reference: "Al-Bukhari, Fathul-Bari 3/408, Muslim 2/841",
        },
      ],
    },
    {
      id: "dua-110",
      title: "Upon hearing a rooster crow, ass bray or dogs barking",
      desc: "Supplications to make when hearing certain animal sounds.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Rooster or Ass",
          text: "If you hear the crow of a rooster, ask Allaah for his bounty for it has seen an angel and if you hear the braying of an ass, seek refuge in Allaah for it has seen a devil.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Al-Bukhari, Muslim 4/2092",
        },
        {
          title: "Dogs or Asses at Night",
          text: "If you hear the barking of dogs or the braying of asses at night, seek refuge in Allaah for they see what you do not. Recite this.",
          arabic: "أَعُوذُ بِاللَّهِ مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
          transliteration: "'A'oothu billaahi minash-Shaytaanir-rajeem.",
          translation: "I seek refuge in Allah from Satan the outcast.",
          reference: "Abu Dawud 4/327, Ahmed 3/306",
        },
      ],
    },
    {
      id: "dua-112",
      title: "For one you have insulted",
      desc: "A prayer for someone you may have wronged or abused.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Turning Insult to Closeness",
          text: "Recite this for a believer you have insulted.",
          arabic:
            "أَللَّٰهُمَّ فَأَيُّمَا مُؤۡمِنٍ سَبَبۡتُهُ فَاجۡعَلۡ ذَلِكَ لَهُ قُرۡبَةً إِلَيكَ يَومَ ٱلۡقِيَامَةِ",
          transliteration:
            "Allaahumma fa'ayyumaa mu'minin sababtuhu faj'al thaalika lahu qurbatan 'ilayka yawmal-qiyaamati.",
          translation:
            "O Allah, whomever of the believers I have abused, make it a means of gaining nearness to you on the Day of Resurrection.",
          reference: "Al-Bukhari, Fathul-Bari 6/350, Muslim 4/2092",
        },
      ],
    },
    {
      id: "dua-114",
      title: "For the one that have been praised",
      desc: "Supplication to maintain humility and seek forgiveness when praised.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Humility upon Praise",
          text: "Recite this when someone praises you.",
          arabic:
            "أَللَّٰهُمَّ لَا تُؤَاخِذۡنِى بِمَا يَقُولُونَ وَاغۡفِرۡ لِى مَا لَا يَعۡلَمُونَ (وَاجۡعَلۡنِى خَيرًا مِّمَّا يَظُنُّونَ)",
          transliteration:
            "Allaahumma laa tu'aakhithnee bimaa yaqooloona, waghfir lee maa laa ya'lamoona [waj'alnee khayram-mimmaa yadhunnoon.]",
          translation:
            "Oh Allah, do not call me to account for what they say and forgive me for what they have no knowledge of [and make me better than they imagine]",
          reference: "Al-Bukhari, Al Adab Al Mufrad No. 761, Baihaqi 4/228",
        },
      ],
    },
    {
      id: "dua-115",
      title: "Pilgrim's arrival for Hajj/Umrah - Talbiya",
      desc: "The Talbiya chanted by pilgrims upon arrival and during Hajj or Umrah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "The Talbiya",
          text: "Recite this repeatedly during the pilgrimage state.",
          arabic:
            "لَبَّيكَ أَللَّٰهُمَّ لَبَّيكَ لَبَّيكَ لَا شَرِيكَ لَكَ لَبَّيكَ إِنَّ ٱلۡحَمۡدَ وَالنِّعۡمَةَ لَكَ وَالۡمُلۡكَ لَا شَرِيكَ لَكَ",
          transliteration:
            "Labbayk Allaahumma labbayk, labbayk laa shareeka laka labbayk, 'innal-hamda, wanni'mata, laka walmulk, laa shareeka laka.",
          translation:
            "I am here at Your service, O Allah, I am here at Your service. I am here at Your service, You have no partner, I am here at Your service. Surely the praise, and blessings are Yours, and the dominion. You have no partner.",
          reference: "Al-Bukhari, Muslim 2/841",
        },
      ],
    },
    {
      id: "dua-116",
      title: "Takbir when passing the black stone",
      desc: "What to say when passing the Black Stone during Tawaf.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Takbir at the Black Stone",
          text: "The Prophet (SAW) circled the Ka'bah on a camel, every time he reached the black stone he would point to it with something (his staff) and say this.",
          arabic: "أَللَّٰهُ أَكۡبَرُ",
          transliteration: "Allaahu 'Akbar.",
          translation: "Allah is the Most Great.",
          reference: "Al-Bukhari, Fathul-Bari 3/476",
        },
      ],
    },
    {
      id: "dua-117",
      title: "Between the Yemeni corner and black stone [Ka'bah]",
      desc: "Supplication to recite between the Yemeni Corner and the Black Stone during Tawaf.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Asking for Goodness",
          text: "The Prophet (SAW) used to say this between the Yemeni corner and the black stone.",
          arabic:
            "رَبَّنَا آتِنَا فِى ٱلدُّنۡيَا حَسَنَةً وَّفِى ٱلۡآخِرَةِ حَسَـنَةً وَّقِنَا عَذَابَ ٱلنَّارِ",
          transliteration:
            "Rabbanaa 'aatinaa fid-dunyaa hasanatan wa fil-'aakhirati hasanatan wa qinaa 'athaaban-naar.",
          translation:
            "Our Lord, grant us the good things in this world and the good things in the next life and save us from the punishment of the Fire.",
          reference: "Al-Bukhari, Fathul-Bari 11/171, Muslim 4/2007",
        },
      ],
    },
    {
      id: "dua-118",
      title: "When at Mount Safa and Mount Marwah",
      desc: "Supplications and actions when approaching and standing upon Mount Safa and Mount Marwah.",
      time: "3 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "Approaching Mount Safa",
          text: "When approaching Mount Safa, recite this.",
          arabic: "إِنَّ ٱلصَّفَا وَالۡمَرۡوَةَ مِنۡ شَعَآئِرِ ٱللَّهِ",
          transliteration: "Inna assafa walmarwatamin shaAAa-iri Allahi",
          translation:
            "Indeed, as-Safa and al-Marwah are among the symbols of Allah",
          reference: "Soorah al-Baqarah 2:158",
        },
        {
          title: "Beginning the Sa'ee",
          text: "Then say this to begin.",
          arabic: "أَبۡدَأُ بِمَا بَدَأَ ٱللَّهُ بِهِ",
          transliteration: "Abda'u bimaa bada'allaahu bihi.",
          translation: "I begin by that which Allah began.",
          reference: "Muslim 2/888",
        },
        {
          title: "Facing the Ka'bah",
          text: "Climb Safa until you see the Ka'bah, face it, and recite this three times, making dua between recitations. Repeat the same process at Mount Marwah.",
          arabic:
            "لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُۥ لَهُ ٱلۡمُلۡكُ وَلَهُ ٱلۡحَمۡدُ وَهُوَ عَلَىٰ كُلِّ شَيءٍ قَدِيرٌ لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ أَنۡجَزَ وَعۡدَهُۥ وَنَصَرَ عَبۡدَهُۥ وَهَزَمَ ٱلۡأَحۡزَابَ وَحۡدَهُۥ",
          transliteration:
            "Laa 'ilaaha 'illallaahu wahdahu laa shareeka lahu, lahul-mulku wa lahul-hamdu wa Huwa 'alaa kulli shay'in Qadeer, laa 'ilaaha 'illallaahu ilahaahu, 'anjaza wa'dahu, wa nasara 'abdahu, wa hazamal 'ahzaaba wahdahu.",
          translation:
            "None has the right to be worshipped but Allah alone, Who has no partner, His is the dominion and His is the praise, and He is Able to do all things. None has the right to be worshipped but Allah alone, He fulfilled His Promise, He aided His slave, and He alone defeated Confederates.",
          reference: "Muslim 2/888",
        },
      ],
    },
    {
      id: "dua-120",
      title: "Sacred Site [al-Mash'ar al-Haraam] - At Muzdalifa",
      desc: "Supplication and remembrances made at Al-Mash'ar Al-Haraam in Muzdalifa.",
      time: "1 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "Extolling His Greatness",
          text: "Face the Qiblah, supplicate, and say this.",
          arabic: "أَللَّٰهُ أَكۡبَرُ",
          transliteration: "Allaahu 'Akbar",
          translation: "Allah is the Most Great.",
          reference: "Muslim 2/891",
        },
        {
          title: "Declaring Oneness",
          text: "Then say this.",
          arabic: "لَآ إِلَٰهَ إِلَّا ٱللَّهُ",
          transliteration: "Laa 'ilaaha 'illallaahu",
          translation: "None has the right to be worshipped but Allah alone",
          reference: "Muslim 2/891",
        },
        {
          title: "Affirming He is One",
          text: "And say this. Stand until the sun shines but leave before it rises.",
          arabic: "أَللَّٰهُ أَحَدٌ",
          transliteration: "Allahu Ahad",
          translation: "Allah is the one",
          reference: "Muslim 2/891",
        },
      ],
    },
    {
      id: "dua-122",
      title: "At times of amazement and delight",
      desc: "Remembrances to say when amazed or delighted.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Glorifying Allah",
          text: "Say this.",
          arabic: "سُبۡحَانَ ٱللَّهِ",
          transliteration: "Subhaanallaah!",
          translation: "Glory is to Allah.",
          reference: "Al-Bukhari, Muslim 4/1857",
        },
        {
          title: "Magnifying Allah",
          text: "Or say this.",
          arabic: "أَللَّٰهُ أَكۡبَرُ",
          transliteration: "Allaahu 'Akbar!",
          translation: "Allah is the Most Great.",
          reference: "Al-Bukhari, Sahih At-Tirmithi 2/103",
        },
      ],
    },
    {
      id: "dua-123",
      title: "Upon receiving pleasant news",
      desc: "The Prophetic action of gratitude when receiving good news.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Prostration of Gratitude",
          text: "The Prophet (sal-Allaahu 'alayhe wa sallam) would prostrate in gratitude to Allaah (Subhaanahu wa Ta'aala) upon receiving news which pleased him or which caused pleasure.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Abu Dawud, Ibn Majah, At-Tirmithi",
        },
      ],
    },
    {
      id: "dua-125",
      title: "When in fear of afflicting someone with one’s eye",
      desc: "Supplication to seek blessings and ward off the evil eye when admiring something.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Invoking Blessings",
          text: "If you see something from your brother, yourself or wealth which you find impressing, then invoke blessings for it.",
          arabic: "بَارَكَ ٱللَّهُ لَكَ",
          transliteration: "Barakallahu lak",
          translation: "May Allah bless you",
          reference: "Ahmad 4/447, Ibn Majah, Malik",
        },
      ],
    },
    {
      id: "dua-126",
      title: "When startled",
      desc: "Remembrance to declare when suddenly startled or surprised.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Declaring Tawheed",
          text: "Recite this when startled.",
          arabic: "لَآ إِلَٰهَ إِلَّا ٱللَّهُ",
          transliteration: "Laa 'ilaaha 'illallaah!",
          translation: "There is none worthy of worship but Allah!",
          reference: "Bukhari 6/361, Muslim 4/2208",
        },
      ],
    },
    {
      id: "dua-127",
      title: "When slaughtering or sacrificing an animal",
      desc: "Supplication and intention made at the time of animal sacrifice.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Sacrifice Supplication",
          text: "Recite this when sacrificing.",
          arabic:
            "بِسۡمِ ٱللَّهِ وَاللَّهُ أَكۡبَرُ [أَللَّٰهُمَّ مِنۡكَ وَلَكَ] أَللَّٰهُمَّ تَقَبَّلۡ مِنِّي",
          transliteration:
            "Bismillaahi wallaahu 'Akbar [Allaahumma minka wa laka] Allaahumma taqabbal minnee.",
          translation:
            "With the Name of Allah, Allah is the Most Great! [O Allah, from You and to You.] O Allah, accept it from me.",
          reference: "At-Tirmithi 5/82, Ahmad 4/400, Abu Dawud 4/308",
        },
      ],
    },
    {
      id: "dua-129-1",
      title: "Seeking Forgiveness & Repentance",
      desc: "Various Prophetic instructions on repenting and seeking forgiveness from Allah.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "Daily Repentance",
          text: 'The Prophet (SAW) said: "By Allaah, I seek forgiveness and repent to Allaah, more than seventy times a day." and "O People, Repent to Allaah! Verily I repent to Him a hundred times a day."',
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Al-Bukhari 11/101, Muslim 4/2076",
        },
        {
          title: "A Great Istighfar",
          text: "Whoever says this, Allaah would forgive him even if he was one who fled during the advance of an army.",
          arabic:
            "أَسۡتَغۡفِرُ ٱللَّهَ ٱلۡعَظِيمَ ٱلَّذِى لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلقَيُّومُ وَأَتُوبُ إِلَيهِ",
          transliteration:
            "Astaghfirullaahal-'Adheemal-lathee laa 'ilaaha 'illaa Huwal-Hayyul-Qayyoomu wa 'atoobu 'ilayhi.",
          translation:
            "I seek Allaah's forgiveness, besides whom, none has the right to be worshipped except He, The Ever Living, The Self-Subsisting and Supporter of all, and I turn to Him in repentance.",
          reference: "Abu Dawud 2/85, At-Tirmithi 5/569",
        },
        {
          title: "Times of Closeness",
          text: "The nearest the Lord comes to His servant is in the middle of the night, so remember Allah then. The nearest a servant is to his Lord is when he is prostrating, so supplicate much therein.",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "At-Tirmithi, An-Nasa'i 1/279, Muslim 1/350",
        },
      ],
    },
    {
      id: "dua-130-1",
      title: "Sins forgiven even if like the foam of the sea",
      desc: "A daily remembrance carrying immense forgiveness.",
      time: "2 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Praising Allah",
          text: "Whoever says this one hundred times a day, will have his sins forgiven even if they are like the foam of the sea.",
          arabic: "سُبۡحَانَ ٱللَّهِ وَبِحَمۡدِهِ",
          transliteration: "Subhaanallaahi wa bihamdihi.",
          translation: "Glorified is Allah and praised is He.",
          reference: "Al-Bukhari 7/168, Muslim 4/2071",
        },
      ],
    },
    {
      id: "dua-131",
      title: "How the Prophet (saws) made tasbeeh",
      desc: "The method used by the Prophet (SAW) to count his remembrances.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Using the Right Hand",
          text: "Abdullaah Ibn 'Amr (radhi-yAllaahu 'anhu) said: \"I saw The Prophet (sal-Allaahu 'alayhe wa sallam) make tasbeeh with his right hand.\"",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "Abu Dawud, At-Tirmizi 5/521",
        },
      ],
    },
    {
      id: "dua-132-1",
      title: "General and Beneficent rules",
      desc: "A general prayer of peace and blessings upon the Prophet and his followers.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Closing Supplication",
          text: "O Allaah, send peace and blessings upon our Prophet Muhammad, his companions, and his family and all those who follow them in righteousness till the Day of Reckoning. Aameen",
          arabic: "",
          transliteration: "",
          translation: "",
          reference: "",
        },
      ],
    },
    {
      id: "dua-133",
      title: "Surah Fatiha 1:1-7",
      desc: "The Opening Chapter of the Quran, a fundamental supplication and praise.",
      time: "2 min",
      stepsCount: 7,
      difficulty: "beginner",
      steps: [
        {
          title: "Ayah 1",
          text: "Recite the first verse.",
          arabic: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
          transliteration: "Bismillaahir Rahmaanir Raheem",
          translation:
            "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          reference: "Surah Fatiha 1:1",
        },
        {
          title: "Ayah 2",
          text: "Recite the second verse.",
          arabic: "أَلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَۙ",
          transliteration: "Alhamdu lillaahi Rabbil 'aalameen",
          translation: "[All] praise is [due] to Allah, Lord of the worlds -",
          reference: "Surah Fatiha 1:2",
        },
        {
          title: "Ayah 3",
          text: "Recite the third verse.",
          arabic: "أَلرَّحۡمَٰنِ ٱلرَّحِيمِۙ",
          transliteration: "Ar-Rahmaanir-Raheem",
          translation: "The Entirely Merciful, the Especially Merciful,",
          reference: "Surah Fatiha 1:3",
        },
        {
          title: "Ayah 4",
          text: "Recite the fourth verse.",
          arabic: "مَٰلِكِ يَومِ ٱلدِّينِؕ",
          transliteration: "Maaliki Yawmid-Deen",
          translation: "Sovereign of the Day of Recompense.",
          reference: "Surah Fatiha 1:4",
        },
        {
          title: "Ayah 5",
          text: "Recite the fifth verse.",
          arabic: "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُؕ",
          transliteration: "Iyyaaka na'budu wa lyyaaka nasta'een",
          translation: "It is You we worship and You we ask for help.",
          reference: "Surah Fatiha 1:5",
        },
        {
          title: "Ayah 6",
          text: "Recite the sixth verse.",
          arabic: "إِهۡدِنَا ٱلصِّرَاطَ ٱلۡمُسۡتَقِيمَۙ",
          transliteration: "Ihdinas-Siraatal-Mustaqeem",
          translation: "Guide us to the straight path -",
          reference: "Surah Fatiha 1:6",
        },
        {
          title: "Ayah 7",
          text: "Recite the seventh verse.",
          arabic:
            "صِرَاطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيهِمۡ ۙ‏غَيرِ ٱلۡمَغۡضُوبِ عَلَيهِمۡ وَلَا ٱلضَّآلِّينَ",
          transliteration:
            "Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen",
          translation:
            "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
          reference: "Surah Fatiha 1:7",
        },
      ],
    },
    {
      id: "dua-134",
      title: "Protection from being ignorant [2:67]",
      desc: "Quranic supplication to seek refuge from ignorance.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Refuge from Ignorance",
          text: "Recite this to seek protection from being ignorant.",
          arabic: "أَعُوذُ بِاللَّهِ أَنۡ أَكُونَ مِنَ ٱلۡجَاهِلِينَ",
          transliteration: "AAoothu biAllahi an akoona mina aljahileen",
          translation: "I seek refuge in Allah from being among the ignorant.",
          reference: "Surah Al-Baqarah 2:67",
        },
      ],
    },
    {
      id: "dua-135",
      title: "Surah Al-Baqarah - 2:126",
      desc: "The Dua of Ibrahim (AS) for the security and provision of Makkah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Security and Provision",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ ٱجۡعَلۡ هَٰذَا بَلَدًا ءَامِنٗا وَٱرۡزُقۡ أَهۡلَهُۥ مِنَ ٱلثَّمَرَٰتِ مَنۡ ءَامَنَ مِنۡهُم بِٱللَّهِ وَٱلۡيَوۡمِ ٱلۡأٓخِرِۚ",
          transliteration:
            "rabbi ijAAal hatha baladan aminan warzuqahlahu mina aththamarati man amana minhumbillahi walyawmi al-akhiri",
          translation:
            "My Lord, make this a secure city and provide its people with fruits - whoever of them believes in Allah and the Last Day.",
          reference: "Surah Al-Baqarah 2:126",
        },
      ],
    },
    {
      id: "dua-136",
      title:
        "Seeking acceptance of deeds & becoming a devout muslim [2:127-128]",
      desc: "The Dua of Ibrahim and Ismail (AS) while building the Ka'bah.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Acceptance of Deeds",
          text: "Recite this for acceptance of deeds.",
          arabic:
            "رَبَّنَا تَقَبَّلۡ مِنَّآۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلۡعَلِيمُ",
          transliteration: "Rabbana taqabbal minna innaka antas Sameeaul Aleem",
          translation:
            "Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing.",
          reference: "Surah Al-Baqarah 2:127",
        },
        {
          title: "Submission and Repentance",
          text: "Recite this to seek submission and repentance.",
          arabic:
            "رَبَّنَا وَٱجۡعَلۡنَا مُسۡلِمَيۡنِ لَكَ وَمِن ذُرِّيَّتِنَآ أُمَّةٗ مُّسۡلِمَةٗ لَّكَ وَأَرِنَا مَنَاسِكَنَا وَتُبۡ عَلَيۡنَآۖ إِنَّكَ أَنتَ ٱلتَّوَّابُ ٱلرَّحِيمُ",
          transliteration:
            "Rabbana wa-j'alna Muslimayni laka wa min Dhurriyatina 'Ummatan Muslimatan laka wa 'Arina Manasikana wa tub 'alayna 'innaka 'antat-Tawwabu-Raheem",
          translation:
            "Our Lord, and make us Muslims [in submission] to You and from our descendants a Muslim nation [in submission] to You. And show us our rites and accept our repentance. Indeed, You are the Accepting of repentance, the Merciful.",
          reference: "Surah Al-Baqarah 2:128",
        },
      ],
    },
    {
      id: "dua-137",
      title: "Seeking good of this world and the hereafter [2:201]",
      desc: "A comprehensive Quranic dua seeking the best in both worlds.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Good in Both Worlds",
          text: "Recite this comprehensive supplication.",
          arabic:
            "رَبَّنَا آتِنَا فِى ٱلدُّنۡيَا حَسَنَةً وَّفِى ٱلۡآخِرَةِ حَسَنَةً وَّقِنَا عَذَابَ ٱلنَّارِ",
          transliteration:
            "Rabbana aatina fiddunya hasanatan wa fil aakhirati hasanatan waqina azaabannaar",
          translation:
            "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
          reference: "Surah Al-Baqarah 2:201",
        },
      ],
    },
    {
      id: "dua-138",
      title: "Seeking patience, firmness and victory [2:250]",
      desc: "Dua for patience and victory over disbelieving forces.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Patience and Victory",
          text: "Recite this when facing hardship or opposition.",
          arabic:
            "رَبَّنَآ أَفۡرِغۡ عَلَيۡنَا صَبۡرٗا وَثَبِّتۡ أَقۡدَامَنَا وَٱنصُرۡنَا عَلَى ٱلۡقَوۡمِ ٱلۡكَٰفِرِينَ",
          transliteration:
            "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'alal-qawmil-kafirin",
          translation:
            "Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.",
          reference: "Surah Al-Baqarah 2:250",
        },
      ],
    },
    {
      id: "dua-139",
      title: "Surah Al-Baqarah 2:285",
      desc: "Dua declaring obedience and seeking forgiveness.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Hearing and Obeying",
          text: "Recite this affirmation of faith.",
          arabic:
            "سَمِعۡنَا وَأَطَعۡنَا‌ غُفۡرَانَكَ رَبَّنَا وَإِلَيكَ ٱلۡمَصِيرُ",
          transliteration:
            "samiAAna waataAAna ghufranakarabbana wa-ilayka almaseer",
          translation:
            "We hear and we obey. [We seek] Your forgiveness, our Lord, and to You is the [final] destination.",
          reference: "Surah Al-Baqarah 2:285",
        },
      ],
    },
    {
      id: "dua-140",
      title: "Surah Al-Baqarah 2:286",
      desc: "A powerful dua asking Allah not to place heavy burdens and to grant pardon and victory.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Relief from Burdens",
          text: "Recite this at the end of Surah Al-Baqarah.",
          arabic:
            "رَبَّنَا لَا تُؤَاخِذۡنَآ إِن نَّسِينَآ أَوۡ أَخۡطَأۡنَاۚ رَبَّنَا وَلَا تَحۡمِلۡ عَلَيۡنَآ إِصۡرٗا كَمَا حَمَلۡتَهُۥ عَلَى ٱلَّذِينَ مِن قَبۡلِنَاۚ رَبَّنَا وَلَا تُحَمِّلۡنَا مَا لَا طَاقَةَ لَنَا بِهِۦۖ وَٱعۡفُ عَنَّا وَٱغۡفِرۡ لَنَا وَٱرۡحَمۡنَآۚ أَنتَ مَوۡلَىٰنَا فَٱنصُرۡنَا عَلَى ٱلۡقَوۡمِ ٱلۡكَٰفِرِينَ",
          transliteration:
            "rabbana latu-akhithna in naseena aw akhta/narabbana wala tahmil AAalayna isrankama hamaltahu AAala allatheena minqablina rabbana wala tuhammilnama la taqata lana bihi waAAfuAAanna waghfir lana warhamnaanta mawlana fansurna AAalaalqawmi alkafireen",
          translation:
            "Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.",
          reference: "Surah Al-Baqarah 2:286",
        },
      ],
    },
    {
      id: "dua-141",
      title: "Protection from deviation after guidance [3:8-9]",
      desc: "Seeking steadfastness upon the straight path and mercy from Allah.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Firmness of the Heart",
          text: "Recite this to protect your heart from deviating.",
          arabic:
            "رَبَّنَا لَا تُزِغۡ قُلُوبَنَا بَعۡدَ إِذۡ هَدَيۡتَنَا وَهَبۡ لَنَا مِن لَّدُنكَ رَحۡمَةًۚ إِنَّكَ أَنتَ ٱلۡوَهَّابُ",
          transliteration:
            "Rabbana la tuzigh quloobana ba'da idh hadaytana wa hab lana milladunka rahmah innaka antal Wahhab",
          translation:
            "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.",
          reference: "Surah Al-Imran 3:8",
        },
        {
          title: "Day of Gathering",
          text: "Affirming belief in the Day of Judgment.",
          arabic:
            "رَبَّنَآ إِنَّكَ جَامِعُ ٱلنَّاسِ لِيَوۡمٖ لَّا رَيۡبَ فِيهِۚ إِنَّ ٱللَّهَ لَا يُخۡلِفُ ٱلۡمِيعَادَ",
          transliteration:
            "Rabbana innaka jamiAAu annasiliyawmin la rayba feehi inna Allaha layukhlifu almeeAAad",
          translation:
            "Our Lord, surely You will gather the people for a Day about which there is no doubt. Indeed, Allah does not fail in His promise.",
          reference: "Surah Al-Imran 3:9",
        },
      ],
    },
    {
      id: "dua-142",
      title: "Asking forgiveness and protection from hell [3:16]",
      desc: "Quranic supplication affirming faith and seeking protection from the Fire.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from the Fire",
          text: "Recite this to seek forgiveness.",
          arabic:
            "رَبَّنَا إِنَّنَا آمَنَّا فَاغۡفِرۡ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ ٱلنَّارِ",
          transliteration:
            "Rabbana innana amanna faghfir lana dhunuubana wa qinna 'adhaban-Naar",
          translation:
            "Our Lord, indeed we have believed, so forgive us our sins and protect us from the punishment of the Fire,",
          reference: "Surah Al-Imran 3:16",
        },
      ],
    },
    {
      id: "dua-143",
      title: "Asking for a good child [3:38]",
      desc: "The Dua of Zakariya (AS) asking Allah for righteous offspring.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Righteous Offspring",
          text: "Recite this supplication for good children.",
          arabic:
            "رَبِّ هَبۡ لِي مِن لَّدُنكَ ذُرِّيَّةٗ طَيِّبَةًۖ إِنَّكَ سَمِيعُ ٱلدُّعَآءِ",
          transliteration:
            "Rabbi hab lee min ladunka thurriyyatan tayyibatan innaka samee ud duaa",
          translation:
            "My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication.",
          reference: "Surah Al-Imran 3:38",
        },
      ],
    },
    {
      id: "dua-144",
      title: "Surah Al-Imran - 3:53",
      desc: "Dua declaring belief in Allah's revelation and His messengers.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Witnesses to Truth",
          text: "Recite this declaration of faith.",
          arabic:
            "رَبَّنَآ ءَامَنَّا بِمَآ أَنزَلۡتَ وَٱتَّبَعۡنَا ٱلرَّسُولَ فَٱكۡتُبۡنَا مَعَ ٱلشَّٰهِدِينَ",
          transliteration:
            "Rabbana amanna bima anzalta wattaba 'nar-Rusula fak-tubna ma'ash-Shahideen",
          translation:
            "Our Lord, we have believed in what You revealed and have followed the messenger Jesus, so register us among the witnesses [to truth].",
          reference: "Surah Al-Imran 3:53",
        },
      ],
    },
    {
      id: "dua-145",
      title: "Seeking forgiveness, firmness and victory [3:147]",
      desc: "Supplication for pardon of excesses and granting of victory.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Forgiveness and Victory",
          text: "Recite this when seeking firmness and help.",
          arabic:
            "رَبَّنَا ٱغۡفِرۡ لَنَا ذُنُوبَنَا وَإِسۡرَافَنَا فِيٓ أَمۡرِنَا وَثَبِّتۡ أَقۡدَامَنَا وَٱنصُرۡنَا عَلَى ٱلۡقَوۡمِ ٱلۡكَٰفِرِينَ",
          transliteration:
            "Rabbana-ghfir lana dhunuubana wa israfana fi amrina wa thabbit aqdamana wansurna 'alal qawmil kafireen",
          translation:
            "Our Lord, forgive us our sins and the excess [committed] in our affairs and plant firmly our feet and give us victory over the disbelieving people.",
          reference: "Surah Al-Imran 3:147",
        },
      ],
    },
    {
      id: "dua-146",
      title: "Surah Al-Imran - 3:191-194",
      desc: "A beautiful sequence of supplications pondering creation and seeking salvation.",
      time: "2 min",
      stepsCount: 4,
      difficulty: "intermediate",
      steps: [
        {
          title: "Pondering Creation",
          text: "Recite verse 191.",
          arabic:
            "رَبَّنَا مَا خَلَقۡتَ هَٰذَا بَٰطِلٗا سُبۡحَٰنَكَ فَقِنَا عَذَابَ ٱلنَّارِ",
          transliteration:
            "Rabbana ma khalaqta hadha batila Subhanaka faqina 'adhaban-Naar",
          translation:
            "Our Lord, You did not create this aimlessly; exalted are You [above such a thing]; then protect us from the punishment of the Fire.",
          reference: "Surah Al-Imran 3:191",
        },
        {
          title: "Disgrace of the Fire",
          text: "Recite verse 192.",
          arabic:
            "رَبَّنَآ إِنَّكَ مَن تُدۡخِلِ ٱلنَّارَ فَقَدۡ أَخۡزَيۡتَهُۥۖ وَمَا لِلظَّٰلِمِينَ مِنۡ أَنصَارٖ",
          transliteration:
            "Rabbana innaka man tudkhilin nara faqad akhzaytah wa ma liDh-dhalimeena min ansar",
          translation:
            "Our Lord, indeed whoever You admit to the Fire - You have disgraced him, and for the wrongdoers there are no helpers.",
          reference: "Surah Al-Imran 3:192",
        },
        {
          title: "Answering the Caller",
          text: "Recite verse 193.",
          arabic:
            "رَّبَّنَآ إِنَّنَا سَمِعۡنَا مُنَادِيٗا يُنَادِي لِلۡإِيمَٰنِ أَنۡ ءَامِنُواْ بِرَبِّكُمۡ فَـَٔامَنَّاۚ رَبَّنَا فَٱغۡفِرۡ لَنَا ذُنُوبَنَا وَكَفِّرۡ عَنَّا سَيِّـَٔاتِنَا وَتَوَفَّنَا مَعَ ٱلۡأَبۡرَارِ",
          transliteration:
            "Rabbana innana samiAAnamunadiyan yunadee lil-eemani an aminoobirabbikum faamanna rabbana faghfirlana thunoobana wakaffir AAannasayyi-atina watawaffana maAAa al-abrar",
          translation:
            "Our Lord, indeed we have heard a caller calling to faith, [saying], 'Believe in your Lord,' and we have believed. Our Lord, so forgive us our sins and remove from us our misdeeds and cause us to die with the righteous.",
          reference: "Surah Al-Imran 3:193",
        },
        {
          title: "Fulfillment of the Promise",
          text: "Recite verse 194.",
          arabic:
            "رَبَّنَا وَءَاتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخۡزِنَا يَوۡمَ ٱلۡقِيَٰمَةِۖ إِنَّكَ لَا تُخۡلِفُ ٱلۡمِيعَادَ",
          transliteration:
            "Rabbana waatina mawaAAadtana AAala rusulika wala tukhzinayawma alqiyamati innaka la tukhlifu almeeAAad",
          translation:
            "Our Lord, and grant us what You promised us through Your messengers and do not disgrace us on the Day of Resurrection. Indeed, You do not fail in [Your] promise.",
          reference: "Surah Al-Imran 3:194",
        },
      ],
    },
    {
      id: "dua-147",
      title: "Dua of an oppressed person[4:75]",
      desc: "Seeking rescue and a protector from an oppressive environment.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Rescue from Oppression",
          text: "Recite this when facing oppression.",
          arabic:
            "رَبَّنَآ أَخۡرِجۡنَا مِنۡ هَٰذِهِ ٱلۡقَرۡيَةِ ٱلظَّالِمِ أَهۡلُهَا وَٱجۡعَل لَّنَا مِن لَّدُنكَ وَلِيّٗا وَٱجۡعَل لَّنَا مِن لَّدُنكَ نَصِيرًا",
          transliteration:
            "rabbana akhrijna min hathihialqaryati aththalimi ahluhawajAAal lana min ladunka waliyyan wajAAallana min ladunka naseera",
          translation:
            "Our Lord, take us out of this city of oppressive people and appoint for us from Yourself a protector and appoint for us from Yourself a helper?",
          reference: "Surah An-Nisa 4:75",
        },
      ],
    },
    {
      id: "dua-148",
      title: "Surah Al-Ma'ida - 5:25",
      desc: "The Dua of Musa (AS) distancing himself from the disobedient.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Parting from the Disobedient",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ إِنِّي لَآ أَمۡلِكُ إِلَّا نَفۡسِي وَأَخِيۖ فَٱفۡرُقۡ بَيۡنَنَا وَبَيۡنَ ٱلۡقَوۡمِ ٱلۡفَٰسِقِينَ",
          transliteration:
            "rabbi innee la amliku illanafsee waakhee fafruq baynana wabayna alqawmi alfasiqeen",
          translation:
            '"My Lord, indeed I do not possess except myself and my brother, so part us from the defiantly disobedient people."',
          reference: "Surah Al-Ma'idah 5:25",
        },
      ],
    },
    {
      id: "dua-149",
      title: "Surah Al-Ma'ida - 5:83-84",
      desc: "Dua declaring belief and desiring to be among the righteous.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Register us among Witnesses",
          text: "Recite verse 83.",
          arabic: "رَبَّنَا آمَنَّا فَاكۡتُبۡنَا مَعَ ٱلشَّٰهِدِينَ",
          transliteration: "Rabbana aamana faktubna ma' ash-shahideen",
          translation:
            "Our Lord, we have believed, so register us among the witnesses.",
          reference: "Surah Al-Ma'idah 5:83",
        },
        {
          title: "Admittance with the Righteous",
          text: "Recite verse 84.",
          arabic:
            "وَمَا لَـنَا لَا نُؤۡمِنُ بِاللَّهِ وَمَا جَآءَنَا مِنَ ٱلۡحَـقِّۙ وَنَطۡمَعُ أَنۡ يُّدۡخِلَـنَا رَبُّنَا مَعَ ٱلۡقَومِ ٱلصَّٰلِحِينَ‏",
          transliteration:
            "Wama lana la nu/minu billahiwama jaana mina alhaqqi wanatmaAAuan yudkhilana rabbuna maAAa alqawmi assaliheen",
          translation:
            'And why should we not believe in Allah and what has come to us of the truth? And we aspire that our Lord will admit us [to Paradise] with the righteous people."',
          reference: "Surah Al-Ma'idah 5:84",
        },
      ],
    },
    {
      id: "dua-150",
      title: "Surah Al-Ma'ida - 5:114",
      desc: "The Dua of Isa (AS) asking for a table spread of food from heaven.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Provision from Heaven",
          text: "Recite this asking for Allah's provision.",
          arabic:
            "رَبَّنَآ أَنزِلۡ عَلَيۡنَا مَآئِدَةٗ مِّنَ ٱلسَّمَآءِ تَكُونُ لَنَا عِيدٗا لِّأَوَّلِنَا وَءَاخِرِنَا وَءَايَةٗ مِّنكَۖ وَٱرۡزُقۡنَا وَأَنتَ خَيۡرُ ٱلرَّٰزِقِينَ",
          transliteration:
            "Rabbana anzil 'alayna ma'idatam minas-Samai tuknu lana 'idal li-awwa-lina wa aakhirna wa ayatam-minka war-zuqna wa anta Khayrul-Raziqeen",
          translation:
            "O Allah, our Lord, send down to us a table [spread with food] from the heaven to be for us a festival for the first of us and the last of us and a sign from You. And provide for us, and You are the best of providers.",
          reference: "Surah Al-Ma'ida 5:114",
        },
      ],
    },
    {
      id: "dua-151",
      title: "Seeking forgiveness and mercy after sinning [7:23]",
      desc: "The Dua of Adam and Hawa (AS) seeking forgiveness after their mistake.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Admitting the Wrong",
          text: "Recite this to seek immense mercy.",
          arabic:
            "رَبَّنَا ظَلَمۡنَآ أَنفُسَنَا وَإِن لَّمۡ تَغۡفِرۡ لَنَا وَتَرۡحَمۡنَا لَنَكُونَنَّ مِنَ ٱلۡخَٰسِرِينَ",
          transliteration:
            "Rabbana zalamna anfusina wa il lam taghfir lana wa tarhamna lana kunan minal-khasireen",
          translation:
            "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
          reference: "Surah Al-A'raf 7:23",
        },
      ],
    },
    {
      id: "dua-152",
      title: "Dua for not placing among wrongdoers [7:47]",
      desc: "Supplication to not be grouped with the unjust.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Distance from Wrongdoers",
          text: "Recite this for protection from the company of wrongdoers.",
          arabic: "رَبَّنَا لَا تَجۡعَلۡنَا مَعَ ٱلۡقَومِ ٱلظَّٰلِمِينَ",
          transliteration: "Rabbana la taj'alna ma'al qawwmi-dhalimeen",
          translation: "Our Lord, do not place us with the wrongdoing people.",
          reference: "Surah Al-A'raf 7:47",
        },
      ],
    },
    {
      id: "dua-153",
      title: "Surah Al-A'raf - 7:89",
      desc: "Dua relying on Allah to judge with truth.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "The Best Decision",
          text: "Recite this when seeking a truthful judgment.",
          arabic:
            "عَلَى ٱللَّهِ تَوَكَّلۡنَا‌ ؕرَبَّنَا ٱفۡتَحۡ بَينَنَا وَبَينَ قَومِنَا بِالۡحَـقِّ وَأَنۡتَ خَيرُ ٱلۡفَٰتِحِينَ‏",
          transliteration:
            "AAala Allahi tawakkalna rabbanaiftah baynana wabayna qawmina bilhaqqiwaanta khayru alfatiheen",
          translation:
            'Upon Allah we have relied. Our Lord, decide between us and our people in truth, and You are the best of those who give decision."',
          reference: "Surah Al-A'raf 7:89",
        },
      ],
    },
    {
      id: "dua-154",
      title: "Seeking patience and dying as a muslim [7:126]",
      desc: "A supplication asking for patience and a righteous end.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Patience and a Good End",
          text: "Recite this asking for steadfastness.",
          arabic:
            "رَبَّنَا أَفۡرِغۡ عَلَينَا صَبۡرًا وَّتَوَفَّنَا مُسۡلِمِينَ",
          transliteration:
            "Rabbana afrigh 'alayna sabraw wa tawaffana Muslimeen",
          translation:
            "Our Lord, pour upon us patience and let us die as Muslims [in submission to You].",
          reference: "Surah Al-A'raf 7:126",
        },
      ],
    },
    {
      id: "dua-155",
      title: "Seeking forgiveness and mercy [7:151]",
      desc: "Dua of Musa (AS) asking for forgiveness for himself and his brother.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Mercy for Siblings",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ ٱغۡفِرۡ لِىۡ وَلِأَخِىۡ وَأَدۡخِلۡنَا فِى رَحۡمَتِكَ ‌ۖوَأَنۡتَ أَرۡحَمُ ٱلرَّٰحِمِينَ",
          transliteration:
            "Rabbi ighfir lee wali akhee wa adkhilna fee rahmatika wa anta arhamur rahimeen",
          translation:
            "My Lord, forgive me and my brother and admit us into Your mercy, for You are the most merciful of the merciful.",
          reference: "Surah Al-A'raf 7:151",
        },
      ],
    },
    {
      id: "dua-156",
      title: "Surah Al-A'raf - 7:155-156",
      desc: "Supplication of Musa (AS) seeking forgiveness, mercy, and goodness in this life and the next.",
      time: "2 min",
      stepsCount: 2,
      difficulty: "intermediate",
      steps: [
        {
          title: "Seeking Forgiveness for the People",
          text: "Recite verse 155.",
          arabic:
            "رَبِّ لَوۡ شِئۡتَ أَهۡلَكۡتَهُم مِّن قَبۡلُ وَإِيَّٰيَۖ أَتُهۡلِكُنَا بِمَا فَعَلَ ٱلسُّفَهَآءُ مِنَّآۖ إِنۡ هِيَ إِلَّا فِتۡنَتُكَ تُضِلُّ بِهَا مَن تَشَآءُ وَتَهۡدِى مَن تَشَآءُۖ أَنتَ وَلِيُّنَا فَٱغۡفِرۡ لَنَا وَٱرۡحَمۡنَاۖ وَأَنتَ خَيۡرُ ٱلۡغَٰفِرِينَ",
          transliteration:
            "rabbi lawshi/ta ahlaktahum min qablu wa-iyyaya atuhlikunabima faAAala assufahao minna in hiyailla fitnatuka tudillu biha man tashaowatahdee man tashao anta waliyyuna faghfirlana warhamna waanta khayru alghafireen",
          translation:
            '"My Lord, if You had willed, You could have destroyed them before and me [as well]. Would You destroy us for what the foolish among us have done? This is not but Your trial by which You send astray whom You will and guide whom You will. You are our Protector, so forgive us and have mercy upon us; and You are the best of forgivers.',
          reference: "Surah Al-A'raf 7:155",
        },
        {
          title: "Decree of Goodness",
          text: "Recite verse 156.",
          arabic:
            "وَٱكۡتُبۡ لَنَا فِى هَٰذِهِ ٱلدُّنۡيَا حَسَنَةٗ وَفِى ٱلۡأٓخِرَةِ إِنَّا هُدۡنَآ إِلَيۡكَ",
          transliteration:
            "Waktub lana fee hathihi ddunya hasanatan wafee al-akhiratiinna hudna ilayk",
          translation:
            "And decree for us in this world [that which is] good and [also] in the Hereafter; indeed, we have turned back to You.",
          reference: "Surah Al-A'raf 7:156",
        },
      ],
    },
    {
      id: "dua-157",
      title: "Surah Al-A'raf - 7:189",
      desc: "A prayer expressing gratitude for the blessing of a good child.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Gratitude for Offspring",
          text: "Recite this expressing gratitude.",
          arabic:
            "لَئِنۡ ءَاتَيۡتَنَا صَٰلِحٗا لَّنَكُونَنَّ مِنَ ٱلشَّٰكِرِينَ",
          transliteration:
            "la-in ataytanasalihan lanakoonanna mina ashshakireen",
          translation:
            '"If You should give us a good [child], we will surely be among the grateful."',
          reference: "Surah Al-A'raf 7:189",
        },
      ],
    },
    {
      id: "dua-158",
      title: "Surah Yunus - 10:22",
      desc: "A declaration to be thankful if saved from distress.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Promise of Thankfulness",
          text: "Recite this in times of distress.",
          arabic:
            "لَئِنۡ أَنجَيۡتَنَا مِنۡ هَٰذِهِۦ لَنَكُونَنَّ مِنَ ٱلشَّٰكِرِينَ",
          transliteration:
            "la-in anjaytana min hathihi lanakoonanna mina ashshakireen",
          translation:
            '"If You should save us from this, we will surely be among the thankful."',
          reference: "Surah Yunus 10:22",
        },
      ],
    },
    {
      id: "dua-159",
      title: "Surah Yunus - 10:85-86",
      desc: "Dua placing reliance on Allah and seeking protection from becoming a trial for wrongdoers.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Relying on Allah",
          text: "Recite verse 85.",
          arabic:
            "عَلَى ٱللَّهِ تَوَكَّلۡنَا رَبَّنَا لَا تَجۡعَلۡنَا فِتۡنَةٗ لِّلۡقَوۡمِ ٱلظَّٰلِمِينَ",
          transliteration:
            "Alal Allahi thawakkalna rabbana la taj'alna fitnatal lil-qawmidh-Dhalimeen.",
          translation:
            "Upon Allah do we rely. Our Lord, make us not [objects of] trial for the wrongdoing people",
          reference: "Surah Yunus 10:85",
        },
        {
          title: "Salvation by Mercy",
          text: "Recite verse 86.",
          arabic: "وَنَجِّنَا بِرَحۡمَتِكَ مِنَ ٱلۡقَومِ ٱلۡكَٰفِرِينَ‏",
          transliteration: "Wa najjina bi-Rahmatika minal qawmil kafireen.",
          translation:
            "And save us by Your mercy from the disbelieving people.",
          reference: "Surah Yunus 10:86",
        },
      ],
    },
    {
      id: "dua-160",
      title: "Surah Yunus - 10:88",
      desc: "The Dua of Musa (AS) concerning the wealth and stubbornness of Pharaoh.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Dua against Oppressors",
          text: "Recite this supplication.",
          arabic:
            "رَبَّنَآ إِنَّكَ ءَاتَيۡتَ فِرۡعَوۡنَ وَمَلَأَهُۥ زِينَةٗ وَأَمۡوَٰلٗا فِي ٱلۡحَيَوٰةِ ٱلدُّنۡيَا رَبَّنَا لِيُضِلُّواْ عَن سَبِيلِكَۖ رَبَّنَا ٱطۡمِسۡ عَلَىٰٓ أَمۡوَٰلِهِمۡ وَٱشۡدُدۡ عَلَىٰ قُلُوبِهِمۡ فَلَا يُؤۡمِنُواْ حَتَّىٰ يَرَوُاْ ٱلۡعَذَابَ ٱلۡأَلِيمَ",
          transliteration:
            "rabbanainnaka atayta firAAawna wamalaahu zeenatan waamwalanfee alhayati addunya rabbanaliyudilloo AAan sabeelika rabbana itmis AAalaamwalihim washdud AAala quloobihim falayu/minoo hatta yarawoo alAAathaba al-aleem",
          translation:
            '"Our Lord, indeed You have given Pharaoh and his establishment splendor and wealth in the worldly life, our Lord, that they may lead [men] astray from Your way. Our Lord, obliterate their wealth and harden their hearts so that they will not believe until they see the painful punishment."',
          reference: "Surah Yunus 10:88",
        },
      ],
    },
    {
      id: "dua-161",
      title: "Surah Hud - 11:41",
      desc: "The supplication of Nuh (AS) when boarding the Ark.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Embarking with Allah's Name",
          text: "Recite this when embarking.",
          arabic:
            "بِسۡمِ ٱللَّهِ مَجۡر۪ىَٰهَا وَمُرۡسَٰىَٰهَآۚ إِنَّ رَبِّىۡ لَـغَفُورٌ رَّحِيمٌ",
          transliteration:
            "bismillahi majra-ha wa mursa-ha, inna rabbi lagafu-rur ra'heem",
          translation:
            'in the name of Allah is its course and its anchorage. Indeed, my Lord is Forgiving and Merciful."',
          reference: "Surah Hud 11:41",
        },
      ],
    },
    {
      id: "dua-162",
      title: "Surah Hud - 11:47",
      desc: "The Dua of Nuh (AS) seeking refuge from asking without knowledge.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Refuge from Ignorant Requests",
          text: "Recite this to seek forgiveness.",
          arabic:
            "رَبِّ إِنِّيٓ أَعُوذُ بِكَ أَنۡ أَسۡــَٔلَكَ مَا لَـيسَ لِىۡ بِهِۦٓ عِلۡمٌ‌ؕ وَإِلَّا تَغۡفِرۡ لِىۡ وَتَرۡحَمۡنِيٓ أَكُنۡ مِّنَ ٱلۡخَٰسِرِينَ",
          transliteration:
            "Rabbi innee aoothu bika an as alaka ma laysa lee bihi ilmun wa illa taghfir lee wa tarhamnee akun minal khasireen",
          translation:
            "My Lord, I seek refuge in You from asking that of which I have no knowledge. And unless You forgive me and have mercy upon me, I will be among the losers.",
          reference: "Surah Hud 11:47",
        },
      ],
    },
    {
      id: "dua-163",
      title: "Surah Yusuf - 12:23",
      desc: "The Dua of Yusuf (AS) seeking refuge in Allah from temptation.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Refuge from Temptation",
          text: "Recite this when facing temptation.",
          arabic:
            "مَعَاذَ ٱللَّهِ‌ إِنَّهُۥ رَبِّيٓ أَحۡسَنَ مَثۡوَاىَ‌ؕ إِنَّهُۥ لَا يُفۡلِحُ ٱلظَّٰلِمُونَ‏",
          transliteration:
            "maAAatha Allahi innahu rabbee ahsanamathwaya innahu la yuflihu aththalimoon",
          translation:
            '"[I seek] the refuge of Allah . Indeed, he is my master, who has made good my residence. Indeed, wrongdoers will not succeed."',
          reference: "Surah Yusuf 12:23",
        },
      ],
    },
    {
      id: "dua-164",
      title: "Surah Yusuf - 12:33",
      desc: "The Dua of Yusuf (AS) preferring hardship over sin.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from Sin",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ ٱلسِّجۡنُ أَحَبُّ إِلَىَّ مِمَّا يَدۡعُونَنِيٓ إِلَيهِ‌ۚ وَإِلَّا تَصۡرِفۡ عَنِّىۡ كَيدَهُنَّ أَصۡبُ إِلَيهِنَّ وَأَكُنۡ مِّنَ ٱلۡجَٰهِلِينَ‏",
          transliteration:
            "rabbi assijnu ahabbuilayya mimma yadAAoonanee ilayhi wa-illa tasrifAAannee kaydahunna asbu ilayhinna waakun mina aljahileen",
          translation:
            "My Lord, prison is more to my liking than that to which they invite me. And if You do not avert from me their plan, I might incline toward them and [thus] be of the ignorant.",
          reference: "Surah Yusuf 12:33",
        },
      ],
    },
    {
      id: "dua-165",
      title: "Seeking death among the righteous muslims [12:101]",
      desc: "The Dua of Yusuf (AS) expressing gratitude and asking for a good end.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "A Righteous End",
          text: "Recite this to seek a good death.",
          arabic:
            "رَبِّ قَدۡ آتَيتَنِىۡ مِنَ ٱلۡمُلۡكِ وَعَلَّمۡتَنِىۡ مِنۡ تَاۡوِيلِ ٱلۡأَحَادِيثِ‌ ۚفَاطِرَ ٱلسَّمَٰوَٰتِ وَالۡأَرۡضِ أَنۡتَ وَلِىِّۦٓ فِى ٱلدُّنۡيَا وَالۡآخِرَةِ‌ ۚتَوَفَّنِىۡ مُسۡلِمًا وَّأَلۡحِقۡنِىۡ بِالصَّٰلِحِينَ",
          transliteration:
            "Rabbi qad ataytanee mina almulkiwaAAallamtanee min ta/weeli al-ahadeethi fatira assamawatiwal-ardi anta waliyyee fee addunyawal-akhirati tawaffanee musliman waalhiqneebissaliheen",
          translation:
            'My Lord, You have given me [something] of sovereignty and taught me of the interpretation of dreams. Creator of the heavens and earth, You are my protector in this world and in the Hereafter. Cause me to die a Muslim and join me with the righteous."',
          reference: "Surah Yusuf 12:101",
        },
      ],
    },
    {
      id: "dua-166",
      title: "Surah Ibraheem - 14:35",
      desc: "The Dua of Ibrahim (AS) for the security of Makkah and protection from idolatry.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from Idols",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ ٱجۡعَلۡ هَٰذَا ٱلۡبَلَدَ آمِنًا وَّاجۡنُبۡنِىۡ وَبَنِىَّ أَنۡ نَّـعۡبُدَ ٱلۡأَصۡنَامَؕ",
          transliteration:
            "rabbi ijAAal hatha albalada aminan wajnubneewabaniyya an naAAbuda al-asnam",
          translation:
            "My Lord, make this city [Makkah] secure and keep me and my sons away from worshipping idols.",
          reference: "Surah Ibraheem 14:35",
        },
      ],
    },
    {
      id: "dua-167",
      title: "Surah Ibraheem - 14:40-41",
      desc: "Dua of Ibrahim (AS) asking to establish prayer and seeking forgiveness for parents.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Establishing Prayer",
          text: "Recite verse 40.",
          arabic:
            "رَبِّ ٱجۡعَلۡنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِيۚ رَبَّنَا وَتَقَبَّلۡ دُعَآءِ",
          transliteration:
            "Rabbij alnee muqeemas salaati wa min thurriyyatee rabbana wa taqabbal duaa",
          translation:
            "My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.",
          reference: "Surah Ibraheem 14:40",
        },
        {
          title: "Forgiveness for Parents",
          text: "Recite verse 41.",
          arabic:
            "رَبَّنَا ٱغۡفِرۡ لِى وَلِوَٰلِدَيَّ وَلِلۡمُؤۡمِنِينَ يَوۡمَ يَقُومُ ٱلۡحِسَابُ",
          transliteration:
            "Rabbana ghfir li wa li wallidayya wa lil Mu'mineena yawma yaqumul hisaab",
          translation:
            "Our Lord, forgive me and my parents and the believers the Day the account is established.",
          reference: "Surah Ibraheem 14:41",
        },
      ],
    },
    {
      id: "dua-168",
      title: "Dua for parents [17:24]",
      desc: "A beautiful Quranic supplication to ask mercy for one's parents.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Mercy for Parents",
          text: "Recite this regularly for your parents.",
          arabic: "رَّبِّ ٱرۡحَمۡهُمَا كَمَا رَبَّيَانِى صَغِيرٗا",
          transliteration: "Rabbi irhamhuma kama rabbayani sagheera",
          translation:
            "My Lord, have mercy upon them as they brought me up [when I was] small.",
          reference: "Surah Al-Isra 17:24",
        },
      ],
    },
    {
      id: "dua-169",
      title: "Surah Al-Isra - 17:80",
      desc: "Dua asking Allah for a sound entrance, exit, and a supporting authority.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "A Sound Entrance and Exit",
          text: "Recite this supplication.",
          arabic:
            "رَّبِّ أَدۡخِلۡنِىۡ مُدۡخَلَ صِدۡقٍ وَّأَخۡرِجۡنِىۡ مُخۡرَجَ صِدۡقٍ وَّاجۡعَلۡ لِّىۡ مِنۡ لَّدُنۡكَ سُلۡطَٰنًا نَّصِيرًا‏",
          transliteration:
            "Waqul rabbi adkhilnee mudkhala sidqinwaakhrijnee mukhraja sidqin wajAAal lee minladunka sultanan naseera",
          translation:
            "My Lord, cause me to enter a sound entrance and to exit a sound exit and grant me from Yourself a supporting authority.",
          reference: "Surah Al-Isra 17:80",
        },
      ],
    },
    {
      id: "dua-170",
      title: "Asking for correcting affairs and mercy[18:10]",
      desc: "The Dua of the Companions of the Cave seeking mercy and right guidance.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Guidance and Mercy",
          text: "Recite this supplication.",
          arabic:
            "رَبَّنَا آتِنَا مِنۡ لَّدُنۡكَ رَحۡمَةً وَّهَيِّئۡ لَـنَا مِنۡ أَمۡرِنَا رَشَدًا‏",
          transliteration:
            "Rabbana 'atina mil-ladunka Rahmataw wa hayyi lana min amrina rashada",
          translation:
            "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
          reference: "Surah Al-Kahf 18:10",
        },
      ],
    },
    {
      id: "dua-171",
      title: "Surah Maryam - 19:4-6",
      desc: "The supplication of Zakariya (AS) detailing his weakness and asking for an heir.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "Expressing Weakness",
          text: "Recite verse 4.",
          arabic:
            "رَبِّ إِنِّىۡ وَهَنَ ٱلۡعَظۡمُ مِنِّىۡ وَاشۡتَعَلَ ٱلرَّاۡسُ شَيبًا وَّلَمۡ أَكُنۡۢ بِدُعَائِكَ رَبِّ شَقِيًّا",
          transliteration:
            "rabbi innee wahana alAAathmuminnee washtaAAala arra/su shayban walam akunbiduAAa-ika rabbi shaqiyya",
          translation:
            '"My Lord, indeed my bones have weakened, and my head has filled with white, and never have I been in my supplication to You, my Lord, unhappy.',
          reference: "Surah Maryam 19:4",
        },
        {
          title: "Asking for an Heir",
          text: "Recite verse 5.",
          arabic:
            "إِنِّى خِفۡتُ ٱلۡمَوَٰلِىَ مِن وَرَآءِى وَكَانَتِ ٱمۡرَأَتِى عَاقِرٗا فَهَبۡ لِى مِن لَّدُنكَ وَلِيّٗا",
          transliteration:
            "Wa-innee khiftu almawaliya min wara-eewakanati imraatee AAaqiran fahab lee min ladunkawaliyya",
          translation:
            "And indeed, I fear the successors after me, and my wife has been barren, so give me from Yourself an heir",
          reference: "Surah Maryam 19:5",
        },
        {
          title: "An Heir Pleasing to Allah",
          text: "Recite verse 6.",
          arabic:
            "يَّرِثُنِىۡ وَيَرِثُ مِنۡ آلِ يَعۡقُوبَ ۖوَاجۡعَلۡهُ رَبِّ رَضِيًّا‏",
          transliteration:
            "Yarithunee wayarithu min ali yaAAqoobawajAAalhu rabbi radiyya",
          translation:
            'Who will inherit me and inherit from the family of Jacob. And make him, my Lord, pleasing [to You]."',
          reference: "Surah Maryam 19:6",
        },
      ],
    },
    {
      id: "dua-172",
      title: "Surah Maryam - 19:18",
      desc: "The Dua of Maryam (AS) seeking refuge in the Most Merciful.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Refuge in the Most Merciful",
          text: "Recite this supplication.",
          arabic: "إِنِّيٓ أَعُوذُ بِالرَّحۡمَٰنِ مِنۡكَ إِنۡ كُنۡتَ تَقِيًّا",
          transliteration: "innee aAAoothu birrahmaniminka in kunta taqiyya",
          translation:
            '"Indeed, I seek refuge in the Most Merciful from you, [so leave me], if you should be fearing of Allah ."',
          reference: "Surah Maryam 19:18",
        },
      ],
    },
    {
      id: "dua-173",
      title: "Seeking easeness in speech [20:25-28]",
      desc: "The Dua of Musa (AS) asking for confidence, ease in task, and eloquence.",
      time: "1 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "Expanding the Breast",
          text: "Recite verse 25.",
          arabic: "رَبِّ ٱشۡرَحۡ لِىۡ صَدۡرِىۡ",
          transliteration: "Rabbi ishrah lee sadree",
          translation: "My Lord, expand for me my breast [with assurance]",
          reference: "Surah Ta'ha 20:25",
        },
        {
          title: "Easing the Task",
          text: "Recite verse 26.",
          arabic: "وَيَسِّرۡ لِىٓ أَمۡرِىۡ",
          transliteration: "Wayassir lee amree",
          translation: "And ease for me my task",
          reference: "Surah Ta'ha 20:26",
        },
        {
          title: "Untying the Knot",
          text: "Recite verse 27.",
          arabic: "وَاحۡلُلۡ عُقۡدَةً مِّنۡ لِّسَانِىۡ",
          transliteration: "Wahlul AAuqdatan min lisanee",
          translation: "And untie the knot from my tongue",
          reference: "Surah Ta'ha 20:27",
        },
        {
          title: "Understanding the Speech",
          text: "Recite verse 28.",
          arabic: "يَفۡقَهُوا۟ قَولِىۡ",
          transliteration: "Yafqahoo qawlee",
          translation: "That they may understand my speech.",
          reference: "Surah Ta'ha 20:28",
        },
      ],
    },
    {
      id: "dua-174",
      title: "Asking for increase in knowledge [20:114]",
      desc: "A brief and powerful supplication asking Allah to increase one's knowledge.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Increase in Knowledge",
          text: "Recite this regularly to seek knowledge.",
          arabic: "رَّبِّ زِدۡنِىۡ عِلۡمًا",
          transliteration: "rabbizidnee AAilma",
          translation: "My Lord, increase me in knowledge",
          reference: "Surah Ta'ha 20:114",
        },
      ],
    },
    {
      id: "dua-175",
      title: "Surah Al-Anbiya - 21:83",
      desc: "The Dua of Ayyub (AS) during his intense hardship and illness.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Calling upon the Most Merciful",
          text: "Recite this during times of sickness and distress.",
          arabic: "أَنِّىۡ مَسَّنِىَ ٱلضُّرُّ وَأَنۡتَ أَرۡحَمُ ٱلرَّٰحِمِينَ",
          transliteration: "annee massaniya addurru waanta arhamuarrahimeen",
          translation:
            '"Indeed, adversity has touched me, and you are the Most Merciful of the merciful."',
          reference: "Surah Al-Anbiya 21:83",
        },
      ],
    },
    {
      id: "dua-176",
      title: "Surah Al-Anbiya - 21:87",
      desc: "The Dua of Yunus (AS) while in the belly of the whale (Ayat Karima).",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "The Dua of Yunus",
          text: "Recite this powerful supplication when in distress.",
          arabic:
            "لَّآ إِلَٰهَ إِلَّآ أَنۡتَ سُبۡحَٰنَكَ ‌ۖإِنِّىۡ كُنۡتُ مِنَ ٱلظَّٰلِمِينَ",
          transliteration:
            "la ilaha illa anta subhanaka inneekuntu mina aththalimeen",
          translation:
            '"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."',
          reference: "Surah Al-Anbiya 21:87",
        },
      ],
    },
    {
      id: "dua-177",
      title: "Surah Al-Anbiya - 21:89",
      desc: "Another Dua of Zakariya (AS) asking Allah not to leave him childless.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Asking for an Heir",
          text: "Recite this supplication.",
          arabic: "رَبِّ لَا تَذَرۡنِى فَرۡدٗا وَأَنتَ خَيۡرُ ٱلۡوَٰرِثِينَ",
          transliteration:
            "Rabbi la tatharnee fardan waanta khayru alwaritheen",
          translation:
            "My Lord, do not leave me alone [with no heir], while you are the best of inheritors",
          reference: "Surah Al-Anbiya 21:89",
        },
      ],
    },
    {
      id: "dua-178",
      title: "Surah Al-Anbiya - 21:112",
      desc: "A supplication asking for Allah's truthful judgment and seeking His help.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Judging in Truth",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ ٱحۡكُمۡ بِالۡحَـقِّ‌ؕ وَرَبُّنَا ٱلرَّحۡمَٰنُ ٱلۡمُسۡتَعَانُ عَلَىٰ مَا تَصِفُونَ",
          transliteration:
            "Rabbi ohkum bilhaqqi wa rabbuna arrahmanul musta'aanu alaa ma tasifoon",
          translation:
            "My Lord, judge [between us] in truth. And our Lord is the Most Merciful, the one whose help is sought against that which you describe.",
          reference: "Surah Al-Anbiya 21:112",
        },
      ],
    },
    {
      id: "dua-179",
      title: "Surah Al-Mu'minoon - 23:26, 39",
      desc: "A prayer for support when faced with denial and rejection.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Support Against Denial",
          text: "Recite this supplication.",
          arabic: "رَبِّ ٱنۡصُرۡنِىۡ بِمَا كَذَّبُونِ",
          transliteration: "rabbi onsurnee bimakaththaboon",
          translation: '"My Lord, support me because they have denied me."',
          reference: "Surah Al-Mu'minoon 23:26, 39",
        },
      ],
    },
    {
      id: "dua-180",
      title: "Surah Al-Mu'minoon - 23:29",
      desc: "A supplication asking for a blessed landing or destination.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "A Blessed Landing",
          text: "Recite this when reaching a destination.",
          arabic:
            "رَّبِّ أَنزِلۡنِى مُنزَلٗا مُّبَارَكٗا وَأَنتَ خَيۡرُ ٱلۡمُنزِلِينَ",
          transliteration:
            "Rabbi anzilnee munzalan mubarakanwaanta khayru almunzileen",
          translation:
            "My Lord, let me land at a blessed landing place, and You are the best to accommodate [us].",
          reference: "Surah Al-Mu'minoon 23:29",
        },
      ],
    },
    {
      id: "dua-181",
      title: "Dua for not placing among wrongdoers [23:94]",
      desc: "Another variation seeking protection from being among the unjust.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from Wrongdoers",
          text: "Recite this supplication.",
          arabic: "رَبِّ فَلَا تَجۡعَلۡنِىۡ فِى ٱلۡقَومِ ٱلظَّٰلِمِينَ‏",
          transliteration: "Rabbi fala tajAAalnee fee alqawmi aththalimeen",
          translation:
            "My Lord, then do not place me among the wrongdoing people.",
          reference: "Surah Al-Mu'minoon 23:94",
        },
      ],
    },
    {
      id: "dua-182",
      title: "Seeking refuge in Allah from devils [23:97-98]",
      desc: "Dua asking Allah for protection against the incitements and presence of devils.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Refuge from Incitements",
          text: "Recite verse 97.",
          arabic: "رَّبِّ أَعُوذُ بِكَ مِنۡ هَمَزَٰتِ ٱلشَّيَٰطِينِ",
          transliteration: "Rabbi aoothu bika min hamazatish shayateen",
          translation:
            "My Lord, I seek refuge in You from the incitements of the devils",
          reference: "Surah Al-Mu'minoon 23:97",
        },
        {
          title: "Refuge from their Presence",
          text: "Recite verse 98.",
          arabic: "وَأَعُوذُ بِكَ رَبِّ أَنۡ يَّحۡضُرُونِ‏",
          transliteration: "Wa aoothu bika rabbi an yahduroon",
          translation:
            "And I seek refuge in You, my Lord, lest they be present with me.",
          reference: "Surah Al-Mu'minoon 23:98",
        },
      ],
    },
    {
      id: "dua-183",
      title: "Seeking forgiveness and mercy [23:109]",
      desc: "Dua of the believers acknowledging their faith and asking for mercy.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Faith and Forgiveness",
          text: "Recite this supplication.",
          arabic:
            "رَبَّنَا آمَنَّا فَاغۡفِرۡ لَـنَا وَارۡحَمۡنَا وَأَنۡتَ خَيرُ ٱلرَّٰحِمِينَ‌‌",
          transliteration:
            "Rabbana amanna faghfir lana warhamna wa anta khayrur Rahimiin",
          translation:
            "Our Lord, we have believed, so forgive us and have mercy upon us, and You are the best of the merciful.",
          reference: "Surah Al-Mu'minoon 23:109",
        },
      ],
    },
    {
      id: "dua-184",
      title: "Seeking forgiveness and mercy [23:118]",
      desc: "A brief and beautiful dua asking Allah for forgiveness and mercy.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "The Best of the Merciful",
          text: "Recite this supplication.",
          arabic: "رَّبِّ ٱغۡفِرۡ وَارۡحَمۡ وَأَنۡتَ خَيرُ ٱلرَّٰحِمِينَ",
          transliteration: "Rabbi ighfir warhamwaanta khayru arrahimeen",
          translation:
            "My Lord, forgive and have mercy, and You are the best of the merciful.",
          reference: "Surah Al-Mu'minoon 23:118",
        },
      ],
    },
    {
      id: "dua-185",
      title: "Seeking refuge from the punishment from hellfire [25:65]",
      desc: "The Dua of the servants of the Most Merciful asking to be saved from Hell.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Averting the Punishment",
          text: "Recite this supplication.",
          arabic:
            "رَبَّنَا ٱصۡرِفۡ عَنَّا عَذَابَ جَهَنَّمَۖ إِنَّ عَذَابَهَا كَانَ غَرَامًا",
          transliteration:
            "Rabbanas-rif 'anna 'adhaba jahannama inna 'adhabaha kana gharama",
          translation:
            "Our Lord, avert from us the punishment of Hell. Indeed, its punishment is ever adhering;",
          reference: "Surah Al-Furqan 25:65",
        },
      ],
    },
    {
      id: "dua-186",
      title:
        "Asking coolness of eyes from family and becoming example for the righteous [25:74]",
      desc: "Supplication asking for comfort from spouses and offspring and to be leaders of the righteous.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Comfort of the Eyes",
          text: "Recite this supplication.",
          arabic:
            "رَبَّنَا هَبۡ لَنَا مِنۡ أَزۡوَٰجِنَا وَذُرِّيَّٰتِنَا قُرَّةَ أَعۡيُنٖ وَٱجۡعَلۡنَا لِلۡمُتَّقِينَ إِمَامًا",
          transliteration:
            "Rabbana Hablana min azwaajina wadhurriy-yatina, qurrata 'ayioni wa-jalna lil-muttaqeena Imaama",
          translation:
            "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.",
          reference: "Surah Al-Furqan 25:74",
        },
      ],
    },
    {
      id: "dua-187",
      title: "Surah Ash-Shu'araa - 26:83-89",
      desc: "Dua of Ibrahim (AS) asking for authority, honor, Paradise, forgiveness for his father, and protection from disgrace.",
      time: "2 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "A Comprehensive Supplication",
          text: "Recite verses 83 through 89.",
          arabic:
            "رَبِّ هَبۡ لِى حُكۡمٗا وَأَلۡحِقۡنِى بِٱلصَّٰلِحِينَ وَٱجۡعَل لِّى لِسَانَ صِدۡقٖ فِى ٱلۡأٓخِرِينَ وَٱجۡعَلۡنِى مِن وَرَثَةِ جَنَّةِ ٱلنَّعِيمِ وَٱغۡفِرۡ لِأَبِىٓ إِنَّهُۥ كَانَ مِنَ ٱلضَّآلِّينَ وَلَا تُخۡزِنِي يَوۡمَ يُبۡعَثُونَ يَوۡمَ لَا يَنفَعُ مَالٞ وَلَا بَنُونَ إِلَّا مَنۡ أَتَى ٱللَّهَ بِقَلۡبٖ سَلِيمٖ",
          transliteration:
            "Rabbi hab lee hukman wa alhiqnee bis saliheen. Waj'al lee lisana sidqin fil akhireen. Waj'al nee min warathati jannatin na'eem. Waghfir li-abee innahu kanamina addalleen. Wala tukhzinee yawma yub'asoon. Yawma la yanfa'u malun walaa banoon. Illa man ata Allah bi qalbin saleem.",
          translation:
            "My Lord, grant me authority and join me with the righteous. And grant me a reputation of honor among later generations. And place me among the inheritors of the Garden of Pleasure. And forgive my father. Indeed, he has been of those astray. And do not disgrace me on the Day they are [all] resurrected - The Day when there will not benefit [anyone] wealth or children But only one who comes to Allah with a sound heart.",
          reference: "Surah Ash-Shu'araa 26:83-89",
        },
      ],
    },
    {
      id: "dua-188",
      title: "Surah Ash-Shu'araa - 26:117-118",
      desc: "Dua of Nuh (AS) asking for decisive judgment and salvation from those who denied him.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Decisive Judgment",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ إِنَّ قَومِىۡ كَذَّبُونِ‌ۖ فَٱفۡتَحۡ بَيۡنِى وَبَيۡنَهُمۡ فَتۡحٗا وَنَجِّنِى وَمَن مَّعِىَ مِنَ ٱلۡمُؤۡمِنِينَ",
          transliteration:
            "rabbi inna qawmee kaththaboon Faftah baynee wabaynahum fathanwanajjinee waman maAAiya mina almu/mineen",
          translation:
            '"My Lord, indeed my people have denied me. Then judge between me and them with decisive judgement and save me and those with me of the believers."',
          reference: "Surah Ash-Shu'araa 26:117-118",
        },
      ],
    },
    {
      id: "dua-189",
      title: "Surah Ash-Shu'araa - 26:169",
      desc: "The Dua of Lut (AS) seeking salvation for himself and his family from the evil deeds of his people.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Salvation for Family",
          text: "Recite this for protection.",
          arabic: "رَبِّ نَجِّنِىۡ وَأَهۡلِىۡ مِمَّا يَعۡمَلُونَ",
          transliteration: "Rabbi najjinee waahlee mimma ya'maloon.",
          translation:
            "My Lord, save me and my family from [the consequence of] what they do.",
          reference: "Surah Ash-Shu'araa 26:169",
        },
      ],
    },
    {
      id: "dua-190",
      title: "Seeking gratefulness to Allah and approved deeds [27:19]",
      desc: "The Dua of Sulaiman (AS) asking for gratitude, righteousness, and admittance among the righteous.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Enable Gratefulness",
          text: "Recite this to seek gratitude and righteousness.",
          arabic:
            "رَبِّ أَوزِعۡنِىٓ أَنۡ أَشۡكُرَ نِعۡمَتَكَ ٱلَّتِىٓ أَنۡعَمۡتَ عَلَىَّ وَعَلَى وَالِدَىَّ وَأَنۡ أَعۡمَلَ صَالِحًـا تَرۡضَٰهُ وَأَدۡخِلۡنِىۡ بِرَحۡمَتِكَ فِى عِبَادِكَ ٱلصَّٰلِحِينَ‏",
          transliteration:
            "Rabbi awziAAnee an ashkura niAAmataka allateeanAAamta AAalayya waAAala walidayya waan aAAmala salihantardahu waadkhilnee birahmatika fee AAibadikaassaliheen",
          translation:
            "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to do righteousness of which You approve. And admit me by Your mercy into [the ranks of] Your righteous servants.",
          reference: "Surah An-Naml 27:19",
        },
      ],
    },
    {
      id: "dua-191",
      title: "Surah 27:44",
      desc: "The Dua of the Queen of Sheba (Bilqis) upon submitting to Allah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Submitting to Allah",
          text: "Recite this declaration of submission.",
          arabic:
            "رَبِّ إِنِّىۡ ظَلَمۡتُ نَـفۡسِىۡ وَأَسۡلَمۡتُ مَعَ سُلَيمَٰنَ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
          transliteration:
            "rabbi innee thalamtunafsee waaslamtu maAAa sulaymana lillahi rabbi alAAalameen",
          translation:
            '"My Lord, indeed I have wronged myself, and I submit with Solomon to Allah , Lord of the worlds."',
          reference: "Surah An-Naml 27:44",
        },
      ],
    },
    {
      id: "dua-192",
      title: "Surah Al-Qasas - 28:16-17",
      desc: "The Dua of Musa (AS) asking for forgiveness and pledging not to aid criminals.",
      time: "1 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "Asking for Forgiveness",
          text: "Recite verse 16.",
          arabic:
            "رَبِّ إِنِّى ظَلَمۡتُ نَفۡسِى فَٱغۡفِرۡ لِى فَغَفَرَ لَهُۥٓۚ إِنَّهُۥ هُوَ ٱلۡغَفُورُ ٱلرَّحِيمُ",
          transliteration:
            "innee thalamtunafsee faghfir lee faghafara lahu innahu huwa alghafooruarraheem",
          translation:
            'My Lord, indeed I have wronged myself, so forgive me," and He forgave him. Indeed, He is the Forgiving, the Merciful.',
          reference: "Surah Al-Qasas 28:16",
        },
        {
          title: "Pledging not to Assist Criminals",
          text: "Recite verse 17.",
          arabic:
            "رَبِّ بِمَآ أَنۡعَمۡتَ عَلَىَّ فَلَنۡ أَكُونَ ظَهِيرٗا لِّلۡمُجۡرِمِينَ",
          transliteration:
            "Qala  Rabbi bima anAAamtaAAalayya falan akoona thaheeran lilmujrimeen,",
          translation:
            'Say: "My Lord, for the favor You bestowed upon me, I will never be an assistant to the criminals."',
          reference: "Surah Al-Qasas 28:17",
        },
      ],
    },
    {
      id: "dua-193",
      title: "Seeking protection from wrongdoing people [28:21]",
      desc: "The Dua of Musa (AS) asking for protection from oppressors.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Protection from the Unjust",
          text: "Recite this for safety.",
          arabic: "رَبِّ نَجِّنِىۡ مِنَ ٱلۡقَومِ ٱلظَّٰلِمِينَ",
          transliteration: "Rabbi najjinee mina alqawmi aththalimeen",
          translation: "My Lord, save me from the wrongdoing people.",
          reference: "Surah Al-Qasas 28:21",
        },
      ],
    },
    {
      id: "dua-194",
      title: "Seeking whatever good Allah can bestow [28:24]",
      desc: "The beautiful Dua of Musa (AS) expressing utter need for any good from Allah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Need for Allah's Goodness",
          text: "Recite this when in need.",
          arabic: "رَبِّ إِنِّي لِمَآ أَنزَلۡتَ إِلَيَّ مِنۡ خَيۡرٖ فَقِيرٞ",
          transliteration: "Rabbi innee lima anzalta ilayya min khayrin faqeer",
          translation:
            "My Lord, indeed I am, for whatever good You would send down to me, in need.",
          reference: "Surah Al-Qasas 28:24",
        },
      ],
    },
    {
      id: "dua-195",
      title: "Asking help against corrupt people [29:30]",
      desc: "The Dua of Lut (AS) seeking support against those who spread corruption.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Support Against Corruption",
          text: "Recite this for help against corruption.",
          arabic: "رَبِّ ٱنۡصُرۡنِىۡ عَلَى ٱلۡقَومِ ٱلۡمُفۡسِدِينَ",
          transliteration: "Rabbi onsurnee AAalaalqawmi almufsideen",
          translation: "My Lord, support me against the corrupting people.",
          reference: "Surah Al-'Ankaboot 29:30",
        },
      ],
    },
    {
      id: "dua-196",
      title: "Seeking a righteous child [37:100]",
      desc: "The Dua of Ibrahim (AS) asking Allah for a righteous offspring.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "A Righteous Child",
          text: "Recite this to ask for a righteous child.",
          arabic: "رَبِّ هَبۡ لِىۡ مِنَ ٱلصَّٰلِحِينَ",
          transliteration: "Rabbi hablee mina assaliheen",
          translation: "My Lord, grant me [a child] from among the righteous.",
          reference: "Surah As-Saaffaat 37:100",
        },
      ],
    },
    {
      id: "dua-197",
      title: "Surah Sad - 38:35",
      desc: "The Dua of Sulaiman (AS) seeking forgiveness and a unique kingdom.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Forgiveness and a Kingdom",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ ٱغۡفِرۡ لِى وَهَبۡ لِى مُلۡكٗا لَّا يَنۢبَغِى لِأَحَدٖ مِّنۢ بَعۡدِىٓۖ إِنَّكَ أَنتَ ٱلۡوَهَّابُ",
          transliteration:
            "rabbi ighfir lee wahab leemulkan la yanbaghee li-ahadin min baAAdee innakaanta alwahhab",
          translation:
            "My Lord, forgive me and grant me a kingdom such as will not belong to anyone after me. Indeed, You are the Bestower.",
          reference: "Surah Sad 38:35",
        },
      ],
    },
    {
      id: "dua-198",
      title: "Surah Sad - 38:41",
      desc: "The Dua of Ayyub (AS) complaining of hardship and torment.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Expressing Hardship",
          text: "Recite this when afflicted by hardship.",
          arabic: "أَنِّى مَسَّنِىَ ٱلشَّيۡطَٰنُ بِنُصۡبٖ وَعَذَابٍ",
          transliteration: "annee massaniya ashshaytanubinusbin waAAathab",
          translation:
            '"Indeed, Satan has touched me with hardship and torment."',
          reference: "Surah Sad 38:41",
        },
      ],
    },
    {
      id: "dua-199",
      title: "Surah Ghafir - 40:7-9",
      desc: "The Dua of the Angels for the believers, asking for forgiveness and admittance to Paradise.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "Forgiveness for Believers",
          text: "Recite verse 7.",
          arabic:
            "رَبَّنَا وَسِعۡتَ كُلَّ شَىۡءٖ رَّحۡمَةٗ وَعِلۡمٗا فَٱغۡفِرۡ لِلَّذِينَ تَابُواْ وَٱتَّبَعُواْ سَبِيلَكَ وَقِهِمۡ عَذَابَ ٱلۡجَحِيمِ",
          transliteration:
            "Rabbana wasi'ta kulla sha'ir Rahmatanw wa 'ilman faghfir lilladhina tabu wattaba'u sabilaka waqihim 'adhabal-Jahiim",
          translation:
            "Our Lord, You have encompassed all things in mercy and knowledge, so forgive those who have repented and followed Your way and protect them from the punishment of Hellfire.",
          reference: "Surah Ghafir 40:7",
        },
        {
          title: "Admittance to Paradise",
          text: "Recite verse 8.",
          arabic:
            "رَبَّنَا وَأَدۡخِلۡهُمۡ جَنَّٰتِ عَدۡنٍ ٱلَّتِى وَعَدتَّهُمۡ وَمَن صَلَحَ مِنۡ ءَابَآئِهِمۡ وَأَزۡوَٰجِهِمۡ وَذُرِّيَّٰتِهِمۡۚ إِنَّكَ أَنتَ ٱلۡعَزِيزُ ٱلۡحَكِيمُ",
          transliteration:
            "Rabbana wa adhkhilhum Jannati 'adninil-lati wa'attahum wa man salaha min aba'ihim wa azwajihim wa dhuriyyatihim innaka antal 'Azizul-Hakim,",
          translation:
            "Our Lord, and admit them to gardens of perpetual residence which You have promised them and whoever was righteous among their fathers, their spouses and their offspring. Indeed, it is You who is the Exalted in Might, the Wise.",
          reference: "Surah Ghafir 40:8",
        },
        {
          title: "Protection from Evil Consequences",
          text: "Recite verse 9.",
          arabic:
            "وَقِهِمُ ٱلسَّيِّئَاتِۚ وَمَن تَقِ ٱلسَّيِّئَاتِ يَوۡمَئِذٖ فَقَدۡ رَحِمۡتَهُۥۚ وَذَٰلِكَ هُوَ ٱلۡفَوۡزُ ٱلۡعَظِيمُ",
          transliteration:
            "waqihimus sayyi'at wa man taqis-sayyi'ati yawma'idhin faqad rahimatahu wa dhalika huwal fawzul-'Adheem",
          translation:
            "And protect them from the evil consequences [of their deeds]. And he whom You protect from evil consequences that Day - You will have given him mercy. And that is the great attainment.",
          reference: "Surah Ghafir 40:9",
        },
      ],
    },
    {
      id: "dua-200",
      title: "Surah Ghafir - 40:27",
      desc: "The Dua of Musa (AS) seeking refuge from every arrogant disbeliever.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Refuge from the Arrogant",
          text: "Recite this to seek refuge from arrogance.",
          arabic:
            "إِنِّى عُذۡتُ بِرَبِّى وَرَبِّكُم مِّن كُلِّ مُتَكَبِّرٖ لَّا يُؤۡمِنُ بِيَوۡمِ ٱلۡحِسَابِ",
          transliteration:
            "innee AAuthtubirabbee warabbikum min kulli mutakabbirin la yu/minubiyawmi alhisab",
          translation:
            'Indeed, I have sought refuge in my Lord and your Lord from every arrogant one who does not believe in the Day of Account."',
          reference: "Surah Ghafir 40:27",
        },
      ],
    },
    {
      id: "dua-201",
      title: "Surah Ghafir - 40:44",
      desc: "A declaration of entrusting one's affairs completely to Allah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Entrusting Affairs to Allah",
          text: "Recite this supplication.",
          arabic:
            "وَأُفَوِّضُ أَمۡرِىٓ إِلَى ٱللَّهِۚ إِنَّ ٱللَّهَ بَصِيرُۢ بِٱلۡعِبَادِ",
          transliteration:
            "waofawwidu amree ila Allahi inna Allahabaseerun bilAAibad",
          translation:
            'and I entrust my affair to Allah . Indeed, Allah is Seeing of [His] servants."',
          reference: "Surah Ghafir 40:44",
        },
      ],
    },
    {
      id: "dua-202",
      title:
        "Seeking gratefulness to Allah, approved deeds and righteous child [46:15]",
      desc: "A beautiful Dua for gratitude, righteous deeds, and righteous offspring upon reaching maturity.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "intermediate",
      steps: [
        {
          title: "Gratitude and Righteousness",
          text: "Recite this comprehensive supplication.",
          arabic:
            "رَبِّ أَوۡزِعۡنِىٓ أَنۡ أَشۡكُرَ نِعۡمَتَكَ ٱلَّتِىٓ أَنۡعَمۡتَ عَلَىَّ وَعَلَىٰ وَٰلِدَىَّ وَأَنۡ أَعۡمَلَ صَٰلِحٗا تَرۡضَىٰهُ وَأَصۡلِحۡ لِى فِى ذُرِّيَّتِىٓۖ إِنِّى تُبۡتُ إِلَيۡكَ وَإِنِّى مِنَ ٱلۡمُسۡلِمِينَ",
          transliteration:
            "awzi'nee an ashkura ni'mataka allatee anAAamta AAalayya waAAalawalidayya waan aAAmala salihan tardahuwaaslih lee fee thurriyyatee innee tubtuilayka wa-innee mina almuslimeen",
          translation:
            "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to work righteousness of which You will approve and make righteous for me my offspring. Indeed, I have repented to You, and indeed, I am of the Muslims.",
          reference: "Surah Al-Ahqaf 46:15",
        },
      ],
    },
    {
      id: "dua-203",
      title: "Surah Qamar 54:10",
      desc: "The Dua of Nuh (AS) when he was overpowered by his people, asking Allah for help.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Seeking Help when Overpowered",
          text: "Recite this brief yet powerful supplication.",
          arabic: "أَنِّي مَغۡلُوبٞ فَٱنتَصِرۡ",
          transliteration: "annee maghloobun fantasir",
          translation: '"Indeed, I am overpowered, so help."',
          reference: "Surah Qamar 54:10",
        },
      ],
    },
    {
      id: "dua-204",
      title: "Surah Al-Hashr - 59:10",
      desc: "A Dua for oneself, for preceding believers, and for a heart free of resentment.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Forgiveness and a Pure Heart",
          text: "Recite this to purify your heart towards believers.",
          arabic:
            "رَبَّنَا ٱغۡفِرۡ لَنَا وَلِإِخۡوَٰنِنَا ٱلَّذِينَ سَبَقُونَا بِٱلۡإِيمَٰنِ وَلَا تَجۡعَلۡ فِى قُلُوبِنَا غِلّٗا لِّلَّذِينَ ءَامَنُواْ رَبَّنَآ إِنَّكَ رَءُوفٞ رَّحِيمٌ",
          transliteration:
            "Rabbana ighfir lana wali-ikhwaninaallatheena sabaqoona bil-eemani walatajAAal fee quloobina ghillan lillatheena amanoorabbana innaka raoofun raheem",
          translation:
            "Our Lord, forgive us and our brothers who preceded us in faith and put not in our hearts [any] resentment toward those who have believed. Our Lord, indeed You are Kind and Merciful.",
          reference: "Surah Al-Hashr 59:10",
        },
      ],
    },
    {
      id: "dua-205",
      title: "Surah Al-Mumtahina - 60:4",
      desc: "The declaration of reliance upon Allah by Ibrahim (AS) and his followers.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Reliance on Allah",
          text: "Recite this supplication.",
          arabic:
            "رَّبَّنَا عَلَيۡكَ تَوَكَّلۡنَا وَإِلَيۡكَ أَنَبۡنَا وَإِلَيۡكَ ٱلۡمَصِيرُ",
          transliteration:
            "rabbanaAAalayka tawakkalna wa-ilayka anabna wa-ilayka almaseer",
          translation:
            "Our Lord, upon You we have relied, and to You we have returned, and to You is the destination.",
          reference: "Surah Al-Mumtahina 60:4",
        },
      ],
    },
    {
      id: "dua-206",
      title: "Surah At-Tahreem - 66:8",
      desc: "The Dua of the believers on the Day of Judgment asking Allah to perfect their light.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Perfecting the Light",
          text: "Recite this supplication.",
          arabic:
            "رَبَّنَآ أَتۡمِمۡ لَنَا نُورَنَا وَٱغۡفِرۡ لَنَآۖ إِنَّكَ عَلَىٰ كُلِّ شَىۡءٖ قَدِيرٞ",
          transliteration:
            "Rabbana atmim lana nurana waighfir lana innaka 'ala kulli shay-in qadir",
          translation:
            "Our Lord, perfect for us our light and forgive us. Indeed, You are over all things competent.",
          reference: "Surah At-Tahreem 66:8",
        },
      ],
    },
    {
      id: "dua-207",
      title: "Surah At-Tahreem - 66:11",
      desc: "The Dua of Asiya (the wife of Pharaoh) asking for a house in Paradise and salvation.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "A House in Paradise",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ ٱبۡنِ لِى عِندَكَ بَيۡتٗا فِى ٱلۡجَنَّةِ وَنَجِّنِى مِن فِرۡعَوۡنَ وَعَمَلِهِۦ وَنَجِّنِى مِنَ ٱلۡقَوۡمِ ٱلظَّٰلِمِينَ",
          transliteration:
            "rabbiibni lee AAindaka baytan fee aljannati wanajjinee min firAAawnawaAAamalihi wanajjinee mina alqawmi aththalimeen",
          translation:
            "My Lord, build for me near You a house in Paradise and save me from Pharaoh and his deeds and save me from the wrongdoing people.",
          reference: "Surah At-Tahreem 66:11",
        },
      ],
    },
    {
      id: "dua-208",
      title: "Surah Nooh - 71:26",
      desc: "The Dua of Nuh (AS) asking Allah not to leave any disbelievers on earth.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Against the Disbelievers",
          text: "Recite this supplication.",
          arabic:
            "رَبِّ لَا تَذَرۡ عَلَى ٱلۡأَرۡضِ مِنَ ٱلۡكَٰفِرِينَ دَيَّارًا",
          transliteration:
            "rabbi latathar AAala al-ardi mina alkafireenadayyara",
          translation:
            "My Lord, do not leave upon the earth from among the disbelievers an inhabitant.",
          reference: "Surah Nooh 71:26",
        },
      ],
    },
    {
      id: "dua-209",
      title: "Surah Nooh - 71:28",
      desc: "The final Dua of Nuh (AS) seeking forgiveness for himself, his parents, believers, and destruction for wrongdoers.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Forgiveness for Believers",
          text: "Recite this comprehensive supplication.",
          arabic:
            "رَبِّ ٱغۡفِرۡ لِى وَلِوَٰلِدَىَّ وَلِمَن دَخَلَ بَيۡتِىَ مُؤۡمِنٗا وَلِلۡمُؤۡمِنِينَ وَٱلۡمُؤۡمِنَٰتِۖ وَلَا تَزِدِ ٱلظَّٰلِمِينَ إِلَّا تَبَارَا",
          transliteration:
            "ighfir lee waliwalidayyawaliman dakhala baytiya mu'minan walil mu'mineena wal mu'minati wala tazidi aththalimeena illatabaran",
          translation:
            'My Lord, forgive me and my parents and whoever enters my house a believer and the believing men and believing women. And do not increase the wrongdoers except in destruction."',
          reference: "Surah Nooh 71:28",
        },
      ],
    },
  ],
  Stories: [
    {
      id: "story-musa",
      title: "Prophet Musa (AS)",
      desc: "The incredible story of Moses and Pharaoh.",
      time: "10 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "The River Nile",
          text: "Born in a time when Pharaoh was killing newborn boys, his mother put him in a basket in the river, where he was remarkably rescued and raised in Pharaoh's own palace.",
        },
        {
          title: "Fleeing to Madyan",
          text: "After accidentally killing an Egyptian, Musa fled to Madyan, where he worked for 10 years and married.",
        },
        {
          title: "The Burning Bush",
          text: "On his way back to Egypt, Allah spoke to him at Mount Tur, granting him Prophethood and commanding him to confront Pharaoh.",
        },
        {
          title: "Parting the Sea",
          text: "When trapped between Pharaoh's army and the Red Sea, Allah commanded Musa to strike the water with his staff, splitting it to save the Children of Israel.",
        },
      ],
    },
    {
      id: "dua-start-of-prayer",
      title: "At the Start of the Prayer",
      desc: "Opening supplication recited after the opening Takbir and before Surah Al-Fatihah.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Opening Supplication",
          text: "Recite this after saying Takbiratul Ihram and before beginning the recitation.",
          arabic:
            "أَللَّٰهُمَّ بَاعِدۡ بَينِى وَبَينَ خَطَايَاىَ كَمَا بَاعَدۡتَ بَينَ ٱلۡمَشۡرِقِ وَٱلۡمَغۡرِبِ أَللَّٰهُمَّ نَقِّنِى مِنۡ خَطَايَاىَ كَمَا يُنَقَّى ٱلثَّوبُ ٱلۡأَبۡيَضُ مِنَ ٱلدَّنَسِ أَللَّٰهُمَّ ٱغۡسِلۡنِى مِنۡ خَطَايَاىَ بِٱلۡمَآءِ وَٱلثَّلۡجِ وَٱلۡبَرَدِ",
          transliteration:
            "Allaahumma baa'id baynee wa bayna khataayaaya kamaa baa'adta baynal-mashriqi walmaghribi. Allaahumma naqqinee min khataayaaya kamaa yunaqqath-thawbul-'abyadhu minad-danasi. Allaahummaghsilnee min khataayaaya bith-thalji walmaa'i walbarad.",
          translation:
            "O Allah, separate me from my sins as You have separated the East from the West. O Allah, cleanse me of my sins as a white garment is cleansed of dirt. O Allah, wash away my sins with water, snow and hail.",
        },
      ],
    },

    {
      id: "dua-rukoo",
      title: "While in Rukoo (Bowing)",
      desc: "The remembrance to recite while bowing during Salah.",
      time: "30 sec",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite Three Times",
          text: "While in the bowing position (Rukoo), recite this remembrance three times.",
          arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
          transliteration: "Subhaana Rabbiyal-'Adheem.",
          translation: "Glory be to my Lord, the Most Great.",
        },
      ],
    },

    {
      id: "dua-rising-from-rukoo",
      title: "Upon Rising from Rukoo",
      desc: "Supplication recited while standing after Rukoo.",
      time: "30 sec",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "Say this while rising from the bowing position.",
          arabic: "سَمِعَ ٱللَّهُ لِمَنۡ حَمِدَهُ",
          transliteration: "Sami'allaahu liman hamidah.",
          translation: "Allah hears whoever praises Him.",
        },
      ],
    },

    {
      id: "dua-sujood",
      title: "Whilst Prostrating (Sujood)",
      desc: "The remembrance to recite during prostration.",
      time: "30 sec",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite Three Times",
          text: "While in Sujood, recite this remembrance three times.",
          arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
          transliteration: "Subhaana Rabbiyal-A'laa.",
          translation: "Glory be to my Lord, the Most High.",
        },
      ],
    },

    {
      id: "dua-between-two-sujood",
      title: "Between the Two Prostrations",
      desc: "Supplication recited while sitting between the two prostrations.",
      time: "30 sec",
      stepsCount: 1,
      difficulty: "beginner",
      steps: [
        {
          title: "Recite",
          text: "While sitting between the two Sujood, recite this supplication.",
          arabic: "رَبِّ ٱغۡفِرۡ لِى رَبِّ ٱغۡفِرۡ لِى",
          transliteration: "Rabbighfir lee, Rabbighfir lee.",
          translation: "My Lord, forgive me. My Lord, forgive me.",
        },
      ],
    },
  ],
  Seerah: [
    {
      id: "seerah-hijrah",
      title: "The Hijrah",
      desc: "The historical migration from Mecca to Madinah.",
      time: "6 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "The Plot",
          text: "After 13 years of persecution, the leaders of Quraysh plotted to assassinate the Prophet ﷺ in his sleep.",
        },
        {
          title: "Leaving Mecca",
          text: "Ali (RA) slept in the Prophet's bed as a decoy. The Prophet ﷺ and Abu Bakr (RA) escaped and hid in the Cave of Thawr for 3 days.",
        },
        {
          title: "Arrival in Madinah",
          text: "They arrived safely in Yathrib (renamed Madinat an-Nabi). This monumental event marks year 1 of the Islamic (Hijri) calendar.",
        },
        {
          id: "dua-entering-home",
          title: "Upon Entering the Home",
          desc: "Supplication to recite when entering your home.",
          time: "1 min",
          stepsCount: 2,
          difficulty: "beginner",
          steps: [
            {
              title: "Recite",
              text: "Say this dua when entering your home.",
              arabic:
                "بِسۡمِ ٱللَّهِ وَلَجۡنَا وَبِسۡمِ ٱللَّهِ خَرَجۡنَا وَعَلَى ٱللَّهِ رَبِّنَا تَوَكَّلۡنَا",
              transliteration:
                "Bismillaahi walajnaa, wa bismillaahi kharajnaa, wa 'alaa Rabbinaa tawakkalnaa.",
              translation:
                "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we place our trust.",
            },
            {
              title: "Then Say",
              text: "Greet those inside the home.",
              arabic: "السَّلَامُ عَلَيْكُمْ",
              transliteration: "As-Salaamu 'Alaykum",
              translation: "Peace be upon you.",
            },
          ],
        },

        {
          id: "dua-going-to-mosque",
          title: "Going to the Mosque",
          desc: "Supplication while going to the mosque seeking Allah's light.",
          time: "2 min",
          stepsCount: 4,
          difficulty: "beginner",
          steps: [
            {
              title: "Main Dua",
              text: "Recite this while going to the mosque.",
              arabic:
                "أَللَّٰهُمَّ ٱجۡعَلۡ فِى قَلۡبِى نُورًا وَفِى لِسَانِى نُورًا وَفِى سَمۡعِى نُورًا وَفِى بَصَرِى نُورًا وَمِنۡ فَوقِى نُورًا وَمِنۡ تَحۡتِى نُورًا وَعَنۡ يَمِينِى نُورًا وَعَنۡ شِمَالِى نُورًا وَمِنۡ أَمَامِى نُورًا وَمِنۡ خَلۡفِى نُورًا وَاجۡعَلۡ فِى نَفۡسِى نُورًا",
              transliteration:
                "Allaahummaj'al fee qalbee nooran, wa fee lisaaanee nooran, wa fee sam'ee nooran, wa fee basaree nooran, wa min fawqee nooran, wa min tahtee nooran, wa 'an yameenee nooran, wa 'an shimaalee nooran, wa min amaamee nooran, wa min khalfee nooran, waj'al fee nafsee nooran.",
              translation:
                "O Allah, place light in my heart, tongue, hearing, sight, above me, below me, to my right, to my left, before me, behind me and within myself.",
            },
            {
              title: "Ask for More Light",
              text: "Continue with this supplication.",
              arabic:
                "وَأَعۡظِمۡ لِى نُورًا وَعَظِّمۡ لِى نُورًا وَاجۡعَلۡ لِى نُورًا وَاجۡعَلۡنِى نُورًا",
              transliteration:
                "Wa a'dhim lee nooran, wa 'adhdhim lee nooran, waj'al lee nooran, waj'alnee nooran.",
              translation:
                "Magnify my light, increase my light, make for me light and make me a light.",
            },
            {
              title: "Additional Dua",
              text: "Continue asking Allah for light.",
              arabic: "أَللَّٰهُمَّ أَعۡطِنِى نُورًا",
              transliteration: "Allaahumma a'tinee nooran.",
              translation: "O Allah, grant me light.",
            },
            {
              title: "Final Supplication",
              text: "Finish with this dua.",
              arabic: "وَزِدۡنِى نُورًا وَهَبۡ لِى نُورًا عَلَى نُورٍ",
              transliteration:
                "Wa zidnee nooran, wa hab lee nooran 'alaa noor.",
              translation:
                "Increase me in light and grant me light upon light.",
            },
          ],
        },

        {
          id: "dua-entering-mosque",
          title: "Upon Entering the Mosque",
          desc: "Supplication to recite before entering the mosque.",
          time: "1 min",
          stepsCount: 4,
          difficulty: "beginner",
          steps: [
            {
              title: "Seek Refuge",
              text: "Seek Allah's protection.",
              arabic:
                "أَعُوذُ بِاللَّهِ ٱلۡعَظِيمِ وَبِوَجۡهِهِ ٱلۡكَرِيمِ وَسُلۡطَانِهِ ٱلۡقَدِيمِ مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
              transliteration:
                "A'oothu billaahil-'Adheem, wa bi-Wajhihil-Kareem, wa Sultaanihil-Qadeem, minash-Shaytaanir-Rajeem.",
              translation:
                "I seek refuge in Almighty Allah, by His Noble Face and Eternal Authority from Satan the outcast.",
            },
            {
              title: "Say Bismillah",
              text: "Mention Allah's name.",
              arabic: "بِسۡمِ ٱللَّهِ",
              transliteration: "Bismillaahi",
              translation: "In the Name of Allah.",
            },
            {
              title: "Send Salawat",
              text: "Send blessings upon the Prophet ﷺ.",
              arabic: "وَالصَّلَاةُ وَالسَّلَامُ عَلَىٰ رَسُولِ ٱللَّهِ",
              transliteration: "Wassalaatu wassalaamu 'alaa Rasoolillaahi.",
              translation:
                "Peace and blessings be upon the Messenger of Allah.",
            },
            {
              title: "Ask for Mercy",
              text: "Recite this dua.",
              arabic: "أَللَّٰهُمَّ ٱفۡتَحۡ لِىٓ أَبۡوَابَ رَحۡمَتِكَ",
              transliteration: "Allaahummaftah lee abwaaba rahmatika.",
              translation: "O Allah, open for me the doors of Your mercy.",
            },
          ],
        },

        {
          id: "dua-leaving-mosque",
          title: "Upon Leaving the Mosque",
          desc: "Supplication to recite when leaving the mosque.",
          time: "1 min",
          stepsCount: 1,
          difficulty: "beginner",
          steps: [
            {
              title: "Recite",
              text: "Leave with your left foot first and recite this dua.",
              arabic:
                "بِسۡمِ ٱللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَىٰ رَسُولِ ٱللَّهِ أَللَّٰهُمَّ إِنِّىٓ أَسۡأَلُكَ مِنۡ فَضۡلِكَ أَللَّٰهُمَّ ٱعۡصِمۡنِى مِنَ ٱلشَّيطَانِ ٱلرَّجِيمِ",
              transliteration:
                "Bismillaahi wassalaatu wassalaamu 'alaa Rasoolillaahi, Allaahumma innee as'aluka min fadhlika, Allaahumma'simnee minash-Shaytaanir-rajeem.",
              translation:
                "In the Name of Allah, peace and blessings be upon the Messenger of Allah. O Allah, I ask You for Your bounty. O Allah, protect me from Satan the outcast.",
            },
          ],
        },

        {
          id: "dua-hearing-adhan",
          title: "Upon Hearing the Adhan",
          desc: "Supplications and responses while listening to the call to prayer.",
          time: "3 min",
          stepsCount: 4,
          difficulty: "beginner",
          steps: [
            {
              title: "Repeat the Adhan",
              text: "Repeat every phrase after the Mu'adhdhin except Hayya 'alas-Salah and Hayya 'alal-Falah.",
            },
            {
              title: "Instead Say",
              text: "When the Mu'adhdhin says 'Hayya alas-Salah' and 'Hayya alal-Falah', recite:",
              arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
              transliteration: "Laa hawla wa laa quwwata illaa billaah.",
              translation: "There is no might and no power except with Allah.",
            },
            {
              title: "Declaration of Faith",
              text: "After the Adhan finishes.",
              arabic:
                "وَأَنَا أَشۡهَدُ أَنۡ لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُ...",
              transliteration:
                "Wa anaa ash-hadu an laa ilaaha illallaahu wahdahu laa shareeka lahu...",
              translation:
                "I bear witness that none has the right to be worshipped except Allah alone...",
            },
            {
              title: "Dua After Adhan",
              text: "Ask Allah to grant the Prophet ﷺ Al-Waseelah.",
              arabic: "أَللَّٰهُمَّ رَبَّ هَٰذِهِ ٱلدَّعۡوَةِ ٱلتَّامَّةِ...",
              transliteration:
                "Allaahumma Rabba haathihid-da'watit-taammati...",
              translation:
                "O Allah, Lord of this perfect call and established prayer, grant Muhammad the highest station and excellence.",
            },
          ],
        },
      ],
    },
  ],
  Aqeedah: [
    {
      id: "aqeedah-pillars",
      title: "The Six Pillars of Faith (Iman)",
      desc: "The core beliefs required of every Muslim.",
      time: "5 min",
      stepsCount: 6,
      difficulty: "beginner",
      steps: [
        {
          title: "Belief in Allah",
          text: "Believing in His existence, His supreme Oneness (Tawheed), and His perfect Names and Attributes.",
        },
        {
          title: "Belief in the Angels",
          text: "Believing in unseen beings created from light who carry out Allah's commands without disobedience.",
        },
        {
          title: "Belief in the Divine Books",
          text: "Believing in the original revelations, including the Torah, Gospel, Psalms, and the final unchanged book, the Quran.",
        },
        {
          title: "Belief in the Prophets",
          text: "Believing in all messengers sent by Allah, from Adam to Jesus, ending with the final seal, Muhammad ﷺ.",
        },
        {
          title: "Belief in the Last Day",
          text: "Believing in resurrection, judgment, Heaven, and Hell.",
        },
        {
          title: "Belief in Divine Decree (Qadr)",
          text: "Believing that Allah knows, records, and creates all things, and nothing happens outside His will.",
        },
      ],
    },
  ],
  Fiqh: [
    {
      id: "fiqh-intro",
      title: "Introduction to Fiqh",
      desc: "Understanding Islamic Jurisprudence.",
      time: "4 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "What is Fiqh?",
          text: "The practical application of Islamic law (Shari'ah) derived from the Quran and Sunnah.",
        },
        {
          title: "The 5 Rulings",
          text: "Every action falls into 5 categories: Fard (Obligatory), Mustahabb (Recommended), Mubah (Permissible), Makruh (Disliked), or Haram (Forbidden).",
        },
        {
          title: "The Madhhabs",
          text: "The four main accepted schools of thought in Sunni Islam: Hanafi, Maliki, Shafi'i, and Hanbali.",
        },
      ],
    },
  ],
  "Islamic History": [
    {
      id: "history-rashidun",
      title: "The Rashidun Caliphate",
      desc: "The era of the Rightly Guided Caliphs.",
      time: "6 min",
      stepsCount: 4,
      difficulty: "intermediate",
      steps: [
        {
          title: "Abu Bakr (RA)",
          text: "The 1st Caliph. United the Muslim world after the Prophet's passing and initiated the compilation of the Quran.",
        },
        {
          title: "Umar ibn Al-Khattab (RA)",
          text: "The 2nd Caliph. Expanded the empire massively, establishing justice, infrastructure, and the Islamic calendar.",
        },
        {
          title: "Uthman ibn Affan (RA)",
          text: "The 3rd Caliph. Standardized the Quran into a single written dialect to prevent differences in recitation.",
        },
        {
          title: "Ali ibn Abi Talib (RA)",
          text: "The 4th Caliph. Ruled during a time of intense civil strife and focused on justice and maintaining the state.",
        },
      ],
    },
  ],
  "99 Names Of Allah": [
    {
      id: "name-1",
      title: "1. Ar-Rahman (The Entirely Merciful)",
      desc: "Understanding Allah's boundless mercy.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The Most Merciful, whose mercy encompasses all creation.",
          arabic: "الرحمن",
          transliteration: "Ar-Rahman",
          translation: "The Entirely Merciful",
        },
        {
          title: "Explanation",
          text: "This mercy applies to everyone in this world, believers and disbelievers alike. He provides air, food, and sustenance to all.",
        },
        {
          title: "Reflection",
          text: "Since Allah is so merciful to us, we should strive to show mercy to others.",
        },
      ],
    },
    {
      id: "name-2",
      title: "2. Ar-Raheem (The Especially Merciful)",
      desc: "His specific mercy for the believers.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The bestowal of mercy upon those who believe.",
          arabic: "الرحيم",
          transliteration: "Ar-Raheem",
          translation: "The Especially Merciful",
        },
        {
          title: "Explanation",
          text: "While Ar-Rahman applies to all creation, Ar-Raheem is a special, enduring mercy reserved for the believers, especially in the Hereafter.",
        },
        {
          title: "Reflection",
          text: "We seek His special mercy by striving in faith and turning to Him in repentance.",
        },
      ],
    },
    {
      id: "name-3",
      title: "3. Al-Malik (The Sovereign)",
      desc: "The absolute King and Ruler.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The King and Sovereign to whom belongs all dominion.",
          arabic: "الملك",
          transliteration: "Al-Malik",
          translation: "The Sovereign",
        },
        {
          title: "Explanation",
          text: "He is the absolute ruler. He does not need His kingdom, but His kingdom desperately needs Him.",
        },
        {
          title: "Reflection",
          text: "Knowing He is the true King frees us from the fear of earthly kings or authorities.",
        },
      ],
    },
    {
      id: "name-4",
      title: "4. Al-Quddus (The Holy)",
      desc: "The perfectly pure.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The entirely pure, free from any blemish.",
          arabic: "القدوس",
          transliteration: "Al-Quddus",
          translation: "The Holy",
        },
        {
          title: "Explanation",
          text: "He is perfectly free from any imperfections, errors, or human weaknesses.",
        },
        {
          title: "Reflection",
          text: "We should strive to purify our hearts and actions out of respect for His holiness.",
        },
      ],
    },
    {
      id: "name-5",
      title: "5. As-Salam (The Source of Peace)",
      desc: "The giver of peace and security.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The flawless, the source of peace.",
          arabic: "السلام",
          transliteration: "As-Salam",
          translation: "The Source of Peace",
        },
        {
          title: "Explanation",
          text: "He is free from any defect, and all peace in the universe originates from Him.",
        },
        {
          title: "Reflection",
          text: "True peace in our hearts can only be found by submitting to the Source of Peace.",
        },
      ],
    },
    {
      id: "name-6",
      title: "6. Al-Mu'min (The Inspirer of Faith)",
      desc: "The granter of security.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The One who gives security and affirms His truth.",
          arabic: "المؤمن",
          transliteration: "Al-Mu'min",
          translation: "The Inspirer of Faith",
        },
        {
          title: "Explanation",
          text: "He removes fear and provides safety to His creation.",
        },
        {
          title: "Reflection",
          text: "Place your trust in Him to find ultimate safety.",
        },
      ],
    },
    {
      id: "name-7",
      title: "7. Al-Muhaymin (The Guardian)",
      desc: "The protector and overseer.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who oversees, protects, and guards.",
          arabic: "المهيمن",
          transliteration: "Al-Muhaymin",
          translation: "The Guardian",
        },
        {
          title: "Explanation",
          text: "He watches over every single deed, word, and thought.",
        },
        {
          title: "Reflection",
          text: "Live with the awareness that the Guardian is always watching over you.",
        },
      ],
    },
    {
      id: "name-8",
      title: "8. Al-Aziz (The Almighty)",
      desc: "The victorious who cannot be overcome.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The strong, the invincible.",
          arabic: "العزيز",
          transliteration: "Al-Aziz",
          translation: "The Almighty",
        },
        {
          title: "Explanation",
          text: "No one can overcome Him, and His will always prevails.",
        },
        {
          title: "Reflection",
          text: "Seek strength and dignity only through the Almighty.",
        },
      ],
    },
    {
      id: "name-9",
      title: "9. Al-Jabbar (The Compeller)",
      desc: "The restorer who mends the broken.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who compels all and mends what is broken.",
          arabic: "الجبار",
          transliteration: "Al-Jabbar",
          translation: "The Compeller",
        },
        {
          title: "Explanation",
          text: "He mends the brokenhearted and compels creation according to His will.",
        },
        {
          title: "Reflection",
          text: "Turn to Al-Jabbar to heal your physical and emotional wounds.",
        },
      ],
    },
    {
      id: "name-10",
      title: "10. Al-Mutakabbir (The Supreme)",
      desc: "The greatest in majesty.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The supremely great.",
          arabic: "المتكبر",
          transliteration: "Al-Mutakabbir",
          translation: "The Supreme",
        },
        {
          title: "Explanation",
          text: "True greatness belongs only to Him; pride is exclusively His right.",
        },
        {
          title: "Reflection",
          text: "Recognize human limitations and avoid arrogance.",
        },
      ],
    },
    {
      id: "name-11",
      title: "11. Al-Khaliq (The Creator)",
      desc: "The creator from nothing.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who brings everything from non-existence to existence.",
          arabic: "الخالق",
          transliteration: "Al-Khaliq",
          translation: "The Creator",
        },
        {
          title: "Explanation",
          text: "He determines the measure of all things before bringing them into existence.",
        },
        {
          title: "Reflection",
          text: "Ponder upon the perfection of creation to appreciate the Creator.",
        },
      ],
    },
    {
      id: "name-12",
      title: "12. Al-Bari' (The Maker of Order)",
      desc: "The one who organizes creation.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The originator who creates without a prior model.",
          arabic: "البارئ",
          transliteration: "Al-Bari'",
          translation: "The Maker of Order",
        },
        {
          title: "Explanation",
          text: "He executes His plans and brings the creation into existence.",
        },
        {
          title: "Reflection",
          text: "Recognize the flawless order in the universe.",
        },
      ],
    },
    {
      id: "name-13",
      title: "13. Al-Musawwir (The Shaper of Beauty)",
      desc: "The fashioner of forms.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who forms His creation in different pictures.",
          arabic: "المصور",
          transliteration: "Al-Musawwir",
          translation: "The Shaper of Beauty",
        },
        {
          title: "Explanation",
          text: "He gave everything its unique and distinct form.",
        },
        {
          title: "Reflection",
          text: "Appreciate the diverse beauty in yourself and others.",
        },
      ],
    },
    {
      id: "name-14",
      title: "14. Al-Ghaffar (The Forgiving)",
      desc: "The perpetual forgiver.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who repeatedly forgives and conceals sins.",
          arabic: "الغفار",
          transliteration: "Al-Ghaffar",
          translation: "The Forgiving",
        },
        {
          title: "Explanation",
          text: "No matter how many times we sin, He continuously forgives if we repent.",
        },
        {
          title: "Reflection",
          text: "Never despair of His mercy, and learn to forgive others.",
        },
      ],
    },
    {
      id: "name-15",
      title: "15. Al-Qahhar (The Subduer)",
      desc: "The dominant over all.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The ever-dominating, who subdues all creation.",
          arabic: "القهار",
          transliteration: "Al-Qahhar",
          translation: "The Subduer",
        },
        {
          title: "Explanation",
          text: "Everything in existence is submissive to His will and power.",
        },
        {
          title: "Reflection",
          text: "Submit your will to the One who controls the entire universe.",
        },
      ],
    },
    {
      id: "name-16",
      title: "16. Al-Wahhab (The Giver of All)",
      desc: "The continuous bestower of gifts.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who gives constantly without expecting anything in return.",
          arabic: "الوهاب",
          transliteration: "Al-Wahhab",
          translation: "The Giver of All",
        },
        {
          title: "Explanation",
          text: "All blessings, talents, and gifts are freely given by Him.",
        },
        {
          title: "Reflection",
          text: "Be grateful for the countless unearned gifts you receive daily.",
        },
      ],
    },
    {
      id: "name-17",
      title: "17. Ar-Razzaq (The Provider)",
      desc: "The ultimate sustainer.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The provider of sustenance for all living things.",
          arabic: "الرزاق",
          transliteration: "Ar-Razzaq",
          translation: "The Provider",
        },
        {
          title: "Explanation",
          text: "He provides physical sustenance (food, money) and spiritual sustenance (knowledge, faith).",
        },
        {
          title: "Reflection",
          text: "Work hard, but trust that your ultimate provision comes only from Him.",
        },
      ],
    },
    {
      id: "name-18",
      title: "18. Al-Fattah (The Opener)",
      desc: "The opener of closed doors.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who opens what is closed and grants victory.",
          arabic: "الفتاح",
          transliteration: "Al-Fattah",
          translation: "The Opener",
        },
        {
          title: "Explanation",
          text: "He opens the doors of mercy, opportunity, and truth.",
        },
        {
          title: "Reflection",
          text: "When you feel stuck in life, ask Al-Fattah to open a path for you.",
        },
      ],
    },
    {
      id: "name-19",
      title: "19. Al-'Alim (The Knower of All)",
      desc: "The all-knowing.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one whose knowledge encompasses all things.",
          arabic: "العليم",
          transliteration: "Al-'Alim",
          translation: "The Knower of All",
        },
        {
          title: "Explanation",
          text: "He knows the past, present, future, and what is hidden in hearts.",
        },
        {
          title: "Reflection",
          text: "Act righteously, knowing that your intentions and deeds are fully known.",
        },
      ],
    },
    {
      id: "name-20",
      title: "20. Al-Qabid (The Withholder)",
      desc: "The one who constricts.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who withholds and restricts provision or souls.",
          arabic: "القابض",
          transliteration: "Al-Qabid",
          translation: "The Withholder",
        },
        {
          title: "Explanation",
          text: "He constricts resources or hearts to test His servants and draw them closer.",
        },
        {
          title: "Reflection",
          text: "During tight times, remain patient and turn back to Him.",
        },
      ],
    },
    {
      id: "name-21",
      title: "21. Al-Basit (The Extender)",
      desc: "The one who expands and grants abundance.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The expander who gives abundant provision.",
          arabic: "الباسط",
          transliteration: "Al-Basit",
          translation: "The Extender",
        },
        {
          title: "Explanation",
          text: "He expands provision, knowledge, and joy for whom He wills.",
        },
        {
          title: "Reflection",
          text: "When granted abundance, be generous and thankful.",
        },
      ],
    },
    {
      id: "name-22",
      title: "22. Al-Khafid (The Abaser)",
      desc: "The one who lowers the arrogant.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who brings down the proud and arrogant.",
          arabic: "الخافض",
          transliteration: "Al-Khafid",
          translation: "The Abaser",
        },
        {
          title: "Explanation",
          text: "He humiliates those who are oppressive and arrogant.",
        },
        {
          title: "Reflection",
          text: "Stay humble to avoid being lowered by the Almighty.",
        },
      ],
    },
    {
      id: "name-23",
      title: "23. Ar-Rafi' (The Exalter)",
      desc: "The one who elevates the humble.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who elevates the status of the believers.",
          arabic: "الرافع",
          transliteration: "Ar-Rafi'",
          translation: "The Exalter",
        },
        {
          title: "Explanation",
          text: "He raises the ranks of those who believe and do good deeds.",
        },
        {
          title: "Reflection",
          text: "Seek elevation through faith and righteous character, not through pride.",
        },
      ],
    },
    {
      id: "name-24",
      title: "24. Al-Mu'izz (The Bestower of Honors)",
      desc: "The giver of dignity.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who gives honor and power.",
          arabic: "المعز",
          transliteration: "Al-Mu'izz",
          translation: "The Bestower of Honors",
        },
        {
          title: "Explanation",
          text: "All true honor and dignity come exclusively from Allah.",
        },
        {
          title: "Reflection",
          text: "Do not seek honor by compromising your faith; seek it from Al-Mu'izz.",
        },
      ],
    },
    {
      id: "name-25",
      title: "25. Al-Mudhill (The Humiliator)",
      desc: "The one who disgraces the oppressors.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who degrades the enemies of truth.",
          arabic: "المذل",
          transliteration: "Al-Mudhill",
          translation: "The Humiliator",
        },
        {
          title: "Explanation",
          text: "He lowers those who rebel against His commands.",
        },
        {
          title: "Reflection",
          text: "Protect yourself from disgrace by obeying His guidance.",
        },
      ],
    },
    {
      id: "name-26",
      title: "26. As-Sami' (The Hearer of All)",
      desc: "The all-hearing.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who hears every sound, spoken or silent.",
          arabic: "السميع",
          transliteration: "As-Sami'",
          translation: "The Hearer of All",
        },
        {
          title: "Explanation",
          text: "He hears the whisper in your heart just as clearly as a loud voice.",
        },
        {
          title: "Reflection",
          text: "Be mindful of your words and constantly speak to Him in Dua.",
        },
      ],
    },
    {
      id: "name-27",
      title: "27. Al-Basir (The Seer of All)",
      desc: "The all-seeing.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who sees everything in existence.",
          arabic: "البصير",
          transliteration: "Al-Basir",
          translation: "The Seer of All",
        },
        {
          title: "Explanation",
          text: "Nothing is hidden from His sight, not even an ant in the dark.",
        },
        {
          title: "Reflection",
          text: "Act with excellence (Ihsan), knowing He is always watching.",
        },
      ],
    },
    {
      id: "name-28",
      title: "28. Al-Hakam (The Judge)",
      desc: "The ultimate arbitrator.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The impartial judge whose rulings are perfect.",
          arabic: "الحكم",
          transliteration: "Al-Hakam",
          translation: "The Judge",
        },
        {
          title: "Explanation",
          text: "He is the ultimate source of justice and law.",
        },
        {
          title: "Reflection",
          text: "Trust in His rulings and strive to be fair in your own life.",
        },
      ],
    },
    {
      id: "name-29",
      title: "29. Al-'Adl (The Just)",
      desc: "The perfectly fair.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The embodiment of perfect justice.",
          arabic: "العدل",
          transliteration: "Al-'Adl",
          translation: "The Just",
        },
        {
          title: "Explanation",
          text: "He never oppresses anyone in the slightest.",
        },
        {
          title: "Reflection",
          text: "Ensure justice in your dealings with family, friends, and strangers.",
        },
      ],
    },
    {
      id: "name-30",
      title: "30. Al-Latif (The Subtle One)",
      desc: "The gentle and subtle.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who is kind to His slaves and knows the subtle details.",
          arabic: "اللطيف",
          transliteration: "Al-Latif",
          translation: "The Subtle One",
        },
        {
          title: "Explanation",
          text: "He brings about benefit in ways we cannot perceive.",
        },
        {
          title: "Reflection",
          text: "Trust that His subtle plans are working for your good.",
        },
      ],
    },
    {
      id: "name-31",
      title: "31. Al-Khabir (The All-Aware)",
      desc: "The fully acquainted.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who knows the hidden reality of all things.",
          arabic: "الخبير",
          transliteration: "Al-Khabir",
          translation: "The All-Aware",
        },
        {
          title: "Explanation",
          text: "He knows the inner intentions and the ultimate outcome of affairs.",
        },
        {
          title: "Reflection",
          text: "Purify your inner intentions, as He is fully aware of them.",
        },
      ],
    },
    {
      id: "name-32",
      title: "32. Al-Halim (The Forbearing)",
      desc: "The patient one who does not rush to punish.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who is calm, patient, and delays punishment.",
          arabic: "الحليم",
          transliteration: "Al-Halim",
          translation: "The Forbearing",
        },
        {
          title: "Explanation",
          text: "He gives sinners time to repent instead of punishing immediately.",
        },
        {
          title: "Reflection",
          text: "Be patient and forbearing with the faults of others.",
        },
      ],
    },
    {
      id: "name-33",
      title: "33. Al-'Azim (The Magnificent)",
      desc: "The supremely great.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one whose greatness is beyond human comprehension.",
          arabic: "العظيم",
          transliteration: "Al-'Azim",
          translation: "The Magnificent",
        },
        {
          title: "Explanation",
          text: "His majesty is infinite and cannot be fully grasped by creation.",
        },
        {
          title: "Reflection",
          text: "We say 'Subhana Rabbiyal-Azeem' in Ruku to declare His magnificence.",
        },
      ],
    },
    {
      id: "name-34",
      title: "34. Al-Ghafur (The Forgiver)",
      desc: "The great forgiver of sins.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who constantly forgives and hides faults.",
          arabic: "الغفور",
          transliteration: "Al-Ghafur",
          translation: "The Forgiver",
        },
        {
          title: "Explanation",
          text: "He completely forgives sins, big and small, when we repent.",
        },
        {
          title: "Reflection",
          text: "Never lose hope in His forgiveness, no matter your past.",
        },
      ],
    },
    {
      id: "name-35",
      title: "35. Ash-Shakur (The Rewarder of Thankfulness)",
      desc: "The highly appreciative.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who abundantly rewards a small amount of good deeds.",
          arabic: "الشكور",
          transliteration: "Ash-Shakur",
          translation: "The Rewarder",
        },
        {
          title: "Explanation",
          text: "He appreciates and multiplies the reward of sincere efforts.",
        },
        {
          title: "Reflection",
          text: "Show gratitude to Allah, and He will increase your blessings.",
        },
      ],
    },
    {
      id: "name-36",
      title: "36. Al-'Aliyy (The Highest)",
      desc: "The most high and exalted.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The highest in status, power, and essence.",
          arabic: "العلي",
          transliteration: "Al-'Aliyy",
          translation: "The Highest",
        },
        {
          title: "Explanation",
          text: "Nothing is above Him, and He transcends all attributes of creation.",
        },
        {
          title: "Reflection",
          text: "When we prostrate (Sujood), we declare 'Subhana Rabbiyal A'la' (Glory to my Lord, the Most High).",
        },
      ],
    },
    {
      id: "name-37",
      title: "37. Al-Kabir (The Greatest)",
      desc: "The incomparably great.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The great one whose essence and attributes are supreme.",
          arabic: "الكبير",
          transliteration: "Al-Kabir",
          translation: "The Greatest",
        },
        {
          title: "Explanation",
          text: "Everything else is insignificant compared to His greatness.",
        },
        {
          title: "Reflection",
          text: "Saying 'Allahu Akbar' reminds us that He is greater than any worldly problem.",
        },
      ],
    },
    {
      id: "name-38",
      title: "38. Al-Hafiz (The Preserver)",
      desc: "The protector of all.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The ultimate preserver and protector of creation.",
          arabic: "الحفيظ",
          transliteration: "Al-Hafiz",
          translation: "The Preserver",
        },
        {
          title: "Explanation",
          text: "He protects the heavens, the earth, and the deeds of mankind.",
        },
        {
          title: "Reflection",
          text: "Ask Al-Hafiz to protect your faith, family, and health.",
        },
      ],
    },
    {
      id: "name-39",
      title: "39. Al-Muqit (The Nourisher)",
      desc: "The sustainer of bodies and souls.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who provides exact nourishment and strength.",
          arabic: "المقيت",
          transliteration: "Al-Muqit",
          translation: "The Nourisher",
        },
        {
          title: "Explanation",
          text: "He gives everything the exact amount of sustenance it needs to survive.",
        },
        {
          title: "Reflection",
          text: "Trust that your daily needs have already been decreed and measured.",
        },
      ],
    },
    {
      id: "name-40",
      title: "40. Al-Hasib (The Bringer of Judgment)",
      desc: "The sufficient reckoner.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who takes account of all things and is sufficient for believers.",
          arabic: "الحسيب",
          transliteration: "Al-Hasib",
          translation: "The Bringer of Judgment",
        },
        {
          title: "Explanation",
          text: "He keeps an exact record of all deeds and is enough for those who trust Him.",
        },
        {
          title: "Reflection",
          text: "Say 'Hasbunallah wa ni'mal wakil' (Allah is sufficient for us).",
        },
      ],
    },
    {
      id: "name-41",
      title: "41. Al-Jalil (The Majestic)",
      desc: "The lord of majesty.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who possesses all attributes of greatness and majesty.",
          arabic: "الجليل",
          transliteration: "Al-Jalil",
          translation: "The Majestic",
        },
        {
          title: "Explanation",
          text: "His true majesty commands absolute awe and reverence.",
        },
        {
          title: "Reflection",
          text: "Approach your prayers with awe for the Majestic.",
        },
      ],
    },
    {
      id: "name-42",
      title: "42. Al-Karim (The Bountiful)",
      desc: "The most generous.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The inherently generous and noble giver.",
          arabic: "الكريم",
          transliteration: "Al-Karim",
          translation: "The Bountiful",
        },
        {
          title: "Explanation",
          text: "He gives abundantly without being asked and without measure.",
        },
        {
          title: "Reflection",
          text: "Be generous to others, mirroring the generosity of Al-Karim.",
        },
      ],
    },
    {
      id: "name-43",
      title: "43. Ar-Raqib (The Watchful)",
      desc: "The vigilant observer.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The all-observant who misses nothing.",
          arabic: "الرقيب",
          transliteration: "Ar-Raqib",
          translation: "The Watchful",
        },
        {
          title: "Explanation",
          text: "He watches over every action, thought, and feeling.",
        },
        {
          title: "Reflection",
          text: "Maintain integrity in private, knowing Ar-Raqib is watching.",
        },
      ],
    },
    {
      id: "name-44",
      title: "44. Al-Mujib (The Responder)",
      desc: "The answerer of prayers.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who answers the supplications of His servants.",
          arabic: "المجيب",
          transliteration: "Al-Mujib",
          translation: "The Responder",
        },
        {
          title: "Explanation",
          text: "He is always near and ready to answer the caller.",
        },
        {
          title: "Reflection",
          text: "Never stop making Dua, for He is always listening.",
        },
      ],
    },
    {
      id: "name-45",
      title: "45. Al-Wasi' (The All-Encompassing)",
      desc: "The boundless.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The vast one whose knowledge and mercy encompass everything.",
          arabic: "الواسع",
          transliteration: "Al-Wasi'",
          translation: "The All-Encompassing",
        },
        {
          title: "Explanation",
          text: "His provision, mercy, and knowledge have no limits.",
        },
        {
          title: "Reflection",
          text: "Do not put limits on your prayers; ask for the impossible.",
        },
      ],
    },
    {
      id: "name-46",
      title: "46. Al-Hakim (The Perfectly Wise)",
      desc: "The possessor of infinite wisdom.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who acts with perfect wisdom.",
          arabic: "الحكيم",
          transliteration: "Al-Hakim",
          translation: "The Perfectly Wise",
        },
        {
          title: "Explanation",
          text: "Everything He commands or decrees has a profound purpose.",
        },
        {
          title: "Reflection",
          text: "Trust His timing, even when you don't understand the reason.",
        },
      ],
    },
    {
      id: "name-47",
      title: "47. Al-Wadud (The Loving One)",
      desc: "The source of unconditional love.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The exceptionally loving and affectionate.",
          arabic: "الودود",
          transliteration: "Al-Wadud",
          translation: "The Loving One",
        },
        {
          title: "Explanation",
          text: "He loves His righteous servants and manifests His love through blessings.",
        },
        {
          title: "Reflection",
          text: "Love Allah above all else, and spread love to His creation.",
        },
      ],
    },
    {
      id: "name-48",
      title: "48. Al-Majid (The Most Glorious)",
      desc: "The deeply respected and glorious.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The glorious and highly praised.",
          arabic: "المجيد",
          transliteration: "Al-Majid",
          translation: "The Most Glorious",
        },
        {
          title: "Explanation",
          text: "His glory is infinite, combining majesty with immense generosity.",
        },
        { title: "Reflection", text: "We praise His glory in every prayer." },
      ],
    },
    {
      id: "name-49",
      title: "49. Al-Ba'ith (The Resurrector)",
      desc: "The awakener from death.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who resurrects the dead on the Day of Judgment.",
          arabic: "الباعث",
          transliteration: "Al-Ba'ith",
          translation: "The Resurrector",
        },
        {
          title: "Explanation",
          text: "He will bring all beings back to life to face ultimate justice.",
        },
        {
          title: "Reflection",
          text: "Live each day preparing for the moment of resurrection.",
        },
      ],
    },
    {
      id: "name-50",
      title: "50. Ash-Shahid (The Witness)",
      desc: "The all-observing witness.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The ultimate witness to all things.",
          arabic: "الشهيد",
          transliteration: "Ash-Shahid",
          translation: "The Witness",
        },
        {
          title: "Explanation",
          text: "He is present and witnesses every event and intention in the universe.",
        },
        {
          title: "Reflection",
          text: "Act knowing that the ultimate Witness will testify to your deeds.",
        },
      ],
    },
    {
      id: "name-51",
      title: "51. Al-Haqq (The Truth)",
      desc: "The absolute reality.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The embodiment of absolute truth and reality.",
          arabic: "الحق",
          transliteration: "Al-Haqq",
          translation: "The Truth",
        },
        {
          title: "Explanation",
          text: "He is the only true reality; everything else is fleeting.",
        },
        {
          title: "Reflection",
          text: "Stand firmly for the truth in all your affairs.",
        },
      ],
    },
    {
      id: "name-52",
      title: "52. Al-Wakil (The Trustee)",
      desc: "The ultimate dependable.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who can be entirely trusted to manage all affairs.",
          arabic: "الوكيل",
          transliteration: "Al-Wakil",
          translation: "The Trustee",
        },
        {
          title: "Explanation",
          text: "When you hand your affairs to Him, He provides the best outcome.",
        },
        {
          title: "Reflection",
          text: "Say 'Hasbunallah wa ni'mal Wakil' to rely entirely on Him.",
        },
      ],
    },
    {
      id: "name-53",
      title: "53. Al-Qawiyy (The Possessor of All Strength)",
      desc: "The perfectly strong.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The incredibly strong, who cannot be defeated.",
          arabic: "القوي",
          transliteration: "Al-Qawiyy",
          translation: "The Possessor of All Strength",
        },
        { title: "Explanation", text: "His strength is perfect and infinite." },
        {
          title: "Reflection",
          text: "Seek strength from Al-Qawiyy during moments of weakness.",
        },
      ],
    },
    {
      id: "name-54",
      title: "54. Al-Matin (The Firm)",
      desc: "The steadfast and unshakeable.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The steadfast, whose power never diminishes.",
          arabic: "المتين",
          transliteration: "Al-Matin",
          translation: "The Firm",
        },
        {
          title: "Explanation",
          text: "His strength is unshakeable and absolute.",
        },
        {
          title: "Reflection",
          text: "Build firm, unshakeable faith in His promises.",
        },
      ],
    },
    {
      id: "name-55",
      title: "55. Al-Waliyy (The Protecting Friend)",
      desc: "The patron of believers.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The protecting friend and ally.",
          arabic: "الولي",
          transliteration: "Al-Waliyy",
          translation: "The Protecting Friend",
        },
        {
          title: "Explanation",
          text: "He loves, guards, and guides the believers.",
        },
        {
          title: "Reflection",
          text: "Be a friend of Allah by obeying Him, and He will protect you.",
        },
      ],
    },
    {
      id: "name-56",
      title: "56. Al-Hamid (The All-Praiseworthy)",
      desc: "The one deserving of all praise.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The praised one, regardless of whether anyone praises Him.",
          arabic: "الحميد",
          transliteration: "Al-Hamid",
          translation: "The All-Praiseworthy",
        },
        {
          title: "Explanation",
          text: "All perfection and praise belong exclusively to Him.",
        },
        {
          title: "Reflection",
          text: "Say 'Alhamdulillah' constantly in good times and bad.",
        },
      ],
    },
    {
      id: "name-57",
      title: "57. Al-Muhsi (The Accounter)",
      desc: "The counter of all things.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who counts and registers every single thing.",
          arabic: "المحصي",
          transliteration: "Al-Muhsi",
          translation: "The Accounter",
        },
        {
          title: "Explanation",
          text: "Every leaf that falls and every deed performed is recorded.",
        },
        {
          title: "Reflection",
          text: "Account for your own deeds before you are held to account.",
        },
      ],
    },
    {
      id: "name-58",
      title: "58. Al-Mubdi' (The Originator)",
      desc: "The initiator of creation.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who creates everything from nothing.",
          arabic: "المبدئ",
          transliteration: "Al-Mubdi'",
          translation: "The Originator",
        },
        {
          title: "Explanation",
          text: "He began the creation of the universe without any prior blueprint.",
        },
        {
          title: "Reflection",
          text: "Marvel at the originality of the universe around you.",
        },
      ],
    },
    {
      id: "name-59",
      title: "59. Al-Mu'id (The Restorer)",
      desc: "The recreator of life.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who brings creation back to life after death.",
          arabic: "المعيد",
          transliteration: "Al-Mu'id",
          translation: "The Restorer",
        },
        {
          title: "Explanation",
          text: "Just as He created us the first time, restoring us is easy for Him.",
        },
        {
          title: "Reflection",
          text: "Use this belief to prepare for the Day of Judgment.",
        },
      ],
    },
    {
      id: "name-60",
      title: "60. Al-Muhyi (The Giver of Life)",
      desc: "The bestower of life.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who gives physical and spiritual life.",
          arabic: "المحيي",
          transliteration: "Al-Muhyi",
          translation: "The Giver of Life",
        },
        {
          title: "Explanation",
          text: "He gives life to the dead earth and revives dead hearts.",
        },
        {
          title: "Reflection",
          text: "Ask Him to revive your heart with the light of faith.",
        },
      ],
    },
    {
      id: "name-61",
      title: "61. Al-Mumit (The Taker of Life)",
      desc: "The creator of death.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who brings about death.",
          arabic: "المميت",
          transliteration: "Al-Mumit",
          translation: "The Taker of Life",
        },
        {
          title: "Explanation",
          text: "Death is entirely under His control and timing.",
        },
        {
          title: "Reflection",
          text: "Remember death often to keep your priorities straight.",
        },
      ],
    },
    {
      id: "name-62",
      title: "62. Al-Hayy (The Ever-Living)",
      desc: "The eternally alive.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who has absolute, unending life.",
          arabic: "الحي",
          transliteration: "Al-Hayy",
          translation: "The Ever-Living",
        },
        {
          title: "Explanation",
          text: "He has no beginning, no end, and is never subject to death or sleep.",
        },
        {
          title: "Reflection",
          text: "Rely only on the Ever-Living, as all else will eventually perish.",
        },
      ],
    },
    {
      id: "name-63",
      title: "63. Al-Qayyum (The Sustainer)",
      desc: "The self-subsisting sustainer of all.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The self-sustaining one who sustains everything else.",
          arabic: "القيوم",
          transliteration: "Al-Qayyum",
          translation: "The Sustainer",
        },
        {
          title: "Explanation",
          text: "The universe would collapse instantly without His continuous support.",
        },
        {
          title: "Reflection",
          text: "Call upon 'Ya Hayyu Ya Qayyum' in moments of deep distress.",
        },
      ],
    },
    {
      id: "name-64",
      title: "64. Al-Wajid (The Finder)",
      desc: "The unfailing.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who finds whatever He wants, whenever He wants.",
          arabic: "الواجد",
          transliteration: "Al-Wajid",
          translation: "The Finder",
        },
        {
          title: "Explanation",
          text: "He lacks nothing and has access to all things instantly.",
        },
        {
          title: "Reflection",
          text: "Knowing He lacks nothing assures us He can provide us with anything.",
        },
      ],
    },
    {
      id: "name-65",
      title: "65. Al-Majid (The Glorious)",
      desc: "The noble and magnificent.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The majestic and glorious.",
          arabic: "الماجد",
          transliteration: "Al-Majid",
          translation: "The Glorious",
        },
        {
          title: "Explanation",
          text: "He is exalted in His honor, nobility, and immense generosity.",
        },
        {
          title: "Reflection",
          text: "Strive for noble character to earn the love of the Glorious.",
        },
      ],
    },
    {
      id: "name-66",
      title: "66. Al-Wahid (The Unique)",
      desc: "The one and only.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The unique one who has no second or equal.",
          arabic: "الواحد",
          transliteration: "Al-Wahid",
          translation: "The Unique",
        },
        {
          title: "Explanation",
          text: "He is singular in His essence and actions.",
        },
        {
          title: "Reflection",
          text: "Direct your worship exclusively to the Unique One.",
        },
      ],
    },
    {
      id: "name-67",
      title: "67. Al-Ahad (The One)",
      desc: "The indivisible.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The indivisible, absolute One.",
          arabic: "الأحد",
          transliteration: "Al-Ahad",
          translation: "The One",
        },
        {
          title: "Explanation",
          text: "He cannot be divided and has no partners, parents, or offspring.",
        },
        {
          title: "Reflection",
          text: "Recite Surah Al-Ikhlas to affirm His absolute Oneness.",
        },
      ],
    },
    {
      id: "name-68",
      title: "68. As-Samad (The Eternal Refuge)",
      desc: "The self-sufficient master.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The supreme provider whom all creation depends upon.",
          arabic: "الصمد",
          transliteration: "As-Samad",
          translation: "The Eternal Refuge",
        },
        {
          title: "Explanation",
          text: "He needs absolutely nothing, but everything needs Him.",
        },
        {
          title: "Reflection",
          text: "Bring all your needs to As-Samad, for He alone can fulfill them.",
        },
      ],
    },
    {
      id: "name-69",
      title: "69. Al-Qadir (The All-Powerful)",
      desc: "The capable.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who has the power to do whatever He wills.",
          arabic: "القادر",
          transliteration: "Al-Qadir",
          translation: "The All-Powerful",
        },
        {
          title: "Explanation",
          text: "Nothing is impossible for Him; He measures all things perfectly.",
        },
        {
          title: "Reflection",
          text: "Never feel hopeless; the All-Powerful can change your situation instantly.",
        },
      ],
    },
    {
      id: "name-70",
      title: "70. Al-Muqtadir (The Creator of All Power)",
      desc: "The supreme determiner.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The all-determining, dominant creator of power.",
          arabic: "المقتدر",
          transliteration: "Al-Muqtadir",
          translation: "The Creator of All Power",
        },
        {
          title: "Explanation",
          text: "He is the source of all power and ability in the universe.",
        },
        {
          title: "Reflection",
          text: "Rely on His power when facing immense challenges.",
        },
      ],
    },
    {
      id: "name-71",
      title: "71. Al-Muqaddim (The Expediter)",
      desc: "The one who brings forward.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who advances things according to His wisdom.",
          arabic: "المقدم",
          transliteration: "Al-Muqaddim",
          translation: "The Expediter",
        },
        {
          title: "Explanation",
          text: "He brings certain people and events forward in status or time.",
        },
        {
          title: "Reflection",
          text: "Ask Him to bring you forward in righteousness and faith.",
        },
      ],
    },
    {
      id: "name-72",
      title: "72. Al-Mu'akhkhir (The Delayer)",
      desc: "The one who holds back.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who delays things according to His will.",
          arabic: "المؤخر",
          transliteration: "Al-Mu'akhkhir",
          translation: "The Delayer",
        },
        {
          title: "Explanation",
          text: "He delays punishment or blessings for a divine purpose.",
        },
        {
          title: "Reflection",
          text: "If a blessing is delayed, trust that Al-Mu'akhkhir has a better plan for you.",
        },
      ],
    },
    {
      id: "name-73",
      title: "73. Al-Awwal (The First)",
      desc: "The one without a beginning.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The First, before whom there was nothing.",
          arabic: "الأول",
          transliteration: "Al-Awwal",
          translation: "The First",
        },
        { title: "Explanation", text: "He existed before time and creation." },
        {
          title: "Reflection",
          text: "Put Allah first in all your decisions and priorities.",
        },
      ],
    },
    {
      id: "name-74",
      title: "74. Al-Akhir (The Last)",
      desc: "The eternal survivor.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The Last, after whom there is nothing.",
          arabic: "الآخر",
          transliteration: "Al-Akhir",
          translation: "The Last",
        },
        {
          title: "Explanation",
          text: "When all of creation ends, He alone will remain.",
        },
        {
          title: "Reflection",
          text: "Work for the Hereafter, as it is the final and lasting destination.",
        },
      ],
    },
    {
      id: "name-75",
      title: "75. Az-Zahir (The Manifest)",
      desc: "The evident through His creation.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The manifest, above whom there is nothing.",
          arabic: "الظاهر",
          transliteration: "Az-Zahir",
          translation: "The Manifest",
        },
        {
          title: "Explanation",
          text: "His existence is evident through the perfection of His creation.",
        },
        {
          title: "Reflection",
          text: "Look at nature to clearly witness the signs of the Manifest.",
        },
      ],
    },
    {
      id: "name-76",
      title: "76. Al-Batin (The Hidden)",
      desc: "The unperceivable.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The hidden, below whom there is nothing.",
          arabic: "الباطن",
          transliteration: "Al-Batin",
          translation: "The Hidden",
        },
        {
          title: "Explanation",
          text: "He is veiled from human sight in this world but intimately near to us.",
        },
        {
          title: "Reflection",
          text: "Connect with Him spiritually, knowing He knows your hidden thoughts.",
        },
      ],
    },
    {
      id: "name-77",
      title: "77. Al-Wali (The Patron)",
      desc: "The governing governor.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The patron, governor, and protecting manager.",
          arabic: "الوالي",
          transliteration: "Al-Wali",
          translation: "The Patron",
        },
        {
          title: "Explanation",
          text: "He directs, manages, and governs the universe perfectly.",
        },
        {
          title: "Reflection",
          text: "Submit to His governance in your personal life.",
        },
      ],
    },
    {
      id: "name-78",
      title: "78. Al-Muta'ali (The Supremely Exalted)",
      desc: "The exceptionally high.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The highly exalted, far above any attributes of creation.",
          arabic: "المتعالي",
          transliteration: "Al-Muta'ali",
          translation: "The Supremely Exalted",
        },
        {
          title: "Explanation",
          text: "He is infinitely supreme and completely free from any faults.",
        },
        {
          title: "Reflection",
          text: "Exalt Him daily through your words of praise (Tasbeeh).",
        },
      ],
    },
    {
      id: "name-79",
      title: "79. Al-Barr (The Most Kind and Righteous)",
      desc: "The source of all goodness.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The completely kind, righteous, and beneficent.",
          arabic: "البر",
          transliteration: "Al-Barr",
          translation: "The Most Kind",
        },
        {
          title: "Explanation",
          text: "He is the source of all good, kindness, and devotion.",
        },
        {
          title: "Reflection",
          text: "Show deep kindness to your parents and creation as an act of devotion.",
        },
      ],
    },
    {
      id: "name-80",
      title: "80. At-Tawwab (The Ever-Returning)",
      desc: "The acceptor of repentance.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who constantly accepts repentance.",
          arabic: "التواب",
          transliteration: "At-Tawwab",
          translation: "The Ever-Returning",
        },
        {
          title: "Explanation",
          text: "He inspires people to repent and then completely accepts it.",
        },
        {
          title: "Reflection",
          text: "Never tire of repenting, for He never tires of forgiving.",
        },
      ],
    },
    {
      id: "name-81",
      title: "81. Al-Muntaqim (The Avenger)",
      desc: "The punisher of the oppressive.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who avenges and retaliates against severe wrongdoers.",
          arabic: "المنتقم",
          transliteration: "Al-Muntaqim",
          translation: "The Avenger",
        },
        {
          title: "Explanation",
          text: "He executes justice upon oppressors who refuse to repent.",
        },
        {
          title: "Reflection",
          text: "Fear committing injustice, knowing He defends the oppressed.",
        },
      ],
    },
    {
      id: "name-82",
      title: "82. Al-'Afuww (The Pardoner)",
      desc: "The effacer of sins.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who completely wipes away sins.",
          arabic: "العفو",
          transliteration: "Al-'Afuww",
          translation: "The Pardoner",
        },
        {
          title: "Explanation",
          text: "While forgiveness hides a sin, pardoning completely erases it as if it never happened.",
        },
        {
          title: "Reflection",
          text: "Ask for His pardon constantly, especially on Laylatul Qadr.",
        },
      ],
    },
    {
      id: "name-83",
      title: "83. Ar-Ra'uf (The Compassionate)",
      desc: "The most kind and pitying.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The extremely compassionate and gentle.",
          arabic: "الرؤوف",
          transliteration: "Ar-Ra'uf",
          translation: "The Compassionate",
        },
        {
          title: "Explanation",
          text: "His compassion goes beyond regular mercy, filled with immense tenderness.",
        },
        {
          title: "Reflection",
          text: "Be extremely gentle and compassionate with the weak and vulnerable.",
        },
      ],
    },
    {
      id: "name-84",
      title: "84. Malik-ul-Mulk (Owner of Sovereignty)",
      desc: "The master of all kingdoms.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The absolute owner of all dominions.",
          arabic: "مالك الملك",
          transliteration: "Malik-ul-Mulk",
          translation: "Owner of All Sovereignty",
        },
        {
          title: "Explanation",
          text: "He gives kingdoms to whom He wills and takes them away from whom He wills.",
        },
        {
          title: "Reflection",
          text: "Do not attach your heart to worldly power; it all belongs to Him.",
        },
      ],
    },
    {
      id: "name-85",
      title: "85. Dhul-Jalali wal-Ikram (Lord of Majesty and Bounty)",
      desc: "The possessor of glory and honor.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The Lord of majesty, glory, and generous bounty.",
          arabic: "ذو الجلال والإكرام",
          transliteration: "Dhul-Jalali wal-Ikram",
          translation: "Lord of Majesty and Bounty",
        },
        {
          title: "Explanation",
          text: "He is majestic in His power and extremely generous in His blessings.",
        },
        {
          title: "Reflection",
          text: "Combine your awe of His majesty with hope in His supreme bounty.",
        },
      ],
    },
    {
      id: "name-86",
      title: "86. Al-Muqsit (The Equitable)",
      desc: "The perfectly just.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who is completely equitable and fair.",
          arabic: "المقسط",
          transliteration: "Al-Muqsit",
          translation: "The Equitable",
        },
        {
          title: "Explanation",
          text: "He balances the scales and gives everyone their absolute exact right.",
        },
        {
          title: "Reflection",
          text: "Be perfectly fair in your judgments and dealings with others.",
        },
      ],
    },
    {
      id: "name-87",
      title: "87. Al-Jami' (The Gatherer)",
      desc: "The uniter of mankind.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who will gather all of mankind on a Day about which there is no doubt.",
          arabic: "الجامع",
          transliteration: "Al-Jami'",
          translation: "The Gatherer",
        },
        {
          title: "Explanation",
          text: "He gathers creation, regardless of space or time, on the Day of Judgment.",
        },
        {
          title: "Reflection",
          text: "Prepare for the Day when you will be gathered with all of humanity.",
        },
      ],
    },
    {
      id: "name-88",
      title: "88. Al-Ghaniyy (The Self-Sufficient)",
      desc: "The entirely rich and independent.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The rich, the one who needs absolutely nothing.",
          arabic: "الغني",
          transliteration: "Al-Ghaniyy",
          translation: "The Self-Sufficient",
        },
        {
          title: "Explanation",
          text: "We all desperately need Him, but He is completely independent of creation.",
        },
        {
          title: "Reflection",
          text: "Worship Him out of love and need, knowing He does not 'need' your worship.",
        },
      ],
    },
    {
      id: "name-89",
      title: "89. Al-Mughni (The Enricher)",
      desc: "The one who makes creation wealthy.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who grants wealth and enriches His creation.",
          arabic: "المغني",
          transliteration: "Al-Mughni",
          translation: "The Enricher",
        },
        {
          title: "Explanation",
          text: "He enriches the hearts with faith and the hands with provision.",
        },
        {
          title: "Reflection",
          text: "Seek true richness (contentment of the heart) from the Enricher.",
        },
      ],
    },
    {
      id: "name-90",
      title: "90. Al-Mani' (The Preventer)",
      desc: "The protector and withholder.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who prevents harm and withholds out of wisdom.",
          arabic: "المانع",
          transliteration: "Al-Mani'",
          translation: "The Preventer",
        },
        {
          title: "Explanation",
          text: "He protects His servants by preventing harmful things from reaching them.",
        },
        {
          title: "Reflection",
          text: "If a desire is blocked, trust that Al-Mani' is protecting you.",
        },
      ],
    },
    {
      id: "name-91",
      title: "91. Ad-Darr (The Distresser)",
      desc: "The creator of harm and trials.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who allows harm and distress to occur.",
          arabic: "الضار",
          transliteration: "Ad-Darr",
          translation: "The Distresser",
        },
        {
          title: "Explanation",
          text: "Harm only occurs by His permission, often as a test or purification.",
        },
        {
          title: "Reflection",
          text: "During hardship, turn to Him, for only He can remove the distress.",
        },
      ],
    },
    {
      id: "name-92",
      title: "92. An-Nafi' (The Propitious)",
      desc: "The creator of benefit.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The source of all goodness and benefit.",
          arabic: "النافع",
          transliteration: "An-Nafi'",
          translation: "The Propitious",
        },
        {
          title: "Explanation",
          text: "Every advantage and benefit in the universe comes directly from Him.",
        },
        {
          title: "Reflection",
          text: "Strive to be a source of benefit to others in your community.",
        },
      ],
    },
    {
      id: "name-93",
      title: "93. An-Nur (The Light)",
      desc: "The illuminator of heaven and earth.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The divine light that guides the universe.",
          arabic: "النور",
          transliteration: "An-Nur",
          translation: "The Light",
        },
        {
          title: "Explanation",
          text: "He illuminates the physical world with light and the spiritual world with guidance.",
        },
        {
          title: "Reflection",
          text: "Ask An-Nur to place light in your heart, your face, and your path.",
        },
      ],
    },
    {
      id: "name-94",
      title: "94. Al-Hadi (The Guide)",
      desc: "The ultimate provider of guidance.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who guides hearts to the truth.",
          arabic: "الهادي",
          transliteration: "Al-Hadi",
          translation: "The Guide",
        },
        {
          title: "Explanation",
          text: "True guidance and faith come exclusively from Him.",
        },
        {
          title: "Reflection",
          text: "We ask Him for guidance at least 17 times a day in Surah Al-Fatihah.",
        },
      ],
    },
    {
      id: "name-95",
      title: "95. Al-Badi' (The Incomparable)",
      desc: "The innovative creator.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The originator of creation without any prior model.",
          arabic: "البديع",
          transliteration: "Al-Badi'",
          translation: "The Incomparable",
        },
        {
          title: "Explanation",
          text: "His creation is flawless, innovative, and perfectly beautiful.",
        },
        {
          title: "Reflection",
          text: "Look at the stars and the universe to witness His incomparable design.",
        },
      ],
    },
    {
      id: "name-96",
      title: "96. Al-Baqi (The Ever-Enduring)",
      desc: "The everlasting.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who remains forever after all creation perishes.",
          arabic: "الباقي",
          transliteration: "Al-Baqi",
          translation: "The Ever-Enduring",
        },
        {
          title: "Explanation",
          text: "Everything on earth will pass away, but the face of your Lord will remain.",
        },
        {
          title: "Reflection",
          text: "Invest your time in good deeds, for they are the only things that endure.",
        },
      ],
    },
    {
      id: "name-97",
      title: "97. Al-Warith (The Inheritor)",
      desc: "The ultimate inheritor of all.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one to whom everything returns.",
          arabic: "الوارث",
          transliteration: "Al-Warith",
          translation: "The Inheritor",
        },
        {
          title: "Explanation",
          text: "We do not truly own anything; eventually, all wealth and land return to Him.",
        },
        {
          title: "Reflection",
          text: "Use your wealth for Allah, knowing you will leave it all behind.",
        },
      ],
    },
    {
      id: "name-98",
      title: "98. Ar-Rashid (The Guide to the Right Path)",
      desc: "The unerring director.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who directs all affairs flawlessly without needing advice.",
          arabic: "الرشيد",
          transliteration: "Ar-Rashid",
          translation: "The Guide to the Right Path",
        },
        {
          title: "Explanation",
          text: "His plans are perfectly directed toward their ultimate goal.",
        },
        {
          title: "Reflection",
          text: "Follow His guidance to stay on the straight and sensible path.",
        },
      ],
    },
    {
      id: "name-99",
      title: "99. As-Sabur (The Patient)",
      desc: "The ultimately patient one.",
      time: "2 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "The Name",
          text: "The one who is immensely patient and does not rush to retaliate.",
          arabic: "الصبور",
          transliteration: "As-Sabur",
          translation: "The Patient",
        },
        {
          title: "Explanation",
          text: "He sees the disobedience of His creation but gives them time to repent.",
        },
        {
          title: "Reflection",
          text: "Adopt patience in your own life, especially when facing hardship or anger.",
        },
      ],
    },
  ],
  "Kids Corner": [
    {
      id: "kids-alphabet",
      title: "Arabic Alphabet Basics",
      desc: "Learn the first letters of the Quran!",
      time: "3 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        { title: "Alif (أ)", text: "It makes the 'A' sound. Like Apple!" },
        {
          title: "Baa (ب)",
          text: "It makes the 'B' sound. Look at the little dot under the boat!",
        },
        {
          title: "Taa (ت)",
          text: "It makes the 'T' sound. It has two dots on top, like two eyes smiling!",
        },
      ],
    },
  ],
  "Learn Arabic": [
    {
      id: "arabic-greetings",
      title: "Basic Islamic Greetings",
      desc: "How to greet and respond in Arabic.",
      time: "2 min",
      stepsCount: 2,
      difficulty: "beginner",
      steps: [
        {
          title: "The Greeting",
          text: "This is how Muslims greet each other.",
          arabic: "السلام عليكم ورحمة الله وبركاته",
          transliteration: "As-salamu alaykum wa rahmatullahi wa barakatuh",
          translation:
            "May the peace, mercy, and blessings of Allah be upon you.",
        },
        {
          title: "The Reply",
          text: "You should reply with something equal or better.",
          arabic: "وعليكم السلام ورحمة الله وبركاته",
          transliteration: "Wa alaykum as-salam wa rahmatullahi wa barakatuh",
          translation:
            "And upon you be peace, and the mercy of Allah and His blessings.",
        },
      ],
    },
  ],
  "Mosque Etiquette": [
    {
      id: "mosque-rules",
      title: "Mosque Etiquettes",
      desc: "How to behave in the house of Allah.",
      time: "4 min",
      stepsCount: 3,
      difficulty: "beginner",
      steps: [
        {
          title: "Entering",
          text: "Enter with your right foot and recite the Dua for entering the mosque.",
        },
        {
          title: "Tahiyyat al-Masjid",
          text: "Before sitting down, pray 2 short Rakats as a greeting to the mosque.",
        },
        {
          title: "Silence & Respect",
          text: "Turn your phone on silent. Do not talk loudly, especially while others are praying or reciting Quran.",
        },
      ],
    },
  ],
  "Islamic Manners": [
    {
      id: "manners-parents",
      title: "Rights of Parents",
      desc: "The immense status of parents in Islam.",
      time: "3 min",
      stepsCount: 2,
      difficulty: "beginner",
      evidence: {
        quran:
          "17:23 - 'And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age [while] with you, say not to them [so much as], 'uff'...",
      },
      steps: [
        {
          title: "Obedience",
          text: "You must obey your parents in everything unless they command you to disobey Allah.",
        },
        {
          title: "Gentle Speech",
          text: "Never raise your voice at them, do not sigh at their requests, and lower the wing of humility to them.",
        },
      ],
    },
  ],
  "Character Building": [
    {
      id: "character-sabr",
      title: "Patience (Sabr)",
      desc: "Mastering the art of beautiful patience.",
      time: "4 min",
      stepsCount: 3,
      difficulty: "intermediate",
      steps: [
        {
          title: "What is Sabr?",
          text: "Sabr is not just 'waiting.' It is maintaining good character and trusting Allah while enduring hardship.",
        },
        {
          title: "The Three Types",
          text: "1. Patience in obeying Allah. 2. Patience in avoiding sins. 3. Patience when struck by calamity.",
        },
        {
          title: "The First Strike",
          text: "True patience is shown at the very first moment a calamity hits, before anger takes over.",
        },
      ],
    },
  ],
  "Islamic Calendar": [
    {
      id: "calendar-sacred-months",
      title: "The 4 Sacred Months",
      desc: "Understanding the most holy times of the year.",
      time: "3 min",
      stepsCount: 4,
      difficulty: "beginner",
      steps: [
        {
          title: "Muharram",
          text: "The 1st month. Highly recommended to fast, especially on the 10th (Ashura).",
        },
        {
          title: "Rajab",
          text: "The 7th month. A time of planting the seeds of good deeds before Ramadan.",
        },
        {
          title: "Dhul Qa'dah",
          text: "The 11th month. The month leading up to Hajj.",
        },
        {
          title: "Dhul Hijjah",
          text: "The 12th month. The first 10 days are the best days of the year, culminating in Hajj and Eid al-Adha.",
        },
      ],
    },
  ],
  default: [
    {
      id: "default-1",
      title: "Introduction Guide",
      desc: "Select a topic to begin learning.",
      time: "1 min",
      stepsCount: 1,
      difficulty: "beginner",
    },
  ],
};

// --- Expandable FAQ Component ---
function ExpandableFAQ({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <HelpCircle size={18} /> Frequently Asked Questions
      </h3>
      <div className="divide-y divide-border">
        {faqs.map((faq, i) => (
          <div key={i} className="py-3">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex justify-between items-center text-left font-semibold text-sm text-foreground focus:outline-none"
            >
              {faq.q}
              {openIndex === i ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </button>
            {openIndex === i && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 fade-in">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- The "Interactive Prayer Trainer" Step Card ---
function InteractiveStepCard({
  step,
  index,
  isActive,
  isCompleted,
  onComplete,
}) {
  const [showArabic, setShowArabic] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Audio Logic remains the same...
  const isLoopingRef = React.useRef(isLooping);
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  const handlePlayAudio = () => {
    if (!step.arabic) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const speakText = () => {
      const utterance = new SpeechSynthesisUtterance(step.arabic);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      utterance.onend = () => {
        if (isLoopingRef.current) setTimeout(() => speakText(), 500);
        else setIsPlaying(false);
      };
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    };
    speakText();
  };

  return (
    <div
      className={`relative pl-14 mb-8 ${isActive ? "opacity-100" : "opacity-80"}`}
    >
      {/* Number Badge */}
      <div
        className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ring-4 ring-background shadow-sm z-10 ${isCompleted ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"}`}
      >
        {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
      </div>

      {/* Main Card */}
      <div
        className={`bg-white dark:bg-card border ${isActive ? "border-emerald-500 shadow-xl" : "border-border"} rounded-3xl p-6 transition-all`}
      >
        <h3 className="font-extrabold text-xl text-foreground mb-4">
          {step.title}
        </h3>

        <p className="text-md text-slate-600 dark:text-slate-300 mb-6 leading-7">
          {step.text}
        </p>

        {/* Expandable Recitation Section */}
        {(step.arabic || step.translation) && (
          <div className="mt-4">
            <button
              onClick={() => setShowArabic(!showArabic)}
              className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
            >
              {showArabic ? "▲ Hide Recitation" : "▼ Show Recitation"}
            </button>

            {showArabic && (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 transition-all">
                {/* Audio Bar */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayAudio}
                      className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg"
                    >
                      {isPlaying ? (
                        <Pause size={18} />
                      ) : (
                        <Play size={18} className="ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center ${isLooping ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-400"}`}
                    >
                      <Repeat size={18} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <p
                  dir="rtl"
                  className="text-3xl font-arabic text-foreground text-right leading-[2.2] mb-6"
                >
                  {step.arabic}
                </p>

                {/* Transliteration & Translation */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                    {step.transliteration}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
                    "{step.translation}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {isActive && !isCompleted && (
          <button
            onClick={onComplete}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
          >
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useLocalStorage(
    "recent-searches",
    [],
  );


  const TRENDING_SEARCHES = [
    "Fajr Prayer",
    "Morning Dua",
    "Wudu",
    "Ayatul Kursi",
    "Hajj",
    "Zakat",
  ];
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [xp, setXp] = useLocalStorage("tawfiq_xp", 820);
  const [streak, setStreak] = useLocalStorage("tawfiq_streak", 8);
  const [completedLessons, setCompletedLessons] = useLocalStorage(
    "tawfiq_completed_lessons",
    [],
  );
  const [bookmarkedLessons, setBookmarkedLessons] = useLocalStorage(
    "tawfiq_bookmarked_lessons",
    [],
  );
  const [recentLesson, setRecentLesson] = useLocalStorage(
    "tawfiq_recent_lesson",
    null,
  );

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    let results = [];
    Object.keys(MOCK_TOPICS).forEach((cat) => {
      MOCK_TOPICS[cat].forEach((topic) => {
      const matches =
        topic.title.toLowerCase().includes(q) ||
        topic.desc?.toLowerCase().includes(q) ||
        topic.id?.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        topic.steps?.some(
          (step) =>
            step.title?.toLowerCase().includes(q) ||
            step.text?.toLowerCase().includes(q) ||
            step.translation?.toLowerCase().includes(q) ||
            step.transliteration?.toLowerCase().includes(q) ||
            step.arabic?.includes(searchQuery),
        );

      if (matches) {
        results.push({ ...topic, categoryName: cat });
      }
      });
    });
    return results;
  }, [searchQuery]);
  const suggestions = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.slice(0, 5);
  }, [searchResults]);

  const openCategory = (category) => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTopic = (topic, categoryName) => {
    setRecentSearches((prev) => {
      const updated = [
        topic.title,
        ...prev.filter((item) => item !== topic.title),
      ];

      return updated.slice(0, 6);
    });
    setSelectedTopic(topic);
    setActiveStepIndex(0);
    setRecentLesson({
      id: topic.id,
      title: topic.title,
      category: categoryName || selectedCategory?.title,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (selectedTopic) setSelectedTopic(null);
    else setSelectedCategory(null);
  };

  const toggleBookmark = (id) => {
    if (bookmarkedLessons.includes(id)) {
      setBookmarkedLessons(bookmarkedLessons.filter((l) => l !== id));
    } else {
      setBookmarkedLessons([...bookmarkedLessons, id]);
    }
  };

  const finishLesson = () => {
    if (!completedLessons.includes(selectedTopic.id)) {
      setCompletedLessons([...completedLessons, selectedTopic.id]);
      setXp(xp + 50);
    }
    goBack();
  };

  const getDifficultyColor = (level) => {
    if (level === "beginner")
      return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200";
    if (level === "intermediate")
      return "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200";
    return "text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200";
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Sticky Header */}
      <div className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex-col  items-center justify-between">
          {selectedCategory || selectedTopic ? (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in w-full">
              <button
                onClick={goBack}
                className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full hover:bg-muted transition-colors active:scale-95 flex-shrink-0"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <div className="min-w-0 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                  <span>Academy</span>
                  {selectedCategory && (
                    <>
                      <span>›</span>
                      <span className="truncate">{selectedCategory.title}</span>
                    </>
                  )}
                </div>
                <h1 className="text-xl font-black tracking-tight text-foreground truncate mt-0.5">
                  {selectedTopic ? selectedTopic.title : "Courses"}
                </h1>
              </div>

              {selectedTopic && (
                <button
                  onClick={() => toggleBookmark(selectedTopic.id)}
                  className="ml-auto w-10 h-10 flex items-center justify-center bg-secondary rounded-full text-foreground hover:text-primary transition-colors flex-shrink-0"
                >
                  {bookmarkedLessons.includes(selectedTopic.id) ? (
                    <BookmarkCheck
                      size={18}
                      className="text-primary fill-primary/20"
                    />
                  ) : (
                    <Bookmark size={18} />
                  )}
                </button>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Academy
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track your Salah journey and build lasting consistency
              </p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6 space-y-6">
        {/* --- LAYER 3: THE LESSON VIEW --- */}
        {selectedTopic ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
            {selectedTopic.isSpecialGuide && selectedTopic.heroImage && (
              <div className="relative w-full h-56 rounded-3xl overflow-hidden shadow-lg border border-border">
                <img
                  src={selectedTopic.heroImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg mb-2 inline-block">
                    Masterclass
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {selectedTopic.title}
                  </h2>
                </div>
              </div>
            )}

            {!selectedTopic.isSpecialGuide && selectedTopic.video && (
              <div className="relative w-full h-48 bg-slate-900 rounded-3xl overflow-hidden shadow-lg group cursor-pointer border border-border">
                <img
                  src={selectedTopic.video}
                  alt="t Thumbnail"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            )}

            {!selectedTopic.isSpecialGuide && (
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-xl border border-border bg-card text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} /> {selectedTopic.time}
                </div>
                <div className="px-3 py-1.5 rounded-xl border border-border bg-card text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered size={12} /> {selectedTopic.steps?.length || 0}{" "}
                  Steps
                </div>
              </div>
            )}

            {/* <p className="text-foreground leading-relaxed font-medium px-1">
              {selectedTopic.desc}
            </p> */}

            {/* <pre className="text-red-500 text-xs">
              {JSON.stringify(selectedCategory, null, 2)}
            </pre> */}

            {selectedCategory?.id === "salah-academy" && (
              <div className="space-y-8 mt-8 mb-8">
                <div>
                  

                  <VideoLesson
                    videoId="paWC3KIEY_0"
                    title="Fajr Sunnah Namaz For Men"
                  />


                  <VideoLesson
                    videoId="9f6qArZ7EbE"
                    title="Fajr Sunnah Namaz For Women"
                  />
                </div>
              </div>
            )}

            {selectedTopic.isSpecialGuide && selectedTopic.steps && (
              <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
                  Ritual Tracker
                </h3>
                <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                  {selectedTopic.steps.map((step, idx) => {
                    const isCompleted = idx < activeStepIndex;
                    const isCurrent = idx === activeStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`px-4 py-2 rounded-2xl whitespace-nowrap text-xs font-bold flex items-center gap-1.5 transition-colors border ${isCompleted ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : isCurrent ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-500 ring-2 ring-emerald-500/20" : "bg-secondary text-muted-foreground border-border"}`}
                      >
                        {isCompleted && (
                          <CheckCircle2
                            size={12}
                            className="fill-current text-white/20"
                          />
                        )}
                        {step.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTopic.steps ? (
              <div className="space-y-0 mt-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                {selectedTopic.steps.map((step, idx) => (
                  <InteractiveStepCard
                    key={idx}
                    step={step}
                    index={idx}
                    isActive={idx === activeStepIndex}
                    isCompleted={idx < activeStepIndex}
                    onComplete={() =>
                      setActiveStepIndex(Math.max(activeStepIndex, idx + 1))
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-3xl">
                <FileText
                  size={32}
                  className="mx-auto text-muted-foreground/50 mb-3"
                />
                <p className="font-bold">Content arriving soon.</p>
              </div>
            )}

            {/* --- POST LESSON CONTENT --- */}
            {activeStepIndex >= (selectedTopic.steps?.length || 0) &&
              selectedTopic.steps && (
                <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6 pt-4 border-t border-border">
                  {selectedTopic.timeline && (
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                      <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                        <CalendarDays size={18} className="text-emerald-500" />{" "}
                        Hajj Timeline
                      </h3>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                        {selectedTopic.timeline.map((item, i) => (
                          <div
                            key={i}
                            className="relative flex items-start gap-4"
                          >
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 flex-shrink-0 z-10 mt-0.5"></div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                                {item.day}
                              </span>
                              <h4 className="font-bold text-foreground mt-1 text-sm">
                                {item.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTopic.faqs && (
                    <ExpandableFAQ faqs={selectedTopic.faqs} />
                  )}

                  {selectedTopic.sunnahs && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-6">
                      <h3 className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-4">
                        <ThumbsUp size={18} /> Sunnah Tips
                      </h3>
                      <ul className="space-y-3">
                        {selectedTopic.sunnahs.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400"
                          >
                            <span className="mt-0.5">🌿</span>{" "}
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedTopic.mistakes && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6">
                      <h3 className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-4">
                        <AlertCircle size={18} /> Common Mistakes
                      </h3>
                      <ul className="space-y-3">
                        {selectedTopic.mistakes.map((mistake, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400"
                          >
                            <span className="mt-0.5">❌</span>{" "}
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedTopic.summaryTable && (
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                      <div className="bg-secondary p-4 border-b border-border">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                          <BookOpen size={16} /> Quick Reference
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                            <tr>
                              <th className="px-4 py-3 font-semibold">
                                Position
                              </th>
                              <th className="px-4 py-3 font-semibold text-right">
                                Arabic
                              </th>
                              <th className="px-4 py-3 font-semibold">
                                Meaning
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {selectedTopic.summaryTable.map((row, i) => (
                              <tr
                                key={i}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3 font-medium text-foreground">
                                  {row.pos}
                                </td>
                                <td className="px-4 py-3 text-right font-arabic text-lg text-primary">
                                  {row.arabic}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {row.mean}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTopic.evidence && (
                    <div className="bg-card border border-border rounded-3xl p-5">
                      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <BookOpen size={18} /> Authentic Sources
                      </h3>
                      <div className="space-y-3 text-sm">
                        {selectedTopic.evidence.quran && (
                          <div className="bg-secondary p-3 rounded-2xl">
                            <span className="font-bold text-primary block mb-1">
                              Quran
                            </span>
                            <p className="text-muted-foreground italic">
                              "{selectedTopic.evidence.quran}"
                            </p>
                          </div>
                        )}
                        {selectedTopic.evidence.hadith && (
                          <div className="bg-secondary p-3 rounded-2xl">
                            <span className="font-bold text-primary block mb-1">
                              Hadith
                            </span>
                            <p className="text-muted-foreground italic">
                              "{selectedTopic.evidence.hadith}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-secondary text-foreground hover:bg-muted font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 border border-border text-xs shadow-sm">
                      <MessageCircle size={16} /> Ask AI
                    </button>
                    <button className="bg-secondary text-foreground hover:bg-muted font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 border border-border text-xs shadow-sm">
                      <Download size={16} /> Save Offline
                    </button>
                  </div>

                  <div className="pt-4 pb-8">
                    <button
                      onClick={finishLesson}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg py-5 rounded-2xl transition-transform active:scale-95 shadow-[0_6px_0_0_#047857] flex flex-col items-center justify-center"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={24} /> Mark Course Complete
                      </span>
                      {!completedLessons.includes(selectedTopic.id) && (
                        <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest mt-1">
                          Earn +50 XP
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
          </div>
        ) : selectedCategory ? (
          /* --- LAYER 2: CATEGORY "SYLLABUS" VIEW --- */
          <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="px-2 mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <ListOrdered size={16} /> Syllabus
              </h2>
            </div>
            {selectedCategory?.id === "wudu-basics" && (
              <div className="space-y-8 mt-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">🧔 Wudu for Men</h3>

                  <VideoLesson
                    videoId="P29LMOHhpjE"
                    title="How to Perform Wudu (Men)"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">👩 Wudu for Women</h3>

                  <VideoLesson
                    videoId="quVqtpkYwNI"
                    title="How to Perform Wudu (Women)"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(MOCK_TOPICS[selectedCategory.title] || MOCK_TOPICS.default).map(
                (topic, idx) => {
                  const isDone = completedLessons.includes(topic.id);
                  return (
                    <button
                      key={idx}
                      onClick={() => openTopic(topic)}
                      className="w-full flex items-center gap-4 p-4 rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-md active:scale-[0.98] transition-all duration-300 text-left group relative overflow-hidden"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold transition-colors ${"bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-base leading-6 whitespace-normal break-words ${isDone ? "text-primary" : "text-foreground"}`}
                        >
                          {topic.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {topic.time}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ListOrdered size={12} /> {topic.stepsCount} Steps
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        ) : (
          /* --- LAYER 1: ACADEMY DASHBOARD VIEW --- */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <Search
                    size={20}
                    className="text-muted-foreground pointer-events-none"
                  />
                )}
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prayers, Hajj, Wudu..."
                className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
              />
            </div>
            {!searchQuery && (
              <div className="space-y-4 mt-5">
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-xs uppercase font-bold text-muted-foreground mb-2">
                      Recent
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <button
                          key={item}
                          onClick={() => setSearchQuery(item)}
                          className="px-3 py-2 rounded-full bg-card border border-border text-sm hover:bg-primary hover:text-white transition"
                        >
                          🕘 {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* <div>
                    <p className="text-xs uppercase font-bold text-muted-foreground mb-2">
                      Trendingddd
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((item) => (
                        <button
                          key={item}
                          onClick={() => setSearchQuery(item)}
                          className="px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm hover:bg-emerald-500 hover:text-white transition"
                        >
                          🔥 {item}
                        </button>
                      ))}
                    </div>
                  </div> */}
              </div>
            )}

            {/* Search Suggestions */}

            {searchQuery &&
              suggestions.length > 0 &&
              suggestions.length !== searchResults?.length && (
                <div className="mt-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {suggestions.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedCategory(
                          CATEGORIES.find(
                            (c) => c.title === topic.categoryName,
                          ) || CATEGORIES[0],
                        );

                        openTopic(topic, topic.categoryName);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition border-b last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-sm">{topic.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {topic.categoryName}
                        </p>
                      </div>

                      <ArrowRight size={15} />
                    </button>
                  ))}
                </div>
              )}

            {searchQuery ? (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-4 px-1">
                  Search Results
                </h2>
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedCategory(
                            CATEGORIES.find(
                              (c) => c.title === topic.categoryName,
                            ) || CATEGORIES[0],
                          );
                          openTopic(topic, topic.categoryName);
                        }}
                        className="w-full bg-card border border-border rounded-2xl p-4 text-left shadow-sm flex items-center justify-between hover:border-primary transition-colors"
                      >
                        <div>
                          <p className="text-xs text-primary font-bold mb-1 uppercase">
                            {topic.categoryName}
                          </p>
                          <p className="font-bold text-foreground">
                            {topic.title}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-muted-foreground"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/50 rounded-3xl border border-dashed border-border">
                    <Search
                      size={32}
                      className="mx-auto text-muted-foreground/50 mb-3"
                    />
                    <p className="text-foreground font-bold">
                      No exact matches
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Beginner Roadmap Banner */}
                <div className="relative rounded-3xl p-8 shadow-[0_20px_50px_rgba(16,185,129,0.15)] overflow-hidden border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20">
                  {/* Subtle decorative background pattern */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-foreground leading-none">
                          Academy Roadmap
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mt-1">
                          Start your journey here
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mt-6">
                      {["① Purity", "② Salah", "③ Duas", "④ Quran"].map(
                        (step, i) => (
                          <span
                            key={i}
                            className="flex-shrink-0 bg-white dark:bg-slate-800 border border-border shadow-sm px-4 py-2 rounded-xl text-xs font-bold text-foreground flex items-center gap-2"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px]">
                              {i + 1}
                            </span>
                            {step.split(" ")[1]}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {recentLesson && (
                  <div>
                    <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3 px-1">
                      Jump Back In
                    </h2>
                    <button
                      onClick={() => {
                        const cat = CATEGORIES.find(
                          (c) => c.title === recentLesson.category,
                        );
                        if (cat) {
                          setSelectedCategory(cat);
                          openTopic(
                            MOCK_TOPICS[cat.title]?.find(
                              (t) => t.id === recentLesson.id,
                            ) || MOCK_TOPICS.default[0],
                          );
                        }
                      }}
                      className="w-full bg-card border border-primary/30 rounded-3xl p-5 text-left shadow-md flex items-center justify-between group hover:border-primary transition-colors"
                    >
                      <div>
                        <p className="text-xs text-primary font-bold uppercase mb-1">
                          {recentLesson.category}
                        </p>
                        <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                          {recentLesson.title}
                        </p>
                      </div>
                      <PlayCircle
                        size={28}
                        className="text-primary group-hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                )}

                <div>
                  <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4 px-1">
                    All 22 Academies
                  </h2>
                  <div className="grid grid-cols-2 gap-5 mt-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.title}
                        onClick={() => openCategory(category)}
                        className="
bg-card
border
border-border
rounded-3xl
p-6
text-left
shadow-sm
hover:shadow-xl
hover:border-green-300
hover:-translate-y-2
active:scale-95
transition-all
duration-300
group
"
                      >
                        <div
                          className={`w-14 h-14 shadow-md rounded-2xl ${category.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4`}
                        >
                          <category.icon size={22} className={category.color} />
                        </div>
                        <h3 className="font-bold text-base text-foreground leading-tight">
                          {category.title}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          Start Learning →
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}