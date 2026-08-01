// Маски для телефона по странам
export const phoneMasks: Record<string, { mask: string; code: string; flag: string }> = {
  '7': { mask: '+7 (999) 999-99-99', code: 'RU', flag: '🇷🇺' },
  '1': { mask: '+1 (999) 999-99-99', code: 'US', flag: '🇺🇸' },
  '44': { mask: '+44 99 9999 9999', code: 'GB', flag: '🇬🇧' },
  '49': { mask: '+49 999 99999999', code: 'DE', flag: '🇩🇪' },
  '34': { mask: '+34 999 99 99 99', code: 'ES', flag: '🇪🇸' },
  '33': { mask: '+33 9 99 99 99 99', code: 'FR', flag: '🇫🇷' },
  '81': { mask: '+81 99-9999-9999', code: 'JP', flag: '🇯🇵' },
  '86': { mask: '+86 999 9999 9999', code: 'CN', flag: '🇨🇳' },
  // Добавляй любые страны по мере необходимости
};

// Определение страны по первым цифрам
export function getCountryCode(input: string): string | null {
  if (!input.startsWith('+')) return null;
  const digits = input.replace('+', '');
  for (let i = 4; i >= 1; i--) {
    const prefix = digits.slice(0, i);
    if (phoneMasks[prefix]) return prefix;
  }
  return null;
}

// Применение маски к телефону
export function applyPhoneMask(value: string): string {
  if (!value.startsWith('+')) return value;
  const digits = value.replace(/\D/g, '');
  const prefix = getCountryCode('+' + digits);
  if (!prefix) return value;
  
  const mask = phoneMasks[prefix].mask;
  let result = '';
  let digitIndex = 0;
  let isFirst = true;

  for (const char of mask) {
    if (char === '9') {
      if (digitIndex < digits.length - prefix.length) {
        result += digits[prefix.length + digitIndex];
        digitIndex++;
      } else if (isFirst) {
        result += ' ';
        isFirst = false;
      } else {
        break;
      }
    } else {
      if (char === '+') {
        result += '+';
        isFirst = false;
      } else if (char === ' ' || char === '(' || char === ')' || char === '-') {
        result += char;
      }
    }
  }
  return result;
}

// Код подтверждения: только A + 6 цифр
export function formatVerificationCode(value: string): string {
  // Убираем всё, кроме букв и цифр
  const clean = value.replace(/[^A-Za-z0-9]/g, '');
  if (clean.length === 0) return '';
  
  // Первый символ должен быть A
  let first = clean[0].toUpperCase();
  if (first !== 'A') first = 'A';
  
  // Остальное — только цифры
  let rest = clean.slice(1).replace(/\D/g, '');
  rest = rest.slice(0, 6);
  
  if (rest.length === 0) return first;
  return `${first}-${rest}`;
}

// Валидация кода: A-XXXXXX (ровно 8 символов)
export function isValidCode(code: string): boolean {
  return /^A-\d{6}$/.test(code);
}

// Валидация телефона: полная маска
export function isValidPhone(phone: string): boolean {
  // Проверяем, что телефон полностью соответствует маске
  const prefix = getCountryCode(phone);
  if (!prefix) return false;
  const mask = phoneMasks[prefix].mask;
  const cleanPhone = phone.replace(/\D/g, '');
  const cleanMask = mask.replace(/\D/g, '');
  return cleanPhone.length === cleanMask.length;
}
