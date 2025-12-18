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

    // Collection privilege operation prefixes
    'privilege-prefix-admin': string
    'privilege-prefix-create': string
    'privilege-prefix-read': string
    'privilege-prefix-readVersions': string
    'privilege-prefix-update': string
    'privilege-prefix-delete': string
    'privilege-prefix-unlock': string

    // Collection privilege description templates
    'privilege-template-admin': string
    'privilege-template-admin-plural': string
    'privilege-template-create': string
    'privilege-template-create-plural': string
    'privilege-template-read': string
    'privilege-template-read-plural': string
    'privilege-template-readVersions': string
    'privilege-template-readVersions-plural': string
    'privilege-template-update': string
    'privilege-template-update-plural': string
    'privilege-template-delete': string
    'privilege-template-delete-plural': string
    'privilege-template-unlock': string
    'privilege-template-unlock-plural': string

    // Global privilege operation prefixes
    'privilege-prefix-global-read': string
    'privilege-prefix-global-readDrafts': string
    'privilege-prefix-global-readVersions': string
    'privilege-prefix-global-update': string

    // Global privilege description templates
    'privilege-template-global-read': string
    'privilege-template-global-readDrafts': string
    'privilege-template-global-readVersions': string
    'privilege-template-global-update': string

    // Collection/Global description templates
    'privilege-collection-description': string
    'privilege-global-description': string

    // Privilege descriptions (legacy)
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
