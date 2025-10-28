export default ({ strapi }: any) => ({
  async getAll(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      const bookmarks = await strapi
        .plugin('magic-mark')
        .service('bookmarks')
        .findAll(user.id);

      ctx.body = {
        data: bookmarks,
        meta: {
          count: bookmarks.length
        }
      };
    } catch (error) {
      ctx.throw(500, `Error fetching bookmarks: ${error}`);
    }
  },

  async create(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      const { name, path, query, emoji, description, sharedWithRoles, sharedWithUsers, isPublic } = ctx.request.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return ctx.throw(400, 'Name is required');
      }
      if (!path || path.trim().length === 0) {
        return ctx.throw(400, 'Path is required');
      }

      const service = strapi.plugin('magic-mark').service('bookmarks');

      const bookmark = await service.create(name, path, query, emoji, description, user.id, sharedWithRoles, sharedWithUsers, isPublic);

      ctx.body = {
        data: bookmark
      };
    } catch (error) {
      ctx.throw(500, `Error creating bookmark: ${error}`);
    }
  },

  async update(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      const { id } = ctx.params;
      const { name, path, query, emoji, description, isPinned, order, sharedWithRoles, sharedWithUsers, isPublic } = ctx.request.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return ctx.throw(400, 'Name is required');
      }
      if (!path || path.trim().length === 0) {
        return ctx.throw(400, 'Path is required');
      }

      const bookmark = await strapi
        .plugin('magic-mark')
        .service('bookmarks')
        .update(id, { name, path, query, emoji, description, isPinned, order, sharedWithRoles, sharedWithUsers, isPublic }, user.id);

      ctx.body = {
        data: bookmark
      };
    } catch (error) {
      ctx.throw(500, `Error updating bookmark: ${error}`);
    }
  },

  async delete(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      const { id } = ctx.params;
      
      await strapi
        .plugin('magic-mark')
        .service('bookmarks')
        .delete(id);

      ctx.body = {
        data: { success: true }
      };
    } catch (error) {
      ctx.throw(500, `Error deleting bookmark: ${error}`);
    }
  },

  async pin(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      const { id } = ctx.params;
      const { isPinned } = ctx.request.body;

      const bookmark = await strapi
        .plugin('magic-mark')
        .service('bookmarks')
        .pin(id, isPinned, user.id);

      ctx.body = {
        data: bookmark
      };
    } catch (error) {
      ctx.throw(500, `Error pinning bookmark: ${error}`);
    }
  },

  async reorder(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      const { bookmarkIds } = ctx.request.body;

      // Validation
      if (!bookmarkIds || !Array.isArray(bookmarkIds)) {
        return ctx.throw(400, 'Bookmark IDs array is required');
      }

      const bookmarks = await strapi
        .plugin('magic-mark')
        .service('bookmarks')
        .reorder(bookmarkIds, user.id);

      ctx.body = {
        data: bookmarks
      };
    } catch (error) {
      ctx.throw(500, `Error reordering bookmarks: ${error}`);
    }
  },

  async getRoles(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      // Get ALL admin roles including custom ones
      const roles = await strapi.entityService.findMany(
        'admin::role',
        {
          fields: ['id', 'name', 'code', 'description', 'createdAt', 'updatedAt'],
          filters: {},
          sort: { name: 'asc' },
          populate: ['users'] // Also get user count for each role
        }
      );

      // Add user count to each role
      const rolesWithDetails = roles?.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        userCount: role.users?.length || 0,
        isCustom: !['super_admin', 'editor', 'author'].includes(role.code) // Mark custom roles
      })) || [];

      ctx.body = {
        data: {
          data: rolesWithDetails
        }
      };
    } catch (error) {
      ctx.throw(500, `Error fetching roles: ${error}`);
    }
  },

  async getUsers(ctx: any) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.throw(401, 'User not authenticated');
      }

      // Use Strapi's admin user service to get all admin users
      let users = [];
      
      try {
        // Method 1: Try the admin service
        const adminUserService = strapi.admin?.services?.user || strapi.service('admin::user');
        if (adminUserService?.findPage) {
          const results = await adminUserService.findPage({
            pagination: {
              page: 1,
              pageSize: 100
            }
          });
          users = results.results || [];
        } else if (adminUserService?.find) {
          users = await adminUserService.find();
        }
      } catch (err) {
        console.log('[Magic-Mark] Admin service error, trying entity service:', err);
      }
      
      // Method 2: If admin service failed, use entity service
      if (!users || users.length === 0) {
        try {
          users = await strapi.entityService.findMany('admin::user', {
            limit: 100
          });
        } catch (err) {
          console.log('[Magic-Mark] Entity service error:', err);
        }
      }
      
      // Method 3: Direct database query as last resort
      if (!users || users.length === 0) {
        try {
          users = await strapi.db.query('admin::user').findMany({
            limit: 100
          });
        } catch (err) {
          console.log('[Magic-Mark] DB query error:', err);
        }
      }
      
      // Filter out current user
      const filteredUsers = users.filter(u => u.id !== user.id);

      console.log('[Magic-Mark] Total admin users found:', users.length);
      console.log('[Magic-Mark] Filtered users (excluding current):', filteredUsers.map(u => ({
        id: u.id,
        name: `${u.firstname} ${u.lastname}`,
        email: u.email
      })));

      ctx.body = {
        data: {
          data: filteredUsers.map(u => ({
            id: u.id,
            firstname: u.firstname || '',
            lastname: u.lastname || '',
            email: u.email,
            username: u.username || u.email
          }))
        }
      };
    } catch (error) {
      ctx.throw(500, `Error fetching users: ${error}`);
    }
  },
});