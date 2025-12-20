import type { AcceptedLanguages } from '@payloadcms/translations'
import type { Config } from 'payload'

import { createRolesCollection } from './collections/roles.js'
import { translations } from './translations/index.js'
import type { PluginDefaultTranslationsObject } from './translations/types.js'

import type { PayloadRequest, Where } from 'payload'
import { customPrivilegesRegistry } from './utils/createCustomPrivilege.js'
import {
  allGlobalPrivilegesMap,
  generateGlobalPrivilegeKey,
  generateGlobalPrivileges,
} from './utils/generateGlobalPrivileges.js'
import {
  allPrivilegesMap,
  generateCollectionPrivileges,
  generatePrivilegeKey,
} from './utils/generatePrivileges.js'
import { hasPrivilege } from './utils/privilegesAccess.js'
import { seedSuperAdminRole } from './utils/seedSuperAdminRole.js'
/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type RolesPrivilegesPayloadPluginConfig = {
  enable?: boolean
  disabled?: boolean
  excludeCollections?: string[]
  excludeGlobals?: string[]
  wrapCollectionAccess?: boolean
  wrapGlobalAccess?: boolean
  seedSuperAdmin?: boolean
}

export * from './exports/types.js'
export * from './exports/utilities.js'

type AccessArgs = {
  req: PayloadRequest
  [key: string]: any
}

type AccessResult = boolean | Where
type AccessFn = (args: AccessArgs) => AccessResult | Promise<AccessResult>

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                               */
/* -------------------------------------------------------------------------- */

const wrapAccess =
  (original: AccessFn | AccessResult | undefined, privilegeKey: string): AccessFn =>
  async (args) => {
    let originalResult: AccessResult = true

    if (original !== undefined) {
      originalResult = typeof original === 'function' ? await original(args) : original

      if (originalResult === false) return false
    }

    const hasPriv = await hasPrivilege(privilegeKey)(args)
    if (!hasPriv) return false

    return originalResult
  }

function buildPrivilegesMap(
  autoMap: Map<string, any>,
  type: 'collection' | 'global',
  slugKey: 'collectionSlug' | 'globalSlug',
  labelKey: 'collectionLabel' | 'globalLabel',
) {
  const map = new Map<string, any>()

  for (const entry of autoMap.values()) {
    map.set(entry[slugKey], {
      [slugKey]: entry[slugKey],
      [labelKey]: entry[labelKey],
      privileges: { ...entry.privileges },
    })
  }

  for (const custom of customPrivilegesRegistry.values()) {
    if (custom.type !== type) continue

    const existing = map.get(custom.slug)
    if (existing) {
      existing.privileges = {
        ...existing.privileges,
        ...custom.privileges,
      }
    } else {
      map.set(custom.slug, {
        [slugKey]: custom.slug,
        [labelKey]: custom.label,
        privileges: { ...custom.privileges },
      })
    }
  }

  return Array.from(map.values())
}

/* -------------------------------------------------------------------------- */
/*                                   Plugin                                   */
/* -------------------------------------------------------------------------- */

