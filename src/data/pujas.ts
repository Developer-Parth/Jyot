export type PujaCategory = 'Daily' | 'Deity' | 'Occasion' | 'Festival';

export type SamagriItem = {
  id: number;
  name: string;
  hindiName: string;
};

export type PujaStep = {
  step: number;
  title: string;
  titleHi: string;
  instruction: string;
  instructionHi: string;
  mantra?: string;
  mantraHi?: string;
  audioText?: string;
  audioTextHi?: string;
};

export type Puja = {
  id: number;
  title: string;
  titleHi: string;
  category: PujaCategory;
  deity: string;
  deityHi: string;
  duration: string;
  rating: number;
  verified: boolean;
  overview: string;
  overviewHi: string;
  soundText: string;
  soundTextHi: string;
  samagri: SamagriItem[];
  steps: PujaStep[];
};

export const amazonSearchUrl = (itemName: string) => `https://www.amazon.com/s?k=${encodeURIComponent(itemName.trim().replace(/\s+/g, '+'))}`;

export const pujas: Puja[] = [
  {
    id: 1,
    title: 'Daily Shiva Puja',
    titleHi: 'दैनिक शिव पूजा',
    category: 'Daily',
    deity: 'Shiva',
    deityHi: 'शिव',
    duration: '15 mins',
    rating: 4.8,
    verified: true,
    soundText: 'Om Namah Shivaya. Om Namah Shivaya. Om Namah Shivaya.',
    soundTextHi: 'ॐ नमः शिवाय । ॐ नमः शिवाय । ॐ नमः शिवाय ।',
    overview: 'A simple daily puja dedicated to Lord Shiva for peace, clarity, and spiritual growth. Best performed in the morning after a bath.',
    overviewHi: 'शांति, स्पष्टता और आध्यात्मिक उन्नति के लिए भगवान शिव की सरल दैनिक पूजा। स्नान के बाद सुबह करना श्रेष्ठ माना जाता है।',
    samagri: [
      { id: 1, name: 'Shiva Linga or Idol', hindiName: 'शिवलिंग या शिव प्रतिमा' },
      { id: 2, name: 'Copper Kalash', hindiName: 'तांबे का कलश' },
      { id: 3, name: 'Raw Milk', hindiName: 'कच्चा दूध' },
      { id: 4, name: 'Bilva Patra', hindiName: 'बिल्व पत्र' },
      { id: 5, name: 'Sandalwood Paste', hindiName: 'चंदन' },
      { id: 6, name: 'Incense Sticks and Diya', hindiName: 'अगरबत्ती और दीपक' }
    ],
    steps: [
      { step: 1, title: 'Purification', titleHi: 'शुद्धिकरण', instruction: 'Sit facing East or North and take three small sips of water with a calm mind.', instructionHi: 'पूर्व या उत्तर दिशा की ओर बैठकर शांत मन से तीन बार जल ग्रहण करें।', mantra: 'Om Keshavaya Namah, Om Narayanaya Namah, Om Madhavaya Namah', mantraHi: 'ॐ केशवाय नमः । ॐ नारायणाय नमः । ॐ माधवाय नमः ।' },
      { step: 2, title: 'Sankalpa', titleHi: 'संकल्प', instruction: 'Hold water and rice in your right palm and state your intent for the puja.', instructionHi: 'दाहिने हाथ में जल और अक्षत लेकर पूजा का संकल्प करें।' },
      { step: 3, title: 'Abhishekam', titleHi: 'अभिषेक', instruction: 'Offer water, milk, and water again to the Shiva Linga while chanting.', instructionHi: 'शिवलिंग पर जल, दूध और पुनः जल अर्पित करते हुए मंत्र जप करें।', mantra: 'Om Namah Shivaya', mantraHi: 'ॐ नमः शिवाय' },
      { step: 4, title: 'Offerings', titleHi: 'उपचार', instruction: 'Offer sandalwood paste, bilva leaves, incense, and diya.', instructionHi: 'चंदन, बिल्व पत्र, अगरबत्ती और दीपक अर्पित करें।' },
      { step: 5, title: 'Aarti', titleHi: 'आरती', instruction: 'Perform aarti and ask forgiveness for any mistakes.', instructionHi: 'आरती करें और पूजा में हुई त्रुटियों के लिए क्षमा मांगें।' }
    ]
  },
  {
    id: 2,
    title: 'Satyanarayan Katha',
    titleHi: 'सत्यनारायण कथा',
    category: 'Occasion',
    deity: 'Vishnu',
    deityHi: 'विष्णु',
    duration: '90 mins',
    rating: 4.9,
    verified: true,
    soundText: 'Om Namo Bhagavate Vasudevaya. Shri Satyanarayan Bhagwan ki jai.',
    soundTextHi: 'ॐ नमो भगवते वासुदेवाय । श्री सत्यनारायण भगवान की जय ।',
    overview: 'A household puja for gratitude, prosperity, and auspicious beginnings, often performed on full moon days or family occasions.',
    overviewHi: 'कृतज्ञता, समृद्धि और शुभ शुरुआत के लिए की जाने वाली पारिवारिक पूजा, जो पूर्णिमा या मांगलिक अवसरों पर की जाती है।',
    samagri: [
      { id: 1, name: 'Satyanarayan Puja Book', hindiName: 'सत्यनारायण पूजा पुस्तक' },
      { id: 2, name: 'Banana Leaves', hindiName: 'केले के पत्ते' },
      { id: 3, name: 'Panchamrit Ingredients', hindiName: 'पंचामृत सामग्री' },
      { id: 4, name: 'Tulsi Leaves', hindiName: 'तुलसी पत्ते' },
      { id: 5, name: 'Fruits and Sweets', hindiName: 'फल और मिठाई' },
      { id: 6, name: 'Kalash Coconut Mango Leaves', hindiName: 'कलश नारियल आम पत्ते' }
    ],
    steps: [
      { step: 1, title: 'Kalash Sthapana', titleHi: 'कलश स्थापना', instruction: 'Place the kalash with mango leaves and coconut near the altar.', instructionHi: 'वेदी के पास आम के पत्ते और नारियल सहित कलश स्थापित करें।' },
      { step: 2, title: 'Ganesh Vandana', titleHi: 'गणेश वंदना', instruction: 'Begin with Lord Ganesha prayers for a smooth puja.', instructionHi: 'निर्विघ्न पूजा के लिए भगवान गणेश की वंदना करें।', mantra: 'Om Gan Ganapataye Namah', mantraHi: 'ॐ गण गणपतये नमः' },
      { step: 3, title: 'Katha Reading', titleHi: 'कथा पाठ', instruction: 'Read or listen to the Satyanarayan Katha with family.', instructionHi: 'परिवार के साथ सत्यनारायण कथा पढ़ें या सुनें।' },
      { step: 4, title: 'Prasad Offering', titleHi: 'प्रसाद अर्पण', instruction: 'Offer panchamrit, fruits, and sweets to Lord Vishnu.', instructionHi: 'भगवान विष्णु को पंचामृत, फल और मिठाई अर्पित करें।', mantra: 'Om Namo Bhagavate Vasudevaya', mantraHi: 'ॐ नमो भगवते वासुदेवाय' },
      { step: 5, title: 'Aarti and Distribution', titleHi: 'आरती और प्रसाद', instruction: 'Perform aarti and distribute prasad to everyone.', instructionHi: 'आरती करके सभी को प्रसाद वितरित करें।' }
    ]
  },
  {
    id: 3,
    title: 'Ganesh Chaturthi Sthapana',
    titleHi: 'गणेश चतुर्थी स्थापना',
    category: 'Festival',
    deity: 'Ganesha',
    deityHi: 'गणेश',
    duration: '45 mins',
    rating: 5,
    verified: true,
    soundText: 'Om Gan Ganapataye Namah. Vakratunda Mahakaya Suryakoti Samaprabha.',
    soundTextHi: 'ॐ गं गणपतये नमः । वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    overview: 'A festive installation and worship of Lord Ganesha for wisdom, auspiciousness, and removal of obstacles.',
    overviewHi: 'बुद्धि, शुभता और विघ्न निवारण के लिए भगवान गणेश की उत्सवपूर्ण स्थापना और पूजा।',
    samagri: [
      { id: 1, name: 'Eco Friendly Ganesh Idol', hindiName: 'इको फ्रेंडली गणेश प्रतिमा' },
      { id: 2, name: 'Red Cloth', hindiName: 'लाल कपड़ा' },
      { id: 3, name: 'Durva Grass', hindiName: 'दूर्वा घास' },
      { id: 4, name: 'Modak Sweets', hindiName: 'मोदक' },
      { id: 5, name: 'Marigold Garland', hindiName: 'गेंदा माला' },
      { id: 6, name: 'Camphor and Diya', hindiName: 'कपूर और दीपक' }
    ],
    steps: [
      { step: 1, title: 'Prepare the Seat', titleHi: 'आसन तैयार करें', instruction: 'Place red cloth on a clean platform and install the idol.', instructionHi: 'स्वच्छ चौकी पर लाल वस्त्र बिछाकर प्रतिमा स्थापित करें।' },
      { step: 2, title: 'Invoke Ganesha', titleHi: 'गणेश आवाहन', instruction: 'Invite Lord Ganesha with folded hands and a steady mind.', instructionHi: 'हाथ जोड़कर स्थिर मन से भगवान गणेश का आवाहन करें।', mantra: 'Om Gan Ganapataye Namah', mantraHi: 'ॐ गं गणपतये नमः । वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥' },
      { step: 3, title: 'Offer Durva and Modak', titleHi: 'दूर्वा और मोदक अर्पण', instruction: 'Offer durva grass, flowers, and modaks.', instructionHi: 'दूर्वा, पुष्प और मोदक अर्पित करें।' },
      { step: 4, title: 'Aarti', titleHi: 'आरती', instruction: 'Perform Ganesh aarti with camphor or diya.', instructionHi: 'कपूर या दीपक से गणेश आरती करें।', mantra: 'Jai Ganesh Deva', mantraHi: 'जय गणेश देवा' }
    ]
  },
  {
    id: 4,
    title: 'Navratri Ghatasthapana',
    titleHi: 'नवरात्रि घटस्थापना',
    category: 'Festival',
    deity: 'Durga',
    deityHi: 'दुर्गा',
    duration: '60 mins',
    rating: 4.7,
    verified: true,
    soundText: 'Ya Devi Sarva Bhuteshu Shakti Rupena Samsthita. Namastasyai Namastasyai Namastasyai Namo Namah.',
    soundTextHi: 'या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता । नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ।',
    overview: 'The sacred beginning of Navratri, invoking Maa Durga and establishing the kalash for nine days of devotion.',
    overviewHi: 'नवरात्रि का पावन आरंभ, जिसमें मां दुर्गा का आवाहन और नौ दिनों की साधना के लिए कलश स्थापना की जाती है।',
    samagri: [
      { id: 1, name: 'Clay Pot for Barley', hindiName: 'जौ बोने का मिट्टी पात्र' },
      { id: 2, name: 'Barley Seeds', hindiName: 'जौ' },
      { id: 3, name: 'Kalash', hindiName: 'कलश' },
      { id: 4, name: 'Coconut', hindiName: 'नारियल' },
      { id: 5, name: 'Red Chunri', hindiName: 'लाल चुनरी' },
      { id: 6, name: 'Durga Saptashati Book', hindiName: 'दुर्गा सप्तशती पुस्तक' }
    ],
    steps: [
      { step: 1, title: 'Clean the Space', titleHi: 'स्थान शुद्ध करें', instruction: 'Clean the altar and sprinkle water for purification.', instructionHi: 'पूजा स्थान साफ करके शुद्धि के लिए जल छिड़कें।' },
      { step: 2, title: 'Sow Barley', titleHi: 'जौ बोएं', instruction: 'Sow barley seeds in a clay pot as a sign of growth and abundance.', instructionHi: 'वृद्धि और समृद्धि के प्रतीक रूप में मिट्टी पात्र में जौ बोएं।' },
      { step: 3, title: 'Install Kalash', titleHi: 'कलश स्थापना', instruction: 'Place kalash with water, mango leaves, coconut, and red cloth.', instructionHi: 'जल, आम पत्ते, नारियल और लाल वस्त्र सहित कलश स्थापित करें।' },
      { step: 4, title: 'Durga Invocation', titleHi: 'दुर्गा आवाहन', instruction: 'Invoke Maa Durga and chant the mantra with devotion.', instructionHi: 'भक्ति भाव से मां दुर्गा का आवाहन करें और मंत्र जपें।', mantra: 'Ya Devi Sarva Bhuteshu Shakti Rupena Samsthita', mantraHi: 'या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता' }
    ]
  },
  {
    id: 5,
    title: 'Hanuman Chalisa Path',
    titleHi: 'हनुमान चालीसा पाठ',
    category: 'Daily',
    deity: 'Hanuman',
    deityHi: 'हनुमान',
    duration: '10 mins',
    rating: 4.9,
    verified: true,
    soundText: 'Shri Guru Charan Saroj Raj, Nij Man Mukur Sudhari. Jai Hanuman Gyan Gun Sagar.',
    soundTextHi: 'श्री गुरु चरण सरोज रज, निज मन मुकुर सुधारि । जय हनुमान ज्ञान गुन सागर ।',
    overview: 'A powerful daily recitation for courage, discipline, protection, and devotional strength.',
    overviewHi: 'साहस, अनुशासन, रक्षा और भक्ति शक्ति के लिए किया जाने वाला शक्तिशाली दैनिक पाठ।',
    samagri: [
      { id: 1, name: 'Hanuman Chalisa Book', hindiName: 'हनुमान चालीसा पुस्तक' },
      { id: 2, name: 'Sindoor', hindiName: 'सिंदूर' },
      { id: 3, name: 'Jasmine Oil', hindiName: 'चमेली का तेल' },
      { id: 4, name: 'Red Flowers', hindiName: 'लाल फूल' },
      { id: 5, name: 'Jaggery and Chana', hindiName: 'गुड़ और चना' },
      { id: 6, name: 'Diya and Incense', hindiName: 'दीपक और अगरबत्ती' }
    ],
    steps: [
      { step: 1, title: 'Light Diya', titleHi: 'दीप जलाएं', instruction: 'Light a diya and incense before Lord Hanuman.', instructionHi: 'भगवान हनुमान के समक्ष दीप और अगरबत्ती जलाएं।' },
      { step: 2, title: 'Offer Sindoor', titleHi: 'सिंदूर अर्पण', instruction: 'Offer sindoor, jasmine oil, and red flowers.', instructionHi: 'सिंदूर, चमेली का तेल और लाल फूल अर्पित करें।' },
      { step: 3, title: 'Chalisa Path', titleHi: 'चालीसा पाठ', instruction: 'Recite Hanuman Chalisa with focus and humility.', instructionHi: 'एकाग्रता और विनम्रता से हनुमान चालीसा का पाठ करें।', mantra: 'Shri Guru Charan Saroj Raj, Nij Man Mukur Sudhari', mantraHi: 'श्री गुरु चरण सरोज रज, निज मन मुकुर सुधारि' },
      { step: 4, title: 'Prasad', titleHi: 'प्रसाद', instruction: 'Offer jaggery and chana, then distribute prasad.', instructionHi: 'गुड़ और चना अर्पित करके प्रसाद वितरित करें।' }
    ]
  }
];

export const getPujaById = (id: number) => pujas.find((puja) => puja.id === id);
