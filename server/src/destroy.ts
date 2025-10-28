import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Cleanup License Guard ping interval
  try {
    const licenseGuardService = strapi.plugin('magic-mark')?.service('license-guard');
    if (licenseGuardService) {
      licenseGuardService.cleanup();
      strapi.log.info('✅ License Guard cleanup completed');
    }
  } catch (error) {
    strapi.log.error('❌ Error during License Guard cleanup:', error);
  }
};
