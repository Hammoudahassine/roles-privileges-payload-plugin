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
