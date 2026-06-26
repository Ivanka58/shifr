import React, { createContext, useContext, useState } from "react";

const translations = {
  ru: {
    slogan: "Безопасно. Анонимно. Без следов.",
    phoneLabel: "НОМЕР ТЕЛЕФОНА",
    phonePlaceholder: "+7 (999) 123-45-67",
    initiateBtn: "ИНИЦИИРОВАТЬ СВЯЗЬ",
    codeLabel: "КОД ПОДТВЕРЖДЕНИЯ",
    codePlaceholder: "A-123456",
    verifyBtn: "ВЕРИФИЦИРОВАТЬ",
    backBtn: "НАЗАД",
    sendBtn: "ОТПРАВИТЬ",
    editBtn: "РЕДАКТИРОВАТЬ",
    deleteBtn: "УДАЛИТЬ",
    deleteForAll: "УДАЛИТЬ ДЛЯ ВСЕХ",
    copyBtn: "КОПИРОВАТЬ",
    cancelBtn: "ОТМЕНА",
    saveBtn: "СОХРАНИТЬ",
    logoutBtn: "ВЫХОД",
    profileTitle: "ПРОФИЛЬ",
    settingsTitle: "НАСТРОЙКИ",
    adminTitle: "АДМИНИСТРАТОР",
    chatTitle: "ЗАЩИЩЁННЫЙ КАНАЛ",
    noMessages: "Нет сообщений. Начните диалог.",
    typeMessage: "Введите сообщение...",
    edited: "изм.",
    encrypted: "зашифровано",
    users: "ПОЛЬЗОВАТЕЛИ",
    security: "БЕЗОПАСНОСТЬ",
    doubleBottom: "ДВОЙНОЕ ДНО",
    panic: "ПАНИКА",
    nameLabel: "ИМЯ",
    colorLabel: "ЦВЕТ АВАТАРА",
    panicDesc: "Экстренная очистка всех данных сессии",
    panicBtn: "АКТИВИРОВАТЬ ПРОТОКОЛ ПАНИКИ",
    online: "В СЕТИ",
    offline: "НЕ В СЕТИ",
  },
  en: {
    slogan: "Secure. Anonymous. Untraceable.",
    phoneLabel: "PHONE NUMBER",
    phonePlaceholder: "+1 (555) 123-4567",
    initiateBtn: "INITIATE CONNECTION",
    codeLabel: "VERIFICATION CODE",
    codePlaceholder: "A-123456",
    verifyBtn: "VERIFY",
    backBtn: "BACK",
    sendBtn: "SEND",
    editBtn: "EDIT",
    deleteBtn: "DELETE",
    deleteForAll: "DELETE FOR ALL",
    copyBtn: "COPY",
    cancelBtn: "CANCEL",
    saveBtn: "SAVE",
    logoutBtn: "LOGOUT",
    profileTitle: "PROFILE",
    settingsTitle: "SETTINGS",
    adminTitle: "ADMIN",
    chatTitle: "SECURE CHANNEL",
    noMessages: "No messages. Start a conversation.",
    typeMessage: "Type a message...",
    edited: "edited",
    encrypted: "encrypted",
    users: "USERS",
    security: "SECURITY",
    doubleBottom: "DOUBLE BOTTOM",
    panic: "PANIC",
    nameLabel: "NAME",
    colorLabel: "AVATAR COLOR",
    panicDesc: "Emergency wipe of all session data",
    panicBtn: "ACTIVATE PANIC PROTOCOL",
    online: "ONLINE",
    offline: "OFFLINE",
  },
};

type Lang = "ru" | "en";

interface LangCtx {
  lang: Lang;
  t: typeof translations.ru;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangCtx>(null!);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("shifr_lang") as Lang) || "ru"
  );

  const setLang = (l: Lang) => {
    localStorage.setItem("shifr_lang", l);
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
