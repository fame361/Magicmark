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
          default: '🔖', 
          configurable: false, 
          maxLength: 2 
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
        // Array of role IDs that have access to this bookmark
        sharedWithRoles: {
          type: 'json',
          configurable: false,
          description: 'Array of role IDs that have access to this bookmark'
        },
        // Array of user IDs that have direct access to this bookmark
        sharedWithUsers: {
          type: 'json',
          configurable: false,
          description: 'Array of user IDs that have direct access to this bookmark'
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
