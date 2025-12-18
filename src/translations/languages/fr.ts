import type { PluginTranslations } from '../types.js'

export const frTranslations: PluginTranslations = {
  'plugin-roles-privileges': {
    // Roles collection
    'roles-collection-label-singular': 'Rôle',
    'roles-collection-label-plural': 'Rôles',
    'roles-field-title-label': 'Titre du rôle',
    'roles-field-slug-label': 'Slug',
    'roles-field-slug-description': 'Identifiant unique pour ce rôle',
    'roles-field-privileges-label': 'Privilèges',
    'roles-field-privileges-description': 'Sélectionnez les privilèges que ce rôle devrait avoir',
    'roles-field-description-label': 'Description',
    'roles-field-description-description': 'Description optionnelle de ce rôle',

    // Privileges UI
    'privileges-column-collections-globals': 'Collections & Globals',
    'privileges-column-privileges': 'Privilèges',
    'privileges-column-description': 'Description',
    'privileges-select-placeholder':
      'Sélectionnez une collection ou un global pour voir les privilèges',
    'privileges-select-privilege-placeholder': 'Sélectionnez un privilège pour voir sa description',
    'privileges-selected-count': 'Privilèges sélectionnés',

    // Privilege operations
    'privilege-operation-create': 'Créer',
    'privilege-operation-read': 'Lire',
    'privilege-operation-update': 'Mettre à jour',
    'privilege-operation-delete': 'Supprimer',

    // Collection privilege operation prefixes
    'privilege-prefix-admin': 'Accès administrateur à',
    'privilege-prefix-create': 'Créer',
    'privilege-prefix-read': 'Lire',
    'privilege-prefix-readVersions': 'Lire les versions:',
    'privilege-prefix-update': 'Modifier',
    'privilege-prefix-delete': 'Supprimer',
    'privilege-prefix-unlock': 'Déverrouiller',

    // Collection privilege description templates
    'privilege-template-admin':
      "Accéder au panneau d'administration et à l'interface utilisateur des {label}",
    'privilege-template-admin-plural': 'true',
    'privilege-template-create': 'Possibilité de créer de nouveaux {label}',
    'privilege-template-create-plural': 'true',
    'privilege-template-read': 'Voir le contenu et les informations de {label}',
    'privilege-template-read-plural': 'false',
    'privilege-template-readVersions': 'Accéder et voir les versions précédentes des {label}',
    'privilege-template-readVersions-plural': 'true',
    'privilege-template-update': 'Modifier les données existantes de {label}',
    'privilege-template-update-plural': 'false',
    'privilege-template-delete': 'Supprimer {label} du système',
    'privilege-template-delete-plural': 'true',
    'privilege-template-unlock':
      "Déverrouiller {label} en cours de modification par d'autres utilisateurs",
    'privilege-template-unlock-plural': 'true',

    // Global privilege operation prefixes
    'privilege-prefix-global-read': 'Lire',
    'privilege-prefix-global-readDrafts': 'Lire les brouillons:',
    'privilege-prefix-global-readVersions': 'Lire les versions:',
    'privilege-prefix-global-update': 'Modifier',

    // Global privilege description templates
    'privilege-template-global-read': 'Voir le contenu et les paramètres de {label}',
    'privilege-template-global-readDrafts': 'Accéder et voir les brouillons de {label}',
    'privilege-template-global-readVersions': 'Accéder et voir les versions précédentes de {label}',
    'privilege-template-global-update': 'Modifier les paramètres et données de {label}',

    // Collection/Global description templates
    'privilege-collection-description': 'Gérer {label} dans le système',
    'privilege-global-description': 'Gérer les paramètres globaux de {label}',

    // Privilege descriptions
    'privilege-description-collection-create':
      'Permet les opérations de création sur la collection {{collection}}',
    'privilege-description-collection-read':
      'Permet les opérations de lecture sur la collection {{collection}}',
    'privilege-description-collection-update':
      'Permet les opérations de mise à jour sur la collection {{collection}}',
    'privilege-description-collection-delete':
      'Permet les opérations de suppression sur la collection {{collection}}',
    'privilege-description-global-read': "Permet l'accès en lecture au global {{global}}",
    'privilege-description-global-update': "Permet l'accès en mise à jour au global {{global}}",
    'privilege-description-collection-info': "Gérer les privilèges d'accès pour cette collection",
    'privilege-description-global-info': "Gérer les privilèges d'accès pour ce global",

    // Errors
    'error-cannot-delete-super-admin': 'Impossible de supprimer le rôle Super Admin',
    'error-cannot-modify-super-admin-slug': 'Impossible de modifier le slug du rôle Super Admin',
  },
}
