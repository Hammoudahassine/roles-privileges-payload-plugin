import type {
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from 'payload'

import { APIError } from 'payload'

import type { GlobalPrivilege } from '../utils/generateGlobalPrivileges.js'
import type { Privilege } from '../utils/generatePrivileges.js'

import { slugField } from '../fields/slug/index.js'
import { hasPrivilege } from '../utils/privilegesAccess.js'

export type CollectionData = {
  collectionLabel: { en: string; fr: string }
  collectionSlug: string
  privileges: Record<string, Privilege>
}

export type GlobalData = {
  globalLabel: { en: string; fr: string }
  globalSlug: string
  privileges: Record<string, GlobalPrivilege>
}

/**
 * Hook to ensure the Super Admin role cannot be deleted
 */
export const ensureSuperAdminDontGetDeleted: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const role = await req.payload.findByID({
    id,
    collection: 'roles',
  })

  if (role && role.slug === 'super-admin') {
    throw new APIError(
      (req.t as (key: string) => string)('plugin-roles-privileges:error-cannot-delete-super-admin'),
      400,
    )
  }
}

/**
 * Hook to ensure the Super Admin role slug cannot be changed
 */
export const ensureSuperAdminDontGetUpdated: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (originalDoc && originalDoc.slug === 'super-admin') {
    if (data.slug && data.slug !== 'super-admin') {
      throw new APIError(
        (req.t as (key: string) => string)(
          'plugin-roles-privileges:error-cannot-modify-super-admin-slug',
        ),
        400,
      )
    }
  }
  return data
}

/**
 * Roles collection configuration
 * This collection manages user roles and their associated privileges
 */
export const createRolesCollection = (
  collections?: CollectionData[],
  globals?: GlobalData[],
): CollectionConfig => {
  return {
    slug: 'roles',
    access: {
      // Allow authenticated users to read roles (needed for user role resolution)
      read: () => true,
      // Require specific privileges for other operations
      create: hasPrivilege('roles-create'),
      delete: hasPrivilege('roles-delete'),
      update: hasPrivilege('roles-update'),
    },
    admin: {
      defaultColumns: ['title', 'slug'],
      useAsTitle: 'title',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        label: ({ t }) =>
          (t as (key: string) => string)('plugin-roles-privileges:roles-field-title-label'),
        required: true,
      },
      ...slugField(),
      {
        name: 'privileges',
        type: 'array',
        admin: {
          components: {
            Field: {
              clientProps: {
                collections: collections || [],
                globals: globals || [],
              },
              path: 'roles-privileges-payload-plugin/client#PrivilegesSelect',
            },
          },
          description: ({ t }) =>
            (t as (key: string) => string)(
              'plugin-roles-privileges:roles-field-privileges-description',
            ),
        },
        fields: [
          {
            name: 'privilege',
            type: 'text',
            label: ({ t }) =>
              (t as (key: string) => string)(
                'plugin-roles-privileges:roles-field-privileges-label',
              ),
            required: true,
          },
        ],
        label: ({ t }) =>
          (t as (key: string) => string)('plugin-roles-privileges:roles-field-privileges-label'),
        minRows: 1,
      },
      {
        name: 'description',
        type: 'textarea',
        admin: {
          description: ({ t }) =>
            (t as (key: string) => string)(
              'plugin-roles-privileges:roles-field-description-description',
            ),
        },
        label: ({ t }) =>
          (t as (key: string) => string)('plugin-roles-privileges:roles-field-description-label'),
      },
    ],
    hooks: {
      beforeChange: [ensureSuperAdminDontGetUpdated],
      beforeDelete: [ensureSuperAdminDontGetDeleted],
    },
    labels: {
      plural: ({ t }) =>
        (t as (key: string) => string)('plugin-roles-privileges:roles-collection-label-plural'),
      singular: ({ t }) =>
        (t as (key: string) => string)('plugin-roles-privileges:roles-collection-label-singular'),
    },
  }
}
