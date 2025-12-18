import type { GlobalConfig } from 'payload'
import { translations } from '../translations/index.js'

/**
 * Available privilege types for all global operations
 */
export type GlobalPrivilegeType = 'read' | 'readDrafts' | 'readVersions' | 'update'

/**
 * Interface for a single privilege
 */
export interface GlobalPrivilege {
  privilegeKey: string
  label: Record<string, string>
  description: Record<string, string>
  isCustom?: boolean
}

/**
 * Interface for a global's privileges
 */
export interface GlobalPrivileges {
  globalSlug: string
  globalLabel: Record<string, string>
  description: Record<string, string>
  privileges: {
    read: GlobalPrivilege
    readDrafts: GlobalPrivilege
    readVersions: GlobalPrivilege
    update: GlobalPrivilege
  }
}

/**
 * Map to store all generated global privileges by global slug
 */
export const allGlobalPrivilegesMap = new Map<string, GlobalPrivileges>()

/**
 * Generate privilege key from global slug and operation
 */
export const generateGlobalPrivilegeKey = (
  globalSlug: string,
  operation: GlobalPrivilegeType,
): string => {
  return `${globalSlug}-${operation}`
}

/**
 * Capitalize first letter of a string
 */
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Get label from global config or use slug
 */
const getGlobalLabel = (global: GlobalConfig): Record<string, string> => {
  if (global.label) {
    if (typeof global.label === 'string') {
      // Return the string for all languages (will be used as fallback)
      return { _default: global.label }
    }
    if (typeof global.label === 'object' && !Array.isArray(global.label)) {
      return global.label as Record<string, string>
    }
  }

  // Default to slug
  return { _default: global.slug }
}

/**
 * Get operation prefix translations for each language
 */
const getGlobalOperationPrefix = (operation: GlobalPrivilegeType, lang: string): string => {
  const langTranslations = translations[lang] || translations.en
  const key =
    `privilege-prefix-global-${operation}` as keyof (typeof langTranslations)['plugin-roles-privileges']
  return (
    (langTranslations['plugin-roles-privileges'][key] as string) ||
    (translations.en['plugin-roles-privileges'][key] as string)
  )
}

/**
 * Generate operation labels based on operation type
 */
const getGlobalOperationLabels = (
  operation: GlobalPrivilegeType,
  label: Record<string, string>,
): Record<string, string> => {
  const result: Record<string, string> = {}

  // Get all available languages from label
  const languages = Object.keys(label)

  for (const lang of languages) {
    const labelText = label[lang]
    const prefix = getGlobalOperationPrefix(operation, lang)
    result[lang] = `${prefix} ${labelText}`
  }

  return result
}

/**
 * Get operation description templates for each language
 */
const getGlobalOperationDescriptionTemplate = (
  operation: GlobalPrivilegeType,
  lang: string,
): string => {
  const langTranslations = translations[lang] || translations.en
  const key =
    `privilege-template-global-${operation}` as keyof (typeof langTranslations)['plugin-roles-privileges']
  return (
    (langTranslations['plugin-roles-privileges'][key] as string) ||
    (translations.en['plugin-roles-privileges'][key] as string)
  )
}

/**
 * Generate operation descriptions based on operation type
 */
const getGlobalOperationDescriptions = (
  operation: GlobalPrivilegeType,
  label: Record<string, string>,
): Record<string, string> => {
  const result: Record<string, string> = {}

  // Get all available languages
  const languages = Object.keys(label)

  for (const lang of languages) {
    const labelText = label[lang].toLowerCase()
    const template = getGlobalOperationDescriptionTemplate(operation, lang)
    result[lang] = template.replace('{label}', labelText)
  }

  return result
}

/**
 * Generate a single privilege for a global operation
 */
const generateGlobalPrivilege = (
  globalSlug: string,
  operation: GlobalPrivilegeType,
  label: Record<string, string>,
): GlobalPrivilege => {
  return {
    privilegeKey: generateGlobalPrivilegeKey(globalSlug, operation),
    label: getGlobalOperationLabels(operation, label),
    description: getGlobalOperationDescriptions(operation, label),
  }
}

/**
 * Generate read and update privileges for a global
 */
export const generateGlobalPrivileges = (global: GlobalConfig): GlobalPrivileges => {
  const label = getGlobalLabel(global)

  const description: Record<string, string> = {}
  const languages = Object.keys(label)
  for (const lang of languages) {
    const labelText = label[lang].toLowerCase()
    const langTranslations = translations[lang] || translations.en
    const template =
      (langTranslations['plugin-roles-privileges']['privilege-global-description'] as string) ||
      (translations.en['plugin-roles-privileges']['privilege-global-description'] as string)
    description[lang] = template.replace('{label}', labelText)
  }

  const globalPrivileges: GlobalPrivileges = {
    globalSlug: global.slug,
    globalLabel: label,
    description,
    privileges: {
      read: generateGlobalPrivilege(global.slug, 'read', label),
      readDrafts: generateGlobalPrivilege(global.slug, 'readDrafts', label),
      readVersions: generateGlobalPrivilege(global.slug, 'readVersions', label),
      update: generateGlobalPrivilege(global.slug, 'update', label),
    },
  }

  // Store in the map
  allGlobalPrivilegesMap.set(global.slug, globalPrivileges)

  return globalPrivileges
}

/**
 * Get all global privilege keys
 */
export const getAllGlobalPrivilegeKeys = (): string[] => {
  const keys: string[] = []
  allGlobalPrivilegesMap.forEach((globalPrivileges) => {
    Object.values(globalPrivileges.privileges).forEach((privilege) => {
      keys.push(privilege.privilegeKey)
    })
  })
  return keys
}

/**
 * Get all global privileges as a flat array
 */
export const getAllGlobalPrivileges = (): GlobalPrivilege[] => {
  const privileges: GlobalPrivilege[] = []
  allGlobalPrivilegesMap.forEach((globalPrivileges) => {
    Object.values(globalPrivileges.privileges).forEach((privilege) => {
      privileges.push(privilege)
    })
  })
  return privileges
}
