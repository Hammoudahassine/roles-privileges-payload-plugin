import type {
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from 'payload'
import { APIError } from 'payload'
import type { GlobalPrivilege } from '../utils/generateGlobalPrivileges.js'
import type { Privilege } from '../utils/generatePrivileges.js'
import { hasPrivilege } from '../utils/privilegesAccess.js'

export type CollectionData = {
  collectionSlug: string
  collectionLabel: { en: string; fr: string }
  privileges: Record<string, Privilege>
}

export type GlobalData = {
  globalSlug: string
  globalLabel: { en: string; fr: string }
  privileges: Record<string, GlobalPrivilege>
}

/**
 * Hook to ensure the Super Admin role cannot be deleted
 */
export const ensureSuperAdminDontGetDeleted: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const role = await req.payload.findByID({
    collection: 'roles',
    id,
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
export const ensureSuperAdminDontGetUpdated: CollectionBeforeChangeHook = async ({
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
    labels: {
      singular: ({ t }) =>
        (t as (key: string) => string)('plugin-roles-privileges:roles-collection-label-singular'),
      plural: ({ t }) =>
        (t as (key: string) => string)('plugin-roles-privileges:roles-collection-label-plural'),
    },
    access: {
      // Allow authenticated users to read roles (needed for user role resolution)
      read: () => true,
      // Require specific privileges for other operations
      create: hasPrivilege('roles-create'),
      update: hasPrivilege('roles-update'),
      delete: hasPrivilege('roles-delete'),
    },
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'slug'],
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        label: ({ t }) =>
          (t as (key: string) => string)('plugin-roles-privileges:roles-field-title-label'),
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        label: ({ t }) =>
          (t as (key: string) => string)('plugin-roles-privileges:roles-field-slug-label'),
        admin: {
          description: ({ t }) =>
            (t as (key: string) => string)('plugin-roles-privileges:roles-field-slug-description'),
        },
        hooks: {
          beforeValidate: [
            ({ value }) => {
              if (typeof value === 'string') {
                return value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '')
              }
              return value
            },
          ],
        },
      },
      {
        name: 'privileges',
        type: 'array',
        label: ({ t }) =>
          (t as (key: string) => string)('plugin-roles-privileges:roles-field-privileges-label'),
        admin: {
          description: ({ t }) =>
            (t as (key: string) => string)(
              'plugin-roles-privileges:roles-field-privileges-description',
            ),
          components: {
            Field: {
              path: 'roles-privileges-payload-plugin/client#PrivilegesSelect',
              clientProps: {
                collections: collections || [],
                globals: globals || [],
              },
            },
          },
        },
        minRows: 1,
        fields: [
          {
            name: 'privilege',
            type: 'text',
            required: true,
            label: ({ t }) =>
              (t as (key: string) => string)(
                'plugin-roles-privileges:roles-field-privileges-label',
              ),
          },
        ],
      },
      {
        name: 'description',
        type: 'textarea',
        label: ({ t }) =>
          (t as (key: string) => string)('plugin-roles-privileges:roles-field-description-label'),
        admin: {
          description: ({ t }) =>
            (t as (key: string) => string)(
              'plugin-roles-privileges:roles-field-description-description',
            ),
        },
      },
    ],
    hooks: {
      beforeChange: [ensureSuperAdminDontGetUpdated],
      beforeDelete: [ensureSuperAdminDontGetDeleted],
    },
  }
}
