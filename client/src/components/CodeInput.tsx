import React, { useState, useRef, useEffect } from 'react';
import { formatVerificationCode, isValidCode } from '../lib/masks';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onVerify: () => void;
  error?: boolean;
  onErrorClear?: () => void;
}

export default function CodeInput({ value, onChange, onVerify, error, onErrorClear }: CodeInputProps) {
  const [shake, setShake] = useState(false);
  const [localError, setLocalError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  useEffect(() => {
    if (error) {
      setLocalError(true);
      setShake(true);
      setTimeout(() => setShake(false), 420);
      // Вибрация на телефоне
      if (navigator.vibrate) navigator.vibrate(30);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatVerificationCode(raw);
    onChange(formatted);
    setLocalError(false);
    if (onErrorClear) onErrorClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isValidCode(value)) {
        onVerify();
      } else {
        setLocalError(true);
        setShake(true);
        setTimeout(() => setShake(false), 420);
        if (navigator.vibrate) navigator.vibrate(30);
        // Стираем код при ошибке
        setTimeout(() => {
          onChange('');
          setLocalError(false);
        }, 800);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`input-neon w-full text-center text-xl tracking-[0.5em] font-mono
            ${displayError ? 'border-red-500 border-2' : ''}
            ${shake ? 'animate-shake' : ''}
            transition-all duration-150`}
          placeholder="A-123456"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={8}
          autoFocus
        />
      </div>
      {displayError && (
        <div className="text-xs text-red-500 text-center animate-fade-in">
          Неверный код
        </div>
      )}
    </div>
  );
}
