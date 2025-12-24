import React, { createContext, useContext, useState, useEffect } from 'react';

// Import all 18 languages
import { en } from '../translations/en';
import { hi } from '../translations/hi';
import { es } from '../translations/es';
import { de } from '../translations/de';
import { fr } from '../translations/fr';
import { it } from '../translations/it';
import { pt } from '../translations/pt';
import { ru } from '../translations/ru';
import { bn } from '../translations/bn';
import { te } from '../translations/te';
import { mr } from '../translations/mr';
import { ta } from '../translations/ta';
import { gu } from '../translations/gu';
import { kn } from '../translations/kn';
import { ja } from '../translations/ja';
import { ko } from '../translations/ko';
import { zh } from '../translations/zh';
import { ar } from '../translations/ar';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const translations = { en, hi, es, de, fr, it, pt, ru, bn, te, mr, ta, gu, kn, ja, ko, zh, ar };

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ideaflux_language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const t = (key, params = {}) => {
    const currentTranslations = translations[currentLanguage] || translations.en;
    let translation = currentTranslations[key] || translations.en[key] || key;
    
    // Handle parameter substitution (e.g., {{count}})
    if (params && typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }
    
    return translation;
  };
  
  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('ideaflux_language', languageCode);
    } else {
      console.warn(`Language ${languageCode} not found, falling back to English`);
      setCurrentLanguage('en');
    }
  };

  const availableLanguages = [
    { code: 'en', name: 'English', flag: 'US', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: 'IN', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', flag: 'ES', nativeName: 'Español' },
    { code: 'de', name: 'German', flag: 'DE', nativeName: 'Deutsch' },
    { code: 'fr', name: 'French', flag: 'FR', nativeName: 'Français' },
    { code: 'it', name: 'Italian', flag: 'IT', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', flag: 'PT', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', flag: 'RU', nativeName: 'Русский' },
    { code: 'bn', name: 'Bengali', flag: 'BD', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', flag: 'IN', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', flag: 'IN', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', flag: 'IN', nativeName: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', flag: 'IN', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', flag: 'IN', nativeName: 'ಕನ್ನಡ' },
    { code: 'ja', name: 'Japanese', flag: 'JP', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', flag: 'KR', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', flag: 'CN', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', flag: 'SA', nativeName: 'العربية' }
  ];

  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  };

  const value = {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    getCurrentLanguageInfo,
    isRTL: () => currentLanguage === 'ar',
    translations: translations[currentLanguage] || translations.en,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;