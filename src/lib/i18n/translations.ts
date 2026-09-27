export type Language = 'en' | 'kn' | 'hi';

export interface TranslationDictionary {
  appName: string;
  appTagline: string;
  searchPlaceholder: string;
  currentLocation: string;
  liveData: string;
  demoData: string;
  dataUnavailable: string;
  lastUpdated: string;
  feelsLike: string;
  wind: string;
  humidity: string;
  uvIndex: string;
  visibility: string;
  pressure: string;
  airQuality: string;
  hourlyForecast: string;
  dailyForecast: string;
  smartWeatherScores: string;
  fitness: string;
  health: string;
  travel: string;
  family: string;
  agriculture: string;
  commute: string;
  events: string;
  beach: string;
  aiAssistant: string;
  askAssistant: string;
  notifications: string;
  savedLocations: string;
  alerts: string;
  profile: string;
  login: string;
  signUp: string;
  logout: string;
  viewDetails: string;
  rainProbability: string;
  good: string;
  moderate: string;
  poor: string;
  outdoorScore: string;
  fitnessScore: string;
  commuteScore: string;
  eventScore: string;
  travelScore: string;
  bestRunningWindow: string;
  settings: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: "Mausam",
    appTagline: "Smart Personalized Weather Intelligence",
    searchPlaceholder: "Search city, district, or pincode...",
    currentLocation: "Current Location",
    liveData: "LIVE DATA",
    demoData: "DEMO DATA",
    dataUnavailable: "Data unavailable for this location",
    lastUpdated: "Updated",
    feelsLike: "Feels like",
    wind: "Wind",
    humidity: "Humidity",
    uvIndex: "UV Index",
    visibility: "Visibility",
    pressure: "Pressure",
    airQuality: "Air Quality (AQI)",
    hourlyForecast: "Hourly Forecast",
    dailyForecast: "7-Day Weather Outlook",
    smartWeatherScores: "Smart Weather Scores",
    fitness: "Fitness & Outdoor",
    health: "Health & Allergy",
    travel: "Travel Intelligence",
    family: "Family & Safety",
    agriculture: "Agriculture & Soil",
    commute: "Daily Commute",
    events: "Event Planner",
    beach: "Beach & Marine",
    aiAssistant: "Mausam AI",
    askAssistant: "Ask Mausam AI a question...",
    notifications: "Weather Notifications",
    savedLocations: "Saved Locations",
    alerts: "Active Severe Alerts",
    profile: "Profile & Preferences",
    login: "Sign In",
    signUp: "Create Account",
    logout: "Sign Out",
    viewDetails: "View Details",
    rainProbability: "Rain Chance",
    good: "Good",
    moderate: "Moderate",
    poor: "Unfavorable",
    outdoorScore: "Outdoor Score",
    fitnessScore: "Fitness Score",
    commuteScore: "Commute Score",
    eventScore: "Event Comfort",
    travelScore: "Travel Score",
    bestRunningWindow: "Optimal Activity Window",
    settings: "Settings"
  },
  kn: {
    appName: "ಮೌಸಮ್",
    appTagline: "ಬುದ್ಧಿವಂತ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಹವಾಮಾನ ಮಾಹಿತಿ",
    searchPlaceholder: "ನಗರ, ಜಿಲ್ಲೆ ಅಥವಾ ಪಿನ್ ಕೋಡ್ ಹುಡುಕಿ...",
    currentLocation: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    liveData: "ಲೈವ್ ಡೇಟಾ",
    demoData: "ಡೆಮೊ ಡೇಟಾ",
    dataUnavailable: "ಈ ಸ್ಥಳಕ್ಕೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
    lastUpdated: "ನವೀಕರಿಸಲಾಗಿದೆ",
    feelsLike: "ಅನುಭವವಾಗುವ ತಾಪಮಾನ",
    wind: "ಗಾಳಿ",
    humidity: "ಆರ್ದ್ರತೆ",
    uvIndex: "ಯುವಿ ಸೂಚ್ಯಂಕ",
    visibility: "ಗೋಚರತೆ",
    pressure: "ವಾಯುಭಾರ",
    airQuality: "ವಾಯು ಗುಣಮಟ್ಟ (AQI)",
    hourlyForecast: "ಗಂಟೆಗಳ ಮುನ್ಸೂಚನೆ",
    dailyForecast: "7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
    smartWeatherScores: "ಬುದ್ಧಿವಂತ ಹವಾಮಾನ ಅಂಕಗಳು",
    fitness: "ಫಿಟ್‌ನೆಸ್ ಮತ್ತು ಹೊರಾಂಗಣ",
    health: "ಆರೋಗ್ಯ ಮತ್ತು ಅಲರ್ಜಿ",
    travel: "ಪ್ರಯಾಣ ಮಾಹಿತಿ",
    family: "ಕುಟುಂಬ ಮತ್ತು ಸುರಕ್ಷತೆ",
    agriculture: "ಕೃಷಿ ಮತ್ತು ಮಣ್ಣು",
    commute: "ದೈನಂದಿನ ಪ್ರಯಾಣ",
    events: "ಕಾರ್ಯಕ್ರಮ ಯೋಜನೆ",
    beach: "ಕಡಲತೀರ ಮತ್ತು ಕರಾವಳಿ",
    aiAssistant: "ಮೌಸಮ್ AI",
    askAssistant: "ಮೌಸಮ್ AI ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ...",
    notifications: "ಹವಾಮಾನ ಅಧಿಸೂಚನೆಗಳು",
    savedLocations: "ಉಳಿಸಿದ ಸ್ಥಳಗಳು",
    alerts: "ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು",
    profile: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆದ್ಯತೆಗಳು",
    login: "ಲಾಗಿನ್ ಮಾಡಿ",
    signUp: "ಖಾತೆ ತೆರೆಯಿರಿ",
    logout: "ಲಾಗ್ ಔಟ್",
    viewDetails: "ವಿವರಗಳನ್ನು ನೋಡಿ",
    rainProbability: "ಮಳೆಯ ಸಂಭವನೀಯತೆ",
    good: "ಉತ್ತಮ",
    moderate: "ಮಧ್ಯಮ",
    poor: "ಅನನುಕೂಲ",
    outdoorScore: "ಹೊರಾಂಗಣ ಅಂಕ",
    fitnessScore: "ಫಿಟ್‌ನೆಸ್ ಅಂಕ",
    commuteScore: "ಪ್ರಯಾಣ ಅಂಕ",
    eventScore: "ಕಾರ್ಯಕ್ರಮ ಅನುಕೂಲತೆ",
    travelScore: "ಪ್ರಯಾಣ ಅಂಕ",
    bestRunningWindow: "ಸೂಕ್ತ ಚಟುವಟಿಕೆ ಸಮಯ",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು"
  },
  hi: {
    appName: "मौसम",
    appTagline: "स्मार्ट व्यक्तिगत मौसम बुद्धिमत्ता",
    searchPlaceholder: "शहर, जिला या पिनकोड खोजें...",
    currentLocation: "वर्तमान स्थान",
    liveData: "लाइव डेटा",
    demoData: "डेमो डेटा",
    dataUnavailable: "इस स्थान के लिए डेटा उपलब्ध नहीं है",
    lastUpdated: "अद्यतन",
    feelsLike: "महसूस होता तापमान",
    wind: "हवा",
    humidity: "नमी",
    uvIndex: "यूवी इंडेक्स",
    visibility: "दृश्यता",
    pressure: "दबाव",
    airQuality: "वायु गुणवत्ता (AQI)",
    hourlyForecast: "प्रति घंटा पूर्वानुमान",
    dailyForecast: "7-दिवसीय मौसम दृष्टिकोण",
    smartWeatherScores: "स्मार्ट मौसम स्कोर",
    fitness: "फ़िटनेस और आउटडोर",
    health: "स्वास्थ्य और एलर्जी",
    travel: "यात्रा बुद्धिमत्ता",
    family: "परिवार और सुरक्षा",
    agriculture: "कृषि और मिट्टी",
    commute: "दैनिक आवागमन",
    events: "इवेंट प्लानर",
    beach: "समुद्र तट और समुद्री",
    aiAssistant: "मौसम AI",
    askAssistant: "मौसम AI से कोई सवाल पूछें...",
    notifications: "मौसम सूचनाएं",
    savedLocations: "सहेजे गए स्थान",
    alerts: "सक्रिय मौसम अलर्ट",
    profile: "प्रोफ़ाइल और प्राथमिकताएं",
    login: "साइन इन करें",
    signUp: "खाता बनाएं",
    logout: "साइन आउट",
    viewDetails: "विवरण देखें",
    rainProbability: "बारिश की संभावना",
    good: "अच्छा",
    moderate: "मध्यम",
    poor: "प्रतिकूल",
    outdoorScore: "आउटडोर स्कोर",
    fitnessScore: "फ़िटनेस स्कोर",
    commuteScore: "आवागमन स्कोर",
    eventScore: "इवेंट सुविधा स्कोर",
    travelScore: "यात्रा स्कोर",
    bestRunningWindow: "उत्कृष्ट गतिविधि समय",
    settings: "सेटिंग्स"
  }
};
