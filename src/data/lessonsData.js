export const LessonsData = {
  foundations: [
    {
      id: "islam-basics",
      title: "What is Islam?",
      description: "Learn the core beliefs and practices of Islam",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.03 0-5.5 2.47-5.5 5.5s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5zm0 0h.01M12 12h.01M12 16h.01M9.5 8H5a2 2 0 00-2 2v6a2 2 0 002 2h4.5M16 16a2 2 0 01-2-2V6a2 2 0 114 0v8a2 2 0 01-2 2z" /></svg>,
      level: "Beginner",
      content: [
        {
          title: "The Five Pillars",
          body: "Islam is built upon five pillars: Shahada (faith), Salat (prayer), Zakat (charity), Sawm (fasting during Ramadan), and Hajj (pilgrimage to Mecca)."
        },
        {
          title: "Articles of Faith",
          body: "Muslims believe in one God (Allah), angels, holy books, prophets, the Day of Judgment, and divine decree (qadar)."
        }
      ]
    },
    {
      id: "quran-intro",
      title: "Introduction to the Quran",
      description: "Understand the holy book of Islam",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      level: "Beginner",
      content: [
        {
          title: "Revelation of the Quran",
          body: "The Quran was revealed to Prophet Muhammad (peace be upon him) over a period of 23 years through the Angel Gabriel."
        },
        {
          title: "Structure of the Quran",
          body: "The Quran consists of 114 chapters (surahs) and over 6,000 verses (ayat), arranged roughly by length rather than chronological order."
        }
      ]
    }
  ],
  practice: [
    {
      id: "wudu-guide",
      title: "How to Perform Wudu",
      description: "Step-by-step guide to ritual purification",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      level: "Beginner",
      content: [
        {
          title: "Steps of Wudu",
          body: "Wudu consists of washing the hands, mouth, nose, face, arms, wiping the head and ears, and washing the feet in a specific order."
        },
        {
          title: "When Wudu is Required",
          body: "Wudu is required before performing salah (prayer), touching the Quran, and performing tawaf (circumambulation) around the Kaaba."
        }
      ]
    },
    {
      id: "salah-basics",
      title: "Introduction to Salah",
      description: "Learn about the Islamic prayer",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.03 0-5.5 2.47-5.5 5.5s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5zm0 0h.01M12 12h.01M12 16h.01M9.5 8H5a2 2 0 00-2 2v6a2 2 0 002 2h4.5M16 16a2 2 0 01-2-2V6a2 2 0 114 0v8a2 2 0 01-2 2z" /></svg>,
      level: "Beginner",
      content: [
        {
          title: "The Five Daily Prayers",
          body: "Muslims pray five times daily: Fajr (dawn), Dhuhr (noon), Asr (afternoon), Maghrib (sunset), and Isha (night)."
        },
        {
          title: "Components of Salah",
          body: "Each prayer consists of specific movements and recitations, including standing, bowing, prostrating, and sitting, accompanied by Quranic verses and supplications."
        }
      ]
    }
  ],
  spirituality: [
    {
      id: "dhikr-importance",
      title: "The Importance of Dhikr",
      description: "Understanding remembrance of Allah",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
      level: "Intermediate",
      content: [
        {
          title: "Benefits of Dhikr",
          body: "Regular remembrance of Allah brings peace to the heart, increases faith, protects from evil, and brings blessings in this life and the hereafter."
        },
        {
          title: "Forms of Dhikr",
          body: "Dhikr can include saying SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah, reciting Quranic verses, or making personal supplications (dua)."
        }
      ]
    },
    {
      id: "dua-guide",
      title: "Making Dua (Supplication)",
      description: "How to communicate with Allah",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.03 0-5.5 2.47-5.5 5.5s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5zm0 0h.01M12 12h.01M12 16h.01M9.5 8H5a2 2 0 00-2 2v6a2 2 0 002 2h4.5M16 16a2 2 0 01-2-2V6a2 2 0 01-2 2z" /></svg>,
      level: "Beginner",
      content: [
        {
          title: "Etiquette of Dua",
          body: "When making dua, one should begin with praise of Allah, send blessings upon the Prophet, confess sins, make the request, and end with praise again."
        },
        {
          title: "Times When Dua is Accepted",
          body: "Dua is more likely to be accepted during the last third of the night, while fasting, between the adhan and iqama, while it's raining, and while traveling."
        }
      ]
    }
  ],
  history: [
    {
      id: "prophet-life",
      title: "Life of Prophet Muhammad",
      description: "Key events from the Prophet's biography",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.03 0-5.5 2.47-5.5 5.5s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5zm0 0h.01M12 12h.01M12 16h.01M9.5 8H5a2 2 0 00-2 2v6a2 2 0 002 2h4.5M16 16a2 2 0 01-2-2V6a2 2 0 114 0v8a2 2 0 01-2 2z" /></svg>,
      level: "Intermediate",
      content: [
        {
          title: "Early Life and Revelation",
          body: "Prophet Muhammad was born in Mecca in 570 CE, received his first revelation at age 40 in the Cave of Hira, and began preaching publicly after three years of private preaching."
        },
        {
          title: "Hijra and Establishment of Medina",
          body: "In 622 CE, the Prophet migrated from Mecca to Medina (the Hijra), where he established the first Muslim community and served as both religious and political leader."
        }
      ]
    },
    {
      id: "islamic-civilization",
      title: "Golden Age of Islam",
      description: "Contributions to science, art, and culture",
      icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.03 0-5.5 2.47-5.5 5.5s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5zm0 0h.01M12 12h.01M12 16h.01M9.5 8H5a2 2 0 00-2 2v6a2 2 0 002 2h4.5M16 16a2 2 0 01-2-2V6a2 2 0 01-2 2z" /></svg>,
      level: "Intermediate",
      content: [
        {
          title: "Advancements in Knowledge",
          body: "During the Islamic Golden Age (8th-14th centuries), Muslim scholars made significant contributions to mathematics, astronomy, medicine, philosophy, and architecture."
        },
        {
          title: "House of Wisdom",
          body: "The House of Wisdom in Baghdad was a major intellectual center where scholars translated works from Greek, Persian, and Indian languages into Arabic and conducted original research."
        }
      ]
    }
  ]
};