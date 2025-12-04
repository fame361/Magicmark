export default {
  bookmark: {
    schema: {
      kind: 'collectionType',
      collectionName: 'magic_bookmarks',
      info: {
        singularName: 'bookmark',
        pluralName: 'bookmarks',
        displayName: 'Magic Bookmark',
        description: 'Saved filter views for quick access with path and query parameters'
      },
      options: {
        draftAndPublish: false,
        comment: 'Magic Bookmarks - Saved Views with Filters'
      },
      pluginOptions: {
        'content-manager': { visible: false },
        'content-type-builder': { visible: false }
      },
      attributes: {
        name: { 
          type: 'string', 
          required: true, 
          maxLength: 100, 
          configurable: false 
        },
        // Path: /content-manager/collection-types/api::article.article
        path: { 
          type: 'string', 
          required: true, 
          configurable: false,
          description: 'Content Manager path (e.g., /content-manager/collection-types/api::article.article)'
        },
        // Query: filters[status][$eq]=published&sort=createdAt:DESC
        query: { 
          type: 'text', 
          configurable: false,
          description: 'URL query parameters (e.g., filters[status][$eq]=published&sort=createdAt:DESC)'
        },
        emoji: { 
          type: 'string', 
          default: 'bookmark', 
          configurable: false, 
          maxLength: 50 
        },
        isPinned: { 
          type: 'boolean', 
          default: false, 
          configurable: false 
        },
        order: { 
          type: 'integer', 
          default: 0, 
          configurable: false 
        },
        description: { 
          type: 'text', 
          configurable: false 
        },
        // Creator's documentId (stored as string, not relation)
        // We store documentId instead of relation to avoid admin::user permission issues
        creatorId: {
          type: 'string',
          configurable: false,
          description: 'documentId of the admin user who created this bookmark'
        },
        // Last updater's documentId
        updaterId: {
          type: 'string',
          configurable: false,
          description: 'documentId of the admin user who last updated this bookmark'
        },
        // Array of role documentIds that have access to this bookmark
        sharedWithRoles: {
          type: 'json',
          configurable: false,
          description: 'Array of role documentIds that have access to this bookmark'
        },
        // Array of user documentIds that have direct access to this bookmark
        sharedWithUsers: {
          type: 'json',
          configurable: false,
          description: 'Array of user documentIds that have direct access to this bookmark'
        },
        // Whether this bookmark is public to all admin users
        isPublic: {
          type: 'boolean',
          default: false,
          configurable: false,
          description: 'If true, all admin users can see this bookmark'
        }
      }
    }
  }
};
