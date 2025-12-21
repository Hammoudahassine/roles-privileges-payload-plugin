import type { PluginTranslations } from '../types.js'

export const enTranslations: PluginTranslations = {
  'plugin-roles-privileges': {
    // Roles collection
    'roles-collection-label-plural': 'Roles',
    'roles-collection-label-singular': 'Role',
    'roles-field-description-description': 'Optional description of this role',
    'roles-field-description-label': 'Description',
    'roles-field-privileges-description': 'Select the privileges this role should have',
    'roles-field-privileges-label': 'Privileges',
    'roles-field-slug-description': 'Unique identifier for this role',
    'roles-field-slug-label': 'Slug',
    'roles-field-title-label': 'Role Title',

    // Privileges UI
    'privileges-column-collections-globals': 'Collections & Globals',
    'privileges-column-description': 'Description',
    'privileges-column-privileges': 'Privileges',
    'privileges-select-placeholder': 'Select a collection or global to view privileges',
    'privileges-select-privilege-placeholder': 'Select a privilege to view its description',
    'privileges-selected-count': 'Selected Privileges',

    // Privilege operations
    'privilege-operation-create': 'Create',
    'privilege-operation-delete': 'Delete',
    'privilege-operation-read': 'Read',
    'privilege-operation-update': 'Update',

    // Collection privilege operation prefixes
    'privilege-prefix-admin': 'Admin Access to',
    'privilege-prefix-create': 'Create',
    'privilege-prefix-delete': 'Delete',
    'privilege-prefix-read': 'Read',
    'privilege-prefix-readVersions': 'Read Versions:',
    'privilege-prefix-unlock': 'Unlock',
    'privilege-prefix-update': 'Update',

    // Collection privilege description templates
    'privilege-template-admin': 'Access the {label} admin panel and UI',
    'privilege-template-admin-plural': 'true',
    'privilege-template-create': 'Ability to create new {label}',
    'privilege-template-create-plural': 'true',
    'privilege-template-delete': 'Remove {label} from the system',
    'privilege-template-delete-plural': 'true',
    'privilege-template-read': 'View {label} content and information',
    'privilege-template-read-plural': 'false',
    'privilege-template-readVersions': 'Access and view previous versions of {label}',
    'privilege-template-readVersions-plural': 'true',
    'privilege-template-unlock': 'Unlock {label} that are being edited by other users',
    'privilege-template-unlock-plural': 'true',
    'privilege-template-update': 'Modify existing {label} data',
    'privilege-template-update-plural': 'false',

    // Global privilege operation prefixes
    'privilege-prefix-global-read': 'Read',
    'privilege-prefix-global-readDrafts': 'Read Drafts:',
    'privilege-prefix-global-readVersions': 'Read Versions:',
    'privilege-prefix-global-update': 'Update',

    // Global privilege description templates
    'privilege-template-global-read': 'View {label} content and settings',
    'privilege-template-global-readDrafts': 'Access and view draft versions of {label}',
    'privilege-template-global-readVersions': 'Access and view previous versions of {label}',
    'privilege-template-global-update': 'Modify {label} settings and data',

    // Collection/Global description templates
    'privilege-collection-description': 'Manage {label} in the system',
    'privilege-global-description': 'Manage {label} global settings',

    // Privilege descriptions
    'privilege-description-collection-create':
      'Allows create operations on {{collection}} collection',
    'privilege-description-collection-delete':
      'Allows delete operations on {{collection}} collection',
    'privilege-description-collection-info': 'Manage access privileges for this collection',
    'privilege-description-collection-read': 'Allows read operations on {{collection}} collection',
    'privilege-description-collection-update':
      'Allows update operations on {{collection}} collection',
    'privilege-description-global-info': 'Manage access privileges for this global',
    'privilege-description-global-read': 'Allows read access to {{global}} global',
    'privilege-description-global-update': 'Allows update access to {{global}} global',

    // Errors
    'error-cannot-delete-super-admin': 'Cannot delete the Super Admin role',
    'error-cannot-modify-super-admin-slug': 'Cannot modify the Super Admin role slug',
  },
}
