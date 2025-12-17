import type { GenericTranslationsObject } from '@payloadcms/translations'
import type { PluginDefaultTranslationsObject } from './types.js'

import { enTranslations } from './languages/en.js'
import { frTranslations } from './languages/fr.js'

type TranslationMap = {
  [key: string]: GenericTranslationsObject & PluginDefaultTranslationsObject
}

export const translations: TranslationMap = {
  ar: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  az: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  bg: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  ca: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  cs: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  da: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  de: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  en: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  es: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  et: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  fa: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  fr: frTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  he: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  hr: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  hu: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  hy: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  id: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  is: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  it: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  ja: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  ko: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  lt: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  lv: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  my: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  nb: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  nl: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  pl: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  pt: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  ro: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  rs: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  rsLatin: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  ru: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  sk: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  sl: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  sv: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  ta: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  th: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  tr: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  uk: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  vi: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  zh: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  zhTw: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  bnBd: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
  bnIn: enTranslations as GenericTranslationsObject & PluginDefaultTranslationsObject,
}
