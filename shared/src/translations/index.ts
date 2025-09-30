import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { it } from './it';
import { pt } from './pt';
import { nl } from './nl';
import { pl } from './pl';
import { ru } from './ru';
import { ar } from './ar';
import { zh } from './zh';
import { ja } from './ja';
import { ko } from './ko';
import { hi } from './hi';

export const translations = {
  en,
  es,
  fr,
  de,
  it,
  pt,
  nl,
  pl,
  ru,
  ar,
  zh,
  ja,
  ko,
  hi,
};

export type SupportedLanguage = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl' | 'pl' | 'ru' | 'ar' | 'zh' | 'ja' | 'ko' | 'hi'
  | 'th' | 'vi' | 'tr' | 'sv' | 'no' | 'da' | 'fi' | 'cs' | 'sk' | 'hu' | 'ro' | 'bg' | 'hr' | 'sl'
  | 'et' | 'lv' | 'lt' | 'uk' | 'be' | 'ka' | 'hy' | 'az' | 'kk' | 'ky' | 'uz' | 'mn' | 'bn' | 'ur'
  | 'fa' | 'he' | 'sw' | 'am' | 'yo' | 'ig' | 'ha' | 'zu' | 'af' | 'sq' | 'mk' | 'mt' | 'is' | 'ga'
  | 'cy' | 'eu' | 'ca' | 'gl' | 'pt-BR' | 'es-AR' | 'es-MX' | 'fr-CA' | 'en-GB' | 'en-AU' | 'en-CA'
  | 'zh-TW' | 'zh-HK';

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪', nativeName: 'Svenska' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴', nativeName: 'Norsk' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰', nativeName: 'Dansk' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮', nativeName: 'Suomi' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿', nativeName: 'Čeština' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰', nativeName: 'Slovenčina' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺', nativeName: 'Magyar' },
  { code: 'ro', name: 'Română', flag: '🇷🇴', nativeName: 'Română' },
  { code: 'bg', name: 'Български', flag: '🇧🇬', nativeName: 'Български' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷', nativeName: 'Hrvatski' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮', nativeName: 'Slovenščina' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹', nativeName: 'Lietuvių' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦', nativeName: 'Українська' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾', nativeName: 'Беларуская' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪', nativeName: 'ქართული' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿', nativeName: 'Azərbaycan' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿', nativeName: 'Қазақша' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬', nativeName: 'Кыргызча' },
  { code: 'uz', name: 'Oʻzbekcha', flag: '🇺🇿', nativeName: 'Oʻzbekcha' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳', nativeName: 'Монгол' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩', nativeName: 'বাংলা' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', nativeName: 'اردو' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷', nativeName: 'فارسی' },
  { code: 'he', name: 'עברית', flag: '🇮🇱', nativeName: 'עברית' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿', nativeName: 'Kiswahili' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹', nativeName: 'አማርኛ' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬', nativeName: 'Igbo' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', nativeName: 'Hausa' },
  { code: 'zu', name: 'IsiZulu', flag: '🇿🇦', nativeName: 'IsiZulu' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦', nativeName: 'Afrikaans' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱', nativeName: 'Shqip' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰', nativeName: 'Македонски' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹', nativeName: 'Malti' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸', nativeName: 'Íslenska' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪', nativeName: 'Gaeilge' },
  { code: 'cy', name: 'Cymraeg', flag: '🇬🇧', nativeName: 'Cymraeg' },
  { code: 'eu', name: 'Euskera', flag: '🇪🇸', nativeName: 'Euskera' },
  { code: 'ca', name: 'Català', flag: '🇪🇸', nativeName: 'Català' },
  { code: 'gl', name: 'Galego', flag: '🇪🇸', nativeName: 'Galego' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'es-AR', name: 'Español (Argentina)', flag: '🇦🇷', nativeName: 'Español' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽', nativeName: 'Español' },
  { code: 'fr-CA', name: 'Français (Canada)', flag: '🇨🇦', nativeName: 'Français' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', nativeName: 'English' },
  { code: 'en-AU', name: 'English (Australia)', flag: '🇦🇺', nativeName: 'English' },
  { code: 'en-CA', name: 'English (Canada)', flag: '🇨🇦', nativeName: 'English' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },
  { code: 'zh-HK', name: '繁體中文 (香港)', flag: '🇭🇰', nativeName: '繁體中文' },
];
