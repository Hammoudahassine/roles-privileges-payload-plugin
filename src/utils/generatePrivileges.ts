import type { CollectionConfig } from 'payload'

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
 * Interface for a collection's privileges
 */
export interface CollectionPrivileges {
  collectionSlug: string
  collectionLabel: {
    en: string
    fr: string
  }
  description: {
    en: string
    fr: string
  }
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
 * Get singular label from collection config or generate from slug
 */
const getSingularLabel = (collection: CollectionConfig): { en: string; fr: string } => {
  if (collection.labels?.singular) {
    if (typeof collection.labels.singular === 'string') {
      return {
        en: collection.labels.singular,
        fr: collection.labels.singular,
      }
    }
    if (typeof collection.labels.singular === 'function') {
      const label = capitalize(collection.slug.replace(/-/g, ' '))
      return { en: label, fr: label }
    }
    const singularLabels = collection.labels.singular as Record<string, string>
    return {
      en: singularLabels.en || capitalize(collection.slug),
      fr: singularLabels.fr || capitalize(collection.slug),
    }
  }

  // Default to capitalized slug
  const label = capitalize(collection.slug.replace(/-/g, ' '))
  return { en: label, fr: label }
}

/**
 * Get plural label from collection config or generate from slug
 */
const getPluralLabel = (collection: CollectionConfig): { en: string; fr: string } => {
  if (collection.labels?.plural) {
    if (typeof collection.labels.plural === 'string') {
      return {
        en: collection.labels.plural,
        fr: collection.labels.plural,
      }
    }
    if (typeof collection.labels.plural === 'function') {
      const label = capitalize(collection.slug.replace(/-/g, ' ')) + 's'
      return { en: label, fr: label }
    }
    const pluralLabels = collection.labels.plural as Record<string, string>
    return {
      en: pluralLabels.en || capitalize(collection.slug) + 's',
      fr: pluralLabels.fr || capitalize(collection.slug) + 's',
    }
  }

  // Default to capitalized slug with 's'
  const label = capitalize(collection.slug.replace(/-/g, ' ')) + 's'
  return { en: label, fr: label }
}

/**
 * Generate operation labels based on operation type
 */
const getOperationLabels = (
  operation: PrivilegeType,
  singularLabel: { en: string; fr: string },
): { en: string; fr: string } => {
  const operationMap = {
    admin: {
      en: `Admin Access to ${singularLabel.en}`,
      fr: `Accès administrateur à ${singularLabel.fr}`,
    },
    create: {
      en: `Create ${singularLabel.en}`,
      fr: `Créer ${singularLabel.fr}`,
    },
    read: {
      en: `Read ${singularLabel.en}`,
      fr: `Lire ${singularLabel.fr}`,
    },
    readVersions: {
      en: `Read ${singularLabel.en} Versions`,
      fr: `Lire les versions de ${singularLabel.fr}`,
    },
    update: {
      en: `Update ${singularLabel.en}`,
      fr: `Modifier ${singularLabel.fr}`,
    },
    delete: {
      en: `Delete ${singularLabel.en}`,
      fr: `Supprimer ${singularLabel.fr}`,
    },
    unlock: {
      en: `Unlock ${singularLabel.en}`,
      fr: `Déverrouiller ${singularLabel.fr}`,
    },
  }
  return operationMap[operation]
}

/**
 * Generate operation descriptions based on operation type
 */
const getOperationDescriptions = (
  operation: PrivilegeType,
  singularLabel: { en: string; fr: string },
  pluralLabel: { en: string; fr: string },
): { en: string; fr: string } => {
  const descriptionMap = {
    admin: {
      en: `Access the ${pluralLabel.en.toLowerCase()} admin panel and UI`,
      fr: `Accéder au panneau d'administration et à l'interface utilisateur des ${pluralLabel.fr.toLowerCase()}`,
    },
    create: {
      en: `Ability to create new ${pluralLabel.en.toLowerCase()}`,
      fr: `Possibilité de créer de nouveaux ${pluralLabel.fr.toLowerCase()}`,
    },
    read: {
      en: `View ${singularLabel.en.toLowerCase()} content and information`,
      fr: `Voir le contenu et les informations de ${singularLabel.fr.toLowerCase()}`,
    },
    readVersions: {
      en: `Access and view previous versions of ${pluralLabel.en.toLowerCase()}`,
      fr: `Accéder et voir les versions précédentes des ${pluralLabel.fr.toLowerCase()}`,
    },
    update: {
      en: `Modify existing ${singularLabel.en.toLowerCase()} data`,
      fr: `Modifier les données existantes de ${singularLabel.fr.toLowerCase()}`,
    },
    delete: {
      en: `Remove ${pluralLabel.en.toLowerCase()} from the system`,
      fr: `Supprimer ${pluralLabel.fr.toLowerCase()} du système`,
    },
    unlock: {
      en: `Unlock ${pluralLabel.en.toLowerCase()} that are being edited by other users`,
      fr: `Déverrouiller ${pluralLabel.fr.toLowerCase()} en cours de modification par d'autres utilisateurs`,
    },
  }
  return descriptionMap[operation]
}

/**
 * Generate a single privilege for a collection operation
 */
const generatePrivilege = (
  collectionSlug: string,
  operation: PrivilegeType,
  singularLabel: { en: string; fr: string },
  pluralLabel: { en: string; fr: string },
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

  const collectionPrivileges: CollectionPrivileges = {
    collectionSlug: collection.slug,
    collectionLabel: pluralLabel,
    description: {
      en: `Manage ${pluralLabel.en.toLowerCase()} in the system`,
      fr: `Gérer ${pluralLabel.fr.toLowerCase()} dans le système`,
    },
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
