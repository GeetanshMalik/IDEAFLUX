import React, { createContext, useState, useContext } from 'react';

// 1. The Dictionary of Translations
const translations = {
  en: {
    settings: "Settings",
    account: "Account",
    displayName: "Display Name",
    email: "Email Address",
    publicProfile: "Public Profile",
    preferences: "Preferences",
    darkMode: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    notif_likes: "Likes on your posts",
    notif_comments: "Comments on your posts",
    notif_follows: "New Followers",
    notif_mentions: "Mentions & Tags",
    privacy: "Privacy & Security",
    activityStatus: "Show Activity Status",
    blockedUsers: "Blocked Users",
    changePass: "Change Password",
    deleteAccount: "Delete Account",
    save: "Save Changes",
    help: "Help & Support",
    report: "Report a Problem"
  },
  hi: {
    settings: "सेटिंग्स",
    account: "खाता",
    displayName: "प्रदर्शन नाम",
    email: "ईमेल पता",
    publicProfile: "सार्वजनिक प्रोफ़ाइल",
    preferences: "प्राथमिकताएँ",
    darkMode: "डार्क मोड",
    language: "भाषा",
    notifications: "सूचनाएं",
    notif_likes: "आपकी पोस्ट पर लाइक",
    notif_comments: "आपकी पोस्ट पर टिप्पणियां",
    notif_follows: "नए फॉलोअर्स",
    notif_mentions: "मेंशन और टैग",
    privacy: "गोपनीयता और सुरक्षा",
    activityStatus: "सक्रिय स्थिति दिखाएं",
    blockedUsers: "ब्लॉक किए गए उपयोगकर्ता",
    changePass: "पासवर्ड बदलें",
    deleteAccount: "खाता हटाएं",
    save: "परिवर्तन सहेजें",
    help: "सहायता और समर्थन",
    report: "समस्या की रिपोर्ट करें"
  },
  es: {
    settings: "Configuración",
    account: "Cuenta",
    displayName: "Nombre para mostrar",
    email: "Correo electrónico",
    publicProfile: "Perfil público",
    preferences: "Preferencias",
    darkMode: "Modo oscuro",
    language: "Idioma",
    notifications: "Notificaciones",
    notif_likes: "Me gusta en tus publicaciones",
    notif_comments: "Comentarios en tus publicaciones",
    notif_follows: "Nuevos seguidores",
    notif_mentions: "Menciones y etiquetas",
    privacy: "Privacidad y seguridad",
    activityStatus: "Mostrar estado de actividad",
    blockedUsers: "Usuarios bloqueados",
    changePass: "Cambiar contraseña",
    deleteAccount: "Eliminar cuenta",
    save: "Guardar cambios",
    help: "Ayuda y soporte",
    report: "Reportar un problema"
  }
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default English

  // Helper function to get text
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);