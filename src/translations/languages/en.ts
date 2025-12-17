import type { PluginTranslations } from '../types.js'

export const enTranslations: PluginTranslations = {
  'plugin-roles-privileges': {
    // Roles collection
    'roles-collection-label-singular': 'Role',
    'roles-collection-label-plural': 'Roles',
    'roles-field-title-label': 'Role Title',
    'roles-field-slug-label': 'Slug',
    'roles-field-slug-description': 'Unique identifier for this role',
    'roles-field-privileges-label': 'Privileges',
    'roles-field-privileges-description': 'Select the privileges this role should have',
    'roles-field-description-label': 'Description',
    'roles-field-description-description': 'Optional description of this role',

    // Privileges UI
    'privileges-column-collections-globals': 'Collections & Globals',
    'privileges-column-privileges': 'Privileges',
    'privileges-column-description': 'Description',
    'privileges-select-placeholder': 'Select a collection or global to view privileges',
    'privileges-select-privilege-placeholder': 'Select a privilege to view its description',
    'privileges-selected-count': 'Selected Privileges',

    // Privilege operations
    'privilege-operation-create': 'Create',
    'privilege-operation-read': 'Read',
    'privilege-operation-update': 'Update',
    'privilege-operation-delete': 'Delete',

    // Privilege descriptions
    'privilege-description-collection-create':
      'Allows create operations on {{collection}} collection',
    'privilege-description-collection-read': 'Allows read operations on {{collection}} collection',
    'privilege-description-collection-update':
      'Allows update operations on {{collection}} collection',
    'privilege-description-collection-delete':
      'Allows delete operations on {{collection}} collection',
    'privilege-description-global-read': 'Allows read access to {{global}} global',
    'privilege-description-global-update': 'Allows update access to {{global}} global',
    'privilege-description-collection-info': 'Manage access privileges for this collection',
    'privilege-description-global-info': 'Manage access privileges for this global',

    // Errors
    'error-cannot-delete-super-admin': 'Cannot delete the Super Admin role',
    'error-cannot-modify-super-admin-slug': 'Cannot modify the Super Admin role slug',
  },
}
