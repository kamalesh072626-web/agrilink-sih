import React, { createContext, useContext, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🚩' },
];

const translations = {
  en: {
    // Nav Labels
    'nav.brand': 'AgriLink',
    'nav.tagline': 'Smart Mandi & Price Discovery',
    'nav.dashboard': 'Farmer Dashboard',
    'nav.buyerDashboard': 'Buyer Dashboard',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.marketIntelligence': 'Market Intelligence',
    'nav.priceForecast': 'AI Price Forecast',
    'nav.buyerMatching': 'Buyer Matching',
    'nav.createLot': 'Digitize Harvest Lot',
    'nav.offerInbox': 'Offer Inbox',
    'nav.transactions': 'Transaction Tracking',
    'nav.grievances': 'Grievances & Support',
    'nav.login': 'Log In',
    'nav.signup': 'Create Account',
    'nav.logout': 'Sign Out',
    'nav.guestMode': 'Demo / Guest Mode',

    // Landing Hero
    'hero.title': 'Empowering Farmers with True Net Price Discovery',
    'hero.tagline': 'Maximize your crop profits by cutting out middlemen and calculating real net returns after freight and storage.',
    'hero.formulaTitle': 'Net Realisation Formula',
    'hero.formula': 'Net Income = Gross Mandi Price − Transport Freight − Storage Fees',

    // Farmer Dashboard
    'farmer.kpi.currentMandiPrice': 'Current Mandi Price',
    'farmer.kpi.expectedPrice': 'Expected 7-Day Price',
    'farmer.kpi.transportDeductions': 'Transport Deductions',
    'farmer.kpi.netRealisation': 'Net Realisation',
    'farmer.aiRecommendation': 'AI Selling Window Recommendation',
    'farmer.sellingWindow': 'WAIT 3-5 DAYS',
    'farmer.mandiTable': 'Nearby Mandi Comparison Table',
    'farmer.myLots': 'My Lots',
    'farmer.matchedBuyers': 'Matched Buyers Preview',

    // Buyer Dashboard
    'buyer.kpi.activeInquiries': 'Active Purchase Inquiries',
    'buyer.kpi.pendingLots': 'Pending Lots in Region',
    'buyer.kpi.avgPurchasePrice': 'Average Purchase Price',
    'buyer.kpi.fulfillmentRate': 'Fulfillment Rate',
    'buyer.availableLots': 'Available Farmer Crop Lots',
    'buyer.makeOffer': 'Make an Offer',
    'buyer.directContracts': 'Direct Contract Requests',
    'buyer.logisticsPickup': 'Logistics Pickup Status',

    // Admin Dashboard
    'admin.kpi.registeredFarmers': 'Total Registered Farmers',
    'admin.kpi.activeBuyers': 'Total Active Buyers',
    'admin.kpi.arrivalVolume': 'Mandi Daily Arrival Volume',
    'admin.kpi.openDisputes': 'Open Dispute Tickets',
    'admin.rateSync': 'Mandi Rate Sync Table',
    'admin.disputeQueue': 'Dispute Resolution Queue',
    'admin.buyerVerification': 'Buyer Verification & Trust Score Review',

    // Top KPIs & Section Titles
    'kpi.optimalMarket': 'Optimal Market Destination',
    'kpi.netRealisation': 'Net Farmer Realisation',
    'kpi.transportSaved': 'Transport Leakage Saved',
    'kpi.verifiedBuyers': 'Active Verified Buyers',
    'kpi.estimatedHarvest': 'Harvest Volume',
    'kpi.bestBuyer': 'Top Net Buyer Offer',
    'kpi.storageDays': 'Storage Days',

    'title.welcome': 'Welcome back',
    'title.nashikLocation': 'Nashik (Dindori Road), Maharashtra • Tomato Harvest',
    'title.transactionTimeline': 'Active Transaction Timeline',
    'title.grievancePortal': 'Help Desk & Grievance Portal',

    // General Controls
    'common.language': 'Language',
    'common.farmer': 'Farmer / FPO',
    'common.buyer': 'Buyer / Trader',
    'common.admin': 'APMC Admin',
    'common.status': 'Status',
    'common.action': 'Action',
    'common.submit': 'Submit',
    'common.update': 'Update Rate',
    'common.refresh': 'Refresh Data',
    'common.loading': 'Loading AgriLink intelligence...',
  },
  hi: {
    // Nav Labels
    'nav.brand': 'एग्रीलिंक',
    'nav.tagline': 'स्मार्ट मंडी और मूल्य खोज',
    'nav.dashboard': 'किसान डैशबोर्ड',
    'nav.buyerDashboard': 'खरीदार डैशबोर्ड',
    'nav.adminDashboard': 'प्रशासक डैशबोर्ड',
    'nav.marketIntelligence': 'मंडी बुद्धिमत्ता',
    'nav.priceForecast': 'AI मूल्य पूर्वानुमान',
    'nav.buyerMatching': 'सत्यापित खरीदार मिलान',
    'nav.createLot': 'फसल लॉट दर्ज करें',
    'nav.offerInbox': 'प्राप्त प्रस्ताव (इनबॉक्स)',
    'nav.transactions': 'लेनदेन ट्रैकिंग',
    'nav.grievances': 'शिकायत व सहायता',
    'nav.login': 'लॉग इन',
    'nav.signup': 'खाता बनाएं',
    'nav.logout': 'साइन आउट',
    'nav.guestMode': 'डेमो मोड',

    // Landing Hero
    'hero.title': 'वास्तविक शुद्ध मूल्य खोज के साथ किसानों का सशक्तिकरण',
    'hero.tagline': 'बिचौलियों को हटाकर और माल भाड़ा तथा भंडारण के बाद वास्तविक शुद्ध आय की गणना करके अपनी फसल का लाभ बढ़ाएं।',
    'hero.formulaTitle': 'शुद्ध आय सूत्र',
    'hero.formula': 'शुद्ध आय = सकल मंडी मूल्य − परिवहन भाड़ा − भंडारण शुल्क',

    // Farmer Dashboard
    'farmer.kpi.currentMandiPrice': 'वर्तमान मंडी भाव',
    'farmer.kpi.expectedPrice': '7-दिवसीय अनुमानित भाव',
    'farmer.kpi.transportDeductions': 'परिवहन कटौती',
    'farmer.kpi.netRealisation': 'शुद्ध किसान आय',
    'farmer.aiRecommendation': 'AI बिक्री समय अनुशंसा',
    'farmer.sellingWindow': '3-5 दिन प्रतीक्षा करें',
    'farmer.mandiTable': 'निकटतम मंडी तुलना तालिका',
    'farmer.myLots': 'मेरे फसल लॉट',
    'farmer.matchedBuyers': 'उपयुक्त खरीदार पूर्वावलोकन',

    // Buyer Dashboard
    'buyer.kpi.activeInquiries': 'सक्रिय खरीद पूछताछ',
    'buyer.kpi.pendingLots': 'क्षेत्र में उपलब्ध लॉट',
    'buyer.kpi.avgPurchasePrice': 'औसत खरीद मूल्य',
    'buyer.kpi.fulfillmentRate': 'पूर्ति दर',
    'buyer.availableLots': 'उपलब्ध किसान फसल लॉट',
    'buyer.makeOffer': 'प्रस्ताव भेजें',
    'buyer.directContracts': 'प्रत्यक्ष अनुबंध अनुरोध',
    'buyer.logisticsPickup': 'रसद पिकअप स्थिति',

    // Admin Dashboard
    'admin.kpi.registeredFarmers': 'कुल पंजीकृत किसान',
    'admin.kpi.activeBuyers': 'कुल सक्रिय खरीदार',
    'admin.kpi.arrivalVolume': 'दैनिक मंडी आवक मात्रा',
    'admin.kpi.openDisputes': 'लंबित शिकायतें',
    'admin.rateSync': 'मंडी दर सिंक तालिका',
    'admin.disputeQueue': 'शिकायत निवारण सूची',
    'admin.buyerVerification': 'खरीदार सत्यापन एवं ट्रस्ट स्कोर समीक्षा',

    // Top KPIs & Section Titles
    'kpi.optimalMarket': 'सर्वश्रेष्ठ मंडी गंतव्य',
    'kpi.netRealisation': 'शुद्ध किसान आय',
    'kpi.transportSaved': 'बचाया गया परिवहन खर्च',
    'kpi.verifiedBuyers': 'सक्रिय सत्यापित खरीदार',
    'kpi.estimatedHarvest': 'फसल की मात्रा',
    'kpi.bestBuyer': 'सर्वोत्तम शुद्ध बोली',
    'kpi.storageDays': 'भंडारण दिन',

    'title.welcome': 'स्वागत है',
    'title.nashikLocation': 'नासिक (दिंडोरी रोड), महाराष्ट्र • टमाटर फसल',
    'title.transactionTimeline': 'सक्रिय लेनदेन समयरेखा',
    'title.grievancePortal': 'सहायता व शिकायत निवारण पोर्टल',

    // General Controls
    'common.language': 'भाषा',
    'common.farmer': 'किसान / एफपीओ',
    'common.buyer': 'खरीदार / व्यापारी',
    'common.admin': 'मंडी प्रशासक',
    'common.status': 'स्थिति',
    'common.action': 'कार्रवाई',
    'common.submit': 'जमा करें',
    'common.update': 'अद्यतन करें',
    'common.refresh': 'डेटा रीफ्रेश करें',
    'common.loading': 'एग्रीलिंक जानकारी लोड हो रही है...',
  },
  mr: {
    // Nav Labels
    'nav.brand': 'अॅग्रीलिंक',
    'nav.tagline': 'स्मार्ट बाजार समिती आणि दर शोध',
    'nav.dashboard': 'शेतकरी डॅशबोर्ड',
    'nav.buyerDashboard': 'खरेदीदार डॅशबोर्ड',
    'nav.adminDashboard': 'प्रशासक डॅशबोर्ड',
    'nav.marketIntelligence': 'बाजार बुद्धिमत्ता',
    'nav.priceForecast': 'AI दर अंदाज',
    'nav.buyerMatching': 'सत्यापित खरेदीदार जुळणी',
    'nav.createLot': 'शेतमाल लॉट नोंदणी',
    'nav.offerInbox': 'प्राप्त ऑफर्स',
    'nav.transactions': 'व्यवहार ट्रॅकिंग',
    'nav.grievances': 'तक्रार निवारण केंद्र',
    'nav.login': 'लॉग इन',
    'nav.signup': 'खाते तयार करा',
    'nav.logout': 'साइन आउट',
    'nav.guestMode': 'डेमो मोड',

    // Landing Hero
    'hero.title': 'खऱ्या निव्वळ दर शोधासह शेतकऱ्यांचे सक्षमीकरण',
    'hero.tagline': 'मध्यस्थांना हटवून आणि वाहतूक व साठवणूक खर्चांनंतर खऱ्या निव्वळ उत्पन्नाची गणना करून पिकाचा नफा वाढवा.',
    'hero.formulaTitle': 'निव्वळ उत्पन्न सूत्र',
    'hero.formula': 'निव्वळ उत्पन्न = एकूण बाजार भाव − वाहतूक खर्च − साठवणूक फी',

    // Farmer Dashboard
    'farmer.kpi.currentMandiPrice': 'सध्याचा बाजार भाव',
    'farmer.kpi.expectedPrice': '७-दिवसांचा अंदाजित भाव',
    'farmer.kpi.transportDeductions': 'वाहतूक खर्च कपात',
    'farmer.kpi.netRealisation': 'निव्वळ शेतकरी उत्पन्न',
    'farmer.aiRecommendation': 'AI विक्री वेळ शिफारस',
    'farmer.sellingWindow': '३-५ दिवस थांबा',
    'farmer.mandiTable': 'जवळच्या बाजार समित्या तुलना तक्ता',
    'farmer.myLots': 'माझे शेतमाल लॉट्स',
    'farmer.matchedBuyers': 'जुळणारे खरेदीदार',

    // Buyer Dashboard
    'buyer.kpi.activeInquiries': 'सक्रिय खरेदी चौकशी',
    'buyer.kpi.pendingLots': 'क्षेत्रातील उपलब्ध लॉट्स',
    'buyer.kpi.avgPurchasePrice': 'सरासरी खरेदी दर',
    'buyer.kpi.fulfillmentRate': 'पूर्तता दर',
    'buyer.availableLots': 'उपलब्ध शेतकरी शेतमाल लॉट्स',
    'buyer.makeOffer': 'ऑफर द्या',
    'buyer.directContracts': 'थेट कंत्राट विनंत्या',
    'buyer.logisticsPickup': 'वाहतूक पिकअप स्थिती',

    // Admin Dashboard
    'admin.kpi.registeredFarmers': 'एकूण नोंदणीकृत शेतकरी',
    'admin.kpi.activeBuyers': 'एकूण सक्रिय खरेदीदार',
    'admin.kpi.arrivalVolume': 'दैनंदिन बाजार आवक',
    'admin.kpi.openDisputes': 'प्रलंबित तक्रारी',
    'admin.rateSync': 'बाजार समिती दर अद्ययावत तक्ता',
    'admin.disputeQueue': 'तक्रार निवारण रांग',
    'admin.buyerVerification': 'खरेदीदार पडताळणी आणि ट्रस्ट स्कोर पुनरावलोकन',

    // Top KPIs & Section Titles
    'kpi.optimalMarket': 'सर्वोत्तम बाजार समिती',
    'kpi.netRealisation': 'निव्वळ शेतकरी उत्पन्न',
    'kpi.transportSaved': 'वाहतूक खर्चात बचत',
    'kpi.verifiedBuyers': 'सक्रिय नोंदणीकृत खरेदीदार',
    'kpi.estimatedHarvest': 'एकूण शेतमाल उत्पादन',
    'kpi.bestBuyer': 'सर्वोत्तम निव्वळ बोली',
    'kpi.storageDays': 'साठवणुकीचे दिवस',

    'title.welcome': 'सस्नेह नमस्कार',
    'title.nashikLocation': 'नाशिक (दिंडोरी रोड), महाराष्ट्र • टोमॅटो पीक',
    'title.transactionTimeline': 'सक्रिय व्यवहार टाइमलाइन',
    'title.grievancePortal': 'तक्रार निवारण पोर्टल',

    // General Controls
    'common.language': 'भाषा',
    'common.farmer': 'शेतकरी / एफपीओ',
    'common.buyer': 'खरेदीदार / व्यापारी',
    'common.admin': 'बाजार समिती अधिकारी',
    'common.status': 'स्थिती',
    'common.action': 'कृती',
    'common.submit': 'सबमिट करा',
    'common.update': 'अद्ययावत करा',
    'common.refresh': 'माहिती अद्ययावत करा',
    'common.loading': 'अॅग्रीलिंक माहिती लोड होत आहे...',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Global LanguageSelector component for Top Header
export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shadow-sm">
        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200 py-1">
              {lang.flag} {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
