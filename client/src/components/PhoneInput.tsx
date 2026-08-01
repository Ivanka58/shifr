import React, { useState, useRef } from 'react';
import { phoneMasks, getCountryCode, applyPhoneMask, isValidPhone } from '../lib/masks';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

export default function PhoneInput({ value, onChange, onEnter }: PhoneInputProps) {
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    // Убираем всё, кроме цифр и плюса
    raw = raw.replace(/[^+\d]/g, '');
    
    // Если пользователь начал вводить без +, добавляем
    if (raw.length > 0 && !raw.startsWith('+')) {
      raw = '+' + raw;
    }
    
    // Применяем маску
    const masked = applyPhoneMask(raw);
    onChange(masked);
    
    // Валидация
    if (masked.length > 3) {
      setIsValid(isValidPhone(masked));
    } else {
      setIsValid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnter) {
      if (isValidPhone(value)) {
        onEnter();
      } else {
        setIsValid(false);
        inputRef.current?.classList.add('animate-shake');
        setTimeout(() => inputRef.current?.classList.remove('animate-shake'), 420);
      }
    }
  };

  // Определяем страну для отображения флага
  const prefix = getCountryCode(value);
  const countryInfo = prefix ? phoneMasks[prefix] : null;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="tel"
            className={`input-neon w-full pl-16 ${!isValid ? 'border-red-500' : ''}`}
            placeholder="+7 (999) 999-99-99"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={30}
            autoFocus
          />
          {/* Флаг и код страны */}
          {countryInfo && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <span className="text-sm">{countryInfo.flag}</span>
              <span className="text-xs opacity-40">{countryInfo.code}</span>
            </div>
          )}
          {/* Красный крестик при неверном коде */}
          {!isValid && value.length > 3 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">
              ❌
            </div>
          )}
        </div>
      </div>
      {!isValid && value.length > 3 && (
        <div className="text-xs text-red-500 mt-1 animate-fade-in">
          Проверьте правильность написания номера
        </div>
      )}
    </div>
  );
}
