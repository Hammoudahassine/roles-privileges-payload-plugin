import type { CollectionConfig } from 'payload'
import { translations } from '../translations/index.js'

/**
 * Available privilege types for all collection operations
 */
export type PrivilegeType =
  | 'admin'
  | 'create'
  | 'read'
  | 'readVersions'
  | 'update'
  | 'delete'
  | 'unlock'

/**
 * Interface for a single privilege
 */
export interface Privilege {
  privilegeKey: string
  label: Record<string, string>
  description: Record<string, string>
  isCustom?: boolean
}

/**
 * Interface for a collection's privileges
 */
export interface CollectionPrivileges {
  collectionSlug: string
  collectionLabel: Record<string, string>
  description: Record<string, string>
  privileges: {
    admin: Privilege
    create: Privilege
    read: Privilege
    readVersions: Privilege
    update: Privilege
    delete: Privilege
    unlock: Privilege
  }
}

/**
 * Map to store all generated privileges by collection slug
 */
export const allPrivilegesMap = new Map<string, CollectionPrivileges>()

/**
 * Generate privilege key from collection slug and operation
 */
export const generatePrivilegeKey = (collectionSlug: string, operation: PrivilegeType): string => {
  return `${collectionSlug}-${operation}`
}

/**
 * Capitalize first letter of a string
 */
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Get singular label from collection config or use slug
 */
const getSingularLabel = (collection: CollectionConfig): Record<string, string> => {
  if (collection.labels?.singular) {
    if (typeof collection.labels.singular === 'string') {
      // Return the string for all languages (will be used as fallback)
      return { _default: collection.labels.singular }
    }
    if (
      typeof collection.labels.singular === 'object' &&
      !Array.isArray(collection.labels.singular)
    ) {
      return collection.labels.singular as Record<string, string>
    }
  }

  // Default to slug
  return { _default: collection.slug }
}

/**
 * Get plural label from collection config or use slug
 */
const getPluralLabel = (collection: CollectionConfig): Record<string, string> => {
  if (collection.labels?.plural) {
    if (typeof collection.labels.plural === 'string') {
      // Return the string for all languages (will be used as fallback)
      return { _default: collection.labels.plural }
    }
    if (typeof collection.labels.plural === 'object' && !Array.isArray(collection.labels.plural)) {
      return collection.labels.plural as Record<string, string>
    }
  }

  // Default to slug
  return { _default: collection.slug }
}

/**
 * Get operation prefix translations for each language
 */
const getOperationPrefix = (operation: PrivilegeType, lang: string): string => {
  const langTranslations = translations[lang] || translations.en
  const key =
    `privilege-prefix-${operation}` as keyof (typeof langTranslations)['plugin-roles-privileges']
  return (
    (langTranslations['plugin-roles-privileges'][key] as string) ||
    (translations.en['plugin-roles-privileges'][key] as string)
  )
}

/**
 * Generate operation labels based on operation type
 */
const getOperationLabels = (
  operation: PrivilegeType,
  singularLabel: Record<string, string>,
): Record<string, string> => {
  const result: Record<string, string> = {}

  // Get all available languages from singularLabel
  const languages = Object.keys(singularLabel)

  for (const lang of languages) {
    const label = singularLabel[lang]
    const prefix = getOperationPrefix(operation, lang)
    result[lang] = operation === 'readVersions' ? `${prefix} ${label}` : `${prefix} ${label}`
  }

  return result
}

/**
 * Get operation description templates for each language
 */
const getOperationDescriptionTemplate = (
  operation: PrivilegeType,
  lang: string,
): { template: string; usePlural: boolean } => {
  const langTranslations = translations[lang] || translations.en
  const templateKey =
    `privilege-template-${operation}` as keyof (typeof langTranslations)['plugin-roles-privileges']
  const pluralKey =
    `privilege-template-${operation}-plural` as keyof (typeof langTranslations)['plugin-roles-privileges']

  const template =
    (langTranslations['plugin-roles-privileges'][templateKey] as string) ||
    (translations.en['plugin-roles-privileges'][templateKey] as string)
  const usePlural = (langTranslations['plugin-roles-privileges'][pluralKey] as string) === 'true'

  return { template, usePlural }
}

/**
 * Generate operation descriptions based on operation type
 */
const getOperationDescriptions = (
  operation: PrivilegeType,
  singularLabel: Record<string, string>,
  pluralLabel: Record<string, string>,
): Record<string, string> => {
  const result: Record<string, string> = {}

  // Get all available languages
  const languages = Object.keys(singularLabel)

  for (const lang of languages) {
    const { template, usePlural } = getOperationDescriptionTemplate(operation, lang)
    const labelToUse = usePlural ? pluralLabel[lang] : singularLabel[lang]
    result[lang] = template.replace('{label}', labelToUse.toLowerCase())
  }

  return result
}

/**
 * Generate a single privilege for a collection operation
 */
const generatePrivilege = (
  collectionSlug: string,
  operation: PrivilegeType,
  singularLabel: Record<string, string>,
  pluralLabel: Record<string, string>,
): Privilege => {
  return {
    privilegeKey: generatePrivilegeKey(collectionSlug, operation),
    label: getOperationLabels(operation, singularLabel),
    description: getOperationDescriptions(operation, singularLabel, pluralLabel),
  }
}

/**
 * Generate all CRUD privileges for a collection
 */
export const generateCollectionPrivileges = (
  collection: CollectionConfig,
): CollectionPrivileges => {
  const singularLabel = getSingularLabel(collection)
  const pluralLabel = getPluralLabel(collection)

  const description: Record<string, string> = {}
  const languages = Object.keys(pluralLabel)
  for (const lang of languages) {
    const plural = pluralLabel[lang].toLowerCase()
    const langTranslations = translations[lang] || translations.en
    const template =
      (langTranslations['plugin-roles-privileges']['privilege-collection-description'] as string) ||
      (translations.en['plugin-roles-privileges']['privilege-collection-description'] as string)
    description[lang] = template.replace('{label}', plural)
  }

  const collectionPrivileges: CollectionPrivileges = {
    collectionSlug: collection.slug,
    collectionLabel: pluralLabel,
    description,
    privileges: {
      admin: generatePrivilege(collection.slug, 'admin', singularLabel, pluralLabel),
      create: generatePrivilege(collection.slug, 'create', singularLabel, pluralLabel),
      read: generatePrivilege(collection.slug, 'read', singularLabel, pluralLabel),
      readVersions: generatePrivilege(collection.slug, 'readVersions', singularLabel, pluralLabel),
      update: generatePrivilege(collection.slug, 'update', singularLabel, pluralLabel),
      delete: generatePrivilege(collection.slug, 'delete', singularLabel, pluralLabel),
      unlock: generatePrivilege(collection.slug, 'unlock', singularLabel, pluralLabel),
    },
  }

  // Store in the map
  allPrivilegesMap.set(collection.slug, collectionPrivileges)

  return collectionPrivileges
}

/**
 * Get all privilege keys as a union type
 */
export const getAllPrivilegeKeys = (): string[] => {
  const keys: string[] = []
  allPrivilegesMap.forEach((collectionPrivileges) => {
    Object.values(collectionPrivileges.privileges).forEach((privilege) => {
      keys.push(privilege.privilegeKey)
    })
  })
  return keys
}

/**
 * Get all privileges as a flat array
 */
export const getAllPrivileges = (): Privilege[] => {
  const privileges: Privilege[] = []
  allPrivilegesMap.forEach((collectionPrivileges) => {
    Object.values(collectionPrivileges.privileges).forEach((privilege) => {
      privileges.push(privilege)
    })
  })
  return privileges
}
