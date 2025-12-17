import type { GlobalConfig } from 'payload'

/**
 * Available privilege types for all global operations
 */
export type GlobalPrivilegeType = 'read' | 'readDrafts' | 'readVersions' | 'update'

/**
 * Interface for a single privilege
 */
export interface GlobalPrivilege {
  privilegeKey: string
  label: {
    en: string
    fr: string
  }
  description: {
    en: string
    fr: string
  }
}

/**
 * Interface for a global's privileges
 */
export interface GlobalPrivileges {
  globalSlug: string
  globalLabel: {
    en: string
    fr: string
  }
  description: {
    en: string
    fr: string
  }
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
 * Get label from global config or generate from slug
 */
const getGlobalLabel = (global: GlobalConfig): { en: string; fr: string } => {
  if (global.label) {
    if (typeof global.label === 'string') {
      return {
        en: global.label,
        fr: global.label,
      }
    }
    if (typeof global.label === 'function') {
      const label = capitalize(global.slug.replace(/-/g, ' '))
      return { en: label, fr: label }
    }
    const labels = global.label as Record<string, string>
    return {
      en: labels.en || capitalize(global.slug),
      fr: labels.fr || capitalize(global.slug),
    }
  }

  // Default to capitalized slug
  const label = capitalize(global.slug.replace(/-/g, ' '))
  return { en: label, fr: label }
}

/**
 * Generate operation labels based on operation type
 */
const getGlobalOperationLabels = (
  operation: GlobalPrivilegeType,
  label: { en: string; fr: string },
): { en: string; fr: string } => {
  const operationMap = {
    read: {
      en: `Read ${label.en}`,
      fr: `Lire ${label.fr}`,
    },
    readDrafts: {
      en: `Read ${label.en} Drafts`,
      fr: `Lire les brouillons de ${label.fr}`,
    },
    readVersions: {
      en: `Read ${label.en} Versions`,
      fr: `Lire les versions de ${label.fr}`,
    },
    update: {
      en: `Update ${label.en}`,
      fr: `Modifier ${label.fr}`,
    },
  }
  return operationMap[operation]
}

/**
 * Generate operation descriptions based on operation type
 */
const getGlobalOperationDescriptions = (
  operation: GlobalPrivilegeType,
  label: { en: string; fr: string },
): { en: string; fr: string } => {
  const descriptionMap = {
    read: {
      en: `View ${label.en.toLowerCase()} content and settings`,
      fr: `Voir le contenu et les paramètres de ${label.fr.toLowerCase()}`,
    },
    readDrafts: {
      en: `Access and view draft versions of ${label.en.toLowerCase()}`,
      fr: `Accéder et voir les brouillons de ${label.fr.toLowerCase()}`,
    },
    readVersions: {
      en: `Access and view previous versions of ${label.en.toLowerCase()}`,
      fr: `Accéder et voir les versions précédentes de ${label.fr.toLowerCase()}`,
    },
    update: {
      en: `Modify ${label.en.toLowerCase()} settings and data`,
      fr: `Modifier les paramètres et données de ${label.fr.toLowerCase()}`,
    },
  }
  return descriptionMap[operation]
}

/**
 * Generate a single privilege for a global operation
 */
const generateGlobalPrivilege = (
  globalSlug: string,
  operation: GlobalPrivilegeType,
  label: { en: string; fr: string },
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

  const globalPrivileges: GlobalPrivileges = {
    globalSlug: global.slug,
    globalLabel: label,
    description: {
      en: `Manage ${label.en.toLowerCase()} global settings`,
      fr: `Gérer les paramètres globaux de ${label.fr.toLowerCase()}`,
    },
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
