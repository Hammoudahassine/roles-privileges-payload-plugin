import type { GlobalPrivilege } from './generateGlobalPrivileges.js'
import type { Privilege } from './generatePrivileges.js'

/**
 * Storage for custom privileges that should appear in the UI
 * Organized by collection/global slug
 */
export const customPrivilegesRegistry = new Map<
  string,
  {
    label: Record<string, string>
    privileges: Record<string, GlobalPrivilege | Privilege>
    slug: string
    type: 'collection' | 'global'
  }
>()

/**
 * Configuration for creating a custom privilege
 */
export type CustomPrivilegeConfig = {
  /**
   * Descriptions for the privilege in different languages
   * @example { en: 'Ability to publish posts', fr: 'Capacité de publier des articles' }
   */
  description: Record<string, string>
  /**
   * Labels for the privilege in different languages
   * @example { en: 'Publish Posts', fr: 'Publier les articles' }
   */
  label: Record<string, string>
  /**
   * Unique key for the privilege (e.g., 'posts-publish', 'users-approve')
   */
  privilegeKey: string
}

/**
 * Register a custom privilege to appear in the admin UI
 *
 * @param collectionOrGlobalSlug - The slug of the collection or global this privilege belongs to
 * @param config - The privilege configuration
 * @param options - Additional options
 *
 * @example
 * ```typescript
 * import { registerCustomPrivilege } from '@payload-enchants/roles-privileges-payload-plugin'
 *
 * // In your payload.config.ts, before the plugin initialization
 * registerCustomPrivilege('posts', {
 *   privilegeKey: 'posts-publish',
 *   label: { en: 'Publish Posts', fr: 'Publier les articles' },
 *   description: { en: 'Ability to publish posts', fr: 'Capacité de publier des articles' },
 * }, {
 *   type: 'collection',
 *   groupLabel: { en: 'Posts', fr: 'Articles' },
 * })
 * ```
 */
export const registerCustomPrivilege = (
  collectionOrGlobalSlug: string,
  config: CustomPrivilegeConfig,
  options?: {
    groupLabel?: Record<string, string>
    type?: 'collection' | 'global'
  },
): Privilege => {
  const privilege: Privilege = {
    description: config.description,
    isCustom: true,
    label: config.label,
    privilegeKey: config.privilegeKey,
  }

  // Get or create the group for this collection/global
  let group = customPrivilegesRegistry.get(collectionOrGlobalSlug)

  if (!group) {
    group = {
      slug: collectionOrGlobalSlug,
      type: options?.type || 'collection',
      label: options?.groupLabel || { _default: collectionOrGlobalSlug },
      privileges: {},
    }
    customPrivilegesRegistry.set(collectionOrGlobalSlug, group)
  }

  // Add the privilege to the group
  group.privileges[config.privilegeKey] = privilege

  return privilege
}

/**
 * Register multiple custom privileges at once to appear in the admin UI
 *
 * @example
 * ```typescript
 * import { registerCustomPrivileges } from '@payload-enchants/roles-privileges-payload-plugin'
 *
 * registerCustomPrivileges('posts', [
 *   {
 *     privilegeKey: 'posts-publish',
 *     label: { en: 'Publish Posts', fr: 'Publier les articles' },
 *     description: { en: 'Publish posts', fr: 'Publier des articles' },
 *   },
 *   {
 *     privilegeKey: 'posts-feature',
 *     label: { en: 'Feature Posts', fr: 'Mettre en vedette les articles' },
 *     description: { en: 'Feature posts on homepage', fr: 'Mettre en vedette des articles' },
 *   },
 * ], {
 *   type: 'collection',
 *   groupLabel: { en: 'Posts', fr: 'Articles' },
 * })
 * ```
 */
export const registerCustomPrivileges = (
  collectionOrGlobalSlug: string,
  configs: CustomPrivilegeConfig[],
  options?: {
    groupLabel?: Record<string, string>
    type?: 'collection' | 'global'
  },
): Privilege[] => {
  return configs.map((config) => registerCustomPrivilege(collectionOrGlobalSlug, config, options))
}

/**
 * Type alias for GlobalPrivilege (for consistency)
 */
export type CustomGlobalPrivilege = GlobalPrivilege