export const rolesPrivilegesPayloadPlugin =
  (pluginOptions: RolesPrivilegesPayloadPluginConfig = {}) =>
  (config: Config): Config => {
    const {
      enable = true,
      excludeCollections = [],
      excludeGlobals = [],
      wrapCollectionAccess = true,
      wrapGlobalAccess = true,
      seedSuperAdmin = true,
    } = pluginOptions

    if (!enable) {
      return config
    }

    config.collections ??= []
    config.globals ??= []

    /* ---------------------------------------------------------------------- */
    /*                       Generate initial privileges                        */
    /* ---------------------------------------------------------------------- */

    for (const collection of config.collections) {
      if (!excludeCollections.includes(collection.slug) && collection.slug !== 'roles') {
        generateCollectionPrivileges(collection)
      }
    }

    for (const global of config.globals) {
      if (!excludeGlobals.includes(global.slug)) {
        generateGlobalPrivileges(global)
      }
    }

    /* ---------------------------------------------------------------------- */
    /*                           Roles collection                               */
    /* ---------------------------------------------------------------------- */

    config.collections.push(createRolesCollection([], []))

    const rolesCollection = config.collections.find((c) => c.slug === 'roles')

    if (rolesCollection) {
      generateCollectionPrivileges(rolesCollection)

      const privilegesField = rolesCollection.fields.find(
        (f) => 'name' in f && f.name === 'privileges',
      )

      if (
        privilegesField &&
        'admin' in privilegesField &&
        privilegesField.admin?.components?.Field
      ) {
        const fieldComponent = privilegesField.admin.components.Field

        if (typeof fieldComponent === 'object' && 'clientProps' in fieldComponent) {
          fieldComponent.clientProps = {
            get collections() {
              return buildPrivilegesMap(
                allPrivilegesMap,
                'collection',
                'collectionSlug',
                'collectionLabel',
              )
            },
            get globals() {
              return buildPrivilegesMap(
                allGlobalPrivilegesMap,
                'global',
                'globalSlug',
                'globalLabel',
              )
            },
          }
        }
      }
    }

    if (pluginOptions.disabled) {
      return config
    }

    /* ---------------------------------------------------------------------- */
    /*                       Collection access wrapping                          */
    /* ---------------------------------------------------------------------- */

    const COLLECTION_ACTIONS = [
      'create',
      'read',
      'update',
      'delete',
      'admin',
      'readVersions',
      'unlock',
    ] as const

    if (wrapCollectionAccess) {
      for (const collection of config.collections) {
        if (excludeCollections.includes(collection.slug) || collection.slug === 'roles') {
          continue
        }

        collection.access ??= {}
        const originalAccess = { ...collection.access }

        for (const action of COLLECTION_ACTIONS) {
          const key = generatePrivilegeKey(collection.slug, action)
          collection.access[action] = wrapAccess(originalAccess[action], key)
        }
      }
    }

    /* ---------------------------------------------------------------------- */
    /*                         Global access wrapping                            */
    /* ---------------------------------------------------------------------- */

    const GLOBAL_ACTIONS = ['read', 'update', 'readDrafts', 'readVersions'] as const

    if (wrapGlobalAccess) {
      for (const global of config.globals) {
        if (excludeGlobals.includes(global.slug)) continue

        global.access ??= {}
        const originalAccess = { ...global.access }

        for (const action of GLOBAL_ACTIONS) {
          const key = generateGlobalPrivilegeKey(global.slug, action)
          global.access[action] = wrapAccess(originalAccess[action], key)
        }
      }
    }

    /* ---------------------------------------------------------------------- */
    /*                                 onInit                                   */
    /* ---------------------------------------------------------------------- */

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      const existingCollections = new Set(allPrivilegesMap.keys())

      for (const slug of Object.keys(payload.collections)) {
        if (
          existingCollections.has(slug) ||
          excludeCollections.includes(slug) ||
          slug === 'payload-preferences' ||
          slug === 'payload-migrations' ||
          slug === 'payload-locked-documents'
        ) {
          continue
        }

        const collection = payload.collections[slug]
        if (collection?.config) {
          payload.logger.info(`[Roles & Privileges] Discovered late-loaded collection: ${slug}`)
          generateCollectionPrivileges(collection.config)
        }
      }

      const existingGlobals = new Set(allGlobalPrivilegesMap.keys())

      for (const slug of Object.keys(payload.globals)) {
        if (existingGlobals.has(slug) || excludeGlobals.includes(slug)) continue

        const global = (payload.globals as any)[slug]
        if (global?.config) {
          payload.logger.info(`[Roles & Privileges] Discovered late-loaded global: ${slug}`)
          generateGlobalPrivileges(global.config)
        }
      }

      if (seedSuperAdmin) {
        await seedSuperAdminRole(payload)
      }
    }

    /* ---------------------------------------------------------------------- */
    /*                               Translations                                */
    /* ---------------------------------------------------------------------- */

    config.i18n ??= {}
    config.i18n.translations ??= {}

    for (const locale of Object.keys(translations) as AcceptedLanguages[]) {
      const pluginBlock = translations[locale]['plugin-roles-privileges']

      config.i18n.translations[locale] ??= {}
      ;(config.i18n.translations[locale] as PluginDefaultTranslationsObject)[
        'plugin-roles-privileges'
      ] = {
        ...pluginBlock,
      }
    }

    return config
  }
