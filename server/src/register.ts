import type { Core } from '@strapi/strapi';

const magicMarkActions = {
  actions: [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'settings.read',
      subCategory: 'Settings',
      pluginName: 'magic-mark',
    },
    {
      section: 'plugins',
      displayName: 'Edit',
      uid: 'settings.update',
      subCategory: 'Settings',
      pluginName: 'magic-mark',
    },
  ],
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Register permissions
  await strapi.admin.services.permission.actionProvider.registerMany(
    magicMarkActions.actions
  );
  
  strapi.log.info('[Magic-Mark] Plugin registered successfully');
};
