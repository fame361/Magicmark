import type { Core } from '@strapi/strapi';

const bookmarkService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async findAll(userId: number) {
    try {
      // Get user with roles
      const user = await strapi.entityService.findOne(
        'admin::user',
        userId,
        {
          populate: ['roles']
        }
      );

      const userRoleIds = user?.roles?.map((role: any) => role.id) || [];

      // Find bookmarks that:
      // 1. User created (owns)
      // 2. Are public
      // 3. Are shared with user's roles
      const allBookmarks = await strapi.entityService.findMany(
        'plugin::magic-mark.bookmark',
        {
          sort: [
            { isPinned: 'desc' },
            { order: 'asc' }
          ],
          populate: ['createdBy']
        }
      );

      // Filter bookmarks based on access
      const accessibleBookmarks = allBookmarks?.filter((bookmark: any) => {
        // User owns this bookmark
        if (bookmark.createdBy?.id === userId) {
          return true;
        }
        // Bookmark is public
        if (bookmark.isPublic) {
          return true;
        }
        // Bookmark is shared directly with this user
        if (bookmark.sharedWithUsers && Array.isArray(bookmark.sharedWithUsers)) {
          if (bookmark.sharedWithUsers.includes(userId)) {
            return true;
          }
        }
        // Bookmark is shared with user's roles
        if (bookmark.sharedWithRoles && Array.isArray(bookmark.sharedWithRoles)) {
          return bookmark.sharedWithRoles.some((roleId: number) => 
            userRoleIds.includes(roleId)
          );
        }
        return false;
      }) || [];

      return accessibleBookmarks;
    } catch (error) {
      strapi.log.error('[magic-mark] Error finding bookmarks:', error);
      throw error;
    }
  },

  async create(name: string, path: string, query: string, emoji: string, description: string, userId: number, sharedWithRoles?: number[], sharedWithUsers?: number[], isPublic?: boolean) {
    try {
      // Get the highest order number
      const bookmarks = await strapi.entityService.findMany(
        'plugin::magic-mark.bookmark',
        {
          sort: [{ order: 'desc' }],
          limit: 1
        }
      );
      
      const maxOrder = bookmarks && bookmarks.length > 0 ? bookmarks[0].order : 0;
      
      const bookmark = await strapi.entityService.create(
        'plugin::magic-mark.bookmark',
        {
          data: {
            name,
            path,
            query: query || '',
            emoji: emoji || '🔖',
            description,
            isPinned: false,
            order: (maxOrder || 0) + 1,
            createdBy: userId,
            sharedWithRoles: sharedWithRoles || [],
            sharedWithUsers: sharedWithUsers || [],
            isPublic: isPublic || false
          } as any
        }
      );
      return bookmark;
    } catch (error) {
      strapi.log.error('[magic-mark] Error creating bookmark:', error);
      throw error;
    }
  },

  async update(id: string | number, data: any, userId: number) {
    try {
      // First check if user owns this bookmark
      const existingBookmark = await strapi.entityService.findOne(
        'plugin::magic-mark.bookmark',
        id,
        {
          populate: ['createdBy']
        }
      );

      if (!existingBookmark || existingBookmark.createdBy?.id !== userId) {
        throw new Error('Unauthorized: You can only edit your own bookmarks');
      }

      const bookmark = await strapi.entityService.update(
        'plugin::magic-mark.bookmark',
        id,
        {
          data: {
            name: data.name,
            path: data.path,
            query: data.query || '',
            emoji: data.emoji || '🔖',
            description: data.description,
            isPinned: data.isPinned,
            order: data.order,
            sharedWithRoles: data.sharedWithRoles,
            sharedWithUsers: data.sharedWithUsers,
            isPublic: data.isPublic,
            updatedBy: userId
          } as any
        }
      );
      return bookmark;
    } catch (error) {
      strapi.log.error('[magic-mark] Error updating bookmark:', error);
      throw error;
    }
  },


  async delete(id: string | number) {
    try {
      return await strapi.entityService.delete(
        'plugin::magic-mark.bookmark',
        id
      );
    } catch (error) {
      strapi.log.error('[magic-mark] Error deleting bookmark:', error);
      throw error;
    }
  },

  async pin(id: string | number, isPinned: boolean, userId: number) {
    try {
      const bookmark = await strapi.entityService.update(
        'plugin::magic-mark.bookmark',
        id,
        {
          data: {
            isPinned: isPinned,
            updatedBy: userId
          } as any
        }
      );
      return bookmark;
    } catch (error) {
      strapi.log.error('[magic-mark] Error pinning bookmark:', error);
      throw error;
    }
  },

  async reorder(bookmarkIds: (string | number)[], userId: number) {
    try {
      const updates = bookmarkIds.map((id, index) =>
        strapi.entityService.update(
          'plugin::magic-mark.bookmark',
          id,
          {
            data: {
              order: index,
              updatedBy: userId
            } as any
          }
        )
      );
      return Promise.all(updates);
    } catch (error) {
      strapi.log.error('[magic-mark] Error reordering bookmarks:', error);
      throw error;
    }
  },

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
});

export default bookmarkService;
