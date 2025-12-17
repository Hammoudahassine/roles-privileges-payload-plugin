export type PluginTranslations = {
  'plugin-roles-privileges': {
    // Roles collection
    'roles-collection-label-singular': string
    'roles-collection-label-plural': string
    'roles-field-title-label': string
    'roles-field-slug-label': string
    'roles-field-slug-description': string
    'roles-field-privileges-label': string
    'roles-field-privileges-description': string
    'roles-field-description-label': string
    'roles-field-description-description': string

    // Privileges UI
    'privileges-column-collections-globals': string
    'privileges-column-privileges': string
    'privileges-column-description': string
    'privileges-select-placeholder': string
    'privileges-select-privilege-placeholder': string
    'privileges-selected-count': string

    // Privilege operations
    'privilege-operation-create': string
    'privilege-operation-read': string
    'privilege-operation-update': string
    'privilege-operation-delete': string

    // Privilege descriptions
    'privilege-description-collection-create': string
    'privilege-description-collection-read': string
    'privilege-description-collection-update': string
    'privilege-description-collection-delete': string
    'privilege-description-global-read': string
    'privilege-description-global-update': string
    'privilege-description-collection-info': string
    'privilege-description-global-info': string

    // Errors
    'error-cannot-delete-super-admin': string
    'error-cannot-modify-super-admin-slug': string
  }
}

export type PluginDefaultTranslationsObject = {
  'plugin-roles-privileges': PluginTranslations['plugin-roles-privileges']
}
