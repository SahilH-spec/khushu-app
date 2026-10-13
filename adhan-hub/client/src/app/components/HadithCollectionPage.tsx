import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface Hadith {
  id: number;
  arabic: string;
  translation: string;
  narrator: string;
  reference: string;
  grade: string;
}

interface Book {
  name: string;
  shortName: string;
  color: string;
  totalHadiths: number;
  desc: string;
  hadiths: Hadith[];
}

const BOOKS: Book[] = [
  {
    name: "Sahih Al-Bukhari",
    shortName: "Bukhari",
    color: "#1e6b5e",
    totalHadiths: 7563,
    desc: "Most authentic hadith collection · Compiled by Imam Muhammad ibn Ismail al-Bukhari (810–870 CE)",
    hadiths: [
      { id: 1, arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "Actions are judged by intentions. Every person will get the reward according to what he has intended.", narrator: "Umar ibn al-Khattab (رضي الله عنه)", reference: "Bukhari 1", grade: "Sahih" },
      { id: 2, arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", translation: "A Muslim is one from whose tongue and hand other Muslims are safe.", narrator: "Abdullah ibn Amr (رضي الله عنه)", reference: "Bukhari 10", grade: "Sahih" },
      { id: 3, arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", translation: "None of you will have faith until he loves for his brother what he loves for himself.", narrator: "Anas ibn Malik (رضي الله عنه)", reference: "Bukhari 13", grade: "Sahih" },
      { id: 4, arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", translation: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Bukhari 6018", grade: "Sahih" },
      { id: 5, arabic: "إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ", translation: "Allah does not look at your appearance or wealth, but He looks at your hearts and deeds.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 2564 (also Bukhari)", grade: "Sahih" },
      { id: 6, arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "The best among you are those who learn the Quran and teach it.", narrator: "Uthman ibn Affan (رضي الله عنه)", reference: "Bukhari 5027", grade: "Sahih" },
      { id: 7, arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", translation: "Seeking knowledge is an obligation upon every Muslim.", narrator: "Anas ibn Malik (رضي الله عنه)", reference: "Ibn Majah 224", grade: "Sahih" },
    ],
  },
  {
    name: "Sahih Muslim",
    shortName: "Muslim",
    color: "#5b3fa6",
    totalHadiths: 7500,
    desc: "Second most authentic collection · Compiled by Imam Muslim ibn al-Hajjaj (815–875 CE)",
    hadiths: [
      { id: 1, arabic: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ", translation: "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is His messenger, establishing the prayer, paying Zakat, making Hajj, and fasting in Ramadan.", narrator: "Ibn Umar (رضي الله عنه)", reference: "Muslim 16", grade: "Sahih" },
      { id: 2, arabic: "كُلُّ أَمْرٍ ذِي بَالٍ لاَ يُبْدَأُ فِيهِ بِـ بِسْمِ اللَّهِ فَهُوَ أَبْتَرُ", translation: "Every matter of importance that does not begin with 'Bismillah' is cut off from blessing.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 1", grade: "Sahih" },
      { id: 3, arabic: "الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ كَفَّارَةٌ لِمَا بَيْنَهُنَّ", translation: "The five daily prayers, and Friday to Friday, are expiation for whatever sins are committed between them, as long as major sins are avoided.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 233", grade: "Sahih" },
      { id: 4, arabic: "إِنَّ اللَّهَ كَتَبَ الإِحْسَانَ عَلَى كُلِّ شَيْءٍ", translation: "Verily Allah has prescribed excellence (ihsan) in all things. So when you kill, kill well; and when you slaughter, slaughter well.", narrator: "Shaddad ibn Aws (رضي الله عنه)", reference: "Muslim 1955", grade: "Sahih" },
      { id: 5, arabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ", translation: "Whoever relieves a believer of distress in this world, Allah will relieve him of distress on the Day of Resurrection.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 2699", grade: "Sahih" },
      { id: 6, arabic: "اتَّقُوا الظُّلْمَ فَإِنَّ الظُّلْمَ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ", translation: "Beware of injustice, for injustice will be darknesses on the Day of Resurrection.", narrator: "Jabir ibn Abdullah (رضي الله عنه)", reference: "Muslim 2578", grade: "Sahih" },
      { id: 7, arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", translation: "The most beloved deeds to Allah are those which are most consistent, even if they are small.", narrator: "Aisha (رضي الله عنها)", reference: "Muslim 783", grade: "Sahih" },
    ],
  },
  {
    name: "Jami' At-Tirmidhi",
    shortName: "Tirmidhi",
    color: "#b89230",
    totalHadiths: 3956,
    desc: "Widely used in Islamic schools · Compiled by Imam at-Tirmidhi (824–892 CE)",
    hadiths: [
      { id: 1, arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ", translation: "Fear Allah wherever you are. Follow a bad deed with a good one and it will wipe it out. And treat people with good character.", narrator: "Mu'adh ibn Jabal (رضي الله عنه)", reference: "Tirmidhi 1987", grade: "Hasan Sahih" },
      { id: 2, arabic: "الدُّعَاءُ مُخُّ الْعِبَادَةِ", translation: "Dua (supplication) is the essence of worship.", narrator: "Anas ibn Malik (رضي الله عنه)", reference: "Tirmidhi 3371", grade: "Hasan" },
      { id: 3, arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ", translation: "This world is a prison for the believer and a paradise for the disbeliever.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 2956", grade: "Sahih" },
      { id: 4, arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا", translation: "The most complete of the believers in faith is the one with the best character.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Tirmidhi 1162", grade: "Hasan Sahih" },
      { id: 5, arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ", translation: "The merciful will be shown mercy by the Most Merciful. Be merciful to those on earth, and the One in the heavens will be merciful to you.", narrator: "Abdullah ibn Amr (رضي الله عنه)", reference: "Tirmidhi 1924", grade: "Sahih" },
      { id: 6, arabic: "صِلَةُ الرَّحِمِ تَزِيدُ فِي الْعُمُرِ", translation: "Maintaining family ties increases one's lifespan.", narrator: "Anas ibn Malik (رضي الله عنه)", reference: "Tirmidhi 1979", grade: "Sahih" },
      { id: 7, arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", translation: "Whoever treads a path in search of knowledge, Allah will make easy for him a path to Paradise.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 2699", grade: "Sahih" },
    ],
  },
  {
    name: "Sunan Abu Dawud",
    shortName: "Abu Dawud",
    color: "#1aa399",
    totalHadiths: 5274,
    desc: "Focus on legal rulings · Compiled by Imam Abu Dawud (817–889 CE)",
    hadiths: [
      { id: 1, arabic: "إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلاَقًا", translation: "Indeed among the best of you are those who are best in character.", narrator: "Abdullah ibn Amr (رضي الله عنه)", reference: "Abu Dawud 4682", grade: "Sahih" },
      { id: 2, arabic: "مَنْ لاَ يَشْكُرُ النَّاسَ لاَ يَشْكُرُ اللَّهَ", translation: "Whoever does not thank people, does not thank Allah.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Abu Dawud 4811", grade: "Sahih" },
      { id: 3, arabic: "الأُمُورُ بِمَقَاصِدِهَا", translation: "Matters are judged by their objectives.", narrator: "Umar ibn al-Khattab (رضي الله عنه)", reference: "Bukhari / Abu Dawud", grade: "Sahih" },
      { id: 4, arabic: "مَا مَلَأَ ابْنُ آدَمَ وِعَاءً شَرًّا مِنْ بَطْنٍ", translation: "No human ever filled a vessel worse than the stomach. Sufficient for the son of Adam are a few morsels to keep his back straight.", narrator: "Al-Miqdam ibn Ma'dikarib (رضي الله عنه)", reference: "Tirmidhi 2380", grade: "Hasan" },
      { id: 5, arabic: "إِذَا تَوَضَّأَ الْعَبْدُ الْمُسْلِمُ أَوِ الْمُؤْمِنُ فَغَسَلَ وَجْهَهُ خَرَجَ مِنْ وَجْهِهِ كُلُّ خَطِيئَةٍ نَظَرَ إِلَيْهَا بِعَيْنَيْهِ مَعَ الْمَاءِ", translation: "When a Muslim servant performs wudu and washes his face, every sin he committed with his eyes departs with the water.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 244", grade: "Sahih" },
      { id: 6, arabic: "صَلاَةُ الرَّجُلِ فِي جَمَاعَةٍ تَزِيدُ عَلَى صَلاَتِهِ فِي بَيْتِهِ وَصَلاَتِهِ فِي سُوقِهِ بِضْعًا وَعِشْرِينَ دَرَجَةً", translation: "A man's prayer in congregation is twenty-some degrees greater than his prayer at home or in the marketplace.", narrator: "Abdullah ibn Umar (رضي الله عنه)", reference: "Bukhari 647", grade: "Sahih" },
    ],
  },
  {
    name: "Al-Arba'un An-Nawawiyyah",
    shortName: "Nawawi's 40",
    color: "#b84230",
    totalHadiths: 42,
    desc: "The Forty Hadiths of Imam Nawawi · A foundational collection for every Muslim",
    hadiths: [
      { id: 1, arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", translation: "Actions are judged by intentions, and each person will have what they intended.", narrator: "Umar ibn al-Khattab (رضي الله عنه)", reference: "Nawawi Hadith 1 · Bukhari 1", grade: "Sahih" },
      { id: 2, arabic: "الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ", translation: "Islam is to testify that there is no god but Allah and that Muhammad is His messenger, to establish prayer, to pay Zakat, to fast Ramadan, and to make Hajj if you are able.", narrator: "Umar ibn al-Khattab (رضي الله عنه)", reference: "Nawawi Hadith 2 · Muslim 8", grade: "Sahih" },
      { id: 3, arabic: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ", translation: "Islam was built upon five pillars: the two testimonies of faith, establishing prayer, paying Zakat, fasting Ramadan, and Hajj.", narrator: "Ibn Umar (رضي الله عنه)", reference: "Nawawi Hadith 3 · Bukhari 8", grade: "Sahih" },
      { id: 4, arabic: "إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً", translation: "Each of you has your creation gathered in your mother's womb for forty days as a drop of fluid, then it becomes a clot for a similar period, then a morsel of flesh for a similar period...", narrator: "Abdullah ibn Masud (رضي الله عنه)", reference: "Nawawi Hadith 4 · Bukhari 3208", grade: "Sahih" },
      { id: 5, arabic: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ", translation: "Whoever introduces into this matter of ours something that is not from it, will have it rejected.", narrator: "Aisha (رضي الله عنها)", reference: "Nawawi Hadith 5 · Bukhari 2697", grade: "Sahih" },
      { id: 6, arabic: "الْحَلاَلُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ", translation: "The halal is clear and the haram is clear, and between them are doubtful matters that many people do not know. Whoever avoids the doubtful has safeguarded his religion and honor.", narrator: "Nu'man ibn Bashir (رضي الله عنه)", reference: "Nawawi Hadith 6 · Bukhari 52", grade: "Sahih" },
      { id: 7, arabic: "الدِّينُ النَّصِيحَةُ", translation: "The religion is sincerity (nasiha). We said: To whom? He said: To Allah, to His Book, to His Messenger, to the leaders of the Muslims, and to the common people of the Muslims.", narrator: "Tamim al-Dari (رضي الله عنه)", reference: "Nawawi Hadith 7 · Muslim 55", grade: "Sahih" },
      { id: 8, arabic: "أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ", translation: "I was commanded to fight people until they testify that there is no god but Allah and that Muhammad is the Messenger of Allah.", narrator: "Ibn Umar (رضي الله عنه)", reference: "Nawawi Hadith 8 · Bukhari 25", grade: "Sahih" },
      { id: 9, arabic: "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ وَمَا أَمَرْتُكُمْ بِهِ فَافْعَلُوا مِنْهُ مَا اسْتَطَعْتُمْ", translation: "Whatever I have forbidden for you, avoid it. And whatever I have ordered you, do as much of it as you can.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Nawawi Hadith 9 · Bukhari 7288", grade: "Sahih" },
      { id: 10, arabic: "إِنَّ اللَّهَ طَيِّبٌ لاَ يَقْبَلُ إِلاَّ طَيِّبًا", translation: "Indeed Allah is pure and only accepts that which is pure. Allah has commanded the believers as He has commanded the messengers...", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Nawawi Hadith 10 · Muslim 1015", grade: "Sahih" },
    ],
  },
];

const TOPICS = [
  { name: "Iman & Tawhid", icon: "☪️", hadiths: [
    { arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ", translation: "There is no god but Allah.", narrator: "Multiple sources", reference: "Agreed upon", grade: "Sahih" },
    { arabic: "الإِيمَانُ بِضْعٌ وَسَبْعُونَ شُعْبَةً", translation: "Faith has seventy-some branches, the highest of which is saying 'La ilaha illa Allah', and the lowest is removing something harmful from the road.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Bukhari 9", grade: "Sahih" },
  ]},
  { name: "Salah (Prayer)", icon: "🕌", hadiths: [
    { arabic: "الصَّلاَةُ عِمَادُ الدِّينِ", translation: "Prayer is the pillar of religion.", narrator: "Multiple sources", reference: "Bayhaqi", grade: "Hasan" },
    { arabic: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلاَةُ", translation: "The first matter that the servant will be brought to account for on the Day of Judgment is the prayer.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Tirmidhi 413", grade: "Sahih" },
  ]},
  { name: "Zakat & Charity", icon: "🤲", hadiths: [
    { arabic: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ", translation: "Charity extinguishes sin just as water extinguishes fire.", narrator: "Mu'adh ibn Jabal (رضي الله عنه)", reference: "Tirmidhi 2616", grade: "Hasan Sahih" },
    { arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", translation: "Charity does not decrease wealth.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 2588", grade: "Sahih" },
  ]},
  { name: "Fasting & Ramadan", icon: "🌙", hadiths: [
    { arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "Whoever fasts Ramadan out of faith and hoping for reward, his previous sins are forgiven.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Bukhari 38", grade: "Sahih" },
    { arabic: "الصِّيَامُ جُنَّةٌ", translation: "Fasting is a shield (from sin and the Fire).", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Bukhari 1904", grade: "Sahih" },
  ]},
  { name: "Character & Manners", icon: "🌸", hadiths: [
    { arabic: "إِنَّمَا بُعِثْتُ لأُتَمِّمَ مَكَارِمَ الأَخْلاَقِ", translation: "I was only sent to perfect noble character.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Ahmad 8952", grade: "Sahih" },
    { arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", translation: "The strong person is not the one who can overpower others. Rather, the strong person is the one who controls himself when angry.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Bukhari 6114", grade: "Sahih" },
  ]},
  { name: "Family & Marriage", icon: "👨‍👩‍👧", hadiths: [
    { arabic: "خَيْرُكُمْ خَيْرُكُمْ لأَهْلِهِ وَأَنَا خَيْرُكُمْ لأَهْلِي", translation: "The best of you are the best to their families, and I am the best among you to my family.", narrator: "Aisha (رضي الله عنها)", reference: "Tirmidhi 3895", grade: "Hasan Sahih" },
    { arabic: "الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ", translation: "Paradise lies under the feet of mothers.", narrator: "Mu'awiyah ibn Jahimah (رضي الله عنه)", reference: "Ahmad, An-Nasa'i", grade: "Hasan" },
  ]},
  { name: "Knowledge & Wisdom", icon: "📖", hadiths: [
    { arabic: "إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلاَّ مِنْ ثَلاَثٍ", translation: "When a person dies, his deeds end except for three: ongoing charity, knowledge that is benefited from, or a righteous child who prays for him.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 1631", grade: "Sahih" },
    { arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", translation: "Whoever treads a path in search of knowledge, Allah will make easy for him a path to Paradise.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 2699", grade: "Sahih" },
  ]},
  { name: "Dhikr & Dua", icon: "🤍", hadiths: [
    { arabic: "أَفْضَلُ الذِّكْرِ لاَ إِلَهَ إِلاَّ اللَّهُ", translation: "The best form of remembrance is 'La ilaha illa Allah'.", narrator: "Jabir (رضي الله عنه)", reference: "Tirmidhi 3383", grade: "Sahih" },
    { arabic: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", translation: "Two words that are light on the tongue but heavy on the scale, and beloved to the Most Merciful: Subhanallahi wa bihamdihi, Subhanallahil Adhim.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Bukhari 6682", grade: "Sahih" },
  ]},
];

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

const DOY = dayOfYear();

const FEATURED_POOL = [
  { arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "Actions are judged by intentions. Every person will get the reward according to what he has intended.", narrator: "Umar ibn al-Khattab (رضي الله عنه)", reference: "Bukhari 1 · Muslim 1907" },
  { arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", translation: "None of you will have faith until he loves for his brother what he loves for himself.", narrator: "Anas ibn Malik (رضي الله عنه)", reference: "Bukhari 13 · Muslim 45" },
  { arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ", translation: "The merciful will be shown mercy by the Most Merciful. Be merciful to those on earth and the One in the heavens will be merciful to you.", narrator: "Abdullah ibn Amr (رضي الله عنه)", reference: "Tirmidhi 1924" },
  { arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا", translation: "The most complete of the believers in faith is the one with the best character.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Tirmidhi 1162" },
  { arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "The best among you are those who learn the Quran and teach it.", narrator: "Uthman ibn Affan (رضي الله عنه)", reference: "Bukhari 5027" },
  { arabic: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ", translation: "Charity extinguishes sin just as water extinguishes fire.", narrator: "Mu'adh ibn Jabal (رضي الله عنه)", reference: "Tirmidhi 2616" },
  { arabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ", translation: "Whoever relieves a believer of distress in this world, Allah will relieve him of distress on the Day of Resurrection.", narrator: "Abu Hurayrah (رضي الله عنه)", reference: "Muslim 2699" },
];

const todayFeatured = FEATURED_POOL[DOY % FEATURED_POOL.length];

export function HadithCollectionPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"books" | "topics">("books");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [expandedHadith, setExpandedHadith] = useState<string | null>(null);

  const filteredBooks = BOOKS.map(book => ({
    ...book,
    hadiths: book.hadiths.filter(h =>
      !search || h.translation.toLowerCase().includes(search.toLowerCase()) || h.narrator.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(book => !search || book.hadiths.length > 0 || book.name.toLowerCase().includes(search.toLowerCase()));

  const filteredTopics = TOPICS.map(topic => ({
    ...topic,
    hadiths: topic.hadiths.filter(h =>
      !search || h.translation.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(t => !search || t.hadiths.length > 0);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 mt-3">
      {/* Hadith of the Day */}
      <div className="rounded-2xl" style={{ background: "linear-gradient(135deg, #1e6b5e, #0f3d35)" }}>
        <div className="px-4 pt-3 pb-1">
          <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.65)", fontSize: "10px", fontWeight: 700 }} className="uppercase tracking-widest">Hadith of the Day</p>
        </div>
        <div className="px-4 pb-4">
          <p style={{ fontFamily: "Scheherazade New, serif", color: "#c8a84b", fontSize: "20px", textAlign: "right", lineHeight: 1.9 }}>{todayFeatured.arabic}</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(240,237,230,0.85)", fontSize: "13px", lineHeight: 1.6, fontStyle: "italic", marginBottom: "6px" }}>"{todayFeatured.translation}"</p>
          <p style={{ fontFamily: "Nunito, sans-serif", color: "rgba(200,168,75,0.8)", fontSize: "11px" }}>— {todayFeatured.narrator} · {todayFeatured.reference}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        <Search size={15} style={{ color: "var(--k-text-muted)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by text or narrator..."
          className="bg-transparent flex-1 outline-none"
          style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px" }}
        />
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
        {(["books", "topics"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2.5 text-center"
            style={{ background: activeTab === tab ? "var(--k-gold-sub)" : "transparent" }}>
            <p style={{ fontFamily: "Nunito, sans-serif", color: activeTab === tab ? "var(--k-gold)" : "var(--k-text-muted)", fontSize: "13px", fontWeight: activeTab === tab ? 700 : 400 }}>
              {tab === "books" ? "By Book" : "By Topic"}
            </p>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "books" ? (
        <div className="flex flex-col gap-2">
          {filteredBooks.map(book => (
            <div key={book.name} className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <button
                onClick={() => setExpandedBook(expandedBook === book.name ? null : book.name)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${book.color}20` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: book.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 700 }}>{book.name}</p>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{book.totalHadiths.toLocaleString()} hadiths · {search ? `${book.hadiths.length} match${book.hadiths.length !== 1 ? "es" : ""}` : "Tap to browse"}</p>
                </div>
                {expandedBook === book.name ? <ChevronUp size={16} style={{ color: "var(--k-text-muted)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "var(--k-text-muted)", flexShrink: 0 }} />}
              </button>

              {expandedBook === book.name && (
                <div style={{ borderTop: "1px solid var(--k-border)" }}>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px", padding: "8px 16px 4px" }}>{book.desc}</p>
                  <div className="flex flex-col">
                    {(search ? book.hadiths : book.hadiths).map((h, i) => {
                      const hKey = `${book.name}-${h.id}`;
                      const isOpen = expandedHadith === hKey;
                      return (
                        <div key={h.id} style={{ borderTop: i === 0 ? "1px solid var(--k-border)" : "1px solid var(--k-border)" }}>
                          <button onClick={() => setExpandedHadith(isOpen ? null : hKey)} className="w-full text-left px-4 py-3">
                            <div className="flex items-start gap-2">
                              <span style={{ fontFamily: "Nunito, sans-serif", color: book.color, fontSize: "11px", fontWeight: 700, marginTop: "2px", flexShrink: 0 }}>{h.reference.split("·")[0].trim()}</span>
                              <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", lineHeight: 1.5 }} className="flex-1">"{h.translation.length > 120 && !isOpen ? h.translation.slice(0, 120) + "…" : h.translation}"</p>
                            </div>
                            {isOpen && (
                              <div className="mt-3 flex flex-col gap-2">
                                <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-gold)", fontSize: "18px", textAlign: "right", lineHeight: 1.9 }}>{h.arabic}</p>
                                <div className="flex items-center justify-between">
                                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>— {h.narrator}</p>
                                  <span className="rounded-full px-2 py-0.5" style={{ background: h.grade === "Sahih" ? "#1e6b5e20" : "#b8923020", color: h.grade === "Sahih" ? "#1e6b5e" : "#b89230", fontFamily: "Nunito, sans-serif", fontSize: "10px", fontWeight: 700 }}>{h.grade}</span>
                                </div>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTopics.map(topic => (
            <div key={topic.name} className="rounded-2xl overflow-hidden" style={{ background: "var(--k-surface)", border: "1px solid var(--k-border)" }}>
              <button
                onClick={() => setExpandedBook(expandedBook === topic.name ? null : topic.name)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span style={{ fontSize: "20px" }}>{topic.icon}</span>
                <div className="flex-1">
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "14px", fontWeight: 700 }}>{topic.name}</p>
                  <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>{topic.hadiths.length} hadith{topic.hadiths.length !== 1 ? "s" : ""}</p>
                </div>
                {expandedBook === topic.name ? <ChevronUp size={16} style={{ color: "var(--k-text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--k-text-muted)" }} />}
              </button>

              {expandedBook === topic.name && (
                <div style={{ borderTop: "1px solid var(--k-border)" }}>
                  {topic.hadiths.map((h, i) => {
                    const hKey = `topic-${topic.name}-${i}`;
                    const isOpen = expandedHadith === hKey;
                    return (
                      <div key={i} style={{ borderTop: i > 0 ? "1px solid var(--k-border)" : undefined }}>
                        <button onClick={() => setExpandedHadith(isOpen ? null : hKey)} className="w-full text-left px-4 py-3">
                          <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text)", fontSize: "13px", lineHeight: 1.5 }}>"{h.translation.length > 120 && !isOpen ? h.translation.slice(0, 120) + "…" : h.translation}"</p>
                          {isOpen && (
                            <div className="mt-3 flex flex-col gap-2">
                              <p style={{ fontFamily: "Scheherazade New, serif", color: "var(--k-gold)", fontSize: "18px", textAlign: "right", lineHeight: 1.9 }}>{h.arabic}</p>
                              <div className="flex items-center justify-between">
                                <p style={{ fontFamily: "Nunito, sans-serif", color: "var(--k-text-muted)", fontSize: "11px" }}>— {h.narrator} · {h.reference}</p>
                                <span className="rounded-full px-2 py-0.5" style={{ background: h.grade === "Sahih" ? "#1e6b5e20" : "#b8923020", color: h.grade === "Sahih" ? "#1e6b5e" : "#b89230", fontFamily: "Nunito, sans-serif", fontSize: "10px", fontWeight: 700 }}>{h.grade}</span>
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
